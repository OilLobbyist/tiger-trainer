import React, { useEffect, useRef, useState } from 'react';
import { Entity, EntityType, Particle } from '../types';
import { COLORS, ENTITY_CONFIGS } from '../constants';

interface GameCanvasProps {
  mode: EntityType;
  onCatch: () => void;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ mode, onCatch }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const entitiesRef = useRef<Entity[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const requestRef = useRef<number>(0);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Handle Resize with ResizeObserver
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({ width, height });
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Initialize entities based on mode
  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return;
    
    const initEntities = () => {
      const count = mode === 'laser' ? 1 : 3;
      const newEntities: Entity[] = [];
      for (let i = 0; i < count; i++) {
        newEntities.push({
          id: Math.random().toString(36).substr(2, 9),
          type: mode,
          x: Math.random() * dimensions.width,
          y: Math.random() * dimensions.height,
          vx: (Math.random() - 0.5) * 10,
          vy: (Math.random() - 0.5) * 10,
          size: ENTITY_CONFIGS[mode].size || 30,
          rotation: Math.random() * Math.PI * 2,
          color: ENTITY_CONFIGS[mode].color || '#fff',
          state: 'active',
          lastChange: Date.now(),
        });
      }
      entitiesRef.current = newEntities;
    };

    initEntities();
  }, [mode, dimensions]);

  const createParticles = (x: number, y: number, color: string) => {
    for (let i = 0; i < 20; i++) {
      particlesRef.current.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 12,
        vy: (Math.random() - 0.5) * 12,
        life: 1.0,
        color: ['#fff', '#ff9f1c', '#ffbf69', color][Math.floor(Math.random() * 4)],
        size: Math.random() * 4 + 1,
      });
    }
  };

  const update = () => {
    const now = Date.now();

    // Update Entities
    entitiesRef.current.forEach(entity => {
      if (entity.state === 'caught') {
        entity.state = 'active';
        entity.x = Math.random() * dimensions.width;
        entity.y = Math.random() * dimensions.height;
        entity.size = ENTITY_CONFIGS[entity.type].size || 30;
      }

      if (entity.state === 'falling') {
        entity.rotation += 0.2;
        entity.size *= 0.9; // Shrink inward
        // No gravity, just fade/shrink
        
        if (entity.size < 1) {
          entity.state = 'active';
          entity.x = Math.random() * dimensions.width;
          entity.y = Math.random() * dimensions.height;
          entity.size = ENTITY_CONFIGS[entity.type].size || 30;
          entity.vx = (Math.random() - 0.5) * 10;
          entity.vy = (Math.random() - 0.5) * 10;
        }
      }

      // Behavior logic
      if (entity.state === 'active') {
        if (entity.type === 'laser') {
          if (now - entity.lastChange > 500 + Math.random() * 1000) {
            // Sudden darting - slowed down
            const speed = 10 + Math.random() * 15;
            const angle = Math.random() * Math.PI * 2;
            entity.vx = Math.cos(angle) * speed;
            entity.vy = Math.sin(angle) * speed;
            entity.lastChange = now;
          }
        } else if (entity.type === 'string') {
          // String behavior: slow, organic pendulum swing
          const swingSpeed = 0.0015; // Much slower frequency
          const swingAmplitude = 150; // How far it swings
          const verticalWobble = 20;
          
          // Use initial position as anchor
          if (!entity.lastChange) entity.lastChange = now;
          const elapsed = now - entity.lastChange;
          
          // Calculate target position based on pendulum physics
          const targetX = entity.x + Math.sin(elapsed * swingSpeed) * 2;
          const targetY = entity.y + Math.cos(elapsed * swingSpeed * 2) * 0.5;
          
          entity.vx = (targetX - entity.x) * 0.1;
          entity.vy = (targetY - entity.y) * 0.1;
        } else {
          // Prey-like movement: dart and pause
          if (now - entity.lastChange > 1000 + Math.random() * 2000) {
            const isPausing = Math.random() > 0.7;
            if (isPausing) {
              entity.vx *= 0.1;
              entity.vy *= 0.1;
            } else {
              const speed = 5 + Math.random() * 10;
              const angle = Math.random() * Math.PI * 2;
              entity.vx = Math.cos(angle) * speed;
              entity.vy = Math.sin(angle) * speed;
            }
            entity.lastChange = now;
          }
          
          // Add subtle jitter
          entity.vx += (Math.random() - 0.5) * 0.5;
          entity.vy += (Math.random() - 0.5) * 0.5;
        }
      }

      entity.x += entity.vx;
      entity.y += entity.vy;

      // Bounce off walls
      if (entity.x < 0 || entity.x > dimensions.width) entity.vx *= -1;
      if (entity.y < 0 || entity.y > dimensions.height) entity.vy *= -1;

      // Update rotation to face movement
      entity.rotation = Math.atan2(entity.vy, entity.vx);
    });

    // Update Particles
    particlesRef.current = particlesRef.current.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.02;
      return p.life > 0;
    });
  };

  const draw = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, dimensions.width, dimensions.height);

    // Draw Background based on mode (OLED Optimized - Visible but Deep Gradients)
    const bgGrad = ctx.createRadialGradient(
      dimensions.width / 2, dimensions.height / 2, 0,
      dimensions.width / 2, dimensions.height / 2, Math.max(dimensions.width, dimensions.height)
    );
    
    switch (mode) {
      case 'laser': 
        bgGrad.addColorStop(0, '#0e7490'); // Cyan 700
        bgGrad.addColorStop(0.7, '#000000'); 
        break;
      case 'mouse': 
        bgGrad.addColorStop(0, '#b45309'); // Amber 700
        bgGrad.addColorStop(0.7, '#000000'); 
        break;
      case 'bird': 
        bgGrad.addColorStop(0, '#047857'); // Emerald 700
        bgGrad.addColorStop(0.7, '#000000'); 
        break;
      case 'fish': 
        bgGrad.addColorStop(0, '#1d4ed8'); // Blue 700
        bgGrad.addColorStop(0.7, '#000000'); 
        break;
      case 'string': 
        bgGrad.addColorStop(0, '#be123c'); // Rose 700
        bgGrad.addColorStop(0.7, '#000000'); 
        break;
      default: 
        bgGrad.addColorStop(0, '#000000');
        bgGrad.addColorStop(1, '#000000');
    }
    
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, dimensions.width, dimensions.height);

    // Draw Entities
    entitiesRef.current.forEach(entity => {
      ctx.save();
      ctx.translate(entity.x, entity.y);
      ctx.rotate(entity.rotation);

      if (entity.state === 'falling') {
        ctx.globalAlpha = Math.max(0, entity.size / 10);
      }

      if (entity.type === 'laser') {
        const pulse = 1 + Math.sin(Date.now() / 100) * 0.1;
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, entity.size * pulse);
        gradient.addColorStop(0, '#fff');
        gradient.addColorStop(0.3, entity.color);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, entity.size * pulse, 0, Math.PI * 2);
        ctx.fill();
        
        // Training spark effect
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        const sparkSize = entity.size * 0.6 * pulse;
        for (let i = 0; i < 4; i++) {
          const angle = (i * Math.PI) / 2 + (Date.now() / 200);
          ctx.moveTo(Math.cos(angle) * sparkSize * 0.5, Math.sin(angle) * sparkSize * 0.5);
          ctx.lineTo(Math.cos(angle) * sparkSize, Math.sin(angle) * sparkSize);
        }
        ctx.stroke();

        // Glow effect
        ctx.shadowBlur = 30 * pulse;
        ctx.shadowColor = entity.color;
      } else if (entity.type === 'mouse') {
        const wiggle = Math.sin(Date.now() / 50) * 0.05;
        ctx.scale(1 + wiggle, 1 - wiggle);
        ctx.fillStyle = entity.color;
        // Body
        ctx.beginPath();
        ctx.ellipse(0, 0, entity.size, entity.size / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        // Ears
        ctx.beginPath();
        ctx.ellipse(entity.size / 2, -entity.size / 3, entity.size / 4, entity.size / 3, -0.5, 0, Math.PI * 2);
        ctx.ellipse(entity.size / 2, entity.size / 3, entity.size / 4, entity.size / 3, 0.5, 0, Math.PI * 2);
        ctx.fill();
        // Tail
        ctx.strokeStyle = entity.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-entity.size, 0);
        ctx.quadraticCurveTo(-entity.size * 1.5, Math.sin(Date.now() / 100) * 10, -entity.size * 2, 0);
        ctx.stroke();
      } else if (entity.type === 'bird') {
        const flap = Math.sin(Date.now() / 50) * 0.2;
        ctx.scale(1, 1 + flap);
        ctx.fillStyle = entity.color;
        // Body
        ctx.beginPath();
        ctx.ellipse(0, 0, entity.size, entity.size / 2.5, 0, 0, Math.PI * 2);
        ctx.fill();
        // Beak
        ctx.fillStyle = '#ffb703';
        ctx.beginPath();
        ctx.moveTo(entity.size, 0);
        ctx.lineTo(entity.size + 10, -5);
        ctx.lineTo(entity.size + 10, 5);
        ctx.closePath();
        ctx.fill();
        // Wings
        ctx.fillStyle = entity.color;
        const wingSpread = Math.sin(Date.now() / 100) * entity.size;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-entity.size / 2, -wingSpread);
        ctx.lineTo(entity.size / 2, 0);
        ctx.fill();
      } else if (entity.type === 'fish') {
        const wiggle = Math.sin(Date.now() / 100) * 0.1;
        ctx.rotate(wiggle);
        ctx.fillStyle = entity.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, entity.size, entity.size / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        // Tail wiggle
        const tailWiggle = Math.sin(Date.now() / 150) * 8;
        ctx.beginPath();
        ctx.moveTo(-entity.size, 0);
        ctx.lineTo(-entity.size - 15, -10 + tailWiggle);
        ctx.lineTo(-entity.size - 15, 10 + tailWiggle);
        ctx.closePath();
        ctx.fill();
      } else if (entity.type === 'string') {
        // Draw dangling string
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 4;
        
        // Draw string with a slight curve (quadratic)
        ctx.beginPath();
        ctx.moveTo(0, -entity.y); // Anchor at top
        ctx.quadraticCurveTo(
          Math.sin(Date.now() / 500) * 20, 
          -entity.y / 2, 
          0, 0
        );
        ctx.stroke();

        // Toy at the end
        ctx.fillStyle = entity.color;
        ctx.beginPath();
        ctx.arc(0, 0, entity.size, 0, Math.PI * 2);
        ctx.fill();

        // Feathers/Fringe
        ctx.fillStyle = entity.color;
        for (let i = 0; i < 5; i++) {
          ctx.save();
          const angle = (i * Math.PI * 2) / 5 + Math.sin(Date.now() / 200) * 0.2;
          ctx.rotate(angle);
          ctx.beginPath();
          ctx.ellipse(entity.size * 0.8, 0, entity.size * 0.7, entity.size / 4, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      ctx.restore();
    });

    // Draw Particles
    particlesRef.current.forEach(p => {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1.0;
  };

  const animate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    update();
    draw(ctx);
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [mode, dimensions]);

  const handleInteraction = (clientX: number, clientY: number) => {
    entitiesRef.current.forEach(entity => {
      if (entity.state !== 'active') return;
      
      const dx = entity.x - clientX;
      const dy = entity.y - clientY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < entity.size * 2) {
        if (entity.type === 'bird') {
          entity.state = 'falling';
        } else {
          entity.state = 'caught';
        }
        createParticles(entity.x, entity.y, entity.color);
        onCatch();
      }
    });
  };

  return (
    <div ref={containerRef} className="w-full h-full overflow-hidden bg-black">
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        className="block touch-none cursor-none"
        onMouseDown={(e) => handleInteraction(e.clientX, e.clientY)}
        onTouchStart={(e) => {
          e.preventDefault();
          // Handle all touches for multi-paw pouncing
          Array.from(e.touches).forEach((touch: React.Touch) => {
            handleInteraction(touch.clientX, touch.clientY);
          });
        }}
      />
    </div>
  );
};

export default GameCanvas;
