import { Box, List, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { type GroupChat } from '../../services/api/groupChats';
import GroupListSearch from './GroupListSearch';
import GroupListTabs from './GroupListTabs';
import GroupListEmpty from './GroupListEmpty';
import GroupListItem from './GroupListItem';

interface GroupListSidebarProps {
  groups: GroupChat[];
  searchTerm: string;
  activeTab: 'priority' | 'other';
  selectedGroupId: string | undefined;
  onCreateGroup: () => void;
  onSearchChange: (value: string) => void;
  onTabChange: (tab: 'priority' | 'other') => void;
  onGroupClick: (groupId: string) => void;
  onUpdateGroup: (groupId: string, updates: Partial<GroupChat>) => void;
}

export default function GroupListSidebar({
  groups,
  searchTerm,
  activeTab,
  selectedGroupId,
  onCreateGroup,
  onSearchChange,
  onTabChange,
  onGroupClick,
  onUpdateGroup,
}: GroupListSidebarProps) {
  const filteredGroups = groups
    .filter((group) => {
      const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase());
      if (activeTab === 'priority') {
        return matchesSearch && group.pinned;
      } else {
        return matchesSearch && !group.pinned;
      }
    })
    .sort((a, b) => {
      // Sort by last message time
      if (a.lastMessageAt && b.lastMessageAt) {
        return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
      }
      if (a.lastMessageAt) return -1;
      if (b.lastMessageAt) return 1;
      // Finally by creation time
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const handleGroupClick = (groupId: string) => {
    // Reset unread count when opening group
    onUpdateGroup(groupId, { unreadCount: 0 });
    onGroupClick(groupId);
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
      <GroupListSearch searchTerm={searchTerm} onSearchChange={onSearchChange} />

      <GroupListTabs activeTab={activeTab} onTabChange={onTabChange} />

      <Box sx={{ flex: 1, overflowY: 'auto', bgcolor: 'white' }}>
        {filteredGroups.length === 0 ? (
          <GroupListEmpty searchTerm={searchTerm} onCreateGroup={onCreateGroup} />
        ) : (
          <List sx={{ p: 0 }}>
            {filteredGroups.map((group) => {
              const isSelected = selectedGroupId === group.id;
              return (
                <GroupListItem
                  key={group.id}
                  group={group}
                  isSelected={isSelected}
                  onClick={handleGroupClick}
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
          startIcon={<AddIcon />}
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
      </Box>
    </Box>
  );
}
