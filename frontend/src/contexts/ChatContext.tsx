import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { getConversations, createConversation } from '../api/conversations';
import { getMessages, createMessage, markMessageAsRead } from '../api/messages';
import { createSender } from '../api/senders';
import { ConversationType } from '../api/interfaces/conversation';

interface Message {
  id: string;
  Sender_id: number;
  content: string;
  timestamp: Date;
  type: 'text' | 'image' | 'file' | 'system';
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'error';
  attachmentUrl?: string;
  attachmentName?: string;
}

 interface Userr_Type {
    User_Type: 'Patient' | 'Doctor' | 'Pharmacist' | 'Admin';
}

interface User {
  id: string;
  name: string;
  role: 'patient' | 'doctor' | 'pharmacist';
  avatar?: string;
  isOnline: boolean;
  lastSeen?: Date;
}

interface Chat {
  id: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  type: 'direct' | 'group';
  title?: string;
}

interface ChatContextType {
  chats: Chat[];
  messages: Message[];
  selectedChatId: string | null;
  loading: boolean;
  error: string | null;
  selectChat: (chatId: string) => void;
  sendMessage: (content: string, file?: File) => Promise<void>;
  createNewConversation: (User_id: number, title?: string) => Promise<string>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConversations = async () => {
      if (!user?.User_id) return;

      setLoading(true);
      setError(null);
      
      try {
        const conversations = await getConversations(user.User_id);
        const transformedChats = await Promise.all(
          conversations.map(async (conv) => {
            try {
              const participantId = conv.sender?.toString() || 'unknown';
              const mockParticipant = {
                id: participantId,
                name: conv.Title || `User ${participantId}`,
                role: 'patient' as 'patient' | 'doctor' | 'pharmacist',
                isOnline: Math.random() > 0.5, 
              };
              
              let lastMessage: Message | undefined;
              let unreadCount = 0;
              
              try {
                const conversationMessages = await getMessages(conv.Conversation_id);
                if (conversationMessages.length > 0) {
                  const lastMsg = conversationMessages[conversationMessages.length - 1];
                  lastMessage = {
                    id: lastMsg.Message_id?.toString() || `msg-${Date.now()}`,
                    Sender_id: lastMsg.Sender_id || '',
                    content: lastMsg.Content || '',
                    timestamp: lastMsg.Created_at ? new Date(lastMsg.Created_at) : new Date(),
                    type: lastMsg.Attachment_Url ? 'file' : 'text',
                    status: lastMsg.Is_read ? 'read' : 'delivered'
                  } as Message;
                  
                  unreadCount = conversationMessages.filter(msg => 
                    !msg.Is_read && msg.Sender_id?.toString() !== user.User_id.toString()
                  ).length;
                }
              } catch (msgError) {
                console.error('Error fetching messages for conversation:', msgError);
              }
              
              return {
                id: conv.Conversation_id.toString(),
                participants: [mockParticipant],
                type: conv.Type.toLowerCase() as 'direct' | 'group',
                unreadCount,
                title: conv.Title,
                lastMessage
              } as Chat;
            } catch (convError) {
              console.error('Error processing conversation:', convError);
              return {
                id: conv.Conversation_id.toString(),
                participants: [{
                  id: 'unknown',
                  name: 'Unknown User',
                  role: 'patient' as const,
                  isOnline: false
                }],
                type: 'direct' as const,
                unreadCount: 0,
                title: conv.Title || 'Chat'
              } as Chat;
            }
          })
        );
        
        setChats(transformedChats);
        if (transformedChats.length > 0 && !selectedChatId) {
          setSelectedChatId(transformedChats[0].id);
        }
      } catch (error) {
        console.error('Error fetching conversations:', error);
        setError('Failed to load conversations');
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [user, selectedChatId]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedChatId) return;

      setLoading(true);
      setError(null);
      
      try {
        const messagesData = await getMessages(parseInt(selectedChatId));
        const transformedMessages = messagesData.map(msg => ({
          id: msg.Message_id?.toString() || `msg-${Date.now()}`,
          Sender_id: msg.Sender_id || '',
          content: msg.Content || '',
          timestamp: msg.Created_at ? new Date(msg.Created_at) : new Date(),
          type: msg.Attachment_Url ? 'file' : 'text',
          status: msg.Is_read ? 'read' : 'delivered',
          attachmentUrl: msg.Attachment_Url || undefined,
          attachmentName: msg.Attachment_Url ? msg.Attachment_Url.split('/').pop() : undefined
        } as Message));
        
        setMessages(transformedMessages);
      } catch (error) {
        console.error('Error fetching messages:', error);
        setError('Failed to load messages');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [selectedChatId]);

  const selectChat = (chatId: string) => {
    setSelectedChatId(chatId);
  };

  const sendMessage = async (content: string, file?: File) => {
    if (!selectedChatId || !user?.User_id) return;
    
    const hasAttachment = !!file;

    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      Sender_id: user.User_id,
      content,
      timestamp: new Date(),
      type: hasAttachment ? 'file' : 'text',
      status: 'sending',
      attachmentName: file?.name,
      attachmentUrl: file ? URL.createObjectURL(file) : undefined
    };

    setMessages(prev => [...prev, tempMessage]);

    try {
      const messageData: any = {
        Conversation_id: parseInt(selectedChatId),
        Sender_id: user.User_id,
        Content: content,
        Message_Type: ConversationType.direct || 'direct'
      };
      
      if (hasAttachment && file) {
        const fakeAttachmentUrl = `uploads/${file.name}`;
        messageData.Attachment_Url = fakeAttachmentUrl;
      }
      
      const response = await createMessage(messageData);
      const realMessage: Message = {
        id: response.Message_id?.toString() || `msg-${Date.now()}`,
        Sender_id: typeof response.Sender_id === 'number' ? response.Sender_id : Number(response.Sender_id),
        content: response.Content || content,
        timestamp: response.Created_at ? new Date(response.Created_at) : new Date(),
        type: response.Attachment_Url ? 'file' : 'text',
        status: 'delivered',
        attachmentUrl: response.Attachment_Url || undefined,
        attachmentName: response.Attachment_Url ? response.Attachment_Url.split('/').pop() : undefined
      };
      
      setMessages(prev => prev.map(msg => 
        msg.id === tempMessage.id ? realMessage : msg
      ));

      setChats(prev => prev.map(chat => 
        chat.id === selectedChatId 
          ? { ...chat, lastMessage: realMessage }
          : chat
      ));
      
      setTimeout(async () => {
        try {
          if (response.Message_id) {
            await markMessageAsRead(response.Message_id);
            setMessages(prev => prev.map(msg => 
              msg.id === realMessage.id 
                ? { ...msg, status: 'read' }
                : msg
            ));
          }
        } catch (error) {
          console.error('Error marking message as read:', error);
        }
      }, 2000);
      
    } catch (error) {
      console.error('Error sending message:', error);
      
      setMessages(prev => prev.map(msg => 
        msg.id === tempMessage.id 
          ? { ...msg, status: 'error' }
          : msg
      ));
    }
  };

