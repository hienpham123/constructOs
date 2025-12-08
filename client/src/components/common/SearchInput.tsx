import { useState, useEffect, useCallback, useRef, forwardRef, useImperativeHandle } from 'react';
import { Box } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { Input } from './Input';

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  fullWidth?: boolean;
  maxWidth?: number | string;
}

export interface SearchInputRef {
  focus: () => void;
}

const SearchInput = forwardRef<SearchInputRef, SearchInputProps>(({
  value,
  onChange,
  placeholder = 'Tìm kiếm...',
  debounceMs = 300,
  fullWidth = false,
  maxWidth,
}, ref) => {
  const [localValue, setLocalValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update local value when prop value changes (e.g., when cleared externally)
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Debounced onChange
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue);
      }
    }, debounceMs);

    return () => clearTimeout(timeout);
  }, [localValue, debounceMs, onChange, value]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
  }, []);

  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current?.focus();
    },
  }));

  return (
    <Box
      sx={{
        width: fullWidth ? '100%' : 'auto',
        maxWidth: maxWidth || { xs: '100%', sm: 280 },
      }}
    >
      <Input
        inputRef={inputRef}
        fullWidth
        placeholder={placeholder}
        value={localValue}
        onChange={handleChange}
        size="small"
        InputProps={{
          startAdornment: <FontAwesomeIcon icon={faSearch} style={{ marginRight: 8, color: 'inherit' }} />,
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'background.paper',
            minHeight: '40px',
            height: '40px',
          },
        }}
      />
    </Box>
  );
});

SearchInput.displayName = 'SearchInput';

export default SearchInput;

