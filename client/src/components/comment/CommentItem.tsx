import { Box, Typography, Paper, Avatar, IconButton, Link, Popover, MenuList, MenuItem, ListItemText } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisV, faDownload } from '@fortawesome/free-solid-svg-icons';
import { formatDateTime } from '../../utils/dateFormat';
import { getFileIcon, isImageFile, formatFileSize } from '../../utils/fileHelpers';

interface Attachment {
  id: string;
  fileType: string;
  originalFilename: string;
  fileSize: number;
  fileUrl: string;
}

interface CommentItemProps {
  content?: string;
  attachments: Attachment[];
  createdBy: string;
  createdByName?: string;
  createdByAvatar?: string | null;
  createdAt: string;
  isOwn: boolean;
  isEditing: boolean;
  isHovered: boolean;
  imageErrors: Set<string>;
  anchorEl: HTMLElement | null;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onMoreClick: (event: React.MouseEvent<HTMLElement>) => void;
  onPopoverClose: () => void;
  onEditClick: () => void;
  onDeleteClick: () => void;
  onImageError: (attachmentId: string) => void;
}

export default function CommentItem({
  content,
  attachments,
  createdByName,
  createdByAvatar,
  createdAt,
  isOwn,
  isEditing,
  isHovered,
  imageErrors,
  anchorEl,
  onMouseEnter,
  onMouseLeave,
  onMoreClick,
  onPopoverClose,
  onEditClick,
  onDeleteClick,
  onImageError,
}: CommentItemProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isOwn ? 'flex-end' : 'flex-start',
        gap: 1,
        alignItems: 'flex-end',
        position: 'relative',
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {!isOwn && (
        <Avatar 
          src={createdByAvatar || undefined}
          sx={{ bgcolor: '#0084ff', width: 36, height: 36 }}
        >
          {createdByName?.[0]?.toUpperCase() || 'U'}
        </Avatar>
      )}
      <Box
        sx={{
          maxWidth: '70%',
          display: 'flex',
          flexDirection: 'column',
          gap: 0.5,
        }}
      >
        {!isOwn && (
          <Typography variant="caption" sx={{ px: 1, fontSize: '0.75rem', color: '#666666' }}>
            {createdByName || 'Người dùng'}
          </Typography>
        )}
        <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 0.5, position: 'relative' }}>
          {isOwn && isHovered && (
            <IconButton
              size="small"
              onClick={onMoreClick}
              sx={{ 
                position: 'absolute',
                left: '-32px',
                top: '50%',
                transform: 'translateY(-50%)',
                p: 0.5,
                color: '#999',
                opacity: 0.7,
                bgcolor: 'transparent',
                zIndex: 1,
                '&:hover': {
                  opacity: 1,
                  bgcolor: 'rgba(0,0,0,0.05)',
                },
              }}
            >
              <FontAwesomeIcon icon={faEllipsisV} style={{ fontSize: '16px' }} />
            </IconButton>
          )}
          <Paper
            elevation={0}
            sx={{
              p: '8px 12px',
              bgcolor: isOwn ? '#5C9CE6' : '#ffffff',
              color: isOwn ? '#ffffff' : '#000000',
              borderRadius: isOwn 
                ? '18px 18px 4px 18px' 
                : '18px 18px 18px 4px',
              maxWidth: '100%',
              wordBreak: 'break-word',
              boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
            }}
          >
            {content && (
              <Typography 
                variant="body2" 
                sx={{ 
                  mb: attachments.length > 0 ? 1 : 0,
                  fontSize: '0.9375rem',
                  lineHeight: 1.4,
                  color: isOwn ? '#ffffff' : '#000000',
                }}
              >
                {content}
              </Typography>
            )}
            {attachments.length > 0 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
                {attachments.map((att) => {
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
                        bgcolor: isOwn ? 'rgba(255,255,255,0.15)' : '#f0f0f0',
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
                            <FontAwesomeIcon icon={faDownload} style={{ fontSize: '16px' }} />
                          </Link>
                        </>
                      )}
                    </Box>
                  );
                })}
              </Box>
            )}
            {!isEditing && (
              <Typography 
                variant="caption" 
                sx={{ 
                  fontSize: '0.7rem', 
                  color: isOwn ? 'rgba(255,255,255,0.7)' : '#999',
                  mt: 0.5,
                  px: 0.5,
                  display: 'block',
                }}
              >
                {formatDateTime(createdAt)}
              </Typography>
            )}
          </Paper>
        </Box>
      </Box>

      {/* Popover for message actions */}
      {isOwn && !isEditing && (
        <Popover
          open={Boolean(anchorEl)}
          anchorEl={anchorEl}
          onClose={onPopoverClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: isOwn ? 'right' : 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: isOwn ? 'right' : 'left',
          }}
          sx={{
            '& .MuiPopover-paper': {
              boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
              borderRadius: '8px',
              minWidth: '180px',
              padding: '4px 0',
              bgcolor: '#ffffff',
              border: 'none',
            },
          }}
          disableRestoreFocus
        >
          <MenuList 
            dense
            sx={{
              padding: 0,
              '& .MuiMenuItem-root': {
                padding: '8px 16px',
                fontSize: '14px',
                minHeight: '36px',
                '&:hover': {
                  bgcolor: '#f5f5f5',
                },
              },
            }}
          >
            {attachments.length === 0 && (
              <MenuItem 
                onClick={onEditClick}
                sx={{
                  '& .MuiListItemText-primary': {
                    color: '#000000',
                    fontSize: '14px',
                  },
                }}
              >
                <ListItemText>Chỉnh sửa</ListItemText>
              </MenuItem>
            )}
            <MenuItem 
              onClick={onDeleteClick}
              sx={{
                '& .MuiListItemText-primary': {
                  color: '#d32f2f',
                  fontSize: '14px',
                },
                '&:hover': {
                  bgcolor: '#ffebee',
                },
              }}
            >
              <ListItemText>Xóa</ListItemText>
            </MenuItem>
          </MenuList>
        </Popover>
      )}
    </Box>
  );
}

