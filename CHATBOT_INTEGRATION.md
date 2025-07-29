# Healthcare Chatbot Integration Guide

## Overview

This guide covers the integration of the Coco AI assistant chatbot into the healthcare application, including refined hooks and UI components.

## Components Created/Updated

### 1. API Layer (`/src/api/chatbot.ts`)

- **Purpose**: Handles API communication with the backend chatbot service
- **Endpoint**: `/chatbot/Coco`
- **Types**: `UserRole`, `AskCocoRequest`, `AskCocoResponse`

### 2. Hooks

#### useAskCoco (`/src/hooks/useAskCoco.ts`)

- **Purpose**: React Query mutation hook for chatbot interactions
- **Features**:
  - Error handling
  - Loading states
  - TypeScript support
  - Async mutation handling

### 3. UI Components

#### CocoAssistant (`/src/components/CocoAssistant.tsx`)

- **Purpose**: Main chatbot interface component
- **Features**:
  - Floating chat window
  - Message history
  - Role-based welcome messages
  - Real-time typing indicators
  - Responsive design
  - Dark mode support

#### ChatBubble (`/src/components/ChatBubble.tsx`)

- **Purpose**: Floating chat bubble trigger for home page
- **Features**:
  - Animated entry
  - Hover tooltips
  - Pulse effect
  - Gradient styling
  - Includes CocoAssistant

## Usage Examples

### Basic Hook Usage

```tsx
import { useAskCoco } from "@/hooks/useAskCoco";

function MyComponent() {
  const askCoco = useAskCoco();

  const handleAsk = async () => {
    try {
      const response = await askCoco.mutateAsync({
        message: "What are flu symptoms?",
        role: "patient",
        userId: "user123",
      });
      console.log(response.reply);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <button onClick={handleAsk} disabled={askCoco.isPending}>
      {askCoco.isPending ? "Loading..." : "Ask Coco"}
    </button>
  );
}
```

### Extended Hook Usage (useAskNuru)

```tsx
import { useAskNuru } from "@/hooks/useAskNuru";

function AdvancedComponent() {
  const askNuru = useAskNuru();

  const handleAdvancedAsk = async () => {
    const result = await askNuru.mutateAsync({
      message: "Explain diabetes management",
      role: "doctor",
      userId: "doc123",
    });

    // Access all returned data
    console.log("Original message:", result.message);
    console.log("User role:", result.role);
    console.log("AI response:", result.reply);
    console.log("Timestamp:", result.timestamp);
  };
}
```

## Integration Points

### Home Page Integration

The `ChatBubble` component has been added to the home page (`/src/routes/index.tsx`) and appears as a floating bubble in the bottom-right corner.

### Authentication Integration

Both hooks integrate with the existing auth system:

- Uses `AuthProvider` from `@/contexts/AuthContext`
- Automatically detects user role and ID
- Handles role-based welcome messages

## Key Features

### 1. Role-Based Responses

The chatbot provides different welcome messages based on user roles:

- **Doctor**: Focuses on diagnoses and treatment planning
- **Pharmacy**: Emphasizes medication and drug interactions
- **Patient/Default**: General health advice and procedures

### 2. Error Handling

- Network error recovery
- User-friendly error messages
- Fallback responses when API fails

### 3. Real-time Features

- Typing indicators ("🤖 Coco is thinking...")
- Instant message updates
- Responsive loading states

### 4. Accessibility

- Keyboard navigation (Enter to send)
- Screen reader friendly
- Focus management
- High contrast support

## Backend Compatibility

The hooks are designed to work with the existing backend:

- **Service**: `ChatbotService.askCoco()`
- **Controller**: `ChatbotController`
- **Endpoint**: `POST /chatbot/Coco`
- **Expected payload**: `{ message: string, role: UserRole }`

## Styling

- Uses Tailwind CSS for consistent styling
- Supports dark mode
- Responsive design for mobile/desktop
- Framer Motion animations for smooth interactions

## Dependencies

- `@tanstack/react-query` for state management
- `framer-motion` for animations
- `react-icons/fa` for icons
- Custom UI components from `@/components/ui`

## Future Enhancements

- Message persistence
- Chat history
- File upload support
- Voice input/output
- Multi-language support
- Conversation context awareness
