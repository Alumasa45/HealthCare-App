"use client";

import React, { useEffect, useRef } from "react";
import useCursorPreferences from "@/hooks/useCursorPreferences";

interface SnowflakeCursorOptions {
  element?: HTMLElement;
}

const SnowflakeCursor: React.FC<SnowflakeCursorOptions> = ({ element }) => {
  const { snowflakeEnabled } = useCursorPreferences();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particles = useRef<any[]>([]);
  const canvImages = useRef<HTMLCanvasElement[]>([]);
  const animationFrame = useRef<number | null>(null);
  const prefersReducedMotion = useRef<MediaQueryList | null>(null);

  useEffect(() => {
    // Check if window is defined (to ensure code runs on client-side)
    if (typeof window === "undefined") return;

    // Don't initialize if snowflake cursor is disabled
    if (!snowflakeEnabled) return;

    prefersReducedMotion.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) return;

    const targetElement = element || document.body;

    canvas.style.position = element ? "absolute" : "fixed";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = "9999";

    targetElement.appendChild(canvas);
    canvasRef.current = canvas;

    const setCanvasSize = () => {
      canvas.width = element ? targetElement.clientWidth : window.innerWidth;
      canvas.height = element ? targetElement.clientHeight : window.innerHeight;
    };

    const createEmojiImages = () => {
      // Create custom purple snowflakes instead of using emoji
      const snowflakeSize = 16;
      const purpleColors = [
        "#8B5CF6", // violet-500
        "#A855F7", // purple-500
        "#9333EA", // violet-600
        "#7C3AED", // violet-700
        "#6D28D9", // violet-800
      ];

      purpleColors.forEach((color) => {
        const bgCanvas = document.createElement("canvas");
        const bgContext = bgCanvas.getContext("2d");
        if (!bgContext) return;

        bgCanvas.width = snowflakeSize;
        bgCanvas.height = snowflakeSize;

        const centerX = snowflakeSize / 2;
        const centerY = snowflakeSize / 2;
        const radius = snowflakeSize / 3;

        bgContext.strokeStyle = color;
        bgContext.fillStyle = color;
        bgContext.lineWidth = 1.5;

        // Draw a 6-pointed snowflake
        bgContext.beginPath();

        // Main axes
        for (let i = 0; i < 6; i++) {
          const angle = (i * Math.PI) / 3;
          const x1 = centerX + Math.cos(angle) * radius;
          const y1 = centerY + Math.sin(angle) * radius;
          const x2 = centerX - Math.cos(angle) * radius;
          const y2 = centerY - Math.sin(angle) * radius;

          bgContext.moveTo(x1, y1);
          bgContext.lineTo(x2, y2);

          // Add small branches
          const branchLength = radius * 0.3;
          const branchAngle1 = angle + Math.PI / 6;
          const branchAngle2 = angle - Math.PI / 6;

          bgContext.moveTo(x1, y1);
          bgContext.lineTo(
            x1 - Math.cos(branchAngle1) * branchLength,
            y1 - Math.sin(branchAngle1) * branchLength
          );

          bgContext.moveTo(x1, y1);
          bgContext.lineTo(
            x1 - Math.cos(branchAngle2) * branchLength,
            y1 - Math.sin(branchAngle2) * branchLength
          );
        }

        bgContext.stroke();

        // Add center circle
        bgContext.beginPath();
        bgContext.arc(centerX, centerY, 2, 0, Math.PI * 2);
        bgContext.fill();

        canvImages.current.push(bgCanvas);
      });
    };

    const addParticle = (x: number, y: number) => {
      const randomImage =
        canvImages.current[
          Math.floor(Math.random() * canvImages.current.length)
        ];
      particles.current.push(new Particle(x, y, randomImage));
    };

    const onMouseMove = (e: MouseEvent) => {
      const x = element
        ? e.clientX - targetElement.getBoundingClientRect().left
        : e.clientX;
      const y = element
        ? e.clientY - targetElement.getBoundingClientRect().top
        : e.clientY;
      addParticle(x, y);
    };

    const updateParticles = () => {
      if (!context || !canvas) return;

      context.clearRect(0, 0, canvas.width, canvas.height);

      particles.current.forEach((particle, index) => {
        particle.update(context);
        if (particle.lifeSpan < 0) {
          particles.current.splice(index, 1);
        }
      });
    };

    const animationLoop = () => {
      updateParticles();
      animationFrame.current = requestAnimationFrame(animationLoop);
    };

    const init = () => {
      if (prefersReducedMotion.current?.matches) return;

      setCanvasSize();
      createEmojiImages();

      targetElement.addEventListener("mousemove", onMouseMove);
      window.addEventListener("resize", setCanvasSize);

      animationLoop();
    };

    const destroy = () => {
      if (canvasRef.current) {
        canvasRef.current.remove();
      }
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
      targetElement.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", setCanvasSize);
    };

    prefersReducedMotion.current.onchange = () => {
      if (prefersReducedMotion.current?.matches) {
        destroy();
      } else {
        init();
      }
    };

    init();
    return () => destroy();
  }, [element, snowflakeEnabled]);

  return null;
};

/**
 * Particle Class
 */
class Particle {
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  lifeSpan: number;
  initialLifeSpan: number;
  canv: HTMLCanvasElement;

  constructor(x: number, y: number, canvasItem: HTMLCanvasElement) {
    this.position = { x, y };
    this.velocity = {
      x: (Math.random() < 0.5 ? -1 : 1) * (Math.random() / 2),
      y: 1 + Math.random(),
    };
    this.lifeSpan = Math.floor(Math.random() * 60 + 80);
    this.initialLifeSpan = this.lifeSpan;
    this.canv = canvasItem;
  }

  update(context: CanvasRenderingContext2D) {
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    this.lifeSpan--;

    this.velocity.x += ((Math.random() < 0.5 ? -1 : 1) * 2) / 75;
    this.velocity.y -= Math.random() / 300;

    const scale = Math.max(this.lifeSpan / this.initialLifeSpan, 0);

    context.save();
    context.translate(this.position.x, this.position.y);
    context.scale(scale, scale);
    context.drawImage(this.canv, -this.canv.width / 2, -this.canv.height / 2);
    context.restore();
  }
}

export default SnowflakeCursor;
