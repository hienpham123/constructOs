import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFile,
  faFileImage,
  faFilePdf,
  faFileWord,
  faFilePowerpoint,
  faFileVideo,
  faFileAudio,
  faFileZipper,
  faFileCode,
  faFileText,
} from '@fortawesome/free-solid-svg-icons';
import ExcelIcon from '../images/icon-excel.svg';

/**
 * Lấy icon phù hợp cho loại file
 */
export const getFileIcon = (fileType: string, filename?: string): React.ReactElement => {
  const lowerFileType = fileType.toLowerCase();
  const lowerFilename = filename?.toLowerCase() || '';

  // Image files
  if (lowerFileType.startsWith('image/') || 
      ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg', '.ico'].some(ext => lowerFilename.endsWith(ext))) {
    return React.createElement(FontAwesomeIcon, { icon: faFileImage, style: { fontSize: '24px' } });
  }
  
  // PDF files
  if (lowerFileType.includes('pdf') || lowerFilename.endsWith('.pdf')) {
    return React.createElement(FontAwesomeIcon, { icon: faFilePdf, style: { fontSize: '24px' } });
  }
  
  // Excel files
  if (lowerFileType.includes('excel') || 
      lowerFileType.includes('spreadsheet') ||
      ['.xls', '.xlsx', '.xlsm', '.xlsb'].some(ext => lowerFilename.endsWith(ext))) {
    return React.createElement('img', { 
      src: ExcelIcon, 
      alt: 'Excel file',
      style: { width: '32px', height: '32px', objectFit: 'contain' }
    });
  }
  
  // Word files
  if (lowerFileType.includes('word') ||
      lowerFileType.includes('document') ||
      ['.doc', '.docx'].some(ext => lowerFilename.endsWith(ext))) {
    return React.createElement(FontAwesomeIcon, { icon: faFileWord, style: { fontSize: '24px' } });
  }
  
  // PowerPoint files
  if (lowerFileType.includes('powerpoint') ||
      lowerFileType.includes('presentation') ||
      ['.ppt', '.pptx'].some(ext => lowerFilename.endsWith(ext))) {
    return React.createElement(FontAwesomeIcon, { icon: faFilePowerpoint, style: { fontSize: '24px' } });
  }
  
  // Video files
  if (lowerFileType.startsWith('video/') ||
      ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.mkv', '.webm'].some(ext => lowerFilename.endsWith(ext))) {
    return React.createElement(FontAwesomeIcon, { icon: faFileVideo, style: { fontSize: '24px' } });
  }
  
  // Audio files
  if (lowerFileType.startsWith('audio/') ||
      ['.mp3', '.wav', '.flac', '.aac', '.ogg', '.wma'].some(ext => lowerFilename.endsWith(ext))) {
    return React.createElement(FontAwesomeIcon, { icon: faFileAudio, style: { fontSize: '24px' } });
  }
  
  // Archive files
  if (lowerFileType.includes('zip') ||
      lowerFileType.includes('archive') ||
      lowerFileType.includes('compressed') ||
      ['.zip', '.rar', '.7z', '.tar', '.gz'].some(ext => lowerFilename.endsWith(ext))) {
    return React.createElement(FontAwesomeIcon, { icon: faFileZipper, style: { fontSize: '24px' } });
  }
  
  // Code files
  if (['.js', '.ts', '.jsx', '.tsx', '.html', '.css', '.json', '.xml', '.py', '.java', '.cpp', '.c', '.php', '.rb', '.go'].some(ext => lowerFilename.endsWith(ext))) {
    return React.createElement(FontAwesomeIcon, { icon: faFileCode, style: { fontSize: '24px' } });
  }
  
  // Text files
  if (lowerFileType.includes('text') ||
      ['.txt', '.md', '.rtf'].some(ext => lowerFilename.endsWith(ext))) {
    return React.createElement(FontAwesomeIcon, { icon: faFileText, style: { fontSize: '24px' } });
  }
  
  // Default file icon
  return React.createElement(FontAwesomeIcon, { icon: faFile, style: { fontSize: '24px' } });
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

