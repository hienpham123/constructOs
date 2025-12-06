/**
 * Format number to currency string with thousand separators
 * Example: 1000000 -> "1,000,000"
 */
export const formatCurrencyInput = (value: number | string): string => {
  if (!value && value !== 0) return '';
  const numValue = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : value;
  if (isNaN(numValue)) return '';
  return numValue.toLocaleString('en-US');
};

/**
 * Parse formatted currency string back to number
 * Example: "1,000,000" -> 1000000
 */
export const parseCurrencyInput = (value: string): number => {
  if (!value) return 0;
  const cleaned = value.replace(/,/g, '');
  const numValue = parseFloat(cleaned);
  return isNaN(numValue) ? 0 : numValue;
};

/**
 * Format number to VND currency for display
 * Example: 1000000 -> "1,000,000 ₫"
 */
export const formatCurrencyDisplay = (value: number | string): string => {
  if (!value && value !== 0) return '0 ₫';
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(numValue);
};

