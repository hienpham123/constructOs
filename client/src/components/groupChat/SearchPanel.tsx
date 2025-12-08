import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  IconButton,
  InputAdornment,
  Paper,
  useMediaQuery,
  useTheme,
  Backdrop,
} from '@mui/material';
import { Input } from '../common';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faSearch } from '@fortawesome/free-solid-svg-icons';
import SearchFilters from './SearchFilters';
import SearchResults from './SearchResults';
import SearchResultsSkeleton from './SearchResultsSkeleton';
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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
    <>
      {/* Backdrop for mobile */}
      {isMobile && (
        <Backdrop
          open={true}
          onClick={onClose}
          sx={{
            zIndex: (theme) => theme.zIndex.drawer - 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}
        />
      )}

      <Paper
        sx={{
          position: isMobile ? 'fixed' : 'absolute',
          top: 0,
          right: 0,
          width: isMobile ? '100%' : 400,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'white',
          boxShadow: isMobile ? 'none' : '-2px 0 8px rgba(0,0,0,0.1)',
          zIndex: isMobile ? (theme) => theme.zIndex.drawer : 1000,
          maxWidth: isMobile ? '100%' : 400,
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
          <FontAwesomeIcon icon={faTimes} style={{ fontSize: '16px' }} />
        </IconButton>
      </Box>

      {/* Search Bar */}
      <Box sx={{ p: 2, borderBottom: '1px solid #e4e6eb' }}>
          <Input
          fullWidth
          size="small"
          placeholder="Tìm kiếm..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <FontAwesomeIcon icon={faSearch} style={{ fontSize: '16px', color: '#65676b' }} />
              </InputAdornment>
            ),
            endAdornment: searchQuery && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={handleClear} sx={{ color: '#65676b' }}>
                  <FontAwesomeIcon icon={faTimes} style={{ fontSize: '16px' }} />
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
          <SearchResultsSkeleton />
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
    </>
  );
}

