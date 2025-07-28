import React, { useEffect, useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";

interface Feather {
  id: number;
  x: number;
  y: number;
  size: number;
  rotation: number;
  animationDuration: number;
  animationType: "drift-left" | "drift-right" | "feather-float" | "gentle-sway";
  delay: number;
  featherType: "svg" | "image";
  imageUrl?: string;
}

const FeatherIcon: React.FC<{ size: number; className?: string }> = ({
  size,
  className = "",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M12 2C8.5 2 7 4.5 7 7.5C7 9 7.5 10.5 8.5 11.5L12 15L15.5 11.5C16.5 10.5 17 9 17 7.5C17 4.5 15.5 2 12 2Z"
      fill="currentColor"
      opacity="0.6"
    />
    <path
      d="M12 4C10 4 9 5.5 9 7C9 8 9.3 9 10 9.7L12 11.5L14 9.7C14.7 9 15 8 15 7C15 5.5 14 4 12 4Z"
      fill="currentColor"
      opacity="0.8"
    />
    <path
      d="M12 15L8.5 18.5C7.5 19.5 7 21 7 22H17C17 21 16.5 19.5 15.5 18.5L12 15Z"
      fill="currentColor"
      opacity="0.4"
    />
  </svg>
);

const FloatingFeathers: React.FC = () => {
  const { theme } = useTheme();
  const [feathers, setFeathers] = useState<Feather[]>([]);
  const [isVisible, setIsVisible] = useState(true);

  // Only show feathers in light-purple theme
  useEffect(() => {
    setIsVisible(theme === "light-purple");
  }, [theme]);

  useEffect(() => {
    if (!isVisible) return;

    const generateFeathers = () => {
      const newFeathers: Feather[] = [];
      const featherCount = 35; // Increased for more magical effect

      for (let i = 0; i < featherCount; i++) {
        const animations: Feather["animationType"][] = [
          "drift-left",
          "drift-right",
          "feather-float",
          "gentle-sway",
        ];

        const featherImages = [
          "/feather1.svg",
          "/feather2.svg",
          "/feather3.svg",
        ];

        const useImage = Math.random() > 0.4; // 60% chance to use images for more variety

        newFeathers.push({
          id: i,
          x: Math.random() * 100, // Random position across screen
          y: Math.random() * 100,
          size: Math.random() * 20 + 15, // Size between 15-35px
          rotation: Math.random() * 360,
          animationDuration: Math.random() * 10 + 8, // 8-18 seconds
          animationType:
            animations[Math.floor(Math.random() * animations.length)],
          delay: Math.random() * 5, // Stagger start times
          featherType: useImage ? "image" : "svg",
          imageUrl: useImage
            ? featherImages[Math.floor(Math.random() * featherImages.length)]
            : undefined,
        });
      }

      setFeathers(newFeathers);
    };

    generateFeathers();

    // Regenerate feathers periodically for variety
    const interval = setInterval(generateFeathers, 12000); // Every 12 seconds for more dynamic effect

    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible || feathers.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {feathers.map((feather) => (
        <div
          key={feather.id}
          className="absolute text-feather-purple opacity-30"
          style={{
            left: `${feather.x}%`,
            top: `${feather.y}%`,
            transform: `rotate(${feather.rotation}deg)`,
            animationDelay: `${feather.delay}s`,
            animationDuration: `${feather.animationDuration}s`,
          }}
        >
          <div
            className={`animate-${feather.animationType}`}
            style={{
              animationDuration: `${feather.animationDuration}s`,
              animationDelay: `${feather.delay}s`,
            }}
          >
            {feather.featherType === "image" && feather.imageUrl ? (
              <img
                src={feather.imageUrl}
                alt="floating feather"
                width={feather.size}
                height={feather.size}
                className="filter opacity-60 hover:opacity-80 transition-opacity duration-1000"
                style={{
                  filter: "hue-rotate(280deg) saturate(1.2) brightness(0.9)",
                }}
              />
            ) : (
              <FeatherIcon
                size={feather.size}
                className="text-purple-300 hover:text-purple-400 transition-colors duration-1000"
              />
            )}
          </div>
        </div>
      ))}

      {/* Additional subtle background feathers - More for magical effect */}
      <div className="absolute top-10 left-10 animate-float-slow opacity-20">
        <FeatherIcon size={25} className="text-light-purple-300" />
      </div>
      <div className="absolute top-1/3 right-20 animate-float-medium opacity-15">
        <FeatherIcon size={30} className="text-healthcare-300" />
      </div>
      <div className="absolute bottom-20 left-1/4 animate-gentle-sway opacity-25">
        <FeatherIcon size={20} className="text-purple-200" />
      </div>
      <div className="absolute top-2/3 right-1/3 animate-feather-float opacity-20">
        <FeatherIcon size={35} className="text-light-purple-400" />
      </div>

      {/* Additional corner feathers */}
      <div className="absolute top-20 right-10 animate-drift-left opacity-18">
        <FeatherIcon size={28} className="text-healthcare-200" />
      </div>
      <div className="absolute bottom-32 right-20 animate-gentle-sway opacity-22">
        <FeatherIcon size={22} className="text-light-purple-300" />
      </div>
      <div className="absolute top-1/2 left-10 animate-feather-float opacity-16">
        <FeatherIcon size={32} className="text-purple-250" />
      </div>
      <div className="absolute bottom-10 right-1/4 animate-drift-right opacity-19">
        <FeatherIcon size={26} className="text-healthcare-250" />
      </div>
      <div className="absolute top-16 left-1/3 animate-float-slow opacity-14">
        <FeatherIcon size={24} className="text-light-purple-200" />
      </div>
      <div className="absolute bottom-1/3 left-16 animate-gentle-sway opacity-21">
        <FeatherIcon size={29} className="text-purple-300" />
      </div>
    </div>
  );
};

export default FloatingFeathers;
