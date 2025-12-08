import { DatePicker as MuiDatePicker, DatePickerProps as MuiDatePickerProps } from '@mui/x-date-pickers/DatePicker';
import { Box } from '@mui/material';

export interface DatePickerProps extends Omit<MuiDatePickerProps<any>, 'renderInput'> {
  // Có thể thêm custom props nếu cần
}

export function DatePicker({ slotProps, sx, ...props }: DatePickerProps) {
  const textFieldSx = {
    '& .MuiPickersInputBase-root': {
      borderRadius: '4px !important',
      '& fieldset': {
        borderRadius: '4px !important',
      },
    },
    '& .MuiPickersOutlinedInput-root': {
      borderRadius: '4px !important',
      fontSize: '0.875rem',
      fontFamily: 'SegoeuiPc,Segoe UI,San Francisco,Helvetica Neue,Helvetica,Lucida Grande,Roboto,Ubuntu,Tahoma,Microsoft Sans Serif,Arial,sans-serif',
      overflow: 'hidden',
      '& fieldset': {
        borderColor: '#d0d0d0',
        borderRadius: '4px !important',
      },
      '&:hover fieldset': {
        borderColor: '#4680ff',
        borderRadius: '4px !important',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#4680ff',
        borderWidth: '1.5px',
        borderRadius: '4px !important',
      },
      '&.Mui-disabled': {
        backgroundColor: '#f5f5f5',
        '& fieldset': {
          borderColor: '#e0e0e0',
          borderRadius: '4px !important',
        },
      },
    },
    '& .MuiOutlinedInput-root': {
      borderRadius: '4px !important',
      fontSize: '0.875rem',
      fontFamily: 'SegoeuiPc,Segoe UI,San Francisco,Helvetica Neue,Helvetica,Lucida Grande,Roboto,Ubuntu,Tahoma,Microsoft Sans Serif,Arial,sans-serif',
      overflow: 'hidden',
      '& fieldset': {
        borderColor: '#d0d0d0',
        borderRadius: '4px !important',
      },
      '&:hover fieldset': {
        borderColor: '#4680ff',
        borderRadius: '4px !important',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#4680ff',
        borderWidth: '1.5px',
        borderRadius: '4px !important',
      },
      '&.Mui-disabled': {
        backgroundColor: '#f5f5f5',
        '& fieldset': {
          borderColor: '#e0e0e0',
          borderRadius: '4px !important',
        },
      },
    },
    '& .MuiInputLabel-root': {
      fontFamily: 'SegoeuiPc,Segoe UI,San Francisco,Helvetica Neue,Helvetica,Lucida Grande,Roboto,Ubuntu,Tahoma,Microsoft Sans Serif,Arial,sans-serif',
      fontSize: '0.875rem',
      '&.Mui-focused': {
        color: '#4680ff',
      },
    },
    '& .MuiInputBase-input': {
      fontFamily: 'SegoeuiPc,Segoe UI,San Francisco,Helvetica Neue,Helvetica,Lucida Grande,Roboto,Ubuntu,Tahoma,Microsoft Sans Serif,Arial,sans-serif',
      fontSize: '0.875rem',
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderRadius: '4px !important',
    },
  };

  const textFieldProps = slotProps?.textField || {};
  const existingSx = typeof textFieldProps === 'object' && 'sx' in textFieldProps ? textFieldProps.sx : {};

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: '100%',
        minWidth: 0,
        '& .MuiPickersInputBase-root': {
          borderRadius: '4px !important',
          width: '100%',
          maxWidth: '100%',
          '& fieldset': {
            borderRadius: '4px !important',
          },
        },
        '& .MuiPickersOutlinedInput-root': {
          borderRadius: '4px !important',
          width: '100%',
          maxWidth: '100%',
          '& fieldset': {
            borderRadius: '4px !important',
          },
        },
        '& .MuiOutlinedInput-root': {
          borderRadius: '4px !important',
          width: '100%',
          maxWidth: '100%',
          '& fieldset': {
            borderRadius: '4px !important',
          },
          '& .MuiOutlinedInput-notchedOutline': {
            borderRadius: '4px !important',
          },
        },
      }}
    >
      <MuiDatePicker
        {...props}
        slotProps={{
          ...slotProps,
          textField: {
            fullWidth: true,
            ...textFieldProps,
            sx: {
              ...textFieldSx,
              ...(existingSx as any),
              '& .MuiPickersInputBase-root': {
                borderRadius: '4px !important',
                '& fieldset': {
                  borderRadius: '4px !important',
                },
              },
              '& .MuiPickersOutlinedInput-root': {
                borderRadius: '4px !important',
                overflow: 'hidden',
                '& fieldset': {
                  borderRadius: '4px !important',
                },
              },
              '& .MuiOutlinedInput-root': {
                ...textFieldSx['& .MuiOutlinedInput-root'],
                ...((existingSx as any)?.['& .MuiOutlinedInput-root'] || {}),
                borderRadius: '4px !important',
                overflow: 'hidden',
                '& fieldset': {
                  ...textFieldSx['& .MuiOutlinedInput-root']['& fieldset'],
                  ...((existingSx as any)?.['& .MuiOutlinedInput-root']?.['& fieldset'] || {}),
                  borderRadius: '4px !important',
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderRadius: '4px !important',
                },
              },
            },
          } as any,
        }}
        sx={sx}
      />
    </Box>
  );
}

