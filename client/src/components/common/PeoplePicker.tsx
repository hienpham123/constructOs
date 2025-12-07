import { useState, useEffect } from 'react';
import {
  Autocomplete,
  TextField,
  Box,
  Avatar,
  Typography,
  Chip,
  CircularProgress,
} from '@mui/material';
import { usersAPI } from '../../services/api/users';

export interface PeoplePickerOption {
  id: string;
  name: string;
  avatar?: string | null;
  email?: string;
  phone?: string;
  [key: string]: any; // Allow additional properties
}

export interface PeoplePickerProps {
  label?: string;
  placeholder?: string;
  multiple?: boolean;
  value: PeoplePickerOption | PeoplePickerOption[] | null;
  onChange: (value: PeoplePickerOption | PeoplePickerOption[] | null) => void;
  options?: PeoplePickerOption[]; // If provided, use these instead of loading from API
  excludeIds?: string[]; // IDs to exclude from options
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  size?: 'small' | 'medium';
  fullWidth?: boolean;
  onLoadOptions?: () => Promise<PeoplePickerOption[]>; // Custom loader function
  getOptionDisabled?: (option: PeoplePickerOption) => boolean;
}

export default function PeoplePicker({
  label,
  placeholder = 'Chọn người dùng...',
  multiple = false,
  value,
  onChange,
  options: providedOptions,
  excludeIds = [],
  disabled = false,
  error = false,
  helperText,
  size = 'medium',
  fullWidth = true,
  onLoadOptions,
  getOptionDisabled,
}: PeoplePickerProps) {
  const [options, setOptions] = useState<PeoplePickerOption[]>(providedOptions || []);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  // Load options when dialog opens (if not provided)
  useEffect(() => {
    if (open && !providedOptions && options.length === 0) {
      loadOptions();
    }
  }, [open]);

  // Update options when providedOptions change
  useEffect(() => {
    if (providedOptions) {
      setOptions(providedOptions);
    }
  }, [providedOptions]);

  const loadOptions = async () => {
    try {
      setLoading(true);
      let data: PeoplePickerOption[];
      
      if (onLoadOptions) {
        data = await onLoadOptions();
      } else {
        // Default: load from usersAPI
        const users = await usersAPI.getUsers();
        data = users.map((user) => ({
          id: user.id,
          name: user.name,
          avatar: user.avatar,
          email: user.email,
          phone: user.phone,
        }));
      }

      // Filter out excluded IDs
      if (excludeIds.length > 0) {
        data = data.filter((user) => !excludeIds.includes(user.id));
      }

      setOptions(data);
    } catch (error) {
      console.error('Error loading users:', error);
      setOptions([]);
    } finally {
      setLoading(false);
    }
  };

  const getOptionLabel = (option: PeoplePickerOption) => {
    return option.name || '';
  };

  const isOptionEqualToValue = (option: PeoplePickerOption, value: PeoplePickerOption) => {
    return option.id === value.id;
  };

  const filterOptions = (options: PeoplePickerOption[], { inputValue }: any) => {
    const searchValue = inputValue.toLowerCase();
    return options.filter(
      (option) =>
        option.name?.toLowerCase().includes(searchValue) ||
        option.email?.toLowerCase().includes(searchValue) ||
        option.phone?.includes(searchValue)
    );
  };

  return (
    <Autocomplete
      multiple={multiple}
      options={options}
      value={value}
      onChange={(_, newValue) => {
        onChange(newValue as any);
      }}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      getOptionLabel={getOptionLabel}
      isOptionEqualToValue={isOptionEqualToValue}
      filterOptions={filterOptions}
      disabled={disabled}
      loading={loading}
      size={size}
      fullWidth={fullWidth}
      getOptionDisabled={getOptionDisabled}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          error={error}
          helperText={helperText}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      renderOption={(props, option) => (
        <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1 }}>
          <Avatar
            src={option.avatar || undefined}
            sx={{
              width: 32,
              height: 32,
              bgcolor: '#1877f2',
              fontSize: '0.875rem',
              flexShrink: 0,
            }}
          >
            {option.name?.[0]?.toUpperCase() || 'U'}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 500, color: '#050505' }}>
              {option.name}
            </Typography>
            {option.email && (
              <Typography variant="caption" sx={{ color: '#65676b', display: 'block' }}>
                {option.email}
              </Typography>
            )}
          </Box>
        </Box>
      )}
      renderTags={(value, getTagProps) =>
        value.map((option, index) => (
          <Chip
            {...getTagProps({ index })}
            key={option.id}
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <Avatar
                  src={option.avatar || undefined}
                  sx={{
                    width: 20,
                    height: 20,
                    bgcolor: '#1877f2',
                    fontSize: '0.7rem',
                  }}
                >
                  {option.name?.[0]?.toUpperCase() || 'U'}
                </Avatar>
                <Typography variant="body2" sx={{ fontSize: '0.8125rem' }}>
                  {option.name}
                </Typography>
              </Box>
            }
            size="small"
            sx={{
              height: 'auto',
              py: 0.5,
              '& .MuiChip-label': {
                px: 0.75,
              },
            }}
          />
        ))
      }
    />
  );
}

