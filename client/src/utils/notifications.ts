import { enqueueSnackbar, VariantType } from 'notistack';

export const showNotification = (
  message: string,
  variant: VariantType = 'default'
) => {
  enqueueSnackbar(message, {
    variant,
    autoHideDuration: variant === 'error' ? 5000 : 3000,
  });
};

export const showSuccess = (message: string) => {
  showNotification(message, 'success');
};

export const showError = (message: string) => {
  showNotification(message, 'error');
};

export const showWarning = (message: string) => {
  showNotification(message, 'warning');
};

export const showInfo = (message: string) => {
  showNotification(message, 'info');
};

