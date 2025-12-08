import { Box, List, TextField, InputAdornment, Button, Typography, IconButton, useMediaQuery, useTheme } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faPlus, faUserPlus, faBars } from '@fortawesome/free-solid-svg-icons';
import { type GroupChat } from '../../services/api/groupChats';
import { type DirectConversation } from '../../services/api/directMessages';
import { formatZaloTime } from '../../utils/dateFormat';
import UnifiedChatListItem from './UnifiedChatListItem';
import { useAuthStore } from '../../stores/authStore';

interface UnifiedChatListSidebarProps {
  groups: GroupChat[];
  conversations: DirectConversation[];
  searchTerm: string;
  selectedGroupId: string | undefined;
  selectedConversationId: string | undefined;
  onCreateGroup: () => void;
  onStartChat: () => void;
  onSearchChange: (value: string) => void;
  onGroupClick: (groupId: string) => void;
  onConversationClick: (conversationId: string) => void;
  onUpdateGroup: (groupId: string, updates: Partial<GroupChat>) => void;
  onUpdateConversation: (conversationId: string, updates: Partial<DirectConversation>) => void;
}

type UnifiedChatItem = 
  | { type: 'group'; data: GroupChat }
  | { type: 'conversation'; data: DirectConversation };

export default function UnifiedChatListSidebar({
  groups,
  conversations,
  searchTerm,
  selectedGroupId,
  selectedConversationId,
  onCreateGroup,
  onStartChat,
  onSearchChange,
  onGroupClick,
  onConversationClick,
  onUpdateGroup,
  onUpdateConversation,
}: UnifiedChatListSidebarProps) {
  const { user } = useAuthStore();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Get mobile drawer toggle function from Layout context or window
  const handleDrawerToggle = () => {
    // Dispatch custom event to trigger drawer toggle in Layout
    window.dispatchEvent(new CustomEvent('toggleMobileDrawer'));
  };

  // Combine and sort items: pinned first, then by last message time
  const allItems: UnifiedChatItem[] = [
    ...groups.map((group) => ({ type: 'group' as const, data: group })),
    ...conversations.map((conv) => ({ type: 'conversation' as const, data: conv })),
  ];

  const filteredAndSortedItems = allItems
    .filter((item) => {
      const matchesSearch = searchTerm === '' || 
        (item.type === 'group'
          ? item.data.name.toLowerCase().includes(searchTerm.toLowerCase())
          : item.data.otherUser.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.data.otherUser.email.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesSearch;
    })
    .sort((a, b) => {
      // Pinned items first
      const aPinned = a.type === 'group' ? a.data.pinned : a.data.pinned;
      const bPinned = b.type === 'group' ? b.data.pinned : b.data.pinned;
      
      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;
      
      // Within pinned/unpinned, sort by last message time
      const aTime = a.type === 'group'
        ? (a.data.lastMessageAt ? new Date(a.data.lastMessageAt).getTime() : 0)
        : (a.data.lastMessage ? new Date(a.data.lastMessage.createdAt).getTime() : 0);
      
      const bTime = b.type === 'group'
        ? (b.data.lastMessageAt ? new Date(b.data.lastMessageAt).getTime() : 0)
        : (b.data.lastMessage ? new Date(b.data.lastMessage.createdAt).getTime() : 0);
      
      return bTime - aTime;
    });

  const handleGroupClick = (groupId: string) => {
    onUpdateGroup(groupId, { unreadCount: 0 });
    onGroupClick(groupId);
  };

  const handleConversationClick = (conversationId: string) => {
    onUpdateConversation(conversationId, { unreadCount: 0 });
    onConversationClick(conversationId);
  };

  return (
    <Box
      sx={{
        width: 360,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'white',
        borderRight: '1px solid #e4e6eb',
        height: '100%',
      }}
    >
      {/* Search bar */}
      <Box sx={{ p: 2, borderBottom: '1px solid #e4e6eb', display: 'flex', alignItems: 'center', gap: 1 }}>
        {/* Hamburger icon for mobile */}
        {isMobile && (
          <IconButton
            onClick={handleDrawerToggle}
            sx={{
              minWidth: 40,
              minHeight: 40,
              color: '#65676b',
              '&:hover': {
                backgroundColor: '#f0f2f5',
              },
            }}
          >
            <FontAwesomeIcon icon={faBars} style={{ fontSize: '18px' }} />
          </IconButton>
        )}
        <TextField
          fullWidth
          size="small"
          placeholder="Nhập tên nhóm hoặc người dùng để tìm kiếm"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <FontAwesomeIcon icon={faMagnifyingGlass} style={{ color: '#65676b', fontSize: '16px' }} />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: '#f0f2f5',
              borderRadius: '20px',
              '& fieldset': {
                border: 'none',
              },
            },
          }}
        />
      </Box>

      {/* Chat list */}
      <Box sx={{ flex: 1, overflowY: 'auto', bgcolor: 'white' }}>
        {filteredAndSortedItems.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center', color: '#65676b' }}>
            {searchTerm ? (
              <Box>
                <Typography variant="body2">Không tìm thấy kết quả</Typography>
              </Box>
            ) : (
              <Box>
                <Typography variant="body2" sx={{ mb: 2 }}>Chưa có cuộc trò chuyện nào</Typography>
                <Button
                  variant="contained"
                  startIcon={<FontAwesomeIcon icon={faUserPlus} />}
                  onClick={onStartChat}
                  sx={{
                    textTransform: 'none',
                    bgcolor: '#1877f2',
                    '&:hover': {
                      bgcolor: '#166fe5',
                    },
                  }}
                >
                  Trò chuyện mới
                </Button>
              </Box>
            )}
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {filteredAndSortedItems.map((item) => (
              <UnifiedChatListItem
                key={`${item.type}-${item.data.id}`}
                item={item}
                isSelected={
                  (item.type === 'group' && selectedGroupId === item.data.id) ||
                  (item.type === 'conversation' && selectedConversationId === item.data.id)
                }
                onGroupClick={handleGroupClick}
                onConversationClick={handleConversationClick}
              />
            ))}
          </List>
        )}
      </Box>

      {/* Action buttons */}
      <Box
        sx={{
          p: 2,
          borderTop: '1px solid #e4e6eb',
          bgcolor: 'white',
          display: 'flex',
          gap: 1,
        }}
      >
        <Button
          variant="contained"
          fullWidth
          startIcon={<FontAwesomeIcon icon={faPlus} />}
          onClick={onCreateGroup}
          sx={{
            textTransform: 'none',
            bgcolor: '#1877f2',
            '&:hover': {
              bgcolor: '#166fe5',
            },
          }}
        >
          Tạo nhóm
        </Button>
        <Button
          variant="outlined"
          fullWidth
          startIcon={<FontAwesomeIcon icon={faUserPlus} />}
          onClick={onStartChat}
          sx={{
            textTransform: 'none',
            borderColor: '#1877f2',
            color: '#1877f2',
            '&:hover': {
              borderColor: '#166fe5',
              bgcolor: '#e7f3ff',
            },
          }}
        >
          Trò chuyện
        </Button>
      </Box>
    </Box>
  );
}
