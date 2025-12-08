import { Box, List } from '@mui/material';
import { Button } from '../common';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { type DirectConversation } from '../../services/api/directMessages';
import DirectMessageListSearch from './DirectMessageListSearch';
import DirectMessageListEmpty from './DirectMessageListEmpty';
import DirectMessageListItem from './DirectMessageListItem';

interface DirectMessageListSidebarProps {
  conversations: DirectConversation[];
  searchTerm: string;
  selectedConversationId: string | undefined;
  onStartChat: () => void;
  onSearchChange: (value: string) => void;
  onConversationClick: (conversationId: string) => void;
  onUpdateConversation: (conversationId: string, updates: Partial<DirectConversation>) => void;
}

export default function DirectMessageListSidebar({
  conversations,
  searchTerm,
  selectedConversationId,
  onStartChat,
  onSearchChange,
  onConversationClick,
  onUpdateConversation,
}: DirectMessageListSidebarProps) {
  const filteredConversations = conversations
    .filter((conv) => {
      const matchesSearch = conv.otherUser.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           conv.otherUser.email.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    })
    .sort((a, b) => {
      // Sort by last message time
      if (a.lastMessage && b.lastMessage) {
        return new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime();
      }
      if (a.lastMessage) return -1;
      if (b.lastMessage) return 1;
      // Finally by updated time
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

  const handleConversationClick = (conversationId: string) => {
    // Reset unread count when opening conversation
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
      }}
    >
      <DirectMessageListSearch searchTerm={searchTerm} onSearchChange={onSearchChange} />

      <Box sx={{ flex: 1, overflowY: 'auto', bgcolor: 'white' }}>
        {filteredConversations.length === 0 ? (
          <DirectMessageListEmpty searchTerm={searchTerm} onStartChat={onStartChat} />
        ) : (
          <List sx={{ p: 0 }}>
            {filteredConversations.map((conversation) => {
              const isSelected = selectedConversationId === conversation.id;
              return (
                <DirectMessageListItem
                  key={conversation.id}
                  conversation={conversation}
                  isSelected={isSelected}
                  onClick={handleConversationClick}
                />
              );
            })}
          </List>
        )}
      </Box>

      <Box
        sx={{
          p: 2,
          borderTop: '1px solid #e4e6eb',
          bgcolor: 'white',
        }}
      >
        <Button
          variant="contained"
          fullWidth
          startIcon={<FontAwesomeIcon icon={faPlus} />}
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
    </Box>
  );
}

