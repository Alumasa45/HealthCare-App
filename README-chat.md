# Healthcare Chat Feature Implementation

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

### Backend Components

#### Entities
- **Message**: Stores message content, type, and status
  - Properties: Message_id, Conversation_id, Sender_id, Content, Message_Type, Attachment_Url, Is_read, Created_at, Updated_at
  - Relationships: ManyToOne with Conversation and Sender

- **Conversation**: Manages chat sessions between users
  - Properties: Conversation_id, Title, Type, Is_Active, Created_at
  - Relationships: ManyToOne with Sender

- **Sender**: Tracks participants in conversations
  - Properties: Sender_id, Conversation_id, User_id, User_Type, Joined_at, Left_at, Is_Active, Created_at
  - Relationships: OneToMany with Conversation, ManyToOne with User

#### Services
- **MessagesService**: Handles CRUD operations for messages
  - Methods: create, findAll, findByConversation, findOne, update, markAsRead, remove

#### Controllers
- **MessagesController**: Exposes REST endpoints for message operations
  - Endpoints: POST /messages, GET /messages, GET /messages/conversation/:id, GET /messages/:id, PATCH /messages/:id, PATCH /messages/:id/read, DELETE /messages/:id

### Frontend Components

- **ChatSidebar**: Displays list of conversations with search functionality
  - Features: Conversation list, search, unread count, last message preview

- **ChatWindow**: Shows messages and input for a selected conversation
  - Features: Message history, message input, attachment support

- **MessageBubble**: Renders individual messages with appropriate styling
  - Features: Different styling for sent/received messages, message status indicators

- **MessageStatus**: Shows the status of sent messages (sending, sent, delivered, read)

### API Integration
The frontend components are designed to work with the backend API. Currently, the implementation uses mock data for development purposes, but the code includes commented sections showing how to integrate with the actual API endpoints.

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