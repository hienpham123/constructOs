import { Box, Avatar, Typography, Paper, IconButton, Popover, MenuList, MenuItem, ListItemText, Link } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DownloadIcon from '@mui/icons-material/Download';
import type { GroupMessage } from '../../services/api/groupChats';

interface MessageItemProps {
  message: GroupMessage;
  isOwn: boolean;
  isEditing: boolean;
  isHovered: boolean;
  isLastMessage: boolean;
  imageErrors: Set<string>;
  anchorEl: HTMLElement | null;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onMenuClick: (event: React.MouseEvent<HTMLElement>) => void;
  onMenuClose: () => void;
  onEditClick: () => void;
  onDeleteClick: () => void;
  onImageError: (attachmentId: string) => void;
  getFileIcon: (fileType: string) => React.ReactNode;
  isImageFile: (fileType: string, filename: string) => boolean;
  formatFileSize: (bytes: number) => string;
  lastMessageRef: React.RefObject<HTMLDivElement>;
}

export default function MessageItem({
  message,
  isOwn,
  isEditing,
  isHovered,
  isLastMessage,
  imageErrors,
  anchorEl,
  onMouseEnter,
  onMouseLeave,
  onMenuClick,
  onMenuClose,
  onEditClick,
  onDeleteClick,
  onImageError,
  getFileIcon,
  isImageFile,
  formatFileSize,
  lastMessageRef,
}: MessageItemProps) {
  return (
    <Box
      ref={isLastMessage ? lastMessageRef : null}
      sx={{
        display: 'flex',
        justifyContent: isOwn ? 'flex-end' : 'flex-start',
        gap: 0.75,
        alignItems: 'flex-end',
        mb: 0.5,
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {!isOwn && (
        <Avatar
          src={message.userAvatar || undefined}
          sx={{
            bgcolor: '#1877f2',
            width: 28,
            height: 28,
            fontSize: '0.8125rem',
            flexShrink: 0,
          }}
        >
          {message.userName?.[0]?.toUpperCase() || 'U'}
        </Avatar>
      )}
      <Box
        sx={{
          maxWidth: '65%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: isOwn ? 'flex-end' : 'flex-start',
        }}
      >
        {!isOwn && (
          <Typography
            variant="caption"
            sx={{
              px: 1,
              fontSize: '0.75rem',
              color: '#65676b',
              fontWeight: 600,
              mb: 0.25,
            }}
          >
            {message.userName || 'Người dùng'}
          </Typography>
        )}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: isOwn ? 'flex-end' : 'flex-start',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: 0.5,
              position: 'relative',
              flexDirection: 'row',
            }}
          >
            {isOwn && isHovered && (
              <IconButton
                size="small"
                onClick={onMenuClick}
                sx={{
                  p: 0.5,
                  color: '#65676b',
                  opacity: 0.7,
                  '&:hover': {
                    opacity: 1,
                    bgcolor: 'rgba(0,0,0,0.05)',
                  },
                }}
              >
                <MoreVertIcon fontSize="small" />
              </IconButton>
            )}
            <Paper
              elevation={0}
              sx={{
                p: '8px 12px',
                bgcolor: isOwn ? '#0084ff' : '#e4e6eb',
                color: isOwn ? '#ffffff' : '#050505',
                borderRadius: '12px',
                maxWidth: '100%',
                wordBreak: 'break-word',
                boxShadow: 'none',
              }}
            >
              {message.content && (
                <Typography
                  variant="body2"
                  sx={{
                    mb: message.attachments.length > 0 ? 1 : 0,
                    fontSize: '0.9375rem',
                    lineHeight: 1.333,
                    color: isOwn ? '#ffffff' : '#050505',
                  }}
                >
                  {message.content}
                </Typography>
              )}
              {message.attachments.length > 0 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
                  {message.attachments.map((att) => {
                    const isImage = isImageFile(att.fileType, att.originalFilename);
                    const imageFailed = imageErrors.has(att.id);
                    return (
                      <Box
                        key={att.id}
                        sx={{
                          display: 'flex',
                          flexDirection: isImage && !imageFailed ? 'column' : 'row',
                          alignItems: isImage && !imageFailed ? 'stretch' : 'center',
                          gap: 1,
                          p: 1,
                          bgcolor: isOwn ? 'rgba(255,255,255,0.15)' : '#e4e6eb',
                          borderRadius: 1,
                        }}
                      >
                        {isImage && !imageFailed ? (
                          <Box
                            component="img"
                            src={att.fileUrl}
                            alt={att.originalFilename}
                            sx={{
                              width: '100%',
                              maxWidth: '200px',
                              maxHeight: '200px',
                              objectFit: 'contain',
                              borderRadius: 1,
                              cursor: 'pointer',
                            }}
                            onClick={() => window.open(att.fileUrl, '_blank')}
                            onError={() => onImageError(att.id)}
                          />
                        ) : (
                          <>
                            <Box sx={{ color: isOwn ? '#ffffff' : '#666666' }}>
                              {getFileIcon(att.fileType)}
                            </Box>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography
                                variant="caption"
                                sx={{
                                  display: 'block',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  color: isOwn ? '#ffffff' : '#000000',
                                }}
                              >
                                {att.originalFilename}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{ color: isOwn ? 'rgba(255,255,255,0.8)' : '#666666' }}
                              >
                                {formatFileSize(att.fileSize)}
                              </Typography>
                            </Box>
                            <Link
                              href={att.fileUrl}
                              download
                              target="_blank"
                              rel="noopener noreferrer"
                              sx={{ color: isOwn ? '#ffffff' : '#0084ff' }}
                            >
                              <DownloadIcon fontSize="small" />
                            </Link>
                          </>
                        )}
                      </Box>
                    );
                  })}
                </Box>
              )}
            </Paper>
          </Box>
          {!isEditing && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                mt: 0.25,
                px: 1,
                flexDirection: isOwn ? 'row-reverse' : 'row',
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontSize: '0.6875rem',
                  color: '#65676b',
                  lineHeight: 1.2,
                }}
              >
                {new Date(message.createdAt).toLocaleTimeString('vi-VN', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Typography>
              {isOwn && (
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: '0.6875rem',
                    color: '#65676b',
                    lineHeight: 1.2,
                  }}
                >
                  Đã nhận
                </Typography>
              )}
            </Box>
          )}
        </Box>
      </Box>

      {/* Popover for message actions */}
      {isOwn && !isEditing && (
        <Popover
          open={Boolean(anchorEl) && isHovered}
          anchorEl={anchorEl}
          onClose={onMenuClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <MenuList dense>
            {message.attachments.length === 0 && (
              <MenuItem onClick={onEditClick}>
                <ListItemText>Chỉnh sửa</ListItemText>
              </MenuItem>
            )}
            <MenuItem
              onClick={onDeleteClick}
              sx={{ color: 'error.main' }}
            >
              <ListItemText>Xóa</ListItemText>
            </MenuItem>
          </MenuList>
        </Popover>
      )}
    </Box>
  );
}

