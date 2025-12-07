import { Box, Typography, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Dayjs } from 'dayjs';
import type { GroupMember } from '../../services/api/groupChats';

interface SearchFiltersProps {
  members: GroupMember[];
  selectedSenderId?: string;
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  onSenderChange: (senderId: string | undefined) => void;
  onStartDateChange: (date: Dayjs | null) => void;
  onEndDateChange: (date: Dayjs | null) => void;
}

export default function SearchFilters({
  members,
  selectedSenderId,
  startDate,
  endDate,
  onSenderChange,
  onStartDateChange,
  onEndDateChange,
}: SearchFiltersProps) {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" sx={{ mb: 1.5, fontWeight: 600, color: '#65676b' }}>
          Lọc theo:
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Filter by sender */}
          <FormControl fullWidth size="small">
            <InputLabel>Người gửi</InputLabel>
            <Select
              value={selectedSenderId || ''}
              label="Người gửi"
              onChange={(e) => onSenderChange(e.target.value || undefined)}
              sx={{
                '& .MuiSelect-select': {
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                },
              }}
            >
              <MenuItem value="">Tất cả</MenuItem>
              {members.map((member) => (
                <MenuItem key={member.userId} value={member.userId}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {member.avatar && (
                      <Box
                        component="img"
                        src={member.avatar}
                        alt={member.name}
                        sx={{ width: 24, height: 24, borderRadius: '50%' }}
                      />
                    )}
                    <Typography>{member.name}</Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Filter by date */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <DatePicker
              label="Từ ngày"
              value={startDate}
              onChange={onStartDateChange}
              slotProps={{
                textField: {
                  size: 'small',
                  fullWidth: true,
                },
              }}
            />
            <DatePicker
              label="Đến ngày"
              value={endDate}
              onChange={onEndDateChange}
              slotProps={{
                textField: {
                  size: 'small',
                  fullWidth: true,
                },
              }}
            />
          </Box>
        </Box>
      </Box>
    </LocalizationProvider>
  );
}

