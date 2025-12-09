import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { Box, LinearProgress, useMediaQuery, useTheme } from '@mui/material';
import { groupChatsAPI, type GroupChat } from '../services/api/groupChats';
import { directMessagesAPI, type DirectConversation } from '../services/api/directMessages';
import CreateGroupDialog from '../components/groupChat/CreateGroupDialog';
import SelectUserDialog from '../components/directMessage/SelectUserDialog';
import GroupChatDetail from './GroupChatDetail';
import DirectChatDetail from './DirectChatDetail';
import UnifiedChatListSidebar from '../components/common/UnifiedChatListSidebar';
import GroupListMainContent from '../components/groupChat/GroupListMainContent';
import { useGroupChatSocket } from '../hooks/useGroupChatSocket';
import { useDirectMessageSocket } from '../hooks/useDirectMessageSocket';
import { useAuthStore } from '../stores/authStore';
import type { User } from '../services/api/users';

export default function Chats() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: chatId, conversationId, userId } = useParams<{ id?: string; conversationId?: string; userId?: string }>();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useAuthStore();
  
  // Unified state - no more tabs
  const [groups, setGroups] = useState<GroupChat[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(true);
  const [conversations, setConversations] = useState<DirectConversation[]>([]);
  const [conversationsLoading, setConversationsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [createGroupDialogOpen, setCreateGroupDialogOpen] = useState(false);
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
    const currentConvId = conversationId || userId ? conversationId : undefined;
    
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
  }, [conversationId, userId, loadConversations, user?.id]);

  // Handle conversation updated from socket
  const handleConversationUpdated = useCallback((data?: { conversationId?: string; forReceiverOnly?: boolean }) => {
    // If this is marked as "forReceiverOnly" and we're viewing this conversation,
    // it means we're the sender - skip reload since we already have the message
    if (data?.forReceiverOnly) {
      const currentConvId = conversationId || userId ? conversationId : undefined;
      if (data.conversationId === currentConvId) {
        // We're viewing this conversation, so we're the sender - skip reload
        return;
      }
    }
    // Otherwise, reload conversation list (for receiver or other cases)
    loadConversations();
  }, [loadConversations, conversationId, userId]);

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

  // No need for active tab anymore - we show everything in one list

  // Reload when coming back
  useEffect(() => {
    if (location.pathname === '/chats') {
      loadGroups();
      loadConversations();
    }
  }, [location.pathname, loadGroups, loadConversations]);

  const handleGroupClick = useCallback((groupId: string) => {
    navigate(`/chats/groups/${groupId}`);
  }, [navigate]);

  const handleConversationClick = useCallback((conversationId: string) => {
    navigate(`/chats/direct/${conversationId}`);
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
    } catch (error) {
      console.error('Error starting conversation:', error);
    }
  }, [navigate]);

  const selectedGroupId = chatId ? chatId : undefined;
  const selectedConversationId = conversationId ? conversationId : undefined;
  const selectedUserId = userId ? userId : undefined;

  // On mobile, show sidebar only when no chat is selected
  // Always render sidebar on mobile for smooth animation
  const showSidebar = !isMobile || (!selectedGroupId && !selectedConversationId && !selectedUserId);
  const showDetail = selectedGroupId || selectedConversationId || selectedUserId;
  const showMainContent = !selectedGroupId && !selectedConversationId && !selectedUserId;
  
  // Track previous state to detect changes for animation
  const prevShowSidebarRef = useRef(showSidebar);
  const prevShowDetailRef = useRef(showDetail);
  
  // On mobile, always render both views but control visibility with transform
  const isDetailVisible = showDetail;
  const isSidebarVisible = showSidebar;
  
  // Update refs after render
  useEffect(() => {
    prevShowSidebarRef.current = showSidebar;
    prevShowDetailRef.current = showDetail;
  }, [showSidebar, showDetail]);

  const loading = groupsLoading || conversationsLoading;

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <Box sx={{ display: 'flex', height: '100vh', width: '100%', maxWidth: '100%', bgcolor: '#f0f2f5', overflow: 'hidden', position: 'relative' }}>
      {/* Sidebar with slide animation - always rendered on mobile for smooth animation */}
      {isMobile ? (
        <Box
          sx={{
            display: 'flex',
            width: '100%',
            flexShrink: 0,
            flexDirection: 'column',
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            zIndex: 1,
            transform: isSidebarVisible ? 'translateX(0)' : 'translateX(-100%)',
            transition: 'transform 0.3s ease-in-out',
            willChange: 'transform',
            pointerEvents: isSidebarVisible ? 'auto' : 'none',
            bgcolor: 'white',
          }}
        >
          <UnifiedChatListSidebar
            groups={groups}
            conversations={conversations}
            searchTerm={searchTerm}
            selectedGroupId={selectedGroupId}
            selectedConversationId={selectedConversationId}
            onCreateGroup={() => setCreateGroupDialogOpen(true)}
            onStartChat={() => setSelectUserDialogOpen(true)}
            onSearchChange={setSearchTerm}
            onGroupClick={handleGroupClick}
            onConversationClick={handleConversationClick}
            onUpdateGroup={handleUpdateGroup}
            onUpdateConversation={handleUpdateConversation}
          />
        </Box>
      ) : (
        <Box
          sx={{
            display: 'flex',
            width: '360px',
            flexShrink: 0,
            flexDirection: 'column',
            height: '100vh',
          }}
        >
          <UnifiedChatListSidebar
            groups={groups}
            conversations={conversations}
            searchTerm={searchTerm}
            selectedGroupId={selectedGroupId}
            selectedConversationId={selectedConversationId}
            onCreateGroup={() => setCreateGroupDialogOpen(true)}
            onStartChat={() => setSelectUserDialogOpen(true)}
            onSearchChange={setSearchTerm}
            onGroupClick={handleGroupClick}
            onConversationClick={handleConversationClick}
            onUpdateGroup={handleUpdateGroup}
            onUpdateConversation={handleUpdateConversation}
          />
        </Box>
      )}

      {/* Detail view with slide animation - always rendered on mobile for smooth animation */}
      {isMobile ? (
        <Box
          sx={{
            display: 'flex',
            flex: 1,
            minWidth: 0,
            height: '100vh',
            overflow: 'hidden',
            width: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 2,
            transform: isDetailVisible ? 'translateX(0)' : 'translateX(100%)',
            transition: 'transform 0.3s ease-in-out',
            willChange: 'transform',
            pointerEvents: isDetailVisible ? 'auto' : 'none',
            bgcolor: '#f0f2f5',
          }}
        >
          {selectedGroupId ? (
            <GroupChatDetail />
          ) : (selectedConversationId || selectedUserId) ? (
            <DirectChatDetail />
          ) : null}
        </Box>
      ) : (
        showDetail && (
          <Box
            sx={{
              display: 'flex',
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
        )
      )}

      {/* Main content (empty state) */}
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