  const createNewConversation = async (User_id: number, title?: string): Promise<string> => {
    if (!user?.User_id) throw new Error('User not authenticated');
    
    try {
      setLoading(true);
      
      const conversationData = {
        Title: title || `Chat with User ${User_id}`,
        Type: ConversationType.direct,
        Is_Active: true,
        Sender_id: user.User_id
      };
      
      const newConversation = await createConversation(conversationData);
      
      await createSender({
        Conversation_id: newConversation.Conversation_id,
        User_Type: { User_Type: user?.User_Type || 'Patient' }, 
        Joined_at: new Date(),
        Is_Active: true
      });
      
      const newChat: Chat = {
        id: newConversation.Conversation_id.toString(),
        participants: [{
          id: User_id.toString(),
          name: `User ${User_id}`,
          role: 'patient',
          isOnline: false
        }],
        unreadCount: 0,
        type: 'direct',
        title: conversationData.Title
      };
      
      setChats(prev => [newChat, ...prev]);
      setSelectedChatId(newChat.id);
      
      return newChat.id;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw new Error('Failed to create conversation');
    } finally {
      setLoading(false);
    }
  };

  const value: ChatContextType = {
    chats,
    messages,
    selectedChatId,
    loading,
    error,
    selectChat,
    sendMessage,
    createNewConversation
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};