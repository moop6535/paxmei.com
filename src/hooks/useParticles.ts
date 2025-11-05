import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
}

interface UseParticlesOptions {
  particleCount?: number;
  particleSize?: number;
  particleSpeed?: number;
  particleColor?: string;
  particleOpacity?: number;
}

const getResponsiveParticleCount = (width: number, baseCount: number): number => {
  if (width >= 1024) return baseCount; // Desktop
  if (width >= 768) return Math.floor(baseCount * 0.67); // Tablet
  return Math.floor(baseCount * 0.4); // Mobile
};

export const useParticles = (options: UseParticlesOptions = {}) => {
  const {
    particleCount = 75,
    particleSize = 3,
    particleSpeed = 0.5,
    particleColor = '#ffffff',
    particleOpacity = 0.2,
  } = options;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const lastTimeRef = useRef<number>(0);
  const fpsCounterRef = useRef<number[]>([]);

  // Initialize particles
  const initParticles = (width: number, height: number) => {
    const count = getResponsiveParticleCount(width, particleCount);
    const particles: Particle[] = [];

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * particleSpeed,
        vy: (Math.random() - 0.5) * particleSpeed,
        size: Math.random() * (particleSize - 2) + 2, // 2-4px by default
        opacity: Math.random() * (particleOpacity - 0.1) + 0.1, // 0.1-0.3 by default
      });
    }

    particlesRef.current = particles;
  };

  // Update particle positions
  const updateParticles = (width: number, height: number, deltaTime: number) => {
    const particles = particlesRef.current;

    for (let i = 0; i < particles.length; i++) {
      const particle = particles[i];

      // Update position with delta time for consistent movement
      particle.x += particle.vx * deltaTime * 0.1;
      particle.y += particle.vy * deltaTime * 0.1;

      // Toroidal wrapping (particles wrap around screen edges)
      if (particle.x < 0) particle.x = width;
      if (particle.x > width) particle.x = 0;
      if (particle.y < 0) particle.y = height;
      if (particle.y > height) particle.y = 0;

      // Add subtle sine wave for organic movement
      particle.x += Math.sin(Date.now() * 0.0001 + i) * 0.1;
      particle.y += Math.cos(Date.now() * 0.0001 + i) * 0.1;
    }
  };

  // Render particles
  const renderParticles = (ctx: CanvasRenderingContext2D) => {
    const particles = particlesRef.current;

    for (let i = 0; i < particles.length; i++) {
      const particle = particles[i];

      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fillStyle = `${particleColor}${Math.floor(particle.opacity * 255)
        .toString(16)
        .padStart(2, '0')}`;
      ctx.fill();
    }
  };

  // Animation loop
  const animate = (currentTime: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Calculate delta time
    const deltaTime = currentTime - lastTimeRef.current;
    lastTimeRef.current = currentTime;

    // FPS monitoring
    if (deltaTime > 0) {
      const fps = 1000 / deltaTime;
      fpsCounterRef.current.push(fps);

      // Keep only last 60 frames for average
      if (fpsCounterRef.current.length > 60) {
        fpsCounterRef.current.shift();
      }

      // If average FPS drops below 50, reduce particle count
      const avgFps =
        fpsCounterRef.current.reduce((a, b) => a + b, 0) /
        fpsCounterRef.current.length;

      if (avgFps < 50 && particlesRef.current.length > 30) {
        // Remove 10% of particles
        const removeCount = Math.floor(particlesRef.current.length * 0.1);
        particlesRef.current = particlesRef.current.slice(0, -removeCount);
        console.warn(
          `Low FPS detected (${avgFps.toFixed(1)}). Reduced particle count to ${
            particlesRef.current.length
          }`
        );
      }
    }

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update and render particles
    updateParticles(canvas.width, canvas.height, deltaTime);
    renderParticles(ctx);

    // Continue animation
    animationFrameRef.current = requestAnimationFrame(animate);
  };

  // Handle window resize
  const handleResize = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
    }

    // Reinitialize particles with new dimensions
    initParticles(rect.width, rect.height);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Initial setup
    handleResize();

    // Start animation
    lastTimeRef.current = performance.now();
    animationFrameRef.current = requestAnimationFrame(animate);

    // Add resize listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      if (animationFrameRef.current !== undefined) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [particleCount, particleSize, particleSpeed, particleColor, particleOpacity]);

  return canvasRef;
};
