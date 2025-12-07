import { useState, useEffect, useRef } from 'react';
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  Avatar,
  IconButton,
  Chip,
  Link,
  Popover,
  MenuList,
  MenuItem,
  ListItemText,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import DownloadIcon from '@mui/icons-material/Download';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import ImageIcon from '@mui/icons-material/Image';
import DescriptionIcon from '@mui/icons-material/Description';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableChartIcon from '@mui/icons-material/TableChart';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import { useAuthStore } from '../stores/authStore';
import { formatDateTime } from '../utils/dateFormat';
import type { ProjectComment } from '../types';
import { projectsAPI } from '../services/api';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';

interface CommentSectionProps {
  projectId: string;
  category: 'contract' | 'project_files';
}

export default function CommentSection({ projectId, category }: CommentSectionProps) {
  const { user } = useAuthStore();
  const [comments, setComments] = useState<ProjectComment[]>([]);
  const [content, setContent] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);
  const [hoveredCommentId, setHoveredCommentId] = useState<string | null>(null);
  const [hoveredMoreButtonId, setHoveredMoreButtonId] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [emojiPickerAnchor, setEmojiPickerAnchor] = useState<HTMLElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadComments();
  }, [projectId, category]);

  useEffect(() => {
    scrollToBottom();
  }, [comments]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadComments = async () => {
    setIsLoading(true);
    try {
      const response = await projectsAPI.getComments(projectId, category);
      setComments(response);
    } catch (error: any) {
      console.error('Error loading comments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles((prev) => [...prev, ...files]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!content.trim() && selectedFiles.length === 0) {
      return;
    }

    if (!user) {
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('projectId', projectId);
      formData.append('category', category);
      formData.append('content', content.trim() || '');
      
      selectedFiles.forEach((file) => {
        formData.append('files', file);
      });

      const newComment = await projectsAPI.createComment(formData);
      setComments((prev) => [...prev, newComment]);
      setContent('');
      setSelectedFiles([]);
    } catch (error: any) {
      console.error('Error creating comment:', error);
      alert(error.response?.data?.error || 'Không thể gửi comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (commentId: string) => {
    setCommentToDelete(commentId);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!commentToDelete) return;

    try {
      await projectsAPI.deleteComment(commentToDelete);
      setComments((prev) => prev.filter((c) => c.id !== commentToDelete));
      setDeleteConfirmOpen(false);
      setCommentToDelete(null);
    } catch (error: any) {
      console.error('Error deleting comment:', error);
      alert(error.response?.data?.error || 'Không thể xóa comment');
    }
  };

  const handleEditClick = (comment: ProjectComment) => {
    setEditingCommentId(comment.id);
    setEditingContent(comment.content);
  };

  const handleEditCancel = () => {
    setEditingCommentId(null);
    setEditingContent('');
  };

  const handleEditSave = async (commentId: string) => {
    if (!editingContent.trim()) {
      alert('Nội dung comment không được để trống');
      return;
    }

    try {
      const updated = await projectsAPI.updateComment(commentId, editingContent);
      setComments((prev) => prev.map((c) => (c.id === commentId ? updated : c)));
      setEditingCommentId(null);
      setEditingContent('');
    } catch (error: any) {
      console.error('Error updating comment:', error);
      alert(error.response?.data?.error || 'Không thể cập nhật comment');
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <ImageIcon />;
    } else if (fileType.includes('pdf')) {
      return <PictureAsPdfIcon />;
    } else if (fileType.includes('excel') || fileType.includes('spreadsheet')) {
      return <TableChartIcon />;
    }
    return <DescriptionIcon />;
  };

  const isImageFile = (fileType: string, filename: string): boolean => {
    if (fileType.startsWith('image/')) return true;
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
    const lowerFilename = filename.toLowerCase();
    return imageExtensions.some(ext => lowerFilename.endsWith(ext));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const isCurrentUser = (comment: ProjectComment) => {
    return comment.createdBy === user?.id;
  };

  const handleMessageHover = (commentId: string) => {
    setHoveredCommentId(commentId);
  };

  const handleMessageLeave = () => {
    setHoveredCommentId(null);
  };

  const handleMoreClick = (event: React.MouseEvent<HTMLElement>, commentId: string) => {
    // Toggle popover: nếu đang mở cho comment này thì đóng, nếu không thì mở
    if (anchorEl && hoveredMoreButtonId === commentId) {
      setAnchorEl(null);
      setHoveredMoreButtonId(null);
    } else {
      setAnchorEl(event.currentTarget);
      setHoveredMoreButtonId(commentId);
    }
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
    setHoveredMoreButtonId(null);
  };

  const handleEditFromPopover = (comment: ProjectComment) => {
    handleEditClick(comment);
    handlePopoverClose();
  };

  const handleDeleteFromPopover = (commentId: string) => {
    handleDeleteClick(commentId);
    handlePopoverClose();
  };

  const handleEmojiClick = (event: React.MouseEvent<HTMLElement>) => {
    setEmojiPickerAnchor(event.currentTarget);
  };

  const handleEmojiPickerClose = () => {
    setEmojiPickerAnchor(null);
  };

  const onEmojiClick = (emojiData: EmojiClickData) => {
    setContent((prev) => prev + emojiData.emoji);
    setEmojiPickerAnchor(null);
  };

  return (
    <Box sx={{ height: '600px', display: 'flex', flexDirection: 'column', bgcolor: '#f0f0f0', overflow: 'hidden' }}>
      {/* Comments List */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          p: 2,
          bgcolor: '#f0f0f0',
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
        }}
      >
        {isLoading ? (
          <Typography>Đang tải...</Typography>
        ) : comments.length === 0 ? (
          <Typography color="text.secondary" align="center" sx={{ mt: 4 }}>
            Chưa có comment nào. Hãy bắt đầu cuộc trò chuyện!
          </Typography>
        ) : (
          comments.map((comment) => {
            const isOwn = isCurrentUser(comment);
            const isEditing = editingCommentId === comment.id;
            const isHovered = hoveredCommentId === comment.id;
            return (
              <Box
                key={comment.id}
                sx={{
                  display: 'flex',
                  justifyContent: isOwn ? 'flex-end' : 'flex-start',
                  gap: 1,
                  alignItems: 'flex-end',
                  position: 'relative',
                }}
                onMouseEnter={() => isOwn && !isEditing && handleMessageHover(comment.id)}
                onMouseLeave={handleMessageLeave}
              >
                {!isOwn && (
                  <Avatar 
                    src={comment.createdByAvatar || undefined}
                    sx={{ bgcolor: '#0084ff', width: 36, height: 36 }}
                  >
                    {comment.createdByName?.[0]?.toUpperCase() || 'U'}
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
                      {comment.createdByName || 'Người dùng'}
                    </Typography>
                  )}
                  <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 0.5, position: 'relative' }}>
                    {isOwn && isHovered && (
                      <IconButton
                        size="small"
                        onClick={(e) => handleMoreClick(e, comment.id)}
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
                        <MoreVertIcon fontSize="small" />
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
                    {comment.content && (
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          mb: comment.attachments.length > 0 ? 1 : 0,
                          fontSize: '0.9375rem',
                          lineHeight: 1.4,
                          color: isOwn ? '#ffffff' : '#000000',
                        }}
                      >
                        {comment.content}
                      </Typography>
                    )}
                    {comment.attachments.length > 0 && (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
                        {comment.attachments.map((att) => {
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
                                <>
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
                                    onError={() => {
                                      setImageErrors((prev) => new Set(prev).add(att.id));
                                    }}
                                  />
                                </>
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
                        {formatDateTime(comment.createdAt)}
                      </Typography>
                    )}
                  </Paper>
                  </Box>
                </Box>

                {/* Popover for message actions */}
                {isOwn && !isEditing && (
                  <Popover
                    open={Boolean(anchorEl) && hoveredMoreButtonId === comment.id}
                    anchorEl={anchorEl}
                    onClose={handlePopoverClose}
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
                      {comment.attachments.length === 0 && (
                        <MenuItem 
                          onClick={() => handleEditFromPopover(comment)}
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
                        onClick={() => handleDeleteFromPopover(comment.id)}
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
          })
        )}
        <div ref={messagesEndRef} />
      </Box>

      {/* Selected Files Preview */}
      {selectedFiles.length > 0 && (
        <Box sx={{ p: 1, bgcolor: '#f5f5f5', borderTop: '1px solid #e0e0e0' }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {selectedFiles.map((file, index) => (
              <Chip
                key={index}
                label={file.name}
                onDelete={() => removeFile(index)}
                size="small"
                icon={getFileIcon(file.type)}
              />
            ))}
          </Box>
        </Box>
      )}

      {/* Input Area - Zalo Style */}
      {!editingCommentId && (
        <Box sx={{ bgcolor: 'white', borderTop: '1px solid #e0e0e0' }}>
          {/* Icon Row */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 2,
              py: 1,
              borderBottom: '1px solid #e0e0e0',
            }}
          >
            <IconButton
              component="label"
              size="small"
              sx={{
                color: '#1976d2',
                '&:hover': {
                  bgcolor: 'rgba(25, 118, 210, 0.08)',
                },
              }}
            >
              <AttachFileIcon fontSize="small" />
              <input
                ref={fileInputRef}
                type="file"
                multiple
                hidden
                onChange={handleFileSelect}
                accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.csv"
              />
            </IconButton>
            <IconButton
              size="small"
              onClick={handleEmojiClick}
              sx={{
                color: '#1976d2',
                '&:hover': {
                  bgcolor: 'rgba(25, 118, 210, 0.08)',
                },
              }}
            >
              <EmojiEmotionsIcon fontSize="small" />
            </IconButton>
          </Box>
          {/* Input Field */}
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', px: 2, py: 1.5 }}>
            <TextField
              fullWidth
              multiline
              maxRows={4}
              placeholder="Nhập comment..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (content.trim() || selectedFiles.length > 0) {
                    handleSubmit();
                  }
                }
              }}
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '20px',
                  bgcolor: '#f5f5f5',
                  '& fieldset': {
                    borderColor: 'transparent',
                  },
                  '&:hover fieldset': {
                    borderColor: 'transparent',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'transparent',
                  },
                },
              }}
            />
            <IconButton
              onClick={handleSubmit}
              disabled={isSubmitting || (!content.trim() && selectedFiles.length === 0)}
              sx={{
                color: '#1976d2',
                '&:hover': {
                  bgcolor: 'rgba(25, 118, 210, 0.08)',
                },
                '&.Mui-disabled': {
                  color: '#bdbdbd',
                },
              }}
            >
              <SendIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      )}

      {/* Emoji Picker Popover */}
      <Popover
        open={Boolean(emojiPickerAnchor)}
        anchorEl={emojiPickerAnchor}
        onClose={handleEmojiPickerClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        sx={{
          '& .MuiPopover-paper': {
            boxShadow: 'none',
            bgcolor: 'transparent',
          },
        }}
      >
        <Box sx={{ mt: -1 }}>
          <EmojiPicker
            onEmojiClick={onEmojiClick}
            width={350}
            height={400}
            previewConfig={{ showPreview: false }}
          />
        </Box>
      </Popover>

      {/* Edit Bar - Messenger Style */}
      {editingCommentId && (
        <Box
          sx={{
            bgcolor: '#E8F4FD',
            borderTop: '1px solid #e0e0e0',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Edit Header */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 2,
              py: 1,
              bgcolor: '#E8F4FD',
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: '#1976d2',
                fontSize: '0.875rem',
                fontWeight: 500,
              }}
            >
              Chỉnh sửa tin nhắn
            </Typography>
            <IconButton
              size="small"
              onClick={handleEditCancel}
              sx={{
                color: '#1976d2',
                '&:hover': {
                  bgcolor: 'rgba(25, 118, 210, 0.1)',
                },
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
          {/* Edit Input */}
          <Box
            sx={{
              px: 2,
              pb: 2,
              display: 'flex',
              gap: 1,
              alignItems: 'flex-end',
            }}
          >
            <TextField
              fullWidth
              multiline
              maxRows={4}
              value={editingContent}
              onChange={(e) => setEditingContent(e.target.value)}
              placeholder="Nhập tin nhắn..."
              size="small"
              sx={{
                bgcolor: '#ffffff',
                borderRadius: 1,
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: 'transparent',
                  },
                  '&:hover fieldset': {
                    borderColor: 'transparent',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'transparent',
                  },
                },
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  const comment = comments.find((c) => c.id === editingCommentId);
                  if (comment) {
                    handleEditSave(comment.id);
                  }
                }
              }}
            />
            <IconButton
              onClick={() => {
                const comment = comments.find((c) => c.id === editingCommentId);
                if (comment) {
                  handleEditSave(comment.id);
                }
              }}
              disabled={!editingContent.trim()}
              sx={{
                color: '#4CAF50',
                bgcolor: 'transparent',
                '&:hover': {
                  bgcolor: 'rgba(76, 175, 80, 0.1)',
                },
                '&.Mui-disabled': {
                  color: 'rgba(255,255,255,0.3)',
                },
              }}
            >
              <CheckCircleIcon />
            </IconButton>
          </Box>
        </Box>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setCommentToDelete(null);
        }}
      >
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xóa comment này? Hành động này không thể hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDeleteConfirmOpen(false);
              setCommentToDelete(null);
            }}
          >
            Hủy
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

