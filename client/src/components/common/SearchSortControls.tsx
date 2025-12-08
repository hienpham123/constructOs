import { Select, MenuItem, FormControl, InputLabel, Box, SelectChangeEvent } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { Input } from './Input';

export interface SortOption {
  value: string;
  label: string;
}

interface SearchSortControlsProps {
  search: string;
  onSearchChange: (value: string) => void;
  sortBy: string;
  onSortByChange: (value: string) => void;
  sortOrder: 'asc' | 'desc';
  onSortOrderChange: (value: 'asc' | 'desc') => void;
  sortOptions: SortOption[];
  searchPlaceholder?: string;
}

export default function SearchSortControls({
  search,
  onSearchChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
  sortOptions,
  searchPlaceholder = 'Tìm kiếm...',
}: SearchSortControlsProps) {
  return (
    <Box
      display="flex"
      gap={2}
      mb={3}
      sx={{
        flexWrap: { xs: 'wrap', sm: 'nowrap' },
      }}
    >
      <Input
        fullWidth
        placeholder={searchPlaceholder}
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        InputProps={{
          startAdornment: <FontAwesomeIcon icon={faSearch} style={{ marginRight: 8, color: 'inherit' }} />,
        }}
        sx={{
          maxWidth: { xs: '100%', sm: 400 },
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'background.paper',
          },
        }}
      />
      <FormControl sx={{ minWidth: 180 }}>
        <InputLabel>Sắp xếp theo</InputLabel>
        <Select
          value={sortBy}
          label="Sắp xếp theo"
          onChange={(e: SelectChangeEvent<string>) => onSortByChange(e.target.value)}
        >
          {sortOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl sx={{ minWidth: 120 }}>
        <InputLabel>Thứ tự</InputLabel>
        <Select
          value={sortOrder}
          label="Thứ tự"
          onChange={(e: SelectChangeEvent<string>) => onSortOrderChange(e.target.value as 'asc' | 'desc')}
        >
          <MenuItem value="asc">Tăng dần</MenuItem>
          <MenuItem value="desc">Giảm dần</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
}

