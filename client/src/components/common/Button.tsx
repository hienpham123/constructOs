import { Button as MuiButton, ButtonProps as MuiButtonProps } from '@mui/material';

export interface ButtonProps extends MuiButtonProps {
  children: React.ReactNode;
}

// Color states configuration
const buttonColors = {
  primary: {
    normal: '#4680ff',
    hover: '#79a3ff',
    active: '#0956ff',
    disabled: '#c3d5ff',
  },
  success: {
    normal: '#93BE52',
    hover: '#aacc77',
    active: '#73993a',
    disabled: '#dce9c6',
  },
  warning: {
    normal: '#FFB64D',
    hover: '#ffcb80',
    active: '#ff9d10',
    disabled: '#ffe7c4',
  },
  error: {
    normal: '#FC6180',
    hover: '#fd93a8',
    active: '#fb2550',
    disabled: '#fecbd5',
  },
  info: {
    normal: '#4680ff',
    hover: '#79a3ff',
    active: '#0956ff',
    disabled: '#c3d5ff',
  },
};

function getButtonStyles(variant: string, color: string) {
  const colors = buttonColors[color as keyof typeof buttonColors] || buttonColors.primary;
  
  if (variant === 'contained') {
    return {
      backgroundColor: colors.normal,
      color: '#ffffff',
      boxShadow: 'none',
      '&:hover': {
        backgroundColor: colors.hover,
        boxShadow: `0px 2px 4px ${colors.hover}40`,
      },
      '&:active': {
        backgroundColor: colors.active,
        boxShadow: 'none',
      },
      '&:disabled': {
        backgroundColor: colors.disabled,
        color: '#ffffff',
      },
    };
  }
  
  if (variant === 'outlined') {
    return {
      borderColor: colors.normal,
      color: colors.normal,
      borderWidth: '1.5px',
      '&:hover': {
        borderColor: colors.hover,
        backgroundColor: `${colors.hover}14`,
        color: colors.hover,
      },
      '&:active': {
        borderColor: colors.active,
        backgroundColor: `${colors.active}1F`,
        color: colors.active,
      },
      '&:disabled': {
        borderColor: colors.disabled,
        color: colors.disabled,
      },
    };
  }
  
  if (variant === 'text') {
    return {
      color: colors.normal,
      '&:hover': {
        backgroundColor: `${colors.hover}14`,
        color: colors.hover,
      },
      '&:active': {
        backgroundColor: `${colors.active}1F`,
        color: colors.active,
      },
      '&:disabled': {
        color: colors.disabled,
      },
    };
  }
  
  return {};
}

export function Button({ children, sx, variant = 'contained', color = 'primary', ...props }: ButtonProps) {
  return (
    <MuiButton
      variant={variant}
      color={color}
      {...props}
      sx={{
        textTransform: 'none',
        fontWeight: 600,
        borderRadius: '4px',
        px: 3,
        py: 0.75,
        minHeight: '40px',
        fontSize: '0.875rem',
        fontFamily: 'SegoeuiPc,Segoe UI,San Francisco,Helvetica Neue,Helvetica,Lucida Grande,Roboto,Ubuntu,Tahoma,Microsoft Sans Serif,Arial,sans-serif',
        ...getButtonStyles(variant, color),
        ...sx,
      }}
    >
      {children}
    </MuiButton>
  );
}

