import moment from 'moment';
import 'moment/locale/vi';

// Set Vietnamese locale
moment.locale('vi');

/**
 * Format date to Vietnamese format DD/MM/YYYY
 * @param date - Date string or Date object
 * @param format - Moment format string (default: 'DD/MM/YYYY')
 * @returns Formatted date string in DD/MM/YYYY format
 */
export const formatDate = (date: string | Date | null | undefined, format: string = 'DD/MM/YYYY'): string => {
  if (!date) return '-';
  try {
    const momentDate = moment(date);
    if (!momentDate.isValid()) return '-';
    return momentDate.format(format);
  } catch (error) {
    console.error('Error formatting date:', error, date);
    return '-';
  }
};

/**
 * Format datetime to Vietnamese format
 * @param date - Date string or Date object
 * @param format - Moment format string (default: 'DD/MM/YYYY HH:mm')
 * @returns Formatted datetime string
 */
export const formatDateTime = (date: string | Date | null | undefined, format: string = 'DD/MM/YYYY HH:mm'): string => {
  if (!date) return '-';
  return moment(date).format(format);
};

/**
 * Format date to relative time (e.g., "2 giờ trước")
 * @param date - Date string or Date object
 * @returns Relative time string
 */
export const formatRelativeTime = (date: string | Date | null | undefined): string => {
  if (!date) return '-';
  return moment(date).fromNow();
};

/**
 * Format date range
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Formatted date range string
 */
export const formatDateRange = (
  startDate: string | Date | null | undefined,
  endDate: string | Date | null | undefined
): string => {
  if (!startDate || !endDate) return '-';
  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
};

/**
 * Check if date is today
 */
export const isToday = (date: string | Date | null | undefined): boolean => {
  if (!date) return false;
  return moment(date).isSame(moment(), 'day');
};

/**
 * Check if date is in the past
 */
export const isPast = (date: string | Date | null | undefined): boolean => {
  if (!date) return false;
  return moment(date).isBefore(moment());
};

/**
 * Check if date is in the future
 */
export const isFuture = (date: string | Date | null | undefined): boolean => {
  if (!date) return false;
  return moment(date).isAfter(moment());
};

/**
 * Format time like Zalo: "Vừa xong", "19 phút", "09/07/24"
 * @param dateString - Date string or null
 * @returns Formatted time string in Zalo style
 */
export const formatZaloTime = (dateString: string | null): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Vừa xong';
  if (diffMins < 60) return `${diffMins} phút`;
  if (diffHours < 24) return `${diffHours} giờ`;
  if (diffDays < 7) return `${diffDays} ngày`;
  // Format as DD/MM/YY
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear()).slice(-2);
  return `${day}/${month}/${year}`;
};

