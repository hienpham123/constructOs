import api from './instance';

export interface DirectConversation {
  id: string;
  otherUser: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
    status: string;
  };
  lastMessage: {
    id: string;
    content: string;
    senderId: string;
    senderName: string;
    createdAt: string;
  } | null;
  unreadCount: number;
  pinned?: boolean;
  pinnedAt?: string | null;
  updatedAt: string;
  createdAt: string;
}

export interface DirectConversationDetail {
  id: string;
  otherUser: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
    status: string;
  };
  lastReadAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DirectMessage {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  senderName: string;
  senderAvatar: string | null;
  content: string;
  attachments: DirectMessageAttachment[];
  createdAt: string;
  updatedAt: string;
  status?: 'sending' | 'sent' | 'failed';
}

export interface DirectMessageAttachment {
  id: string;
  messageId: string;
  filename: string;
  originalFilename: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  createdAt: string;
}

export interface SendDirectMessageData {
  content: string;
  files?: File[];
}

export const directMessagesAPI = {
  // Get all conversations for current user
  getConversations: async (): Promise<DirectConversation[]> => {
    const response = await api.get('/direct-messages/conversations');
    return response.data;
  },

  // Get conversation by conversation ID
  getConversation: async (conversationId: string): Promise<DirectConversationDetail> => {
    const response = await api.get(`/direct-messages/conversations/${conversationId}`);
    return response.data;
  },

  // Get conversation by other user ID (creates if doesn't exist)
  getOrCreateConversation: async (otherUserId: string): Promise<DirectConversationDetail> => {
    // First try to find existing conversation
    const conversations = await api.get('/direct-messages/conversations');
    const existing = conversations.data.find(
      (conv: DirectConversation) => conv.otherUser.id === otherUserId
    );
    
    if (existing) {
      return directMessagesAPI.getConversation(existing.id);
    }

    // If not found, create by sending a message will create it
    // Or we can add a separate endpoint, but for now we'll handle it on frontend
    throw new Error('Conversation not found. Send a message to create one.');
  },

  // Get messages for a conversation
  getMessages: async (conversationId: string, limit = 50, offset = 0): Promise<DirectMessage[]> => {
    const response = await api.get(`/direct-messages/conversations/${conversationId}/messages`, {
      params: { limit, offset },
    });
    return response.data;
  },

  // Send message to a user (creates conversation if doesn't exist)
  sendMessage: async (receiverId: string, data: SendDirectMessageData): Promise<DirectMessage> => {
    const formData = new FormData();
    formData.append('content', data.content);
    if (data.files && data.files.length > 0) {
      data.files.forEach((file) => {
        formData.append('files', file);
      });
    }

    const response = await api.post(`/direct-messages/users/${receiverId}/messages`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update message
  updateMessage: async (messageId: string, content: string): Promise<DirectMessage> => {
    try {
      const response = await api.put(`/direct-messages/messages/${messageId}`, { content });
      return response.data;
    } catch (error: any) {
      console.error('Update message API error:', error);
      throw error;
    }
  },

  // Delete message
  deleteMessage: async (messageId: string): Promise<void> => {
    await api.delete(`/direct-messages/messages/${messageId}`);
  },

  // Delete conversation
  deleteConversation: async (conversationId: string): Promise<void> => {
    await api.delete(`/direct-messages/conversations/${conversationId}`);
  },

  // Toggle pin conversation
  togglePinConversation: async (conversationId: string): Promise<{ pinned: boolean }> => {
    const response = await api.post(`/direct-messages/conversations/${conversationId}/pin`);
    return response.data;
  },
};

