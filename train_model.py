import pickle
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error

def generate_synthetic_data(num_samples=2000):
    np.random.seed(42)
    
    # Generate realistic features
    pm2_5 = np.random.uniform(5, 250, num_samples) # ug/m3
    pm10 = pm2_5 * np.random.uniform(1.2, 2.0, num_samples) # PM10 is generally larger than PM2.5
    co = np.random.uniform(100, 3000, num_samples) # ug/m3
    temp = np.random.uniform(-5, 42, num_samples) # Celsius
    humidity = np.random.uniform(15, 95, num_samples) # %
    wind_speed = np.random.uniform(0, 45, num_samples) # km/h
    
    # Target AQI formula: PM2.5 is dominant, PM10 is second, CO contributes.
    # Weather conditions affect AQI (high wind disperses pollutants, humidity traps them, temp can correlate)
    # Let's model this realistically:
    # 1. PM2.5 has the highest influence
    # 2. PM10 has a solid influence
    # 3. CO has a minor influence
    # 4. Wind speed reduces AQI (dispersal)
    # 5. Humidity increases AQI (trapping)
    # 6. Temperature has a small positive correlation (photochemical reactions)
    
    aqi = (
        0.85 * pm2_5 +
        0.25 * pm10 +
        0.02 * co +
        0.3 * temp +
        0.15 * humidity -
        0.4 * wind_speed
    )
    
    # Map to standard AQI scale (0 - 500) and add some non-linear noise
    aqi = 10 + aqi * 1.5
    aqi += np.random.normal(0, 8, num_samples)
    aqi = np.clip(aqi, 0, 500)
    
    df = pd.DataFrame({
        'pm2_5': pm2_5,
        'pm10': pm10,
        'co': co,
        'temp': temp,
        'humidity': humidity,
        'wind_speed': wind_speed,
        'aqi': aqi
    })
    
    return df

def train_and_save():
    print("Generating synthetic data for training...")
    df = generate_synthetic_data()
    
    X = df[['pm2_5', 'pm10', 'co', 'temp', 'humidity', 'wind_speed']]
    y = df['aqi']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("Training RandomForest model...")
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    
    # Evaluate
    y_pred = model.predict(X_test)
    r2 = r2_score(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    mae = mean_absolute_error(y_test, y_pred)
    
    print(f"Model trained successfully!")
    print(f"R2 Score: {r2:.4f}")
    print(f"RMSE: {rmse:.4f}")
    print(f"MAE: {mae:.4f}")
    
    # Save model
    with open('model.pkl', 'wb') as f:
        pickle.dump(model, f)
    print("Model saved to model.pkl")
    
    # Save feature importances
    importances = model.feature_importances_
    features = X.columns.tolist()
    feature_importance_dict = {
        'features': features,
        'importances': importances.tolist(),
        'metrics': {
            'r2': float(r2),
            'rmse': float(rmse),
            'mae': float(mae)
        }
    }
    
    with open('feature_importance.pkl', 'wb') as f:
        pickle.dump(feature_importance_dict, f)
    print("Feature importances saved to feature_importance.pkl")

if __name__ == '__main__':
    train_and_save()
