import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Weather() {
    const [weatherData, setWeatherData] = useState(null);
    const API_KEY = '7de5a5db4d0f4339a3d152516231011'; 
    const LOCATION = 'College Station'; 

    useEffect(() => {
        const fetchWeatherData = async () => {
            try {
                const url = `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${LOCATION}`;
                const response = await axios.get(url);
                setWeatherData(response.data);
            } catch (error) {
                console.error("Error fetching weather data:", error);
            }
        };

        fetchWeatherData();
    }, []);

    if (!weatherData) {
        return <div>Loading weather data...</div>;
    }

    return (
        <div className="weather-container">
            <p className="centered-text">
                Local Weather : {weatherData.current.temp_f}°F 
                | {weatherData.current.condition.text}
            </p>
        </div>
    );
}

export default Weather;
