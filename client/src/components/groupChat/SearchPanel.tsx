import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  InputAdornment,
  Paper,
  CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import SearchFilters from './SearchFilters';
import SearchResults from './SearchResults';
import type { GroupMessage, GroupMember } from '../../services/api/groupChats';
import { groupChatsAPI } from '../../services/api/groupChats';
import { Dayjs } from 'dayjs';

interface SearchPanelProps {
  groupId: string;
  members: GroupMember[];
  onClose: () => void;
  onMessageClick: (message: GroupMessage) => void;
}

export default function SearchPanel({ groupId, members, onClose, onMessageClick }: SearchPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSenderId, setSelectedSenderId] = useState<string | undefined>();
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [results, setResults] = useState<GroupMessage[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto search when query or filters change
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!searchQuery.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const filters: any = {};
        if (selectedSenderId) {
          filters.senderId = selectedSenderId;
        }
        if (startDate) {
          filters.startDate = startDate.format('YYYY-MM-DD');
        }
        if (endDate) {
          filters.endDate = endDate.format('YYYY-MM-DD');
        }

        const data = await groupChatsAPI.searchMessages(groupId, searchQuery.trim(), filters);
        setResults(data);
        setHasSearched(true);
      } catch (error: any) {
        console.error('Error searching messages:', error);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300); // Debounce 300ms

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, selectedSenderId, startDate, endDate, groupId]);

  const handleClear = () => {
    setSearchQuery('');
    setSelectedSenderId(undefined);
    setStartDate(null);
    setEndDate(null);
    setResults([]);
    setHasSearched(false);
  };

  return (
    <Paper
      sx={{
        width: 360,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'white',
        borderLeft: '1px solid #e4e6eb',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          borderBottom: '1px solid #e4e6eb',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
          Tìm kiếm trong trò chuyện
        </Typography>
        <IconButton size="small" onClick={onClose} sx={{ color: '#65676b' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Search Bar */}
      <Box sx={{ p: 2, borderBottom: '1px solid #e4e6eb' }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Tìm kiếm..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" sx={{ color: '#65676b' }} />
              </InputAdornment>
            ),
            endAdornment: searchQuery && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={handleClear} sx={{ color: '#65676b' }}>
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '20px',
              bgcolor: '#f0f2f5',
              '& fieldset': {
                borderColor: 'transparent',
              },
              '&:hover fieldset': {
                borderColor: 'transparent',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'transparent',
              },
            },
          }}
        />
      </Box>

      {/* Filters */}
      <Box sx={{ p: 2, borderBottom: '1px solid #e4e6eb', overflowY: 'auto' }}>
        <SearchFilters
          members={members}
          selectedSenderId={selectedSenderId}
          startDate={startDate}
          endDate={endDate}
          onSenderChange={setSelectedSenderId}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
        />
      </Box>

      {/* Results */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
        {isSearching ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
            <CircularProgress size={24} />
          </Box>
        ) : hasSearched ? (
          <SearchResults
            results={results}
            searchQuery={searchQuery}
            onMessageClick={onMessageClick}
          />
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              Nhập từ khóa để tìm kiếm
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
}

