import { useMemo, useState } from 'react';
import {
  Paper,
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Link,
  useMediaQuery,
  useTheme,
  Backdrop,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import { getFileIcon, formatFileSize, isImageFile } from '../../utils/fileHelpers';
import { formatZaloTime } from '../../utils/dateFormat';
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Collect all files from messages
  const files = useMemo(() => {
    const fileList: FileItem[] = [];
    
    messages.forEach((message) => {
      message.attachments.forEach((attachment) => {
        fileList.push({
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
        });
      });
    });
    
    // Sort by creation date (newest first)
    return fileList.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
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
          Tệp đính kèm ({files.length})
        </Typography>
        <IconButton size="small" onClick={onClose} sx={{ color: '#65676b' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* File List */}
      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        {files.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              Chưa có tệp đính kèm nào
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {files.map((file, index) => {
              const isImage = isImageFile(file.fileType, file.originalFilename);
              const imageFailed = imageErrors.has(file.id);

              return (
                <Box key={file.id}>
                  <ListItem
                    sx={{
                      py: 1.5,
                      px: 2,
                      flexDirection: isImage && !imageFailed ? 'column' : 'row',
                      alignItems: isImage && !imageFailed ? 'stretch' : 'center',
                      '&:hover': {
                        bgcolor: '#f0f2f5',
                      },
                    }}
                  >
                    {isImage && !imageFailed ? (
                      <>
                        <Box
                          component="img"
                          src={file.fileUrl}
                          alt={file.originalFilename}
                          sx={{
                            width: '100%',
                            maxHeight: '200px',
                            objectFit: 'contain',
                            borderRadius: 1,
                            cursor: 'pointer',
                            mb: 1,
                          }}
                          onClick={() => window.open(file.fileUrl, '_blank')}
                          onError={() => setImageErrors((prev) => new Set(prev).add(file.id))}
                        />
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 500,
                                fontSize: '0.9375rem',
                                color: '#050505',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                mb: 0.5,
                              }}
                            >
                              {file.originalFilename}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ color: '#65676b', display: 'block' }}
                            >
                              {formatFileSize(file.fileSize)} • {formatZaloTime(file.createdAt)}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ color: '#65676b', display: 'block', mt: 0.25 }}
                            >
                              {file.uploadedByName}
                            </Typography>
                          </Box>
                          <Link
                            href={file.fileUrl}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{
                              color: '#0084ff',
                              ml: 1,
                              '&:hover': {
                                color: '#0066cc',
                              },
                            }}
                          >
                            <DownloadIcon fontSize="small" />
                          </Link>
                        </Box>
                      </>
                    ) : (
                      <>
                        <ListItemIcon sx={{ minWidth: 40, color: '#65676b' }}>
                          {getFileIcon(file.fileType)}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 500,
                                fontSize: '0.9375rem',
                                color: '#050505',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                mb: 0.5,
                              }}
                            >
                              {file.originalFilename}
                            </Typography>
                          }
                          secondary={
                            <Box>
                              <Typography
                                variant="caption"
                                sx={{ color: '#65676b', display: 'block' }}
                              >
                                {formatFileSize(file.fileSize)} • {formatZaloTime(file.createdAt)}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{ color: '#65676b', display: 'block', mt: 0.25 }}
                              >
                                {file.uploadedByName}
                              </Typography>
                            </Box>
                          }
                        />
                        <Link
                          href={file.fileUrl}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{
                            color: '#0084ff',
                            ml: 1,
                            '&:hover': {
                              color: '#0066cc',
                            },
                          }}
                        >
                          <DownloadIcon fontSize="small" />
                        </Link>
                      </>
                    )}
                  </ListItem>
                  {index < files.length - 1 && <Divider />}
                </Box>
              );
            })}
          </List>
        )}
      </Box>
    </Paper>
    </>
  );
}

