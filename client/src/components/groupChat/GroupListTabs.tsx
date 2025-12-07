import { Box, Tabs, Tab, IconButton, Menu, MenuItem } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
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
          minHeight: 40,
          '& .MuiTab-root': {
            minHeight: 40,
            textTransform: 'none',
            fontSize: '0.875rem',
            fontWeight: 500,
            color: '#65676b',
            '&.Mui-selected': {
              color: '#1877f2',
              fontWeight: 600,
            },
          },
          '& .MuiTabs-indicator': {
            backgroundColor: '#1877f2',
            height: 3,
          },
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
        <ArrowDropDownIcon />
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
