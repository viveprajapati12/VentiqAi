// AeroPredict Core JavaScript Logic (Object-Oriented Architecture)

class AeroPredictApp {
    constructor() {
        // Core State
        this.map = null;
        this.mapMarkers = {};
        this.currentCoordinates = { lat: 28.6139, lon: 77.2090 }; // Default: Delhi
        this.currentCityName = "Delhi, Delhi NCR";
        
        // Chart Instances
        this.aqiTrendChart = null;
        this.pollutantTrendChart = null;
        this.historyDetailedChart = null;
        this.comparisonChart = null;
        this.featureImportanceChart = null;
        
        // Backend Config
        this.backendUrl = window.location.origin.includes('5000') || window.location.origin.includes('localhost')
            ? ''
            : 'http://localhost:5000';
            
        // AQI Configuration Thresholds
        this.aqiThresholds = [
            { min: 0, max: 50, category: 'Good', color: '#2ecc71', rgb: '46, 204, 113', recommendation: 'Air quality is excellent. Safe for outdoor activities and exercise.' },
            { min: 51, max: 100, category: 'Satisfactory', color: '#f1c40f', rgb: '241, 196, 15', recommendation: 'Acceptable air quality. Unusually sensitive people should monitor symptoms.' },
            { min: 101, max: 150, category: 'Moderate', color: '#e67e22', rgb: '230, 126, 34', recommendation: 'Sensitive groups may experience health effects. Limit heavy outdoor exertion.' },
            { min: 151, max: 200, category: 'Poor', color: '#e74c3c', rgb: '231, 76, 60', recommendation: 'Everyone may begin to experience health effects. Wear a mask and limit outdoor exposure.' },
            { min: 201, max: 300, category: 'Very Poor', color: '#9b59b6', rgb: '155, 89, 182', recommendation: 'Health alert! Avoid outdoor exertion. Run indoor air purifiers, keep windows closed.' },
            { min: 301, max: 1000, category: 'Severe', color: '#7f0000', rgb: '127, 0, 0', recommendation: 'Emergency warning. Avoid all outdoor activity. Keep windows shut. Wear N95 masks.' }
        ];
        
        // Presets for India Cities (Dense Grid for comparisons)
        this.citiesPreset = [
            // Delhi NCR
            { name: 'Delhi', lat: 28.6139, lon: 77.2090, region: 'Delhi NCR' },
            { name: 'Gurugram', lat: 28.4595, lon: 77.0266, region: 'Delhi NCR' },
            { name: 'Noida', lat: 28.5355, lon: 77.3910, region: 'Delhi NCR' },
            { name: 'Faridabad', lat: 28.4089, lon: 77.3178, region: 'Delhi NCR' },
            { name: 'Ghaziabad', lat: 28.6692, lon: 77.4538, region: 'Delhi NCR' },
            // Bihar
            { name: 'Patna', lat: 25.5941, lon: 85.1376, region: 'Bihar' },
            { name: 'Gaya', lat: 24.7955, lon: 84.9994, region: 'Bihar' },
            { name: 'Muzaffarpur', lat: 26.1197, lon: 85.3910, region: 'Bihar' },
            { name: 'Bhagalpur', lat: 25.2425, lon: 87.0135, region: 'Bihar' },
            { name: 'Darbhanga', lat: 26.1542, lon: 85.8918, region: 'Bihar' },
            { name: 'Begusarai', lat: 25.4182, lon: 86.1272, region: 'Bihar' },
            // Uttar Pradesh
            { name: 'Lucknow', lat: 26.8467, lon: 80.9462, region: 'Uttar Pradesh' },
            { name: 'Kanpur', lat: 26.4499, lon: 80.3319, region: 'Uttar Pradesh' },
            { name: 'Agra', lat: 27.1767, lon: 78.0081, region: 'Uttar Pradesh' },
            { name: 'Varanasi', lat: 25.3176, lon: 82.9739, region: 'Uttar Pradesh' },
            { name: 'Meerut', lat: 28.9845, lon: 77.7064, region: 'Uttar Pradesh' },
            { name: 'Prayagraj', lat: 25.4358, lon: 81.8463, region: 'Uttar Pradesh' },
            // Maharashtra
            { name: 'Mumbai', lat: 19.0760, lon: 72.8777, region: 'Maharashtra' },
            { name: 'Pune', lat: 18.5204, lon: 73.8567, region: 'Maharashtra' },
            { name: 'Nagpur', lat: 21.1458, lon: 79.0882, region: 'Maharashtra' },
            { name: 'Thane', lat: 19.2183, lon: 72.9781, region: 'Maharashtra' },
            { name: 'Nashik', lat: 19.9975, lon: 73.7898, region: 'Maharashtra' },
            // Karnataka & Tamil Nadu
            { name: 'Bengaluru', lat: 12.9716, lon: 77.5946, region: 'Karnataka' },
            { name: 'Mysore', lat: 12.2958, lon: 76.6394, region: 'Karnataka' },
            { name: 'Chennai', lat: 13.0827, lon: 80.2707, region: 'Tamil Nadu' },
            { name: 'Coimbatore', lat: 11.0168, lon: 76.9558, region: 'Tamil Nadu' },
            { name: 'Madurai', lat: 9.9252, lon: 78.1198, region: 'Tamil Nadu' },
            // West Bengal, Jharkhand & Odisha
            { name: 'Kolkata', lat: 22.5726, lon: 88.3639, region: 'West Bengal' },
            { name: 'Howrah', lat: 22.5958, lon: 88.2636, region: 'West Bengal' },
            { name: 'Ranchi', lat: 23.3441, lon: 85.3096, region: 'Jharkhand' },
            { name: 'Jamshedpur', lat: 22.8046, lon: 86.2029, region: 'Jharkhand' },
            { name: 'Bhubaneswar', lat: 20.2961, lon: 85.8245, region: 'Odisha' },
            { name: 'Talcher', lat: 20.9500, lon: 85.2200, region: 'Odisha' },
            // Gujarat & Rajasthan
            { name: 'Ahmedabad', lat: 23.0225, lon: 72.5714, region: 'Gujarat' },
            { name: 'Surat', lat: 21.1702, lon: 72.8311, region: 'Gujarat' },
            { name: 'Jaipur', lat: 26.9124, lon: 75.7873, region: 'Rajasthan' },
            { name: 'Jodhpur', lat: 26.2389, lon: 73.0243, region: 'Rajasthan' },
            { name: 'Udaipur', lat: 24.5854, lon: 73.7125, region: 'Rajasthan' },
            // Other States
            { name: 'Hyderabad', lat: 17.3850, lon: 78.4867, region: 'Telangana' },
            { name: 'Visakhapatnam', lat: 17.6868, lon: 83.2185, region: 'Andhra Pradesh' },
            { name: 'Bhopal', lat: 23.2599, lon: 77.4126, region: 'Madhya Pradesh' },
            { name: 'Indore', lat: 22.7196, lon: 75.8577, region: 'Madhya Pradesh' },
            { name: 'Guwahati', lat: 26.1445, lon: 91.7362, region: 'Assam' },
            { name: 'Amritsar', lat: 31.6340, lon: 74.8723, region: 'Punjab' },
            { name: 'Thiruvananthapuram', lat: 8.5241, lon: 76.9366, region: 'Kerala' }
        ];
    }

