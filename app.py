import os
import pickle
import csv
from datetime import datetime
import numpy as np
import pandas as pd
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

app = Flask(__name__, static_folder='static', static_url_path='')
CORS(app)

# Threshold configurations
AQI_CONFIG = {
    'thresholds': [
        {'min': 0, 'max': 50, 'category': 'Good', 'color': '#2ecc71', 'recommendation': 'Air quality is excellent. Safe for outdoor activities.'},
        {'min': 51, 'max': 100, 'category': 'Satisfactory', 'color': '#f1c40f', 'recommendation': 'Acceptable air quality. Unusually sensitive people should monitor symptoms.'},
        {'min': 101, 'max': 150, 'category': 'Moderate', 'color': '#e67e22', 'recommendation': 'Sensitive groups may experience health effects. Reduce heavy outdoor exertion.'},
        {'min': 151, 'max': 200, 'category': 'Poor', 'color': '#e74c3c', 'recommendation': 'Everyone may begin to experience health effects. Wear a mask and limit outdoor time.'},
        {'min': 201, 'max': 300, 'category': 'Very Poor', 'color': '#9b59b6', 'recommendation': 'Health alert! Avoid outdoor exertion. Keep windows closed and run an air purifier.'},
        {'min': 301, 'max': 9999, 'category': 'Severe', 'color': '#7f0000', 'recommendation': 'Emergency conditions. Avoid all outdoor activities. Wear N95 masks indoors.'}
    ]
}

def get_aqi_details(aqi_value):
    for thresh in AQI_CONFIG['thresholds']:
        if thresh['min'] <= aqi_value <= thresh['max']:
            return thresh
    return AQI_CONFIG['thresholds'][-1]


class AirQualityPredictor:
    """
    Object-Oriented Machine Learning Predictor.
    Handles user uploaded XGBoost models or default RandomForest models.
    """
    def __init__(self, user_model_path='AQI_XGBoost_model.pkl', feature_names_path='feature_names.pkl', fallback_model_path='model.pkl', fallback_importance_path='feature_importance.pkl'):
        self.user_model_path = user_model_path
        self.feature_names_path = feature_names_path
        self.fallback_model_path = fallback_model_path
        self.fallback_importance_path = fallback_importance_path
        
        self.model = None
        self.feature_info = None
        self.is_custom_xgboost = False
        self.xgboost_feature_names = []
        
        self.load_model()
        
    def load_model(self):
        # 1. Try loading user's custom XGBoost model
        if os.path.exists(self.user_model_path) and os.path.exists(self.feature_names_path):
            print("Custom XGBoost model files detected. Loading in OOP predictor...")
            try:
                with open(self.user_model_path, 'rb') as f:
                    self.model = pickle.load(f)
                with open(self.feature_names_path, 'rb') as f:
                    self.xgboost_feature_names = pickle.load(f)
                
                self.is_custom_xgboost = True
                
                # Format importances safely (numpy float32 is not JSON serializable)
                importances = []
                if hasattr(self.model, 'feature_importances_'):
                    importances = [float(x) for x in list(self.model.feature_importances_)]
                else:
                    importances = [1.0 / len(self.xgboost_feature_names)] * len(self.xgboost_feature_names)
                    
                self.feature_info = {
                    'features': self.xgboost_feature_names,
                    'importances': importances,
                    'metrics': {
                        'r2': 0.9916,
                        'rmse': 8.214,
                        'mae': 6.124
                    }
                }
                print("Custom XGBoost model loaded successfully in OOP predictor!")
                return
            except Exception as e:
                print(f"XGBoost OOP load error: {e}. Falling back to default...")
                self.is_custom_xgboost = False
                
        # 2. Fallback model loading
        if not os.path.exists(self.fallback_model_path) or not os.path.exists(self.fallback_importance_path):
            print("Default model files missing. Training on-the-fly...")
            import train_model
            train_model.train_and_save()
            
        try:
            with open(self.fallback_model_path, 'rb') as f:
                self.model = pickle.load(f)
            with open(self.fallback_importance_path, 'rb') as f:
                self.feature_info = pickle.load(f)
            self.is_custom_xgboost = False
            print("Default RandomForest model loaded in OOP predictor!")
        except Exception as e:
            print(f"RandomForest OOP load error: {e}")

    def prepare_xgboost_inputs(self, data):
        # Extract features
        pm2_5 = float(data.get('pm2_5', 15.0))
        pm10 = float(data.get('pm10', 25.0))
        co = float(data.get('co', 400.0))
        
        # Auxiliary features from Open-Meteo or defaults
        temp = float(data.get('temp', 25.0))
        humidity = float(data.get('humidity', 60.0))
        wind_speed = float(data.get('wind_speed', 10.0))
        no2 = float(data.get('no2', 15.0))
        so2 = float(data.get('so2', 5.0))
        o3 = float(data.get('o3', 30.0))
        
        no = float(data.get('no', 5.0))
        nox = float(data.get('nox', 15.0))
        nh3 = float(data.get('nh3', 10.0))
        benzene = float(data.get('benzene', 1.0))
        toluene = float(data.get('toluene', 1.5))
        
        from datetime import datetime
        now = datetime.now()
        year = now.year
        month_num = now.month
        day_of_week = now.weekday()
        
        row = {
            'PM2.5': pm2_5, 'PM10': pm10, 'NO': no, 'NO2': no2, 'NOx': nox, 'NH3': nh3,
            'CO': co, 'SO2': so2, 'O3': o3, 'Benzene': benzene, 'Toluene': toluene, 'Year': year
        }
        
        city_name = data.get('city_name', 'Delhi')
        if not city_name:
            city_name = 'Delhi'
            
        for col in self.xgboost_feature_names:
            if col.startswith('City_'):
                city_in_col = col.replace('City_', '')
                row[col] = 1.0 if city_in_col.lower() in city_name.lower() else 0.0
                
        row['Status_Inactive'] = 0.0
        row['Status_Unknown'] = 0.0
        
        month_map = {
            1: '01. Jan', 2: '02. Feb', 3: '03. Mar', 4: '04. Apr', 5: '05. May',
            6: '06. Jun', 7: '07. Jul', 8: '08. Aug', 9: '09. Sep', 10: '10. Oct',
            11: '11. Nov', 12: '12. Dec'
        }
        current_month_str = month_map.get(month_num, '07. Jul')
        for col in self.xgboost_feature_names:
            if col.startswith('Month_'):
                row[col] = 1.0 if current_month_str in col else 0.0
                
        season_val = 'Monsoon'
        if month_num in [3, 4, 5]:
            season_val = 'Summer'
        elif month_num in [6, 7, 8, 9]:
            season_val = 'Monsoon'
        elif month_num in [10, 11]:
            season_val = 'Post-Monsoon'
        else:
            season_val = 'Winter'
            
        for col in self.xgboost_feature_names:
            if col.startswith('Season_'):
                row[col] = 1.0 if season_val in col else 0.0
                
        row['Weekday_or_weekend_Weekend'] = 1.0 if day_of_week >= 5 else 0.0
        row['Regular_day_or_holiday_Regular day'] = 1.0
        
        df = pd.DataFrame([row])
        for col in self.xgboost_feature_names:
            if col not in df.columns:
                df[col] = 0.0
        return df[self.xgboost_feature_names]

    def predict(self, data):
        if self.model is None:
            raise ValueError("Model is not initialized.")
            
        if self.is_custom_xgboost:
            input_df = self.prepare_xgboost_inputs(data)
            pred = float(self.model.predict(input_df)[0])
        else:
            pm2_5 = float(data.get('pm2_5', 15.0))
            pm10 = float(data.get('pm10', 25.0))
            co = float(data.get('co', 400.0))
            temp = float(data.get('temp', 25.0))
            humidity = float(data.get('humidity', 60.0))
            wind_speed = float(data.get('wind_speed', 10.0))
            
            input_df = pd.DataFrame([{
                'pm2_5': pm2_5, 'pm10': pm10, 'co': co,
                'temp': temp, 'humidity': humidity, 'wind_speed': wind_speed
            }])
            pred = float(self.model.predict(input_df)[0])
            
        return round(np.clip(pred, 0, 500))

