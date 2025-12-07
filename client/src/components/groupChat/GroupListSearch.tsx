import { Box, TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

interface GroupListSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export default function GroupListSearch({ searchTerm, onSearchChange }: GroupListSearchProps) {
  return (
    <Box sx={{ p: 1.5, borderBottom: '1px solid #e4e6eb' }}>
      <TextField
        fullWidth
        size="small"
        placeholder="Nhập tên nhóm để tìm kiếm"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ fontSize: 18, color: '#8a8d91' }} />
            </InputAdornment>
          ),
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: '20px',
            bgcolor: '#f0f2f5',
            fontSize: '0.875rem',
            '& fieldset': {
              borderColor: 'transparent',
            },
            '&:hover fieldset': {
              borderColor: 'transparent',
            },
            '&.Mui-focused fieldset': {
              borderColor: 'transparent'
            },
          },
        }}
      />
    </Box>
  );
}
