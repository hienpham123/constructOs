import { useState, useEffect, useRef } from 'react';
import { Box, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import { Button } from './common';
import { useAuthStore } from '../stores/authStore';
import type { ProjectComment } from '../types';
import { projectsAPI } from '../services/api';
import CommentList from './comment/CommentList';
import CommentInput from './comment/CommentInput';
import CommentEditBar from './comment/CommentEditBar';

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
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreComments, setHasMoreComments] = useState(true);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);
  const [hoveredCommentId, setHoveredCommentId] = useState<string | null>(null);
  const [hoveredMoreButtonId, setHoveredMoreButtonId] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
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
      const response = await projectsAPI.getComments(projectId, category, 50, 0);
      setComments(response);
      // Check if there are more comments
      setHasMoreComments(response.length === 50);
    } catch (error: any) {
      console.error('Error loading comments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMoreComments = async () => {
    if (isLoadingMore || !hasMoreComments) return;
    
    setIsLoadingMore(true);
    try {
      const commentsContainer = document.querySelector('[data-comments-container]') as HTMLElement;
      if (!commentsContainer) {
        setIsLoadingMore(false);
        return;
      }
      
      // Get current scroll position and height before adding new comments
      const previousScrollTop = commentsContainer.scrollTop;
      const previousScrollHeight = commentsContainer.scrollHeight;
      
      // Load only 50 comments at a time
      const currentOffset = comments.length;
      const data = await projectsAPI.getComments(projectId, category, 50, currentOffset);
      
      if (data.length === 0) {
        setHasMoreComments(false);
      } else {
        // Prepend older comments to the beginning
        setComments((prev) => [...data, ...prev]);
        
        // Restore scroll position after new comments are added
        setTimeout(() => {
          if (commentsContainer) {
            const newScrollHeight = commentsContainer.scrollHeight;
            const heightDifference = newScrollHeight - previousScrollHeight;
            // Set scroll position to maintain the same visual position
            commentsContainer.scrollTop = previousScrollTop + heightDifference;
          }
        }, 50);
        
        // Check if there are more comments (if we got less than 50, we've reached the end)
        setHasMoreComments(data.length === 50);
      }
    } catch (error: any) {
      console.error('Error loading more comments:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    try {
      // Compress image files before adding
      const { compressImage, isImageFile } = await import('../utils/imageCompression');
      const processedFiles = await Promise.all(
        files.map(async (file) => {
          if (isImageFile(file)) {
            return await compressImage(file, {
              maxSizeMB: 1,
              maxWidthOrHeight: 1920,
              initialQuality: 0.8,
            });
          }
          return file;
        })
      );
      
      setSelectedFiles((prev) => [...prev, ...processedFiles]);
    } catch (error) {
      console.error('Error processing files:', error);
      // Fallback: use original files
      setSelectedFiles((prev) => [...prev, ...files]);
    }

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
      // Error is handled by instance.ts interceptor
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
      // Error is handled by instance.ts interceptor
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

  const handleEditSave = async () => {
    if (!editingCommentId || !editingContent.trim()) {
      // Validation error - content is required
      return;
    }

    try {
      const updated = await projectsAPI.updateComment(editingCommentId, editingContent);
      setComments((prev) => prev.map((c) => (c.id === editingCommentId ? updated : c)));
      setEditingCommentId(null);
      setEditingContent('');
    } catch (error: any) {
      console.error('Error updating comment:', error);
      // Error is handled by instance.ts interceptor
    }
  };

  const handleMessageHover = (commentId: string) => {
    setHoveredCommentId(commentId);
  };

  const handleMessageLeave = () => {
    setHoveredCommentId(null);
  };

  const handleMoreClick = (event: React.MouseEvent<HTMLElement>, commentId: string) => {
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

  const handleImageError = (attachmentId: string) => {
    setImageErrors((prev) => new Set(prev).add(attachmentId));
  };

  return (
    <Box sx={{ height: { xs: '100%', sm: '600px' }, display: 'flex', flexDirection: 'column', bgcolor: '#f0f0f0', overflow: 'hidden' }}>
      <CommentList
        comments={comments}
        currentUserId={user?.id}
        editingCommentId={editingCommentId}
        hoveredCommentId={hoveredCommentId}
        imageErrors={imageErrors}
        anchorEl={anchorEl}
        hoveredMoreButtonId={hoveredMoreButtonId}
        isLoading={isLoading}
        hasMoreComments={hasMoreComments}
        isLoadingMore={isLoadingMore}
        onLoadMore={loadMoreComments}
        onMessageHover={handleMessageHover}
        onMessageLeave={handleMessageLeave}
        onMoreClick={handleMoreClick}
        onPopoverClose={handlePopoverClose}
        onEditClick={handleEditClick}
        onDeleteClick={handleDeleteClick}
        onImageError={handleImageError}
        messagesEndRef={messagesEndRef}
      />

      {!editingCommentId && (
        <CommentInput
          content={content}
          selectedFiles={selectedFiles}
          isSubmitting={isSubmitting}
          fileInputRef={fileInputRef}
          onContentChange={setContent}
          onFileSelect={handleFileSelect}
          onRemoveFile={removeFile}
          onSubmit={handleSubmit}
        />
      )}

      {editingCommentId && (
        <CommentEditBar
          editingContent={editingContent}
          onContentChange={setEditingContent}
          onSave={handleEditSave}
          onCancel={handleEditCancel}
          disabled={!editingContent.trim()}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setCommentToDelete(null);
        }}
        fullWidth
        maxWidth="sm"
        sx={{
          '& .MuiDialog-container': {
            '& .MuiPaper-root': {
              width: '100%',
              maxWidth: { xs: '100%', sm: '500px' },
            },
          },
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
