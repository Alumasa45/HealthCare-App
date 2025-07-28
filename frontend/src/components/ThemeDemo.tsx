import React from "react";
import { useTheme } from "@/contexts/ThemeContext";
import ThemeSelector from "@/components/ThemeSelector";
import { Heart, Star, Sparkles } from "lucide-react";

const ThemeDemo: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div className="min-h-screen bg-background light-purple:bg-healthcare-gradient p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground light-purple:text-healthcare-900 mb-4">
            ✨ Healthcare Theme Demo ✨
          </h1>
          <p className="text-lg text-muted-foreground light-purple:text-healthcare-700 mb-6">
            Experience our beautiful light purple theme with floating feathers
          </p>
          <div className="flex justify-center">
            <ThemeSelector />
          </div>
        </div>

        {/* Current Theme Display */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-card light-purple:bg-light-purple-100 border border-border light-purple:border-light-purple-300 rounded-lg">
            <span className="text-sm font-medium">Current Theme:</span>
            <span className="px-2 py-1 bg-primary text-primary-foreground rounded text-sm font-bold">
              {theme}
            </span>
          </div>
        </div>

        {/* Demo Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* Card 1 */}
          <div className="bg-card light-purple:bg-light-purple-50 border border-border light-purple:border-light-purple-200 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center gap-3 mb-4">
              <Heart className="h-6 w-6 text-primary light-purple:text-healthcare-600" />
              <h3 className="text-lg font-semibold text-card-foreground">
                Healthcare Card
              </h3>
            </div>
            <p className="text-muted-foreground light-purple:text-healthcare-700">
              This is a sample healthcare card showcasing the beautiful light
              purple theme with gentle gradients.
            </p>
            <button className="mt-4 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md transition-colors">
              Learn More
            </button>
          </div>

          {/* Card 2 */}
          <div className="bg-card light-purple:bg-light-purple-50 border border-border light-purple:border-light-purple-200 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center gap-3 mb-4">
              <Star className="h-6 w-6 text-secondary light-purple:text-healthcare-500" />
              <h3 className="text-lg font-semibold text-card-foreground">
                Premium Features
              </h3>
            </div>
            <p className="text-muted-foreground light-purple:text-healthcare-700">
              Enjoy premium features with our elegant purple theme and animated
              background elements.
            </p>
            <button className="mt-4 px-4 py-2 bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-md transition-colors">
              Explore
            </button>
          </div>

          {/* Card 3 */}
          <div className="bg-card light-purple:bg-light-purple-50 border border-border light-purple:border-light-purple-200 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="h-6 w-6 text-accent light-purple:text-healthcare-400" />
              <h3 className="text-lg font-semibold text-card-foreground">
                Animated Experience
              </h3>
            </div>
            <p className="text-muted-foreground light-purple:text-healthcare-700">
              Watch the gentle floating feathers create a calming, therapeutic
              atmosphere.
            </p>
            <button className="mt-4 px-4 py-2 bg-accent hover:bg-accent/90 text-accent-foreground rounded-md transition-colors">
              Experience
            </button>
          </div>
        </div>

        {/* Theme Features */}
        <div className="bg-card light-purple:bg-light-purple-50 border border-border light-purple:border-light-purple-200 p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-card-foreground mb-6">
            Theme Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-card-foreground mb-3">
                🎨 Light Purple Theme
              </h3>
              <ul className="space-y-2 text-muted-foreground light-purple:text-healthcare-700">
                <li>• Calming purple color palette</li>
                <li>• Gentle gradients and soft shadows</li>
                <li>• Healthcare-optimized color contrast</li>
                <li>• Accessible design standards</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-card-foreground mb-3">
                ✨ Animated Feathers
              </h3>
              <ul className="space-y-2 text-muted-foreground light-purple:text-healthcare-700">
                <li>• Gentle floating animation</li>
                <li>• Multiple animation patterns</li>
                <li>• Non-intrusive background effects</li>
                <li>• Performance optimized</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Theme Showcase */}
        {theme === "light-purple" && (
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-healthcare-100 border-2 border-healthcare-300 rounded-full">
              <Sparkles className="h-5 w-5 text-healthcare-600 animate-pulse" />
              <span className="text-healthcare-800 font-medium">
                🌸 Light Purple Theme Active! Look for the floating feathers! 🌸
              </span>
              <Sparkles className="h-5 w-5 text-healthcare-600 animate-pulse" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ThemeDemo;
