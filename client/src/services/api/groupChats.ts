import api from './instance';

export interface GroupChat {
  id: string;
  name: string;
  avatar: string | null;
  description: string | null;
  createdBy: string;
  memberCount: number;
  unreadCount: number;
  lastMessageAt: string | null;
  pinned?: boolean;
  pinnedAt?: string | null;
  lastMessage: {
    id: string;
    content: string;
    userName: string;
    createdAt: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface GroupMember {
  id: string;
  userId: string;
  groupId: string;
  role: 'owner' | 'admin' | 'member';
  name: string;
  email: string;
  phone: string;
  avatar: string | null;
  joinedAt: string;
  lastReadAt: string | null;
}

export interface GroupDetail extends Omit<GroupChat, 'memberCount' | 'unreadCount' | 'lastMessageAt' | 'lastMessage'> {
  members: GroupMember[];
  pinned?: boolean;
  pinnedAt?: string | null;
}

export interface GroupMessage {
  id: string;
  groupId: string;
  userId: string;
  userName: string;
  userAvatar: string | null;
  content: string;
  attachments: GroupMessageAttachment[];
  createdAt: string;
  updatedAt: string;
}

export interface GroupMessageAttachment {
  id: string;
  messageId: string;
  filename: string;
  originalFilename: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  createdAt: string;
}

export interface CreateGroupData {
  name: string;
  description?: string;
  memberIds?: string[];
  avatar?: File;
}

export interface UpdateGroupData {
  name?: string;
  description?: string;
  avatar?: File;
}

export const groupChatsAPI = {
  // Get all groups for current user
  getGroups: async (): Promise<GroupChat[]> => {
    const response = await api.get('/group-chats');
    return response.data;
  },

  // Get group by ID
  getGroupById: async (id: string): Promise<GroupDetail> => {
    const response = await api.get(`/group-chats/${id}`);
    return response.data;
  },

  // Create new group
  createGroup: async (data: CreateGroupData): Promise<GroupChat> => {
    const formData = new FormData();
    formData.append('name', data.name);
    if (data.description) {
      formData.append('description', data.description);
    }
    if (data.memberIds && data.memberIds.length > 0) {
      data.memberIds.forEach((id) => {
        formData.append('memberIds[]', id);
      });
    }
    if (data.avatar) {
      formData.append('avatar', data.avatar);
    }

    const response = await api.post('/group-chats', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update group
  updateGroup: async (id: string, data: UpdateGroupData): Promise<GroupChat> => {
    const formData = new FormData();
    if (data.name) {
      formData.append('name', data.name);
    }
    if (data.description !== undefined) {
      formData.append('description', data.description || '');
    }
    if (data.avatar) {
      formData.append('avatar', data.avatar);
    }

    const response = await api.put(`/group-chats/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete group
  deleteGroup: async (id: string): Promise<void> => {
    await api.delete(`/group-chats/${id}`);
  },

  // Add members to group
  addMembers: async (groupId: string, memberIds: string[]): Promise<void> => {
    await api.post(`/group-chats/${groupId}/members`, { memberIds });
  },

  // Remove member from group
  removeMember: async (groupId: string, memberId: string): Promise<void> => {
    await api.delete(`/group-chats/${groupId}/members/${memberId}`);
  },

  // Transfer ownership
  transferOwnership: async (groupId: string, newOwnerId: string): Promise<void> => {
    await api.post(`/group-chats/${groupId}/transfer-ownership`, { newOwnerId });
  },

  // Get messages for a group
  getMessages: async (groupId: string, limit = 50, offset = 0): Promise<GroupMessage[]> => {
    const response = await api.get(`/group-chats/${groupId}/messages`, {
      params: { limit, offset },
    });
    return response.data;
  },

  // Send message
  sendMessage: async (groupId: string, content: string, files?: File[]): Promise<GroupMessage> => {
    const formData = new FormData();
    formData.append('content', content);
    if (files && files.length > 0) {
      files.forEach((file) => {
        formData.append('files', file);
      });
    }

    const response = await api.post(`/group-chats/${groupId}/messages`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete message
  deleteMessage: async (messageId: string): Promise<void> => {
    await api.delete(`/group-chats/messages/${messageId}`);
  },

  // Toggle pin group
  togglePinGroup: async (groupId: string): Promise<{ pinned: boolean }> => {
    const response = await api.post(`/group-chats/${groupId}/pin`);
    return response.data;
  },
};