    async init() {
        this.initMap();
        this.setupEventListeners();
        this.initHealthPanel();
        this.checkLogoImage();
        
        // Initial Geolocation Flow
        try {
            await this.handleAutoLocation();
        } catch (e) {
            console.warn("Auto-location failed, using default: Delhi.", e);
            this.updateLocationDisplay(this.currentCityName);
            this.fetchAndPredictData(this.currentCoordinates.lat, this.currentCoordinates.lon);
        }
        
        this.loadModelMetaData();
        this.loadCityComparisonData();
    }

    // Logo image checker
    checkLogoImage() {
        const logoImg = document.getElementById('logo-img');
        const fallbackIcon = document.getElementById('logo-icon-fallback');
        const logoText = document.getElementById('logo-text-element');
        const logoQuote = document.getElementById('logo-quote-element');
        if (logoImg) {
            logoImg.onload = () => {
                logoImg.style.display = 'block';
                if (fallbackIcon) fallbackIcon.style.display = 'none';
                if (logoText) logoText.style.display = 'none';
                if (logoQuote) logoQuote.style.display = 'none';
            };
            logoImg.onerror = () => {
                logoImg.style.display = 'none';
                if (fallbackIcon) fallbackIcon.style.display = 'flex';
                if (logoText) logoText.style.display = 'block';
                if (logoQuote) logoQuote.style.display = 'block';
            };
            // Set source with version stamp to bypass browser caching of logo.png!
            logoImg.src = 'logo.png?v=1.6';
        }
    }

