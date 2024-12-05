'use client';
import React, { useState, useEffect } from 'react';

type Particle = {
  id: number;
  top: string;
  left: string;
  size: string;
  duration: number; // Kesto sekunteina
  fadeTime: number; // Milloin häipyminen alkaa (% animaation kestosta)
  angle: string;
};

const generateParticle = (): Particle => ({
  id: Date.now(), // Uniikki ID ajan perusteella
  top: `${Math.random() * 70 - 20}%`, // Aloitus yläosasta (-20% - 10%)
  left: `${Math.random() * 100 - 50}%`, // Vaakasuunnassa (0%-100%)
  size: `${Math.random() * 3 + 1}px`, // Koko (1px - 4px)
  duration: Math.random() * 3 + 3, // Kesto (3s - 6s)
  fadeTime: Math.random() * 70 + 20, // Häipyy välillä 20% - 90% animaation kestosta
  angle: `${Math.random() * 60 - 30}deg`, // Kulman vaihtelu (-30° - 30°)
});

export default function Particles() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setParticles((prev) => {
        const newParticle = generateParticle();
        return [...prev.slice(-9), newParticle]; // Säilyttää enintään 10 tähdenlentoa
      });
    }, 1000); // Uusi tähti sekunnin välein

    return () => clearInterval(interval); // Puhdistaa intervallin
  }, []);

  return (
    <div className="particles">
      {particles.map((particle) => (
        <div
          key={particle.id} // Uniikki avain pakottaa Reactin luomaan uuden elementin
          className="particle"
          style={{
            top: particle.top,
            left: particle.left,
            width: particle.size,
            height: particle.size,
            animationDuration: `${particle.duration}s`,
            animationTimingFunction: `ease-in-out`,
            transform: `rotate(${particle.angle})`,
          }}
        ></div>
      ))}
    </div>
  );
}
