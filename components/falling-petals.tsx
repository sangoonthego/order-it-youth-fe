"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

interface Petal {
  id: number;
  left: string;
  animationDuration: string;
  animationDelay: string;
  size: string;
  opacity: string;
  imageSrc: string; 
}

interface FallingPetalsProps {
  petalImageSrc?: string; 
  numberOfPetals?: number; 
}

const FallingPetals: React.FC<FallingPetalsProps> = ({ 
  petalImageSrc = "/animations/sakura.png", 
  numberOfPetals = 30 
}) => {
  const [petals, setPetals] = useState<Petal[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const generatePetals = () => {
      if (!containerRef.current) return;

      const newPetals: Petal[] = [];
      for (let i = 0; i < numberOfPetals; i++) {
        newPetals.push({
          id: i,
          left: `${Math.random() * 100}vw`, 
          animationDuration: `${Math.random() * 10 + 5}s`, 
          animationDelay: `${Math.random() * 10}s`,
          size: `${Math.random() * 20 + 40}px`, 
          opacity: `${Math.random() * 0.5 + 0.5}`, // Độ mờ 50-100%
          imageSrc: petalImageSrc,
        });
      }
      setPetals(newPetals);
    };

    generatePetals();

  }, [petalImageSrc, numberOfPetals]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none z-0"
    >
      {petals.map((petal) => (
        <Image
          key={petal.id}
          src={petal.imageSrc}
          alt="petal"
          width={parseInt(petal.size)}
          height={parseInt(petal.size)}
          className="absolute animate-fall opacity-0" 
          style={{
            left: petal.left,
            animationDuration: petal.animationDuration,
            animationDelay: petal.animationDelay,
            width: petal.size,
            height: petal.size,
            opacity: petal.opacity,
          }}
        />
      ))}

      {/* Tailwind CSS keyframes for falling and fading */}
      <style jsx global>{`
        @keyframes fall {
          0% {
            transform: translateY(-10vh) rotateZ(0deg) scale(0.8);
            opacity: 0;
          }
          10% {
            opacity: ${petals.length > 0 ? petals[0].opacity : 0.8}; /* Adjust based on actual petal opacity */
          }
          100% {
            transform: translateY(110vh) rotateZ(720deg) scale(1.2);
            opacity: 0;
          }
        }
        .animate-fall {
          animation-name: fall;
          animation-iteration-count: infinite;
          animation-timing-function: linear;
        }
      `}</style>
    </div>
  );
};

export default FallingPetals;