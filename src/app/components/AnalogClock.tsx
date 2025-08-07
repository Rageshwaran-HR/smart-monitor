'use client';

import React, { useEffect } from 'react';
import './AnalogClock.css'; // Styles separated for clarity

export const AnalogClock = () => {
  useEffect(() => {
    const deg = 6;
    const hour = document.querySelector('.hour') as HTMLElement;
    const min = document.querySelector('.min') as HTMLElement;
    const sec = document.querySelector('.sec') as HTMLElement;

    const setClock = () => {
      const day = new Date();
      const hh = day.getHours() * 30;
      const mm = day.getMinutes() * deg;
      const ss = day.getSeconds() * deg;

      hour.style.transform = `rotateZ(${hh + mm / 12}deg)`;
      min.style.transform = `rotateZ(${mm}deg)`;
      sec.style.transform = `rotateZ(${ss}deg)`;
    };

    setClock(); // Initial
    const interval = setInterval(setClock, 1000); // Every second

    return () => clearInterval(interval); // Cleanup
  }, []);

  return (
    <div className="clock-widget">
      <div className="clock">
        <div className="hour"></div>
        <div className="min"></div>
        <div className="sec"></div>
      </div>
    </div>
  );
};
