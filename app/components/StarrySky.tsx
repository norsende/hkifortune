'use client';
import { useState, useEffect } from 'react';

const generateStars = (count: number) => {
  const stars = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      id: i,
      top: `${Math.random() * 100}%`, // Satunnainen sijainti pystysuunnassa
      left: `${Math.random() * 100}%`, // Satunnainen sijainti vaakasuunnassa
      size: `${Math.random() * 2 + 1}px`, // Koko (1px - 3px)
      delay: `${Math.random() * 5}s`, // Viive ennen välkkymistä
      duration: `${Math.random() * 5 + 2}s`, // Kesto (2s - 7s)
      opacity: Math.random() * 0.8 + 0.2, // Satunnainen kirkkaus (0.2 - 1)
      color: `rgba(${Math.floor(Math.random() * 256)}, ${Math.floor(
        Math.random() * 256
      )}, ${255}, 0.8)`, // Satunnainen väri (sinertävä painotus)
    });
  }
  return stars;
};


export default function StarrySky() {
  const [stars, setStars] = useState(generateStars(100)); // Luo 100 tähteä

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden">
      {stars.map((star) => (
        <div
          key={star.id}
          className="star"
          style={{
            top: star.top,
            left: star.left,
            width: star.size,
            height: star.size,
            animationDelay: star.delay,
            animationDuration: star.duration,
            background: star.color, // Satunnainen väri
            opacity: star.opacity, // Satunnainen kirkkaus
          }}
        ></div>
      ))}
    </div>
  );  
}
