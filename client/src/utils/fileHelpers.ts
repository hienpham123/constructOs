import React from 'react';
import ImageIcon from '@mui/icons-material/Image';
import DescriptionIcon from '@mui/icons-material/Description';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableChartIcon from '@mui/icons-material/TableChart';

/**
 * Lấy icon phù hợp cho loại file
 */
export const getFileIcon = (fileType: string): React.ReactElement => {
  if (fileType.startsWith('image/')) {
    return React.createElement(ImageIcon);
  } else if (fileType.includes('pdf')) {
    return React.createElement(PictureAsPdfIcon);
  } else if (fileType.includes('excel') || fileType.includes('spreadsheet')) {
    return React.createElement(TableChartIcon);
  }
  return React.createElement(DescriptionIcon);
};

/**
 * Kiểm tra xem file có phải là hình ảnh không
 */
export const isImageFile = (fileType: string, filename: string): boolean => {
  if (fileType.startsWith('image/')) return true;
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
  const lowerFilename = filename.toLowerCase();
  return imageExtensions.some(ext => lowerFilename.endsWith(ext));
};

/**
 * Format kích thước file thành chuỗi dễ đọc
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

