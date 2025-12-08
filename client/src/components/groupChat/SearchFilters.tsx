import { Box, Typography } from '@mui/material';
import { DatePicker } from '../common';
import PeoplePicker, { type PeoplePickerOption } from '../common/PeoplePicker';
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
  // Convert members to PeoplePickerOption format
  const memberOptions: PeoplePickerOption[] = members.map((member) => ({
    id: member.userId,
    name: member.name,
    avatar: member.avatar,
  }));

  // Find selected member option
  const selectedMember = selectedSenderId
    ? memberOptions.find((m) => m.id === selectedSenderId) || null
    : null;

  // Add "Tất cả" option
  const allOptions: PeoplePickerOption[] = [
    { id: '', name: 'Tất cả', avatar: null },
    ...memberOptions,
  ];

  const handleSenderChange = (value: PeoplePickerOption | null) => {
    if (!value || value.id === '') {
      onSenderChange(undefined);
    } else {
      onSenderChange(value.id);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" sx={{ mb: 1.5, fontWeight: 600, color: '#65676b' }}>
          Lọc theo:
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Filter by sender */}
          <PeoplePicker
            label="Người gửi"
            placeholder="Chọn người gửi..."
            multiple={false}
            value={selectedMember}
            onChange={(value) => handleSenderChange(value as PeoplePickerOption | null)}
            options={allOptions}
            size="small"
            fullWidth
          />

          {/* Filter by date */}
          <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
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
                sx={{ width: '100%' }}
              />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
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
                sx={{ width: '100%' }}
              />
            </Box>
          </Box>
        </Box>
      </Box>
    </LocalizationProvider>
  );
}

