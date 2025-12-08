import { useMemo, useState } from 'react';
import {
  Paper,
  Box,
  Typography,
  IconButton,
  List,
  Divider,
  useMediaQuery,
  useTheme,
  Backdrop,
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faChevronDown, faChevronUp, faClock, faDownload } from '@fortawesome/free-solid-svg-icons';
import { getFileIcon, formatFileSize, isImageFile } from '../../utils/fileHelpers';
import { formatZaloTime } from '../../utils/dateFormat';
import { Button } from '../common';
import type { GroupMessage } from '../../services/api/groupChats';

interface FilePanelProps {
  open: boolean;
  onClose: () => void;
  messages: GroupMessage[];
}

interface FileItem {
  id: string;
  messageId: string;
  filename: string;
  originalFilename: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  createdAt: string;
  uploadedBy: string;
  uploadedByName: string;
  uploadedByAvatar: string | null;
}

export default function FilePanel({ open, onClose, messages }: FilePanelProps) {
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [imagesExpanded, setImagesExpanded] = useState(true);
  const [filesExpanded, setFilesExpanded] = useState(true);
  const [showAllImages, setShowAllImages] = useState(false);
  const [showAllFiles, setShowAllFiles] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Collect all files from messages and separate images/videos from other files
  const { images, otherFiles } = useMemo(() => {
    const imageList: FileItem[] = [];
    const fileList: FileItem[] = [];
    
    messages.forEach((message) => {
      message.attachments.forEach((attachment) => {
        const fileItem: FileItem = {
          id: attachment.id,
          messageId: message.id,
          filename: attachment.filename,
          originalFilename: attachment.originalFilename,
          fileType: attachment.fileType,
          fileSize: attachment.fileSize,
          fileUrl: attachment.fileUrl,
          createdAt: attachment.createdAt,
          uploadedBy: message.userId,
          uploadedByName: message.userName,
          uploadedByAvatar: message.userAvatar,
        };

        if (isImageFile(attachment.fileType, attachment.originalFilename) || 
            attachment.fileType.startsWith('video/')) {
          imageList.push(fileItem);
        } else {
          fileList.push(fileItem);
        }
      });
    });
    
    // Sort by creation date (newest first)
    const sortByDate = (a: FileItem, b: FileItem) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    
    return {
      images: imageList.sort(sortByDate),
      otherFiles: fileList.sort(sortByDate),
    };
  }, [messages]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop for mobile */}
      {isMobile && (
        <Backdrop
          open={open}
          onClick={onClose}
          sx={{
            zIndex: (theme) => theme.zIndex.drawer - 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}
        />
      )}

      <Paper
        sx={{
          position: isMobile ? 'fixed' : 'absolute',
          top: 0,
          right: 0,
          width: isMobile ? '100%' : '400px',
          height: '100%',
          bgcolor: 'white',
          boxShadow: isMobile ? 'none' : '-2px 0 8px rgba(0,0,0,0.1)',
          zIndex: isMobile ? (theme) => theme.zIndex.drawer : 1000,
          display: 'flex',
          flexDirection: 'column',
          maxWidth: isMobile ? '100%' : '400px',
        }}
      >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: '1px solid #e4e6eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.125rem' }}>
          Tệp đính kèm
        </Typography>
        <IconButton size="small" onClick={onClose} sx={{ color: '#65676b' }}>
          <FontAwesomeIcon icon={faTimes} style={{ fontSize: '16px' }} />
        </IconButton>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
        {/* Ảnh/Video Section */}
        {images.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 1.5,
                cursor: 'pointer',
              }}
              onClick={() => setImagesExpanded(!imagesExpanded)}
            >
              <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                Ảnh/Video
              </Typography>
              <FontAwesomeIcon 
                icon={imagesExpanded ? faChevronDown : faChevronUp} 
                style={{ fontSize: '14px', color: '#65676b' }} 
              />
            </Box>
            
            {imagesExpanded && (
              <>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: 1,
                    mb: 2,
                  }}
                >
                  {(showAllImages ? images : images.slice(0, 8)).map((image) => {
                    const imageFailed = imageErrors.has(image.id);
                    return (
                      <Box
                        key={image.id}
                        sx={{
                          aspectRatio: '1',
                          borderRadius: 1,
                          overflow: 'hidden',
                          cursor: 'pointer',
                          bgcolor: '#f0f2f5',
                          position: 'relative',
                        }}
                        onClick={() => window.open(image.fileUrl, '_blank')}
                      >
                        {!imageFailed ? (
                          <Box
                            component="img"
                            src={image.fileUrl}
                            alt={image.originalFilename}
                            sx={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                            onError={() => setImageErrors((prev) => new Set(prev).add(image.id))}
                          />
                        ) : (
                          <Box
                            sx={{
                              width: '100%',
                              height: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {getFileIcon(image.fileType, image.originalFilename)}
                          </Box>
                        )}
                      </Box>
                    );
                  })}
                </Box>
                {images.length > 8 && (
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => setShowAllImages(!showAllImages)}
                    sx={{
                      borderColor: '#e4e6eb',
                      color: '#65676b',
                      textTransform: 'none',
                      '&:hover': {
                        borderColor: '#d0d0d0',
                        bgcolor: '#f5f5f5',
                      },
                    }}
                  >
                    {showAllImages ? 'Thu gọn' : 'Xem tất cả'}
                  </Button>
                )}
              </>
            )}
          </Box>
        )}

        {/* File Section */}
        {otherFiles.length > 0 && (
          <Box>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 1.5,
                cursor: 'pointer',
              }}
              onClick={() => setFilesExpanded(!filesExpanded)}
            >
              <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                File
              </Typography>
              <FontAwesomeIcon 
                icon={filesExpanded ? faChevronDown : faChevronUp} 
                style={{ fontSize: '14px', color: '#65676b' }} 
              />
            </Box>
            
            {filesExpanded && (
              <>
                <List sx={{ p: 0 }}>
                  {(showAllFiles ? otherFiles : otherFiles.slice(0, 2)).map((file, index) => {
                    const displayFiles = showAllFiles ? otherFiles : otherFiles.slice(0, 2);
                    return (
                    <Box key={file.id} sx={{ width: '100%' }}>
                      <Box
                        sx={{
                          py: 1.5,
                          px: 1.5,
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          position: 'relative',
                          borderRadius: 1,
                          transition: 'background-color 0.2s',
                          '&:hover': {
                            bgcolor: '#f0f2f5',
                          },
                          '&:hover .download-button': {
                            opacity: 1,
                          },
                        }}
                      >
                        <Box sx={{ minWidth: 48, mr: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {getFileIcon(file.fileType, file.originalFilename)}
                        </Box>
                        <Box
                          className="file-details"
                          sx={{
                            flex: 1,
                            minWidth: 0, // Quan trọng để ellipsis hoạt động trong flexbox
                            pr: 4, // Padding right để tránh text bị che bởi download button
                            overflow: 'hidden',
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 600,
                              fontSize: '0.8125rem',
                              color: '#050505',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              mb: 0.5,
                              width: '100%',
                            }}
                          >
                            {file.originalFilename}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography
                              variant="caption"
                              sx={{ 
                                color: '#65676b',
                                fontSize: '0.75rem',
                              }}
                            >
                              {formatFileSize(file.fileSize)}
                            </Typography>
                            <FontAwesomeIcon 
                              icon={faClock} 
                              style={{ fontSize: '12px', color: '#0084ff' }} 
                            />
                            <Typography
                              variant="caption"
                              sx={{ 
                                color: '#65676b',
                                fontSize: '0.75rem',
                              }}
                            >
                              {formatZaloTime(file.createdAt) === 'Hôm nay' ? 'Hôm nay' : formatZaloTime(file.createdAt)}
                            </Typography>
                          </Box>
                        </Box>
                        <IconButton
                          className="download-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const link = document.createElement('a');
                            link.href = file.fileUrl;
                            link.download = file.originalFilename;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }}
                          sx={{
                            position: 'absolute',
                            right: 8,
                            opacity: 0,
                            transition: 'opacity 0.2s',
                            color: '#0084ff',
                            '&:hover': {
                              bgcolor: 'rgba(0, 132, 255, 0.1)',
                            },
                          }}
                        >
                          <FontAwesomeIcon icon={faDownload} style={{ fontSize: '16px' }} />
                        </IconButton>
                      </Box>
                      {index < displayFiles.length - 1 && (
                        <Divider sx={{ mx: 1.5 }} />
                      )}
                    </Box>
                    );
                  })}
                </List>
                {otherFiles.length > 2 && (
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => setShowAllFiles(!showAllFiles)}
                    sx={{
                      mt: 2,
                      borderColor: '#e4e6eb',
                      color: '#65676b',
                      textTransform: 'none',
                      '&:hover': {
                        borderColor: '#d0d0d0',
                        bgcolor: '#f5f5f5',
                      },
                    }}
                  >
                    {showAllFiles ? 'Thu gọn' : 'Xem tất cả'}
                  </Button>
                )}
              </>
            )}
          </Box>
        )}

        {images.length === 0 && otherFiles.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              Chưa có tệp đính kèm nào
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
    </>
  );
}

