import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Chip,
  LinearProgress,
  IconButton,
  Link,
  Grid,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import DeleteIcon from '@mui/icons-material/Delete';
import { projectReportsAPI, projectsAPI } from '../services/api';
import { formatDate } from '../utils/dateFormat';
import { showSuccess, showError } from '../utils/notifications';
import { useProjectReportStore } from '../stores/projectReportStore';

interface ProjectReportDialogProps {
  open: boolean;
  onClose: () => void;
  report: any;
  mode?: 'view' | 'edit';
}

export default function ProjectReportDialog({ open, onClose, report, mode = 'edit' }: ProjectReportDialogProps) {
  const { createReport, updateReport } = useProjectReportStore();
  const [projects, setProjects] = useState<any[]>([]);
  const [projectId, setProjectId] = useState('');
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [content, setContent] = useState('');
  const [comment, setComment] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(false);

  useEffect(() => {
    if (open) {
      fetchProjects();
      if (report) {
        setProjectId(report.project_id || '');
        setReportDate(report.report_date || new Date().toISOString().split('T')[0]);
        setContent(report.content || '');
        setComment(report.comment || '');
        setExistingAttachments(report.attachments || []);
        setAttachments([]);
      } else {
        resetForm();
      }
    }
  }, [open, report]);

  const fetchProjects = async () => {
    try {
      setLoadingProjects(true);
      const response = await projectsAPI.getAll(1000, 0);
      const projectsList = Array.isArray(response) ? response : (response.data || []);
      setProjects(projectsList);
    } catch (error: any) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoadingProjects(false);
    }
  };

  const resetForm = () => {
    setProjectId('');
    setReportDate(new Date().toISOString().split('T')[0]);
    setContent('');
    setComment('');
    setAttachments([]);
    setExistingAttachments([]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setAttachments([...attachments, ...newFiles]);
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleDeleteExistingAttachment = async (attachmentId: string) => {
    try {
      await projectReportsAPI.deleteAttachment(attachmentId);
      setExistingAttachments(existingAttachments.filter((a) => a.id !== attachmentId));
      showSuccess('Xóa file đính kèm thành công');
    } catch (error: any) {
      showError(error.response?.data?.error || 'Không thể xóa file đính kèm');
    }
  };

  const handleSubmit = async () => {
    if (!projectId || !content.trim()) {
      showError('Vui lòng chọn dự án và nhập nội dung báo cáo');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('projectId', projectId);
      formData.append('reportDate', reportDate);
      formData.append('content', content.trim());
      if (comment.trim()) {
        formData.append('comment', comment.trim());
      }
      
      attachments.forEach((file) => {
        formData.append('attachments', file);
      });

      if (report?.id) {
        await updateReport(report.id, formData);
        showSuccess('Cập nhật báo cáo thành công');
      } else {
        await createReport(formData);
        showSuccess('Tạo báo cáo thành công');
      }
      onClose();
    } catch (error: any) {
      console.error('Error saving project report:', error);
      showError(error.response?.data?.error || 'Không thể lưu báo cáo');
    } finally {
      setLoading(false);
    }
  };

  const isViewMode = mode === 'view';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            {isViewMode ? 'Chi tiết báo cáo dự án' : report?.id ? 'Chỉnh sửa báo cáo dự án' : 'Tạo báo cáo dự án'}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        {loadingProjects ? (
          <LinearProgress />
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              select
              label="Dự án *"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              fullWidth
              required
              variant="outlined"
              disabled={isViewMode}
              SelectProps={{
                native: true,
              }}
            >
              <option value="">Chọn dự án</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name} ({project.code || project.id})
                </option>
              ))}
            </TextField>

            <TextField
              label="Ngày báo cáo *"
              type="date"
              value={reportDate}
              onChange={(e) => setReportDate(e.target.value)}
              fullWidth
              required
              variant="outlined"
              disabled={isViewMode}
              InputLabelProps={{
                shrink: true,
              }}
            />

            <TextField
              label="Nội dung báo cáo *"
              multiline
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              fullWidth
              required
              variant="outlined"
              disabled={isViewMode}
            />

            <TextField
              label="Comment"
              multiline
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              fullWidth
              variant="outlined"
              disabled={isViewMode}
            />

            {!isViewMode && (
              <Box>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  File đính kèm (tối đa 10MB mỗi file)
                </Typography>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<AttachFileIcon />}
                  size="small"
                >
                  Chọn file
                  <input
                    type="file"
                    hidden
                    multiple
                    onChange={handleFileChange}
                  />
                </Button>
                {attachments.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    {attachments.map((file, index) => (
                      <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography variant="body2">{file.name}</Typography>
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveAttachment(index)}
                          color="error"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            )}

            {existingAttachments.length > 0 && (
              <Box>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 'bold' }}>
                  File đã đính kèm:
                </Typography>
                <Grid container spacing={1}>
                  {existingAttachments.map((attachment) => (
                    <Grid item xs={12} key={attachment.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                        <AttachFileIcon fontSize="small" />
                        <Link
                          href={`http://localhost:2222${attachment.file_url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{ flex: 1 }}
                        >
                          {attachment.file_name}
                        </Link>
                        {!isViewMode && (
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteExistingAttachment(attachment.id)}
                            color="error"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          {isViewMode ? 'Đóng' : 'Hủy'}
        </Button>
        {!isViewMode && (
          <Button onClick={handleSubmit} variant="contained" disabled={loading || !projectId || !content.trim()}>
            {loading ? 'Đang lưu...' : report?.id ? 'Cập nhật' : 'Tạo'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