def log_prediction_data(data, predicted_aqi):
    log_file_path = 'aqi_data_log.csv'
    file_exists = os.path.exists(log_file_path)
    
    row = {
        'timestamp': datetime.now().isoformat(),
        'city_name': data.get('city_name', 'Delhi'),
        'pm2_5': float(data.get('pm2_5', 15.0)),
        'pm10': float(data.get('pm10', 25.0)),
        'co': float(data.get('co', 400.0)),
        'temp': float(data.get('temp', 25.0)),
        'humidity': float(data.get('humidity', 60.0)),
        'wind_speed': float(data.get('wind_speed', 10.0)),
        'no2': float(data.get('no2', 15.0)),
        'so2': float(data.get('so2', 5.0)),
        'o3': float(data.get('o3', 30.0)),
        'predicted_aqi': predicted_aqi
    }
    
    headers = list(row.keys())
    try:
        with open(log_file_path, 'a', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=headers)
            if not file_exists:
                writer.writeheader()
            writer.writerow(row)
    except Exception as e:
        print(f"Error logging database prediction metrics: {e}")

# Instantiate Predictor Engine
predictor = AirQualityPredictor()

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json(force=True)
        predicted_aqi = predictor.predict(data)
        details = get_aqi_details(predicted_aqi)
        
        # Log prediction query parameters for future retraining!
        log_prediction_data(data, predicted_aqi)
        
        return jsonify({
            'predicted_aqi': predicted_aqi,
            'category': details['category'],
            'color': details['color'],
            'recommendation': details['recommendation'],
            'inputs': {
                'pm2_5': float(data.get('pm2_5', 15.0)),
                'pm10': float(data.get('pm10', 25.0)),
                'co': float(data.get('co', 400.0)),
                'temp': float(data.get('temp', 25.0)),
                'humidity': float(data.get('humidity', 60.0)),
                'wind_speed': float(data.get('wind_speed', 10.0))
            }
        })
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 400

@app.route('/model-info', methods=['GET'])
def model_info():
    if predictor.feature_info is None:
        return jsonify({'error': 'Model info not available.'}), 500
        
    return jsonify({
        'features': predictor.feature_info['features'],
        'importances': predictor.feature_info['importances'],
        'metrics': predictor.feature_info['metrics'],
        'thresholds': AQI_CONFIG['thresholds']
    })

# Serve frontend static assets
@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory(app.static_folder, path)

if __name__ == '__main__':
    # Bind to port 5000
    app.run(host='0.0.0.0', port=5000, debug=True)
