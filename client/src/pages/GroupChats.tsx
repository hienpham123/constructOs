import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { Box, LinearProgress, useMediaQuery, useTheme } from '@mui/material';
import { groupChatsAPI, type GroupChat } from '../services/api/groupChats';
import CreateGroupDialog from '../components/groupChat/CreateGroupDialog';
import GroupChatDetail from './GroupChatDetail';
import GroupListSidebar from '../components/groupChat/GroupListSidebar';
import GroupListMainContent from '../components/groupChat/GroupListMainContent';
import { useGroupChatSocket } from '../hooks/useGroupChatSocket';

export default function GroupChats() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: groupId } = useParams<{ id?: string }>();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [groups, setGroups] = useState<GroupChat[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'priority' | 'other'>('priority');

  const loadGroups = useCallback(async () => {
    try {
      setLoading(true);
      const data = await groupChatsAPI.getGroups();
      setGroups(data);
    } catch (error: any) {
      console.error('Error loading groups:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle message received from socket
  const handleMessageReceived = useCallback((data: { groupId: string; message: any }) => {
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

  // Handle unread updated from socket
  const handleUnreadUpdated = useCallback(() => {
    loadGroups();
  }, [loadGroups]);

  // Setup socket connection
  useGroupChatSocket({
    onMessageReceived: handleMessageReceived,
    onUnreadUpdated: handleUnreadUpdated,
  });

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  // Reload groups when coming back from detail page
  useEffect(() => {
    if (location.pathname === '/group-chats') {
      loadGroups();
    }
  }, [location.pathname, loadGroups]);

  const handleGroupClick = useCallback((groupId: string) => {
    navigate(`/group-chats/${groupId}`);
  }, [navigate]);

  const handleUpdateGroup = useCallback((groupId: string, updates: Partial<GroupChat>) => {
    setGroups((prevGroups) =>
      prevGroups.map((group) =>
        group.id === groupId ? { ...group, ...updates } : group
      )
    );
  }, []);

  if (loading) {
    return <LinearProgress />;
  }

  const selectedGroupId = groupId || location.pathname.split('/')[2];
  
  // On mobile, show sidebar only when no group is selected
  const showSidebar = !isMobile || !selectedGroupId;
  const showDetail = selectedGroupId;
  const showMainContent = !selectedGroupId;

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#f0f2f5', overflow: 'hidden' }}>
      {showSidebar && (
        <Box
          sx={{
            display: { xs: showSidebar ? 'flex' : 'none', md: 'flex' },
            width: { xs: '100%', md: '360px' },
            flexShrink: 0,
          }}
        >
          <GroupListSidebar
            groups={groups}
            searchTerm={searchTerm}
            activeTab={activeTab}
            selectedGroupId={selectedGroupId}
            onCreateGroup={() => setCreateDialogOpen(true)}
            onSearchChange={setSearchTerm}
            onTabChange={setActiveTab}
            onGroupClick={handleGroupClick}
            onUpdateGroup={handleUpdateGroup}
          />
        </Box>
      )}

      {showDetail && (
        <Box
          sx={{
            display: { xs: showDetail ? 'flex' : 'none', md: 'flex' },
            flex: 1,
            minWidth: 0,
          }}
        >
          <GroupChatDetail />
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
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSuccess={loadGroups}
      />
    </Box>
  );
}