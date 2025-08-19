# ❄️ Snowflake Cursor Effect

A beautiful snowflake cursor effect for your healthcare application using the cursify.vercel.app design pattern.

## Components Added

### 1. SnowflakeCursor

- **Location**: `src/components/ui/SnowflakeCursor.tsx`
- **Purpose**: Creates animated snowflakes that follow the user's mouse cursor
- **Features**:
  - Respects `prefers-reduced-motion` accessibility setting
  - Lightweight canvas-based animation
  - Automatically manages cleanup and memory
  - Configurable target element (defaults to document.body)

### 2. CursorToggle

- **Location**: `src/components/ui/CursorToggle.tsx`
- **Purpose**: Provides a toggle switch for users to enable/disable the snowflake effect
- **Features**:
  - Saves user preference to localStorage
  - Visual feedback with icons
  - Accessible with proper ARIA labels

### 3. useCursorPreferences Hook

- **Location**: `src/hooks/useCursorPreferences.ts`
- **Purpose**: Manages the user's cursor preference state
- **Features**:
  - Persists settings across browser sessions
  - Provides reactive state management

### 4. CursorDemo

- **Location**: `src/components/ui/CursorDemo.tsx`
- **Purpose**: Demonstration component showing the cursor effect and toggle

## Integration

The snowflake cursor has been automatically integrated into your main application in `src/main.tsx`:

```tsx
<SnowflakeCursor />
<FloatingFeathers />
<ChatBubble />
<RouterProvider router={router} />
```

## Usage

### Basic Usage (Already Active)

The cursor effect is automatically active application-wide. Users can toggle it on/off using their preference.

### Adding the Toggle to Settings

You can add the cursor toggle to any settings page or component:

```tsx
import CursorToggle from "@/components/ui/CursorToggle";

function SettingsPage() {
  return (
    <div>
      <h2>Preferences</h2>
      <CursorToggle />
    </div>
  );
}
```

### Adding the Demo Component

To showcase the cursor effect:

```tsx
import CursorDemo from "@/components/ui/CursorDemo";

function DemoPage() {
  return <CursorDemo />;
}
```

### Targeting Specific Elements

If you want the cursor effect only in certain areas:

```tsx
import SnowflakeCursor from "@/components/ui/SnowflakeCursor";
import { useRef } from "react";

function SpecificArea() {
  const targetRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={targetRef} className="relative">
      <SnowflakeCursor element={targetRef.current} />
      {/* Your content */}
    </div>
  );
}
```

## Customization

### Changing the Snowflake Emoji

Edit the `possibleEmoji` array in `SnowflakeCursor.tsx`:

```tsx
const possibleEmoji = ["❄️", "🌟", "✨", "💫"]; // Add more emojis
```

### Adjusting Animation Parameters

Modify the `Particle` class constructor in `SnowflakeCursor.tsx`:

```tsx
// Velocity (how fast snowflakes move)
this.velocity = {
  x: (Math.random() < 0.5 ? -1 : 1) * (Math.random() / 2),
  y: 1 + Math.random(), // Increase for faster falling
};

// Lifespan (how long snowflakes stay visible)
this.lifeSpan = Math.floor(Math.random() * 60 + 80); // Increase for longer trails
```

### Changing Colors/Styles

The toggle component styles can be customized in `CursorToggle.tsx`:

```tsx
// Change the toggle colors
className={`... ${
  snowflakeEnabled ? 'bg-purple-600' : 'bg-gray-200' // Change these colors
}`}

// Change icon colors
<Snowflake className="h-4 w-4 text-blue-500" /> // Change text-blue-500
```

## Accessibility

- ✅ Respects `prefers-reduced-motion: reduce`
- ✅ Proper ARIA labels on toggle button
- ✅ Keyboard accessible toggle
- ✅ High contrast visual indicators

## Performance

- ✅ Uses `requestAnimationFrame` for smooth animation
- ✅ Automatic cleanup on component unmount
- ✅ Efficient canvas rendering
- ✅ Memory leak prevention
- ✅ Optimized particle system

## Browser Support

Works in all modern browsers that support:

- HTML5 Canvas
- ES6 classes
- CSS transforms
- RequestAnimationFrame

## Troubleshooting

### Cursor not appearing?

1. Check if the user has disabled it via the toggle
2. Verify `prefers-reduced-motion` is not set to `reduce`
3. Check browser console for any errors

### Performance issues?

1. Reduce the `lifeSpan` of particles
2. Add throttling to the mouse move event
3. Limit the maximum number of active particles

## Files Created/Modified

### New Files:

- `src/components/ui/SnowflakeCursor.tsx`
- `src/components/ui/CursorToggle.tsx`
- `src/components/ui/CursorDemo.tsx`
- `src/hooks/useCursorPreferences.ts`

### Modified Files:

- `src/main.tsx` (added SnowflakeCursor import and component)

The snowflake cursor effect is now fully integrated and ready to use! 🎉❄️
