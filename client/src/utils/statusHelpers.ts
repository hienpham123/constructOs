/**
 * Lấy label tiếng Việt cho trạng thái purchase request
 */
export const getPurchaseRequestStatusLabel = (status: string): string => {
  switch (status) {
    case 'pending':
      return 'Chờ duyệt';
    case 'approved':
      return 'Đã duyệt';
    case 'rejected':
      return 'Từ chối';
    case 'ordered':
      return 'Đã đặt hàng';
    default:
      return status;
  }
};

/**
 * Lấy màu cho trạng thái purchase request
 */
export const getPurchaseRequestStatusColor = (status: string): { bg: string; text: string } => {
  const statusColors: Record<string, { bg: string; text: string }> = {
    pending: { bg: '#ed6c02', text: '#ffffff' }, // Orange
    approved: { bg: '#2e7d32', text: '#ffffff' }, // Green
    rejected: { bg: '#d32f2f', text: '#ffffff' }, // Red
    ordered: { bg: '#0288d1', text: '#ffffff' }, // Blue
  };
  return statusColors[status] || { bg: '#757575', text: '#ffffff' };
};

