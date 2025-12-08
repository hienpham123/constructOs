import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { Box, LinearProgress, useMediaQuery, useTheme, Tabs, Tab } from '@mui/material';
import { groupChatsAPI, type GroupChat } from '../services/api/groupChats';
import { directMessagesAPI, type DirectConversation } from '../services/api/directMessages';
import CreateGroupDialog from '../components/groupChat/CreateGroupDialog';
import SelectUserDialog from '../components/directMessage/SelectUserDialog';
import GroupChatDetail from './GroupChatDetail';
import DirectChatDetail from './DirectChatDetail';
import GroupListSidebar from '../components/groupChat/GroupListSidebar';
import DirectMessageListSidebar from '../components/directMessage/DirectMessageListSidebar';
import GroupListMainContent from '../components/groupChat/GroupListMainContent';
import { useGroupChatSocket } from '../hooks/useGroupChatSocket';
import { useDirectMessageSocket } from '../hooks/useDirectMessageSocket';
import { useAuthStore } from '../stores/authStore';
import type { User } from '../services/api/users';

type ChatType = 'groups' | 'direct';

export default function Chats() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: chatId, conversationId, userId } = useParams<{ id?: string; conversationId?: string; userId?: string }>();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useAuthStore();
  
  // Determine current chat type from URL
  const currentChatType: ChatType = conversationId || userId ? 'direct' : (chatId ? 'groups' : 'groups');
  const [activeTab, setActiveTab] = useState<ChatType>(currentChatType);
  
  // Groups state
  const [groups, setGroups] = useState<GroupChat[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(true);
  const [groupsSearchTerm, setGroupsSearchTerm] = useState('');
  const [groupsActiveTab, setGroupsActiveTab] = useState<'priority' | 'other'>('priority');
  const [createGroupDialogOpen, setCreateGroupDialogOpen] = useState(false);
  
  // Direct messages state
  const [conversations, setConversations] = useState<DirectConversation[]>([]);
  const [conversationsLoading, setConversationsLoading] = useState(true);
  const [directSearchTerm, setDirectSearchTerm] = useState('');
  const [selectUserDialogOpen, setSelectUserDialogOpen] = useState(false);

  // Load groups
  const loadGroups = useCallback(async () => {
    try {
      setGroupsLoading(true);
      const data = await groupChatsAPI.getGroups();
      setGroups(data);
    } catch (error: any) {
      console.error('Error loading groups:', error);
    } finally {
      setGroupsLoading(false);
    }
  }, []);

  // Load conversations
  const loadConversations = useCallback(async () => {
    try {
      setConversationsLoading(true);
      const data = await directMessagesAPI.getConversations();
      setConversations(data);
    } catch (error: any) {
      console.error('Error loading conversations:', error);
    } finally {
      setConversationsLoading(false);
    }
  }, []);

  // Handle message received from socket for groups
  const handleGroupMessageReceived = useCallback((data: { groupId: string; message: any }) => {
    setGroups((prevGroups) => {
      const updated = prevGroups.map((group) => {
        if (group.id === data.groupId) {
          return {
            ...group,
            lastMessage: {
              id: data.message.id,
              content: data.message.content,
              userName: data.message.userName,
              createdAt: data.message.createdAt,
            },
            lastMessageAt: data.message.createdAt,
            unreadCount: (group.unreadCount || 0) + 1,
          };
        }
        return group;
      });
      return updated;
    });
  }, []);

  // Handle unread updated from socket for groups
  const handleGroupUnreadUpdated = useCallback(() => {
    loadGroups();
  }, [loadGroups]);

  // Handle direct message received from socket
  const handleDirectMessageReceived = useCallback((data: { conversationId: string; message: any }) => {
    // Get current conversation ID from params
    const currentConvId = conversationId && activeTab === 'direct' ? conversationId : undefined;
    
    // Check if this is our own message
    const isOwnMessage = data.message.senderId === user?.id;
    
    // If it's our own message and we're viewing this conversation, don't update list
    // The message is already handled in DirectChatDetail
    if (isOwnMessage && data.conversationId === currentConvId) {
      return; // Skip updating conversation list for our own messages in current conversation
    }
    
    setConversations((prevConversations) => {
      const updated = prevConversations.map((conv) => {
        if (conv.id === data.conversationId) {
          return {
            ...conv,
            lastMessage: {
              id: data.message.id,
              content: data.message.content,
              senderId: data.message.senderId,
              senderName: data.message.senderName || data.message.userName,
              createdAt: data.message.createdAt,
            },
            updatedAt: data.message.createdAt,
            unreadCount: conv.id !== currentConvId ? (conv.unreadCount || 0) + 1 : 0,
          };
        }
        return conv;
      });
      
      // If conversation not found in list, reload conversations (only if not our own message)
      const found = updated.find((c) => c.id === data.conversationId);
      if (!found && !isOwnMessage) {
        loadConversations();
      }
      
      return updated;
    });
  }, [conversationId, activeTab, loadConversations, user?.id]);

  // Handle conversation updated from socket
  const handleConversationUpdated = useCallback((data?: { conversationId?: string; forReceiverOnly?: boolean }) => {
    // If this is marked as "forReceiverOnly" and we're viewing this conversation,
    // it means we're the sender - skip reload since we already have the message
    if (data?.forReceiverOnly) {
      const currentConvId = conversationId && activeTab === 'direct' ? conversationId : undefined;
      if (data.conversationId === currentConvId) {
        // We're viewing this conversation, so we're the sender - skip reload
        return;
      }
    }
    // Otherwise, reload conversation list (for receiver or other cases)
    loadConversations();
  }, [loadConversations, conversationId, activeTab]);

  // Setup socket connection for groups
  useGroupChatSocket({
    onMessageReceived: handleGroupMessageReceived,
    onUnreadUpdated: handleGroupUnreadUpdated,
  });

  // Setup socket connection for direct messages (for conversation list updates)
  useDirectMessageSocket({
    onMessageReceived: handleDirectMessageReceived,
    onConversationUpdated: handleConversationUpdated,
  });

  useEffect(() => {
    loadGroups();
    loadConversations();
  }, [loadGroups, loadConversations]);

  // Update active tab when URL changes
  useEffect(() => {
    const newTab: ChatType = conversationId || userId ? 'direct' : (chatId ? 'groups' : 'groups');
    setActiveTab(newTab);
  }, [conversationId, chatId, userId]);

  // Reload when coming back
  useEffect(() => {
    if (location.pathname === '/chats') {
      loadGroups();
      loadConversations();
    }
  }, [location.pathname, loadGroups, loadConversations]);

  const handleGroupClick = useCallback((groupId: string) => {
    navigate(`/chats/groups/${groupId}`);
    setActiveTab('groups');
  }, [navigate]);

  const handleConversationClick = useCallback((conversationId: string) => {
    navigate(`/chats/direct/${conversationId}`);
    setActiveTab('direct');
  }, [navigate]);

  const handleUpdateGroup = useCallback((groupId: string, updates: Partial<GroupChat>) => {
    setGroups((prevGroups) =>
      prevGroups.map((group) =>
        group.id === groupId ? { ...group, ...updates } : group
      )
    );
  }, []);

  const handleUpdateConversation = useCallback((conversationId: string, updates: Partial<DirectConversation>) => {
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === conversationId ? { ...conv, ...updates } : conv
      )
    );
  }, []);

  const handleSelectUser = useCallback(async (user: User) => {
    try {
      // Get or create conversation
      const conversations = await directMessagesAPI.getConversations();
      const existing = conversations.find((conv) => conv.otherUser.id === user.id);
      
      if (existing) {
        navigate(`/chats/direct/${existing.id}`);
      } else {
        // Create by getting conversation (will create on first message)
        // For now, navigate to a URL that will create conversation when first message is sent
        // We'll need to modify the backend or handle it in DirectChatDetail
        navigate(`/chats/direct/new/${user.id}`);
      }
      setActiveTab('direct');
    } catch (error) {
      console.error('Error starting conversation:', error);
    }
  }, [navigate]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: ChatType) => {
    setActiveTab(newValue);
    if (newValue === 'groups') {
      navigate('/chats');
    } else {
      navigate('/chats');
    }
  };

  const selectedGroupId = chatId && activeTab === 'groups' ? chatId : undefined;
  const selectedConversationId = conversationId && activeTab === 'direct' ? conversationId : undefined;
  const selectedUserId = userId && activeTab === 'direct' ? userId : undefined;

  // On mobile, show sidebar only when no chat is selected
  const showSidebar = !isMobile || (!selectedGroupId && !selectedConversationId && !selectedUserId);
  const showDetail = selectedGroupId || selectedConversationId || selectedUserId;
  const showMainContent = !selectedGroupId && !selectedConversationId && !selectedUserId;

  const loading = (activeTab === 'groups' && groupsLoading) || (activeTab === 'direct' && conversationsLoading);

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <Box sx={{ display: 'flex', height: '100vh', width: '100%', maxWidth: '100%', bgcolor: '#f0f2f5', overflow: 'hidden' }}>
      {showSidebar && (
        <Box
          sx={{
            display: { xs: showSidebar ? 'flex' : 'none', md: 'flex' },
            width: { xs: '100%', md: '360px' },
            flexShrink: 0,
            flexDirection: 'column',
          }}
        >
          {/* Tabs */}
          <Box sx={{ borderBottom: '1px solid #e4e6eb', bgcolor: 'white' }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              sx={{
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 500,
                  minHeight: 48,
                },
                '& .Mui-selected': {
                  color: '#1877f2',
                },
              }}
            >
              <Tab label="Nhóm" value="groups" />
              <Tab label="Trò chuyện" value="direct" />
            </Tabs>
          </Box>

          {/* Sidebar content based on active tab */}
          {activeTab === 'groups' ? (
            <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <GroupListSidebar
                groups={groups}
                searchTerm={groupsSearchTerm}
                activeTab={groupsActiveTab}
                selectedGroupId={selectedGroupId}
                onCreateGroup={() => setCreateGroupDialogOpen(true)}
                onSearchChange={setGroupsSearchTerm}
                onTabChange={setGroupsActiveTab}
                onGroupClick={handleGroupClick}
                onUpdateGroup={handleUpdateGroup}
              />
            </Box>
          ) : (
            <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <DirectMessageListSidebar
                conversations={conversations}
                searchTerm={directSearchTerm}
                selectedConversationId={selectedConversationId}
                onStartChat={() => setSelectUserDialogOpen(true)}
                onSearchChange={setDirectSearchTerm}
                onConversationClick={handleConversationClick}
                onUpdateConversation={handleUpdateConversation}
              />
            </Box>
          )}
        </Box>
      )}

      {showDetail && (
        <Box
          sx={{
            display: { xs: showDetail ? 'flex' : 'none', md: 'flex' },
            flex: 1,
            minWidth: 0,
            height: '100vh',
            overflow: 'hidden',
            width: '100%',
          }}
        >
          {selectedGroupId ? (
            <GroupChatDetail />
          ) : (selectedConversationId || selectedUserId) ? (
            <DirectChatDetail />
          ) : null}
        </Box>
      )}

      {showMainContent && (
        <Box
          sx={{
            display: { xs: showMainContent ? 'flex' : 'none', md: 'flex' },
            flex: 1,
            minWidth: 0,
          }}
        >
          <GroupListMainContent />
        </Box>
      )}

      <CreateGroupDialog
        open={createGroupDialogOpen}
        onClose={() => setCreateGroupDialogOpen(false)}
        onSuccess={loadGroups}
      />

      <SelectUserDialog
        open={selectUserDialogOpen}
        onClose={() => setSelectUserDialogOpen(false)}
        onSelectUser={handleSelectUser}
      />
    </Box>
  );
}

