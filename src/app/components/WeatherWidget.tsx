"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface WeatherData {
  current: {
    temp_c: number;
    condition: {
      text: string;
      icon: string;
    };
  };
  forecast: {
    forecastday: Array<{
      date: string;
      day: {
        maxtemp_c: number;
        mintemp_c: number;
        condition: {
          text: string;
          icon: string;
        };
      };
    }>;
  };
}

const WeatherWidget = () => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const API_KEY = '4872168c226f4d988a2200744250608';
        const response = await fetch(
          `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=Chennai&days=7&aqi=no`
        );
        
        if (!response.ok) {
          throw new Error('Weather API failed');
        }
        
        const data = await response.json();
        setWeatherData(data);
      } catch (error) {
        console.error('Failed to fetch weather:', error);
        // Fallback data if API fails
        setWeatherData({
          current: {
            temp_c: 28,
            condition: {
              text: "Mist",
              icon: "//cdn.weatherapi.com/weather/64x64/day/143.png"
            }
          },
          forecast: {
            forecastday: [
              { date: "2025-08-07", day: { maxtemp_c: 33, mintemp_c: 27, condition: { text: "Rain", icon: "//cdn.weatherapi.com/weather/64x64/day/296.png" } } },
              { date: "2025-08-08", day: { maxtemp_c: 32, mintemp_c: 28, condition: { text: "Rain", icon: "//cdn.weatherapi.com/weather/64x64/day/296.png" } } },
              { date: "2025-08-09", day: { maxtemp_c: 29, mintemp_c: 25, condition: { text: "Rain", icon: "//cdn.weatherapi.com/weather/64x64/day/296.png" } } },
              { date: "2025-08-10", day: { maxtemp_c: 31, mintemp_c: 25, condition: { text: "Rain", icon: "//cdn.weatherapi.com/weather/64x64/day/296.png" } } },
              { date: "2025-08-11", day: { maxtemp_c: 32, mintemp_c: 27, condition: { text: "Rain", icon: "//cdn.weatherapi.com/weather/64x64/day/296.png" } } },
              { date: "2025-08-12", day: { maxtemp_c: 31, mintemp_c: 27, condition: { text: "Rain", icon: "//cdn.weatherapi.com/weather/64x64/day/296.png" } } },
              { date: "2025-08-13", day: { maxtemp_c: 31, mintemp_c: 27, condition: { text: "Rain", icon: "//cdn.weatherapi.com/weather/64x64/day/296.png" } } }
            ]
          }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
    // Update every 30 minutes
    const interval = setInterval(fetchWeather, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getDayName = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  if (loading) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <div className="bg-black/40 backdrop-blur-md rounded-xl p-4 border border-white/20 shadow-lg">
          <div className="text-white text-sm">Loading weather...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="bg-black/40 backdrop-blur-md border border-white/20 rounded-xl p-4 shadow-lg min-w-[320px] text-white">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-lg">CHENNAI</h3>
            <p className="text-sm opacity-80">WEATHER</p>
          </div>
          <div className="flex items-center">
            <div className="text-3xl mr-2">〰〰〰</div>
            <div className="text-right">
              <div className="text-3xl font-bold">{weatherData?.current.temp_c}°C</div>
              <div className="text-sm opacity-80">{weatherData?.current.condition.text}</div>
            </div>
          </div>
        </div>

        {/* 7-day forecast */}
        <div className="grid grid-cols-7 gap-2">
          {weatherData?.forecast.forecastday.map((day, index) => (
            <div key={index} className="text-center">
              <div className="text-xs font-medium mb-1">
                {getDayName(day.date)}
              </div>
              <div className="w-8 h-8 mx-auto mb-1 flex items-center justify-center">
                <Image 
                  src={`https:${day.day.condition.icon}`}
                  alt={day.day.condition.text}
                  width={24}
                  height={24}
                  className="opacity-80"
                />
              </div>
              <div className="text-xs font-bold">
                {Math.round(day.day.maxtemp_c)}°
              </div>
              <div className="text-xs opacity-70">
                {Math.round(day.day.mintemp_c)}°
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeatherWidget;
