import { Box, Tabs, Tab, IconButton, Menu, MenuItem } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';

interface GroupListTabsProps {
  activeTab: 'priority' | 'other';
  onTabChange: (tab: 'priority' | 'other') => void;
}

export default function GroupListTabs({ activeTab, onTabChange }: GroupListTabsProps) {
  const [categoryMenuAnchor, setCategoryMenuAnchor] = useState<null | HTMLElement>(null);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        borderBottom: '1px solid #e4e6eb',
        px: 1,
      }}
    >
      <Tabs
        value={activeTab}
        onChange={(_, newValue) => onTabChange(newValue)}
        sx={{
          flex: 1,
        }}
      >
        <Tab value="priority" label="Ưu tiên" />
        <Tab value="other" label="Khác" />
      </Tabs>
      <IconButton
        size="small"
        onClick={(e) => setCategoryMenuAnchor(e.currentTarget)}
        sx={{ color: '#65676b' }}
      >
        <FontAwesomeIcon icon={faChevronDown} />
      </IconButton>
      <Menu
        anchorEl={categoryMenuAnchor}
        open={Boolean(categoryMenuAnchor)}
        onClose={() => setCategoryMenuAnchor(null)}
      >
        <MenuItem onClick={() => setCategoryMenuAnchor(null)}>Phân loại</MenuItem>
      </Menu>
    </Box>
  );
}
