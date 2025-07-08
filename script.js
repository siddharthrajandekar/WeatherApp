// API keys and URLs
const API_Key = "API_Key" //Add your API key Here.
const API_URL = "https://api.openweathermap.org/data/2.5/weather?";
const geo_API_URL = "http://api.openweathermap.org/geo/1.0/direct?";

// DOM elements
const search_btn = document.getElementById("search-btn");
const location_btn = document.getElementById("location-btn");
const city_name = document.getElementById("city-name");
const loadingMessage = document.getElementById("loading-message");

// Event listeners for buttons
search_btn.addEventListener("click", () => {
    fetchWeatherbyCity(city_name.value.trim());
});

location_btn.addEventListener("click", fetchWeatherbyLocation);

// Get weather using city name
async function fetchWeatherbyCity(city) {
    loadingMessage.style.display = "block";
    try {
        const coords = await cityToCoords(city);
        if (!coords) return;

        const weather_json = await fetchWeatherbyCoords(coords[0], coords[1]);
        if (weather_json) displayWeather(weather_json);
    } finally {
        loadingMessage.style.display = "none";
    }
}

// Get weather using device location
function fetchWeatherbyLocation() {
    async function success(position) {
        loadingMessage.style.display = "block";
        try {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            const json = await fetchWeatherbyCoords(latitude, longitude);
            if (json) displayWeather(json);
        } finally {
            loadingMessage.style.display = "none";
        }
    }

    function error(error) {
        switch (error.code) {
            case error.PERMISSION_DENIED:
                alert("User denied the request for Geolocation.");
                break;
            case error.POSITION_UNAVAILABLE:
                alert("Location information is unavailable.");
                break;
            case error.TIMEOUT:
                alert("The request to get user location timed out.");
                break;
            default:
                alert("An unknown error occurred.");
        }
        loadingMessage.style.display = "none";
    }

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(success, error);
    } else {
        alert("Geolocation is not supported by the browser");
    }
}

// Update DOM with weather info
function displayWeather(json) {
    const city = json.name;
    const country = json.sys.country;
    const temperature = Math.round(json.main.temp);
    const condition = json.weather[0].description;
    const iconCode = json.weather[0].icon;
    const humidity = json.main.humidity;
    const windSpeed = json.wind.speed;
    const pressure = json.main.pressure;

    // Update main values
    document.getElementById("city-country").textContent = `${city}, ${country}`;
    document.getElementById("temperature").textContent = `${temperature}°C`;

    // Update icon and condition
    const iconEl = document.getElementById("weather-icon");
    iconEl.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    iconEl.alt = condition;
    iconEl.previousSibling.textContent = ` ${condition.charAt(0).toUpperCase() + condition.slice(1)} `;

    // Update sub values
    const subDataEls = document.querySelectorAll(".sub-weather-data p");
    if (subDataEls.length === 3) {
        subDataEls[0].textContent = `Humidity: ${humidity}%`;
        subDataEls[1].textContent = `Wind Speed: ${windSpeed} m/s`;
        subDataEls[2].textContent = `Pressure: ${pressure} hPa`;
    }
}

// Fetch weather data by coordinates
async function fetchWeatherbyCoords(lat, lon) {
    const url = `${API_URL}lat=${lat}&lon=${lon}&appid=${API_Key}&units=metric`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Response status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error(error.message);
    }
}

// Convert city name to coordinates using Geo API
async function cityToCoords(city) {
    const url = `${geo_API_URL}q=${city}&appid=${API_Key}`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Response status: ${response.status}`);
        const json = await response.json();
        return [json[0].lat, json[0].lon];
    } catch (error) {
        console.error(error.message);
    }
}