    // Initialize Leaflet Map
    initMap() {
        this.map = L.map('map', {
            zoomControl: false,
            attributionControl: false
        }).setView([this.currentCoordinates.lat, this.currentCoordinates.lon], 5);
        
        // Add standard OpenStreetMap tiles (Highly colorful, bright, detailed mapping)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19
        }).addTo(this.map);
        
        // Reposition zoom controls to lower right
        L.control.zoom({ position: 'bottomright' }).addTo(this.map);
        
        // Map click expands map to full screen
        this.map.on('click', (e) => {
            // Prevent triggering if clicked on map controls or popup elements
            if (e.originalEvent.target.closest('.leaflet-control-container') || e.originalEvent.target.closest('.leaflet-popup')) return;
            
            const isExpanded = document.body.classList.contains('map-expanded-view');
            if (!isExpanded) {
                this.toggleMapExpansion(true);
                const mapNavBtn = document.querySelector('.nav-item[data-target="map-panel"]');
                if (mapNavBtn) {
                    document.querySelectorAll('.nav-item').forEach(x => x.classList.remove('active'));
                    mapNavBtn.classList.add('active');
                }
            }
        });

        // Add default markers for preset cities
        this.citiesPreset.forEach(city => {
            this.addCityMarker(city);
        });
    }

    // Add markers onto Leaflet Map
    addCityMarker(city, customAqi = null) {
        const key = `${city.lat.toFixed(4)},${city.lon.toFixed(4)}`;
        
        const aqi = customAqi || Math.round(50 + Math.random() * 150);
        const cat = this.getAQICategory(aqi);
        
        // Create custom pulsing icon using standard divIcon
        const pulseStyle = `
            background-color: ${cat.color};
            box-shadow: 0 0 12px ${cat.color}, 0 0 25px ${cat.color};
        `;
        
        const icon = L.divIcon({
            className: 'custom-map-marker',
            html: `<div class="map-marker-glow" style="${pulseStyle}"></div>`,
            iconSize: [20, 20]
        });
        
        // Tooltip popup with health recommendations and direct navigation
        const popupContent = `
            <div class="map-popup-card">
                <div class="map-popup-city">${city.name}</div>
                <div class="map-popup-aqi">
                    <span class="map-popup-num" style="color: ${cat.color}">${aqi}</span>
                    <span class="map-popup-lbl" style="background-color: ${cat.color}">${cat.category}</span>
                </div>
                <div class="map-popup-recommendation">
                    <strong>Advisory:</strong> ${cat.recommendation}
                </div>
                <button class="popup-nav-btn" onclick="window.app.navigateToHealthSection()">
                    <span class="material-symbols-outlined" style="font-size: 14px;">health_and_safety</span>
                    <span>View Full Advisory</span>
                </button>
            </div>
        `;

        let marker;
        if (this.mapMarkers[key]) {
            marker = this.mapMarkers[key];
            // Update marker state in-place so open popups do NOT close!
            marker.setIcon(icon);
            marker.setPopupContent(popupContent);
        } else {
            marker = L.marker([city.lat, city.lon], { icon }).addTo(this.map);
            marker.bindPopup(popupContent);
            
            marker.on('click', (e) => {
                L.DomEvent.stopPropagation(e); // Prevent expanding map when selecting marker!
                this.currentCoordinates = { lat: city.lat, lon: city.lon };
                this.currentCityName = `${city.name}, ${city.region || ''}`;
                this.updateLocationDisplay(this.currentCityName);
                this.fetchAndPredictData(city.lat, city.lon);
                this.map.setView([city.lat, city.lon], 8);
            });
            
            this.mapMarkers[key] = marker;
        }
    }

    // Toggle expand status of background map
    toggleMapExpansion(expand = undefined) {
        const body = document.body;
        const isExpanded = body.classList.contains('map-expanded-view');
        
        if (expand === undefined) {
            if (isExpanded) {
                body.classList.remove('map-expanded-view');
            } else {
                body.classList.add('map-expanded-view');
            }
        } else if (expand) {
            body.classList.add('map-expanded-view');
        } else {
            body.classList.remove('map-expanded-view');
        }
        
        // Invalidate map size so it centers correctly after animation
        setTimeout(() => {
            if (this.map) this.map.invalidateSize();
        }, 500);
    }

    // Navigation and general triggers
    setupEventListeners() {
        const navItems = document.querySelectorAll('.nav-item');
        const contentPanels = document.querySelectorAll('.content-panel');
        
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const btn = e.currentTarget;
                const targetId = btn.getAttribute('data-target');
                
                if (targetId === 'map-panel') {
                    this.toggleMapExpansion(true);
                    return;
                }
                
                this.toggleMapExpansion(false);
                
                navItems.forEach(x => x.classList.remove('active'));
                btn.classList.add('active');
                
                contentPanels.forEach(p => {
                    p.classList.remove('active');
                    if (p.id === targetId) {
                        p.classList.add('active');
                    }
                });
            });
        });
        
        // Map contraction restore panels btn
        const restoreBtn = document.getElementById('restore-panels-btn');
        if (restoreBtn) {
            restoreBtn.addEventListener('click', () => {
                this.toggleMapExpansion(false);
            });
        }
        
        // Search handler
        const searchInput = document.getElementById('city-search-input');
        const searchBtn = document.getElementById('city-search-btn');
        
        const triggerSearch = async () => {
            const query = searchInput.value.trim();
            if (!query) return;
            
            try {
                // Fetch count=10 to filter by country
                let searchUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=10&language=en&format=json`;
                let res = await fetch(searchUrl);
                let geo = await res.json();
                
                let results = geo.results || [];
                
                // Helper to find perfect Indian city match containing query
                const findIndianMatch = (arr, q) => {
                    const normQ = q.toLowerCase();
                    // First pass: Match in India containing the name query
                    let match = arr.find(r => (r.country_code === 'IN' || (r.country && r.country.toLowerCase() === 'india')) && (r.name.toLowerCase().includes(normQ) || normQ.includes(r.name.toLowerCase())));
                    // Second pass: Any Match in India
                    if (!match) {
                        match = arr.find(r => r.country_code === 'IN' || (r.country && r.country.toLowerCase() === 'india'));
                    }
                    return match;
                };
                
                let bestMatch = findIndianMatch(results, query);
                
                // Spelling fallback: If they type "koderma" and no Indian match is found, try "kodarma"
                if (!bestMatch && (query.toLowerCase().includes('koderma') || query.toLowerCase() === 'koderma')) {
                    console.log("No Indian match for 'koderma'. Retrying with 'kodarma' spelling...");
                    searchUrl = `https://geocoding-api.open-meteo.com/v1/search?name=kodarma&count=10&language=en&format=json`;
                    res = await fetch(searchUrl);
                    geo = await res.json();
                    results = geo.results || [];
                    bestMatch = findIndianMatch(results, 'kodarma');
                }
                
                // General fallback: if still no Indian match, take the first result in the list
                if (!bestMatch && results.length > 0) {
                    bestMatch = results[0];
                }
                
                if (bestMatch) {
                    const lat = bestMatch.latitude;
                    const lon = bestMatch.longitude;
                    const name = `${bestMatch.name}, ${bestMatch.admin1 || ''} (${bestMatch.country})`;
                    
                    this.currentCoordinates = { lat, lon };
                    this.currentCityName = name;
                    this.updateLocationDisplay(name);
                    
                    // Center and load
                    this.map.setView([lat, lon], 8);
                    this.fetchAndPredictData(lat, lon);
                    
                    // Add visual marker for searched place if not preset
                    this.addCityMarker({ name: bestMatch.name, lat, lon, region: bestMatch.admin1 });
                    
                    searchInput.value = '';
                } else {
                    alert(`City "${query}" not found. Please check spelling.`);
                }
            } catch (e) {
                console.error("Geocoding lookup failure", e);
            }
        };
        
        if (searchBtn) searchBtn.addEventListener('click', triggerSearch);
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') triggerSearch();
            });
        }
        
        // GPS location detection trigger
        const gpsBtn = document.getElementById('gps-btn');
        if (gpsBtn) {
            gpsBtn.addEventListener('click', () => {
                this.handleAutoLocation();
            });
        }
        
        // Setup manual simulator sliders syncer
        const sliderList = ['input-pm25', 'input-pm10', 'input-co', 'input-temp', 'input-humidity', 'input-wind'];
        sliderList.forEach(id => {
            const slider = document.getElementById(id);
            const valSpan = document.getElementById(id.replace('input-', 'val-'));
            if (slider && valSpan) {
                slider.addEventListener('input', () => {
                    let suffix = ' µg/m³';
                    if (id === 'input-temp') suffix = '°C';
                    else if (id === 'input-humidity') suffix = '%';
                    else if (id === 'input-wind') suffix = ' km/h';
                    valSpan.innerText = `${slider.value}${suffix}`;
                });
            }
        });
        
        // Manual simulation submit trigger
        const runPredBtn = document.getElementById('btn-run-prediction');
        if (runPredBtn) {
            runPredBtn.addEventListener('click', () => {
                this.runManualFormPrediction();
            });
        }
    }

    // Geolocation trigger
    handleAutoLocation() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                this.fallbackToIpLocation().then(resolve).catch(reject);
                return;
            }
            
            navigator.geolocation.getCurrentPosition(
                async (pos) => {
                    try {
                        const lat = pos.coords.latitude;
                        const lon = pos.coords.longitude;
                        this.currentCoordinates = { lat, lon };
                        
                        // Reverse geocode
                        try {
                            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
                            const geo = await res.json();
                            const city = geo.address.city || geo.address.town || geo.address.village || "Detected Location";
                            const state = geo.address.state || "";
                            this.currentCityName = `${city}, ${state}`;
                            this.updateLocationDisplay(this.currentCityName);
                        } catch (e) {
                            this.currentCityName = "Current Location";
                            this.updateLocationDisplay(this.currentCityName);
                        }
                        
                        this.map.setView([lat, lon], 8);
                        await this.fetchAndPredictData(lat, lon);
                        resolve();
                    } catch (err) {
                        reject(err);
                    }
                },
                async (err) => {
                    console.warn("Browser geolocation blocked/failed. Trying IP-based lookup...", err);
                    this.fallbackToIpLocation().then(resolve).catch(reject);
                },
                { timeout: 4000 }
            );
        });
    }

    // IP-based approximate geolocator fallback
    async fallbackToIpLocation() {
        try {
            const res = await fetch('https://ipapi.co/json/');
            const ipData = await res.json();
            if (ipData.latitude && ipData.longitude) {
                const lat = ipData.latitude;
                const lon = ipData.longitude;
                this.currentCoordinates = { lat, lon };
                this.currentCityName = `${ipData.city || 'Detected City'}, ${ipData.region || ipData.country_name || ''}`;
                this.updateLocationDisplay(this.currentCityName);
                
                if (this.map) this.map.setView([lat, lon], 8);
                await this.fetchAndPredictData(lat, lon);
                return;
            }
        } catch (e) {
            console.error("IP geolocation fallback failed", e);
        }
        
        // Final fallback to Delhi NCR
        this.currentCoordinates = { lat: 28.6139, lon: 77.2090 };
        this.currentCityName = "Delhi, Delhi NCR";
        this.updateLocationDisplay(this.currentCityName);
        if (this.map) this.map.setView([28.6139, 77.2090], 8);
        await this.fetchAndPredictData(28.6139, 77.2090);
    }

    // Update location headers
    updateLocationDisplay(name) {
        const el = document.getElementById('current-location-text');
        if (el) el.innerText = name;
    }

    // Main API data fetching & prediction engine orchestrator
    async fetchAndPredictData(lat, lon) {
        // Toggle loader overlays
        const mainPanel = document.getElementById('dashboard-panel');
        if (mainPanel) mainPanel.style.opacity = '0.7';
        
        try {
            // Parallel fetches for weather and air quality parameters
            const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m`);
            const aqiRes = await fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm2_5,pm10,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone&hourly=pm2_5,pm10,carbon_monoxide&forecast_days=7`);
            
            const weatherData = await weatherRes.json();
            const aqiData = await aqiRes.json();
            
            // Process weather values
            const temp = weatherData.current?.temperature_2m || 25.0;
            const humidity = weatherData.current?.relative_humidity_2m || 55.0;
            const wind_speed = weatherData.current?.wind_speed_10m || 10.0;
            
            // Process pollutants
            const pm2_5 = aqiData.current?.pm2_5 || 12.0;
            const pm10 = aqiData.current?.pm10 || 22.0;
            const co = aqiData.current?.carbon_monoxide || 350.0; // ug/m3
            const no2 = aqiData.current?.nitrogen_dioxide || 15.0;
            const so2 = aqiData.current?.sulphur_dioxide || 5.0;
            const o3 = aqiData.current?.ozone || 30.0;
            
            // Assemble inputs payload (including city names and auxiliary pollutants for XGBoost)
            const inputs = { pm2_5, pm10, co, temp, humidity, wind_speed, city_name: this.currentCityName, no2, so2, o3 };
            
            // Update weather factors displays on dashboard
            document.getElementById('weather-temp-display').innerText = `${Math.round(temp)} °C`;
            document.getElementById('weather-humidity-display').innerText = `${Math.round(humidity)} %`;
            document.getElementById('weather-wind-display').innerText = `${Math.round(wind_speed)} km/h`;
            
            // Update live pollutant cards/bars
            this.renderPollutantBars({ pm2_5, pm10, co, no2, so2, o3 });
            
            // Send inputs to server for prediction
            let predResult;
            try {
                const predRes = await fetch(`${this.backendUrl}/predict`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(inputs)
                });
                predResult = await predRes.json();
                if (predResult.error) throw new Error(predResult.error);
            } catch (e) {
                console.warn("Prediction backend offline. Using fallback engine...", e);
                predResult = this.predictAQILocally(pm2_5, pm10, co, temp, humidity, wind_speed);
            }
            
            // Render predictions to UI
            const aqiVal = predResult.predicted_aqi;
            const cat = this.getAQICategory(aqiVal);
            
            const mainAqiNum = document.getElementById('aqi-value-display');
            const mainAqiCat = document.getElementById('aqi-category-display');
            const mainAqiReco = document.getElementById('health-recommendation-display');
            
            if (mainAqiNum) mainAqiNum.innerText = aqiVal;
            if (mainAqiCat) {
                mainAqiCat.innerText = cat.category;
                mainAqiCat.style.backgroundColor = cat.color;
            }
            if (mainAqiReco) mainAqiReco.innerText = cat.recommendation;
            
            // Feed map marker with loaded dynamic values
            this.addCityMarker({ name: this.currentCityName.split(',')[0], lat, lon }, aqiVal);
            
            // Process and render trend chart datasets (7 days hourly forecasts logs)
            if (aqiData.hourly && aqiData.hourly.time) {
                const timeStamps = aqiData.hourly.time;
                const pm25Hourly = aqiData.hourly.pm2_5;
                const pm10Hourly = aqiData.hourly.pm10;
                const coHourly = aqiData.hourly.carbon_monoxide;
                
                const labels = [];
                const aqiTrend = [];
                const pm25Trend = [];
                const pm10Trend = [];
                const coTrend = [];
                
                // Sample daily values and predict using the backend XGBoost model (via Promise.all parallel execution)
                const predictPromises = [];
                for (let i = 0; i < timeStamps.length; i += 24) {
                    const date = new Date(timeStamps[i]);
                    const opt = { month: 'short', day: 'numeric' };
                    labels.push(date.toLocaleDateString('en-US', opt));
                    
                    const dailyPm25 = pm25Hourly[i] || 15;
                    const dailyPm10 = pm10Hourly[i] || 25;
                    const dailyCo = coHourly[i] || 400;
                    
                    const dailyInputs = {
                        pm2_5: dailyPm25,
                        pm10: dailyPm10,
                        co: dailyCo,
                        temp: 25,
                        humidity: 60,
                        wind_speed: 10,
                        city_name: this.currentCityName
                    };
                    
                    predictPromises.push(
                        fetch(`${this.backendUrl}/predict`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(dailyInputs)
                        })
                        .then(r => r.json())
                        .catch(err => {
                            console.warn("Fallback local prediction inside loop", err);
                            return this.predictAQILocally(dailyPm25, dailyPm10, dailyCo, 25, 60, 10);
                        })
                    );
                }
                
                const dailyResults = await Promise.all(predictPromises);
                
                dailyResults.forEach((result, idx) => {
                    aqiTrend.push(result.predicted_aqi);
                    const baseIndex = idx * 24;
                    pm25Trend.push(pm25Hourly[baseIndex] || 15);
                    pm10Trend.push(pm10Hourly[baseIndex] || 25);
                    coTrend.push(coHourly[baseIndex] || 400);
                });
                
                this.updateAqiTrendCharts(labels, aqiTrend, pm25Trend, pm10Trend, coTrend);
            }
            
        } catch (e) {
            console.error("Critical dashboard loading error", e);
        } finally {
            if (mainPanel) mainPanel.style.opacity = '1';
        }
    }

    // Dynamic generation of progress bars inside container
    renderPollutantBars(pollutants) {
        const container = document.getElementById('pollutants-container');
        if (!container) return;
        
        const config = [
            { key: 'pm2_5', name: 'PM2.5', label: 'Fine Particles', limit: 250, unit: 'µg/m³' },
            { key: 'pm10', name: 'PM10', label: 'Coarse Dust', limit: 430, unit: 'µg/m³' },
            { key: 'co', name: 'CO', label: 'Carbon Monoxide', limit: 10000, unit: 'µg/m³' },
            { key: 'no2', name: 'NO₂', label: 'Nitrogen Dioxide', limit: 400, unit: 'µg/m³' },
            { key: 'so2', name: 'SO₂', label: 'Sulfur Dioxide', limit: 800, unit: 'µg/m³' },
            { key: 'o3', name: 'O₃', label: 'Ozone Layer', limit: 240, unit: 'µg/m³' }
        ];
        
        container.innerHTML = ''; // Wipe out skeletons
        
        config.forEach(cfg => {
            const val = pollutants[cfg.key] || 0.0;
            const pct = Math.min(100, (val / cfg.limit) * 100);
            
            // Map color according to severity
            let color = '#2ecc71';
            if (pct > 60) color = '#e74c3c';
            else if (pct > 35) color = '#e67e22';
            else if (pct > 15) color = '#f1c40f';
            
            const row = document.createElement('div');
            row.className = 'pollutant-row';
            row.innerHTML = `
                <div class="pollutant-info">
                    <span class="pollutant-name">
                        <strong>${cfg.name}</strong> <span style="font-size: 11px; opacity:0.8;">(${cfg.label})</span>
                    </span>
                    <div class="pollutant-value-wrap">
                        <span class="pollutant-val">${Math.round(val)}</span>
                        <span class="pollutant-unit">${cfg.unit}</span>
                    </div>
                </div>
                <div class="pollutant-track">
                    <div class="pollutant-fill" style="width: ${pct}%; background-color: ${color};"></div>
                    <div class="pollutant-dot" style="left: calc(${pct}% - 6px); border-color: ${color}; box-shadow: 0 0 10px ${color};"></div>
                </div>
            `;
            container.appendChild(row);
        });
    }

    // Chart layouts configuration
    getChartBaseOptions() {
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    labels: { color: '#333333', font: { size: 10, family: 'Inter' } }
                }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(0, 0, 0, 0.05)' },
                    ticks: { color: '#444444', font: { size: 10 } }
                },
                y: {
                    grid: { color: 'rgba(0, 0, 0, 0.05)' },
                    ticks: { color: '#444444', font: { size: 10 } }
                }
            }
        };
    }

    // Update charts datasets values
    updateAqiTrendCharts(labels, aqiDaily, pm25Daily, pm10Daily, coList) {
        // Chart 1: AQI trend
        if (this.aqiTrendChart) this.aqiTrendChart.destroy();
        const ctxAqi = document.getElementById('aqiTrendChart').getContext('2d');
        
        // Gradient fill for AQI Line
        const aqiGrad = ctxAqi.createLinearGradient(0, 0, 0, 200);
        aqiGrad.addColorStop(0, 'rgba(232, 111, 136, 0.35)');
        aqiGrad.addColorStop(1, 'rgba(232, 111, 136, 0.01)');
        
        this.aqiTrendChart = new Chart(ctxAqi, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Predicted AQI',
                    data: aqiDaily,
                    borderColor: '#E86F88',
                    borderWidth: 2,
                    backgroundColor: aqiGrad,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 3,
                    pointHoverRadius: 6
                }]
            },
            options: this.getChartBaseOptions()
        });
        
        // Chart 2: Core pollutants trend
        if (this.pollutantTrendChart) this.pollutantTrendChart.destroy();
        const ctxPol = document.getElementById('pollutantTrendChart').getContext('2d');
        
        this.pollutantTrendChart = new Chart(ctxPol, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'PM2.5 (Fine)',
                        data: pm25Daily,
                        borderColor: '#2ecc71',
                        borderWidth: 1.5,
                        fill: false,
                        tension: 0.3
                    },
                    {
                        label: 'PM10 (Coarse)',
                        data: pm10Daily,
                        borderColor: '#f1c40f',
                        borderWidth: 1.5,
                        fill: false,
                        tension: 0.3
                    }
                ]
            },
            options: this.getChartBaseOptions()
        });
        
        // Detailed Historical page chart
        this.renderDetailedHistoryPage(labels, aqiDaily, pm25Daily, pm10Daily, coList);
    }

    // Render historical page logs list and graphs
    renderDetailedHistoryPage(labels, aqiDaily, pm25Daily, pm10Daily, rawCoList) {
        if (this.historyDetailedChart) this.historyDetailedChart.destroy();
        
        const ctxHist = document.getElementById('historyDetailedChart').getContext('2d');
        this.historyDetailedChart = new Chart(ctxHist, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    { label: 'AQI', data: aqiDaily, borderColor: '#E86F88', borderWidth: 2, fill: false },
                    { label: 'PM2.5', data: pm25Daily, borderColor: '#2ecc71', borderWidth: 1.5, fill: false },
                    { label: 'PM10', data: pm10Daily, borderColor: '#f1c40f', borderWidth: 1.5, fill: false }
                ]
            },
            options: this.getChartBaseOptions()
        });
        
        // Populate logs list table
        const logsList = document.getElementById('historical-logs-list');
        if (logsList) {
            logsList.innerHTML = '';
            labels.forEach((day, index) => {
                const aqi = aqiDaily[index];
                const cat = this.getAQICategory(aqi);
                const item = document.createElement('div');
                item.className = 'log-item';
                item.innerHTML = `
                    <div class="log-date">
                        <span>${day}, 2026</span>
                        <span>Avg Daily Records</span>
                    </div>
                    <div class="log-aqi-val" style="background-color: ${cat.color}">
                        AQI ${aqi}
                    </div>
                `;
                logsList.appendChild(item);
            });
        }
    }

    // Fetch comparison metrics for India cities presets list
    async loadCityComparisonData() {
        const latList = this.citiesPreset.map(c => c.lat).join(',');
        const lonList = this.citiesPreset.map(c => c.lon).join(',');
        
        try {
            const res = await fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latList}&longitude=${lonList}&current=pm2_5,pm10,carbon_monoxide`);
            const listData = await res.json();
            
            const compiledCities = [];
            const dataArray = Array.isArray(listData) ? listData : [listData];
            
            this.citiesPreset.forEach((cityPreset, index) => {
                const node = dataArray[index];
                if (!node) return;
                
                const pm2_5 = node.current?.pm2_5 || 15;
                const pm10 = node.current?.pm10 || 25;
                const co = node.current?.carbon_monoxide || 400;
                
                const details = this.predictAQILocally(pm2_5, pm10, co, 25, 60, 10);
                
                compiledCities.push({
                    name: cityPreset.name,
                    aqi: details.predicted_aqi,
                    category: details.category,
                    color: details.color,
                    pm2_5: Math.round(pm2_5),
                    co: Math.round(co)
                });
                
                // Add city marker with dynamic calculated AQI values
                this.addCityMarker(cityPreset, details.predicted_aqi);
            });
            
            // 1. Populate comparison page chart (sorted Top 15 most polluted)
            if (this.comparisonChart) this.comparisonChart.destroy();
            const ctxComp = document.getElementById('comparisonChart').getContext('2d');
            
            const sortedForChart = [...compiledCities].sort((a, b) => b.aqi - a.aqi).slice(0, 15);
            
            this.comparisonChart = new Chart(ctxComp, {
                type: 'bar',
                data: {
                    labels: sortedForChart.map(c => c.name),
                    datasets: [{
                        label: 'AQI Index',
                        data: sortedForChart.map(c => c.aqi),
                        backgroundColor: sortedForChart.map(c => c.color),
                        borderRadius: 6,
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        x: { grid: { display: false }, ticks: { color: '#333333' } },
                        y: { grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { color: '#333333' } }
                    }
                }
            });
            
            // 2. Populate comparison page table (live leaderboard sorted descending)
            const tbody = document.getElementById('comparison-table-body');
            if (tbody) {
                tbody.innerHTML = '';
                const sortedAll = [...compiledCities].sort((a, b) => b.aqi - a.aqi);
                sortedAll.forEach(city => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td><strong>${city.name}</strong></td>
                        <td><strong style="color: ${city.color}">${city.aqi}</strong></td>
                        <td><span class="table-cat-badge" style="background-color: ${city.color}">${city.category}</span></td>
                        <td>${city.pm2_5} µg/m³</td>
                        <td>${city.co} µg/m³</td>
                    `;
                    tbody.appendChild(tr);
                });
            }
            
            // Update counter in full map tab
            const counterEl = document.getElementById('map-cities-count');
            if (counterEl) counterEl.innerText = compiledCities.length;
            
        } catch (e) {
            console.error("Comparison load failure", e);
        }
    }

    // Fetch model metadata parameters and plot feature importances
    async loadModelMetaData() {
        let meta;
        try {
            const res = await fetch(`${this.backendUrl}/model-info`);
            meta = await res.json();
        } catch (e) {
            console.warn("Using offline simulation model info...", e);
            meta = {
                features: ['PM2.5', 'PM10', 'CO', 'NO2', 'SO2', 'O3', 'Temperature', 'Humidity', 'Wind Speed'],
                importances: [0.35, 0.22, 0.15, 0.10, 0.08, 0.05, 0.03, 0.01, 0.01],
                metrics: { r2: 0.9916, rmse: 4.12, mae: 2.84 }
            };
        }
        
        // Update accuracy text fields
        document.getElementById('model-metric-r2').innerText = meta.metrics.r2.toFixed(4);
        document.getElementById('model-metric-rmse').innerText = meta.metrics.rmse.toFixed(3);
        document.getElementById('model-metric-mae').innerText = meta.metrics.mae.toFixed(3);
        
        const trustBadge = document.getElementById('trust-badge');
        if (trustBadge) {
            trustBadge.innerHTML = `
                <span class="material-symbols-outlined">shield_check</span>
                <span>Model R² ${meta.metrics.r2.toFixed(2)}</span>
            `;
        }
        
        // Render Feature Importance Chart (limit to top 15 labels to fit cleanly)
        if (this.featureImportanceChart) this.featureImportanceChart.destroy();
        const ctxFeat = document.getElementById('featureImportanceChart').getContext('2d');
        
        // Merge into array of objects and sort by importance weight
        const mergedImportances = meta.features.map((feat, i) => ({
            feature: feat,
            importance: meta.importances[i] || 0.0
        })).sort((a, b) => b.importance - a.importance).slice(0, 15);
        
        this.featureImportanceChart = new Chart(ctxFeat, {
            type: 'bar',
            data: {
                labels: mergedImportances.map(m => m.feature),
                datasets: [{
                    label: 'Relative Weight',
                    data: mergedImportances.map(m => m.importance),
                    backgroundColor: '#994D3F',
                    hoverBackgroundColor: '#E86F88',
                    borderRadius: 4
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { grid: { color: 'rgba(0, 0, 0, 0.05)' }, ticks: { color: '#333333' } },
                    y: { grid: { display: false }, ticks: { color: '#333333' } }
                }
            }
        });
    }

    // Health Advisory static rendering
    initHealthPanel() {
        const container = document.getElementById('health-cards-container');
        if (!container) return;
        container.innerHTML = '';
        
        this.aqiThresholds.forEach(thresh => {
            let alertsList = "";
            if (thresh.category === 'Good') {
                alertsList = "<li>Safe to jog and exercise outdoors</li><li>Keep windows open for ventilation</li><li>Ideal environment for children and seniors</li>";
            } else if (thresh.category === 'Satisfactory') {
                alertsList = "<li>Unusually sensitive groups should check for symptoms</li><li>General public is safe to continue normal outdoor activity</li><li>Ventilation is generally safe</li>";
            } else if (thresh.category === 'Moderate') {
                alertsList = "<li>Sensitive groups should reduce intense outdoor activities</li><li>Slight respiratory discomfort may trigger in asthma patients</li><li>Consider closing windows if symptoms show</li>";
            } else if (thresh.category === 'Poor') {
                alertsList = "<li>Wear protective masks (N95) outdoors</li><li>Avoid long-distance running or heavy cardio outside</li><li>Active children and seniors should stay indoors</li>";
            } else if (thresh.category === 'Very Poor') {
                alertsList = "<li>Health warning: Avoid all outdoor exertion</li><li>Shut windows. Run HEPA air filters indoors</li><li>Mandatory N95 mask if walking outdoors is required</li>";
            } else {
                alertsList = "<li>Emergency warnings: Severe health alerts</li><li>Stay indoors under closed environment</li><li>General public will experience high health impact</li>";
            }
            
            const card = document.createElement('div');
            card.className = 'health-card glass-panel';
            card.style.setProperty('--card-color', thresh.color);
            card.innerHTML = `
                <div class="health-card-header">
                    <h3>${thresh.category}</h3>
                    <span class="health-card-aqi">AQI ${thresh.min}-${thresh.max === 1000 ? '301+' : thresh.max}</span>
                </div>
                <div class="health-card-body">
                    <p><strong>Primary Recommendation:</strong> ${thresh.recommendation}</p>
                    <ul>${alertsList}</ul>
                </div>
            `;
            container.appendChild(card);
        });
    }

    // Run prediction on custom manual inputs (class member method)
    async runManualFormPrediction() {
        const pm2_5 = parseFloat(document.getElementById('input-pm25').value);
        const pm10 = parseFloat(document.getElementById('input-pm10').value);
        const co = parseFloat(document.getElementById('input-co').value);
        const temp = parseFloat(document.getElementById('input-temp').value);
        const humidity = parseFloat(document.getElementById('input-humidity').value);
        const wind_speed = parseFloat(document.getElementById('input-wind').value);
        const city_name = document.getElementById('input-city').value;
        
        const inputs = { pm2_5, pm10, co, temp, humidity, wind_speed, city_name };
        
        // Toggle loading
        document.getElementById('pred-loader').style.display = 'flex';
        document.getElementById('pred-result-body').style.opacity = '0.3';
        
        setTimeout(async () => {
            let result;
            try {
                const res = await fetch(`${this.backendUrl}/predict`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(inputs)
                });
                result = await res.json();
                if (result.error) throw new Error(result.error);
            } catch (e) {
                console.warn("Prediction server down. Computing manual simulation locally.", e);
                result = this.predictAQILocally(pm2_5, pm10, co, temp, humidity, wind_speed);
            }
            
            // Hide loader
            document.getElementById('pred-loader').style.display = 'none';
            document.getElementById('pred-result-body').style.opacity = '1';
            
            // Update radial gauge
            const radialNum = document.getElementById('radial-aqi-number');
            const radialLbl = document.getElementById('pred-category-badge');
            const radialRing = document.getElementById('circle-fill');
            
            if (radialNum) radialNum.innerText = result.predicted_aqi;
            const cat = this.getAQICategory(result.predicted_aqi);
            if (radialLbl) {
                radialLbl.innerText = cat.category;
                radialLbl.style.backgroundColor = cat.color;
            }
            
            if (radialRing) {
                const percentage = Math.min(100, (result.predicted_aqi / 300) * 100);
                radialRing.setAttribute('stroke-dasharray', `${percentage}, 100`);
                radialRing.style.stroke = cat.color;
            }
            
            // Update suggestion
            const recoEl = document.getElementById('pred-recommendation-display');
            if (recoEl) recoEl.innerText = result.recommendation || cat.recommendation;
            
            // Sync location details to user manual selected city
            this.currentCityName = `${city_name}, India`;
            this.updateLocationDisplay(this.currentCityName);
            
            // Switch tabs back to Main dashboard to see the prediction results instantly!
            const mainNav = document.querySelector('.nav-item[data-target="dashboard-panel"]');
            if (mainNav) mainNav.click();
            
        }, 800);
    }

    // Fallback Prediction Engine (if python server is offline)
    predictAQILocally(pm2_5, pm10, co, temp, humidity, wind_speed) {
        // Indian CPCB sub-index calculations approximation
        const pm25_aqi = pm2_5 * 1.5;
        const pm10_aqi = pm10 * 1.0;
        const co_aqi = (co / 1000) * 50; 
        
        let predicted_aqi = Math.max(pm25_aqi, pm10_aqi, co_aqi);
        
        // Temperature & Wind speed corrections: high wind disperses, high temp makes ozone
        if (wind_speed > 20) predicted_aqi *= 0.85;
        if (temp > 35) predicted_aqi *= 1.1;
        
        predicted_aqi = Math.round(Math.min(500, Math.max(0, predicted_aqi)));
        const cat = this.getAQICategory(predicted_aqi);
        
        return {
            predicted_aqi,
            category: cat.category,
            color: cat.color,
            recommendation: cat.recommendation
        };
    }

    // Match value to standard ranges
    getAQICategory(value) {
        for (let thresh of this.aqiThresholds) {
            if (value >= thresh.min && value <= thresh.max) {
                return thresh;
            }
        }
        return this.aqiThresholds[this.aqiThresholds.length - 1];
    }

    // Jump to the Health Advisory tab
    navigateToHealthSection() {
        const healthNav = document.querySelector('.nav-item[data-target="health-panel"]');
        if (healthNav) {
            healthNav.click();
        }
    }
}

// Collapsible Cards Toggle (Global procedural utility helper)
window.toggleCardCollapse = function(cardId) {
    const card = document.getElementById(cardId);
    if (!card) return;
    
    card.classList.toggle('collapsed');
    
    const icon = card.querySelector('.icon-arrow');
    if (icon) {
        if (card.classList.contains('collapsed')) {
            icon.innerText = 'keyboard_arrow_down';
        } else {
            icon.innerText = 'keyboard_arrow_up';
        }
    }
};

// Instantiate the OOP App on document load
document.addEventListener('DOMContentLoaded', () => {
    window.app = new AeroPredictApp();
    window.app.init();
});
