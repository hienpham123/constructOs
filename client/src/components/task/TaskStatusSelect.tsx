import { useState } from 'react';
import { Chip, Menu, MenuItem, Box } from '@mui/material';
import { KeyboardArrowDown } from '@mui/icons-material';
import { ProjectTask } from '../../types';

const statusLabels: Record<ProjectTask['status'], string> = {
  pending: 'Chờ xử lý',
  in_progress: 'Đang làm',
  submitted: 'Chờ duyệt',
  completed: 'Hoàn thành',
  blocked: 'Tắc nghẽn',
  cancelled: 'Hủy',
};

// Định nghĩa style chung cho từng status - dùng chung cho cả bên ngoài và trong dropdown
const statusStyleMap: Record<ProjectTask['status'], { 
  bg: string; 
  text: string; 
  muiColor: 'default' | 'primary' | 'warning' | 'success' | 'error' | 'info';
}> = {
  pending: { 
    bg: '#bdbdbd', 
    text: '#212121',
    muiColor: 'default'
  },
  in_progress: { 
    bg: '#90caf9', 
    text: '#1565c0',
    muiColor: 'info'
  },
  submitted: { 
    bg: '#ffb74d', 
    text: '#e65100',
    muiColor: 'warning'
  },
  completed: { 
    bg: '#81c784', 
    text: '#1b5e20',
    muiColor: 'success'
  },
  blocked: { 
    bg: '#ef5350', 
    text: '#b71c1c',
    muiColor: 'error'
  },
  cancelled: { 
    bg: '#f48fb1', 
    text: '#880e4f',
    muiColor: 'error'
  },
};

// Helper function để lấy style cho status
const getStatusStyle = (status: ProjectTask['status']) => {
  return statusStyleMap[status];
};

// Tất cả các status có thể chọn (trừ status hiện tại)
const allStatuses: ProjectTask['status'][] = ['pending', 'in_progress', 'submitted', 'completed', 'blocked', 'cancelled'];

// Status không thể chuyển sang status khác
const finalStatuses: ProjectTask['status'][] = ['completed', 'cancelled'];

interface TaskStatusSelectProps {
  value: ProjectTask['status'];
  onChange: (status: ProjectTask['status']) => void;
  size?: 'small' | 'medium';
  disabled?: boolean;
  title?: string;
}

export default function TaskStatusSelect({ value, onChange, size = 'small', disabled = false, title }: TaskStatusSelectProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  
  // Hiển thị tất cả status trừ status hiện tại
  // Nếu status hiện tại là completed hoặc cancelled, không cho phép thay đổi
  const canChange = !finalStatuses.includes(value);
  const availableStatuses = allStatuses.filter(s => s !== value);
  const currentStyle = getStatusStyle(value);
  
  // Nếu disabled hoặc là final status, không hiện dropdown
  const showDropdown = !disabled && canChange && availableStatuses.length > 0;

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (showDropdown) {
      setAnchorEl(event.currentTarget);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (newStatus: ProjectTask['status']) => {
    onChange(newStatus);
    handleClose();
  };

  return (
    <>
      <Chip
        label={statusLabels[value]}
        color={currentStyle.muiColor}
        size={size}
        onClick={handleClick}
        disabled={disabled}
        title={title}
        icon={showDropdown ? <KeyboardArrowDown fontSize="small" /> : undefined}
        sx={{
          cursor: disabled || !showDropdown ? 'default' : 'pointer',
          '&:hover': disabled || !showDropdown ? {} : {
            opacity: 0.8,
          },
          backgroundColor: currentStyle.bg,
          color: currentStyle.text,
          border: `1px solid ${currentStyle.text}20`,
          '& .MuiChip-icon': {
            color: currentStyle.text,
          },
        }}
      />
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        PaperProps={{
          sx: {
            mt: 0.5,
            minWidth: 160,
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
          },
        }}
      >
        {availableStatuses.map((status) => {
          const optionStyle = getStatusStyle(status);
          return (
            <MenuItem
              key={status}
              onClick={() => handleSelect(status)}
              sx={{
                py: 1,
                px: 1.5,
                backgroundColor: 'transparent',
                '&:hover': {
                  backgroundColor: optionStyle.bg + '30',
                },
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                }}
              >
                <Chip
                  label={statusLabels[status]}
                  size="small"
                  color={optionStyle.muiColor}
                  sx={{
                    backgroundColor: optionStyle.bg,
                    color: optionStyle.text,
                    border: `1px solid ${optionStyle.text}20`,
                    '& .MuiChip-icon': {
                      color: optionStyle.text,
                    },
                    cursor: 'pointer',
                    '&:hover': {
                      opacity: 0.8,
                    },
                  }}
                />
              </Box>
            </MenuItem>
          );
        })}
        {availableStatuses.length === 0 && (
          <MenuItem disabled sx={{ py: 1, px: 1.5 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                width: '100%',
              }}
            >
              <Chip
                label="Không thể thay đổi trạng thái"
                size="small"
                color={currentStyle.muiColor}
                sx={{
                  backgroundColor: currentStyle.bg,
                  color: currentStyle.text,
                  border: `1px solid ${currentStyle.text}20`,
                  opacity: 0.6,
                }}
              />
            </Box>
          </MenuItem>
        )}
      </Menu>
    </>
  );
}

export { statusLabels, statusStyleMap };

