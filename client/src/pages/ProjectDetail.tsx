import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  LinearProgress,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  Checkbox,
} from '@mui/material';
import { Button } from '../components/common';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useProjectStore } from '../stores/projectStore';
import { formatDate, formatDateTime } from '../utils/dateFormat';
import { usePermissions } from '../hooks/usePermissions';
import { Alert } from '@mui/material';

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projects, fetchProjects, selectedProject, setSelectedProject } = useProjectStore();
  const [tabValue, setTabValue] = useState(0);
  const { canViewDocumentType, isLoading: permissionsLoading } = usePermissions();

  useEffect(() => {
    if (projects.length === 0) {
      fetchProjects();
    }
  }, [projects.length, fetchProjects]);

  useEffect(() => {
    if (id && projects.length > 0) {
      const project = projects.find((p) => p.id === id);
      if (project) {
        setSelectedProject(project);
      }
    }
  }, [id, projects, setSelectedProject]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  if (!selectedProject) {
    return <LinearProgress />;
  }

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/projects')}
        sx={{ mb: 2 }}
      >
        Quay lại
      </Button>

      <Typography variant="h4" gutterBottom>
        {selectedProject.name}
      </Typography>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Thông tin dự án
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Chủ đầu tư
                </Typography>
                <Typography variant="body1">{selectedProject.investor || (selectedProject as any).client}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Đầu mối
                </Typography>
                <Typography variant="body1">{selectedProject.contactPerson || (selectedProject as any).contact_person || '-'}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Địa điểm
                </Typography>
                <Typography variant="body1">{selectedProject.location}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Quản lý dự án
                </Typography>
                <Typography variant="body1">{selectedProject.managerName}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Ngày bắt đầu
                </Typography>
                <Typography variant="body1">
                  {formatDate(selectedProject.startDate)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Ngày kết thúc
                </Typography>
                <Typography variant="body1">
                  {formatDate(selectedProject.endDate)}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  Mô tả
                </Typography>
                <Typography variant="body1">{selectedProject.description}</Typography>
              </Grid>
            </Grid>
          </Paper>

          <Paper sx={{ p: 2 }}>
            <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
              <Tab label="Giai đoạn" />
              <Tab label="Tài liệu" />
            </Tabs>

            {tabValue === 0 && (
              <Box sx={{ mt: 2 }}>
                {selectedProject.stages.map((stage) => (
                  <Paper key={stage.id} sx={{ p: 2, mb: 2 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="h6">{stage.name}</Typography>
                      <Chip
                        label={`${stage.progress}%`}
                        color={stage.progress === 100 ? 'success' : 'primary'}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {stage.description}
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Checklist:
                      </Typography>
                      <List>
                        {stage.checklist.map((item) => (
                          <ListItem key={item.id}>
                            <Checkbox checked={item.completed} disabled />
                            <ListItemText
                              primary={item.task}
                              secondary={
                                item.completed && item.completedAt
                                  ? `Hoàn thành: ${formatDate(item.completedAt)}`
                                  : ''
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  </Paper>
                ))}
              </Box>
            )}

            {tabValue === 1 && (
              <Box sx={{ mt: 2 }}>
                {permissionsLoading ? (
                  <LinearProgress />
                ) : (
                  <>
                    {selectedProject.documents.filter((doc) => canViewDocumentType(doc.type, doc.name)).length === 0 ? (
                      <Alert severity="info">
                        Không có tài liệu nào bạn có quyền xem hoặc chưa có tài liệu nào.
                      </Alert>
                    ) : (
                      <List>
                        {selectedProject.documents
                          .filter((doc) => canViewDocumentType(doc.type, doc.name))
                          .map((doc) => (
                            <ListItem key={doc.id}>
                              <ListItemText
                                primary={doc.name}
                                secondary={`${doc.type} - ${formatDate(doc.uploadedAt)}`}
                              />
                            </ListItem>
                          ))}
                      </List>
                    )}
                    {selectedProject.documents.filter((doc) => !canViewDocumentType(doc.type, doc.name)).length > 0 && (
                      <Alert severity="warning" sx={{ mt: 2 }}>
                        Có {selectedProject.documents.filter((doc) => !canViewDocumentType(doc.type, doc.name)).length} tài liệu bạn không có quyền xem.
                      </Alert>
                    )}
                  </>
                )}
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Tiến độ
            </Typography>
            <Box sx={{ mt: 2 }}>
              <LinearProgress
                variant="determinate"
                value={selectedProject.progress}
                sx={{ height: 20, borderRadius: 0, mb: 1 }}
              />
              <Typography variant="h4" align="center">
                {selectedProject.progress}%
              </Typography>
            </Box>
          </Paper>

          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Tài chính
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Ngân sách
              </Typography>
              <Typography variant="h6">{formatCurrency(selectedProject.budget)}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Chi phí thực tế
              </Typography>
              <Typography variant="h6">{formatCurrency(selectedProject.actualCost)}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Tỷ lệ chi phí
              </Typography>
              <Typography variant="h6">
                {((selectedProject.actualCost / selectedProject.budget) * 100).toFixed(1)}%
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

