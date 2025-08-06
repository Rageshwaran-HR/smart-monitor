'use client';

import { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  analyser: AnalyserNode | null;
  isPlaying: boolean;
}

export function AudioVisualizer({ analyser, isPlaying }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const animate = () => {
      if (!ctx || !canvas) return;

      // Clear canvas with gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, 'rgba(147, 51, 234, 0.1)'); // Purple
      gradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.1)'); // Blue
      gradient.addColorStop(1, 'rgba(99, 102, 241, 0.1)'); // Indigo
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (analyser && isPlaying) {
        // Get audio data
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);

        // Draw frequency bars
        const barWidth = canvas.width / bufferLength * 2.5;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * canvas.height * 0.8;
          
          // Create neon glow effect
          const hue = (i / bufferLength) * 360;
          const saturation = 70 + (dataArray[i] / 255) * 30;
          const lightness = 50 + (dataArray[i] / 255) * 30;
          
          // Outer glow
          ctx.shadowColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
          ctx.shadowBlur = 20;
          ctx.fillStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, 0.6)`;
          ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
          
          // Inner bright core
          ctx.shadowBlur = 5;
          ctx.fillStyle = `hsla(${hue}, ${saturation}%, ${lightness + 20}%, 0.8)`;
          ctx.fillRect(x + barWidth * 0.25, canvas.height - barHeight, barWidth * 0.5, barHeight);
          
          x += barWidth + 1;
        }

        // Draw circular visualizer in center
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(canvas.width, canvas.height) * 0.15;

        for (let i = 0; i < bufferLength; i += 4) {
          const angle = (i / bufferLength) * Math.PI * 2;
          const amplitude = (dataArray[i] / 255) * radius * 0.5;
          
          const startX = centerX + Math.cos(angle) * radius;
          const startY = centerY + Math.sin(angle) * radius;
          const endX = centerX + Math.cos(angle) * (radius + amplitude);
          const endY = centerY + Math.sin(angle) * (radius + amplitude);
          
          const hue = (i / bufferLength) * 360 + Date.now() * 0.1;
          
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(endX, endY);
          ctx.strokeStyle = `hsla(${hue % 360}, 70%, 60%, 0.8)`;
          ctx.lineWidth = 3;
          ctx.shadowColor = `hsl(${hue % 360}, 70%, 60%)`;
          ctx.shadowBlur = 10;
          ctx.stroke();
        }

        // Draw pulsing waves
        const time = Date.now() * 0.005;
        const waveAmplitude = Math.max(...dataArray) / 255 * 50;
        
        for (let wave = 0; wave < 3; wave++) {
          ctx.beginPath();
          ctx.strokeStyle = `hsla(${(wave * 120 + time * 50) % 360}, 60%, 50%, ${0.3 - wave * 0.1})`;
          ctx.lineWidth = 2 + wave;
          ctx.shadowColor = `hsl(${(wave * 120 + time * 50) % 360}, 60%, 50%)`;
          ctx.shadowBlur = 15;
          
          for (let x = 0; x <= canvas.width; x += 5) {
            const y = centerY + 
              Math.sin(x * 0.01 + time + wave * 2) * waveAmplitude * (1 + wave * 0.5) +
              Math.sin(x * 0.005 + time * 2 + wave) * waveAmplitude * 0.5;
            
            if (x === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }
          ctx.stroke();
        }
      } else {
        // Static animation when not playing
        const time = Date.now() * 0.001;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        // Gentle pulsing rings
        for (let ring = 0; ring < 5; ring++) {
          const radius = 50 + ring * 30 + Math.sin(time + ring) * 10;
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
          ctx.strokeStyle = `hsla(${(ring * 60 + time * 30) % 360}, 40%, 40%, ${0.2 - ring * 0.03})`;
          ctx.lineWidth = 2;
          ctx.shadowColor = `hsl(${(ring * 60 + time * 30) % 360}, 40%, 40%)`;
          ctx.shadowBlur = 10;
          ctx.stroke();
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [analyser, isPlaying]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ filter: 'blur(0.5px)' }}
    />
  );
}
