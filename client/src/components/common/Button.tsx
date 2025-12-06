import { Button as MuiButton, ButtonProps as MuiButtonProps } from '@mui/material';

export interface ButtonProps extends MuiButtonProps {
  children: React.ReactNode;
}

export function Button({ children, sx, ...props }: ButtonProps) {
  return (
    <MuiButton
      {...props}
      sx={{
        textTransform: 'none',
        fontWeight: 600,
        borderRadius: 0,
        px: 3,
        py: 0.75,
        minHeight: '40px',
        boxShadow: 'none',
        '&:hover': {
          boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.12)',
        },
        ...sx,
      }}
    >
      {children}
    </MuiButton>
  );
}

