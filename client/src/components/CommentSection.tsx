import { useState, useEffect, useRef } from 'react';
import { Box, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';
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

  const handleEditSave = async () => {
    if (!editingCommentId || !editingContent.trim()) {
      alert('Nội dung comment không được để trống');
      return;
    }

    try {
      const updated = await projectsAPI.updateComment(editingCommentId, editingContent);
      setComments((prev) => prev.map((c) => (c.id === editingCommentId ? updated : c)));
      setEditingCommentId(null);
      setEditingContent('');
    } catch (error: any) {
      console.error('Error updating comment:', error);
      alert(error.response?.data?.error || 'Không thể cập nhật comment');
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
    <Box sx={{ height: '600px', display: 'flex', flexDirection: 'column', bgcolor: '#f0f0f0', overflow: 'hidden' }}>
      <CommentList
        comments={comments}
        currentUserId={user?.id}
        editingCommentId={editingCommentId}
        hoveredCommentId={hoveredCommentId}
        imageErrors={imageErrors}
        anchorEl={anchorEl}
        hoveredMoreButtonId={hoveredMoreButtonId}
        isLoading={isLoading}
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
