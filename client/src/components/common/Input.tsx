import { TextField, TextFieldProps } from '@mui/material';

export type InputProps = TextFieldProps;

export function Input({ sx, InputProps: inputPropsProp, ...props }: InputProps) {
  return (
    <TextField
      {...props}
      InputProps={inputPropsProp}
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: '4px',
          fontSize: '0.875rem',
          fontFamily: 'SegoeuiPc,Segoe UI,San Francisco,Helvetica Neue,Helvetica,Lucida Grande,Roboto,Ubuntu,Tahoma,Microsoft Sans Serif,Arial,sans-serif',
          '& fieldset': {
            borderColor: '#d0d0d0',
          },
          '&:hover fieldset': {
            borderColor: '#4680ff',
          },
          '&.Mui-focused fieldset': {
            borderColor: '#4680ff',
            borderWidth: '1.5px',
          },
          '&.Mui-disabled': {
            backgroundColor: '#f5f5f5',
            '& fieldset': {
              borderColor: '#e0e0e0',
            },
          },
          '&.Mui-readOnly': {
            backgroundColor: '#f9f9f9',
            '& fieldset': {
              borderColor: '#e0e0e0',
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
        ...sx,
      }}
    />
  );
}

