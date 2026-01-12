import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  Paperclip,
  Phone,
  Video,
  MoreVertical,
  Search,
  ArrowLeft,
  Check,
  CheckCheck,
  Clock,
  XCircle,
  Plus,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useChat } from "@/contexts/ChatContext";
import NewConversationDialog from "./NewConversationDialog";

interface User extends Record<string, any> {
  id: string;
  name: string;
  role: "patient" | "doctor" | "pharmacist";
  avatar?: string;
  isOnline: boolean;
  lastSeen?: Date;
}

interface LocalMessage {
  id: string;
  Sender_id: string;
  content: string;
  timestamp: Date;
  type: "text" | "image" | "file" | "system";
  status: "sending" | "sent" | "delivered" | "read" | "error";
  attachmentUrl?: string;
  attachmentName?: string;
}

interface LocalChat {
  id: string;
  participants: User[];
  lastMessage?: LocalMessage;
  unreadCount: number;
  type: "direct" | "group";
  title?: string;
}

//Components.
const ChatSidebar: React.FC<{
  chats: LocalChat[];
  selectedChatId: string | null;
  onChatSelect: (chatId: string) => void;
  onNewConversation: () => void;
}> = ({ chats, selectedChatId, onChatSelect, onNewConversation }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredChats = chats.filter((chat) => {
    const participant = chat.participants?.[0] || {
      id: "unknown",
      name: "Unknown User",
      role: "patient" as const,
      isOnline: false,
    };
    return participant.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 86400000) {
      // Less than 24 hours
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    }
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "doctor":
        return "text-blue-600";
      case "patient":
        return "text-green-600";
      case "pharmacist":
        return "text-purple-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Messages</h2>
          <div className="flex items-center">
            <button
              className="p-2 hover:bg-gray-100 rounded-full mr-1"
              title="New conversation"
              onClick={onNewConversation}
            >
              <Plus className="w-5 h-5 text-blue-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <MoreVertical className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No conversations found
          </div>
        ) : (
          filteredChats.map((chat) => {
            const participant = chat.participants?.[0] || {
              id: "unknown",
              name: "Unknown User",
              role: "patient" as const,
              isOnline: false,
            };
            const isSelected = selectedChatId === chat.id;

            return (
              <div
                key={chat.id}
                className={`flex items-center p-4 cursor-pointer hover:bg-gray-50 ${
                  isSelected ? "bg-blue-50 border-r-2 border-blue-500" : ""
                }`}
                onClick={() => onChatSelect(chat.id)}
              >
                {/* Avatar */}
                <div className="relative">
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                    {participant.avatar ? (
                      <img
                        src={participant.avatar}
                        alt={participant.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-600 font-medium">
                        {participant.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  {participant.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>

                {/* Chat Info */}
                <div className="flex-1 ml-3 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900 truncate">
                      {participant.name}
                    </h3>
                    <span className="text-xs text-gray-500 ml-2">
                      {chat.lastMessage &&
                        formatTime(chat.lastMessage.timestamp)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center space-x-1">
                      <span
                        className={`text-xs font-medium ${getRoleColor(
                          participant.role
                        )}`}
                      >
                        {participant.role.charAt(0).toUpperCase() +
                          participant.role.slice(1)}
                      </span>
                      {chat.lastMessage && (
                        <p className="text-sm text-gray-500 truncate">
                          {chat.lastMessage.type === "file"
                            ? "📎 File"
                            : chat.lastMessage.content}
                        </p>
                      )}
                    </div>

                    {chat.unreadCount > 0 && (
                      <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1 min-w-5 text-center">
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

const MessageStatus: React.FC<{ status: LocalMessage["status"] }> = ({ status }) => {
  switch (status) {
    case "sending":
      return <Clock className="w-4 h-4 text-gray-400" />;
    case "sent":
      return <Check className="w-4 h-4 text-gray-400" />;
    case "delivered":
      return <CheckCheck className="w-4 h-4 text-gray-400" />;
    case "read":
      return <CheckCheck className="w-4 h-4 text-blue-500" />;
    case "error":
      return <XCircle className="w-4 h-4 text-red-500" />;
    default:
      return null;
  }
};

const MessageBubble: React.FC<{
  message: LocalMessage;
  isOwnMessage: boolean;
  user: User;
  showAvatar: boolean;
}> = ({ message, isOwnMessage, user, showAvatar }) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  return (
    <div
      className={`flex ${isOwnMessage ? "justify-end" : "justify-start"} mb-4`}
    >
      {/* Avatar for received messages */}
      {!isOwnMessage && showAvatar && (
        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
          <span className="text-xs font-medium text-gray-600">
            {user.name.charAt(0)}
          </span>
        </div>
      )}

      {!isOwnMessage && !showAvatar && (
        <div className="w-8 mr-2" /> // Spacer
      )}

      <div
        className={`max-w-xs lg:max-w-md ${
          isOwnMessage ? "order-1" : "order-2"
        }`}
      >
        <div
          className={`px-4 py-2 rounded-lg ${
            isOwnMessage
              ? "bg-blue-500 text-white"
              : "bg-gray-100 text-gray-900"
          }`}
        >
          {message.type === "file" ? (
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <Paperclip className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {message.attachmentName || "File"}
                </span>
              </div>
              {message.attachmentUrl && (
                <div className="mt-1">
                  {message.attachmentUrl.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                    <img
                      src={message.attachmentUrl}
                      alt="Attachment"
                      className="max-w-full rounded-md max-h-48 object-contain"
                    />
                  ) : (
                    <div className="bg-gray-200 dark:bg-gray-700 rounded-md p-2 text-xs flex items-center">
                      <Paperclip className="w-3 h-3 mr-1" />
                      <a
                        href={message.attachmentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                      >
                        Download {message.attachmentName || "file"}
                      </a>
                    </div>
                  )}
                </div>
              )}
              {message.content && (
                <p className="text-sm mt-2">{message.content}</p>
              )}
            </div>
          ) : (
            <p className="text-sm">{message.content}</p>
          )}
        </div>

        <div
          className={`flex items-center mt-1 space-x-1 ${
            isOwnMessage ? "justify-end" : "justify-start"
          }`}
        >
          <span className="text-xs text-gray-500">
            {formatTime(message.timestamp)}
          </span>
          {isOwnMessage && <MessageStatus status={message.status} />}
        </div>
      </div>
    </div>
  );
};

const ChatWindow: React.FC<{
  chat: LocalChat;
  messages: LocalMessage[];
  currentUser: User;
  onSendMessage: (content: string, file?: File) => void;
}> = ({ chat, messages, currentUser, onSendMessage }) => {
  const [newMessage, setNewMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const participant = chat.participants?.[0] || {
    id: "unknown",
    name: "Unknown User",
    role: "patient" as const,
    isOnline: false,
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim() || selectedFile) {
      onSendMessage(newMessage.trim(), selectedFile || undefined);
      setNewMessage("");
      setSelectedFile(null);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getStatusText = (user: User) => {
    if (user.isOnline) {
      return "online";
    }
    return user.lastSeen
      ? `last seen ${user.lastSeen.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        })}`
      : "offline";
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button className="lg:hidden p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="relative">
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-gray-600 font-medium">
                {participant.name.charAt(0)}
              </span>
            </div>
            {participant.isOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            )}
          </div>

          <div>
            <h3 className="font-medium text-gray-900">{participant.name}</h3>
            <p className="text-sm text-gray-500">
              {getStatusText(participant)}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <Phone className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <Video className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <MoreVertical className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((message, index) => {
            const isOwnMessage = message.Sender_id === currentUser.id;
            const sender = isOwnMessage ? currentUser : participant;
            const showAvatar =
              index === 0 ||
              messages[index - 1].Sender_id !== message.Sender_id;

            return (
              <MessageBubble
                key={message.id}
                message={message}
                isOwnMessage={isOwnMessage}
                user={sender}
                showAvatar={showAvatar}
              />
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        {selectedFile && (
          <div className="mb-2 p-2 bg-blue-50 rounded-md flex items-center justify-between">
            <div className="flex items-center">
              <Paperclip className="w-4 h-4 text-blue-500 mr-2" />
              <span className="text-sm text-blue-700 truncate max-w-xs">
                {selectedFile.name}
              </span>
            </div>
            <button
              onClick={() => setSelectedFile(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="flex items-center space-x-2">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileSelect}
          />
          <button
            className="p-2 hover:bg-gray-100 rounded-full"
            onClick={triggerFileInput}
          >
            <Paperclip className="w-5 h-5 text-gray-600" />
          </button>

          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Type a message..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyPress}
            />
          </div>

          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() && !selectedFile}
            className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

function Messages() {
  const { user } = useAuth();
  const {
    chats: contextChats,
    messages: contextMessages,
    selectedChatId,
    loading,
    error,
    selectChat,
    sendMessage,
    createNewConversation,
  } = useChat();
  const [isNewConversationDialogOpen, setIsNewConversationDialogOpen] =
    useState(false);

  // Convert context data to local types
  const chats: LocalChat[] = contextChats.map(chat => ({
    ...chat,
    lastMessage: chat.lastMessage ? {
      ...chat.lastMessage,
      Sender_id: String(chat.lastMessage.Sender_id)
    } : undefined
  }));

  const messages: LocalMessage[] = contextMessages.map(message => ({
    ...message,
    Sender_id: String(message.Sender_id)
  }));

  const selectedChat = chats.find((chat) => chat.id === selectedChatId);

  const handleNewConversation = () => {
    setIsNewConversationDialogOpen(true);
  };

  const handleCreateConversation = async (userId: number, name: string) => {
    try {
      await createNewConversation(userId, `Chat with ${name}`);
    } catch (error) {
      console.error("Failed to create conversation:", error);
    }
  };

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error</h3>
          <p className="text-gray-500">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  ///Loading state.
  if (loading && chats.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-100 flex rounded-lg overflow-hidden shadow-lg">
      <NewConversationDialog
        isOpen={isNewConversationDialogOpen}
        onClose={() => setIsNewConversationDialogOpen(false)}
        onCreateConversation={handleCreateConversation}
      />

      <ChatSidebar
        chats={chats}
        selectedChatId={selectedChatId}
        onChatSelect={selectChat}
        onNewConversation={handleNewConversation}
      />

      {selectedChat ? (
        <ChatWindow
          chat={selectedChat}
          messages={messages}
          currentUser={{
            id: String(user?.User_id || "1"),
            name:
              `${user?.First_Name || ""} ${user?.Last_Name || ""}`.trim() ||
              "User",
            role:
              (user?.User_Type?.toLowerCase() as
                | "patient"
                | "doctor"
                | "pharmacist") || "doctor",
            isOnline: true,
          }}
          onSendMessage={sendMessage}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Select a conversation
            </h3>
            <p className="text-gray-500">
              Choose a chat from the sidebar to start messaging
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Messages;
