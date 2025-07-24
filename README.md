# Healthcare Chat Feature

## Overview
The Healthcare Chat feature enables secure communication between patients, doctors, and pharmacists within the healthcare platform. It supports direct messaging, file attachments, and real-time status updates.

## Features
- Real-time messaging between users
- Support for text messages and file attachments
- Message status tracking (sent, delivered, read)
- User online/offline status
- Conversation search
- Unread message count

## Technical Implementation

### Backend Entities
- **Message**: Stores message content, type, and status
- **Conversation**: Manages chat sessions between users
- **Sender**: Tracks participants in conversations

### Frontend Components
- **ChatSidebar**: Displays list of conversations with search functionality
- **ChatWindow**: Shows messages and input for a selected conversation
- **MessageBubble**: Renders individual messages with appropriate styling

## API Endpoints
- GET `/messages/conversation/:id` - Get messages for a conversation
- POST `/messages` - Create a new message
- PATCH `/messages/:id/read` - Mark a message as read
- GET `/conversations/user/:id` - Get conversations for a user
- POST `/conversations` - Create a new conversation

## Data Flow
1. User selects a conversation from the sidebar
2. Messages are fetched for the selected conversation
3. User sends a message, which is stored in the database
4. Message status is updated as it's delivered and read

## Future Enhancements
- Group messaging
- Voice and video calls
- Message encryption
- Message reactions and replies
- Typing indicators