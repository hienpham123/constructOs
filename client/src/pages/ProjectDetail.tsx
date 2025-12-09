import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  LinearProgress,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { Button } from '../components/common';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useProjectStore } from '../stores/projectStore';
import { projectsAPI } from '../services/api';
import { normalizeProject } from '../utils/normalize';
import { formatDate } from '../utils/dateFormat';
import { usePermissions } from '../hooks/usePermissions';
import { Alert } from '@mui/material';
import CommentSection from '../components/CommentSection';
import ProjectTasks from '../components/ProjectTasks';

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projects, fetchProjects, selectedProject, setSelectedProject } = useProjectStore();
  const [tabValue, setTabValue] = useState(0);
  const [isLoadingProject, setIsLoadingProject] = useState(false);
  const { canViewDocumentType, isLoading: permissionsLoading } = usePermissions();

  useEffect(() => {
    if (projects.length === 0) {
      fetchProjects();
    }
  }, [projects.length, fetchProjects]);

  // Fetch project by ID to ensure we have full data including managers
  useEffect(() => {
    const loadProject = async () => {
      if (id) {
        setIsLoadingProject(true);
        try {
          // Always fetch fresh project data to ensure managers are loaded
          const data = await projectsAPI.getById(id);
          const normalized = normalizeProject(data);
          setSelectedProject(normalized);
        } catch (error: any) {
          console.error('Error fetching project:', error);
          // Fallback to store if API fails
          const project = projects.find((p) => p.id === id);
          if (project) {
            setSelectedProject(project);
          }
        } finally {
          setIsLoadingProject(false);
        }
      }
    };

    loadProject();
  }, [id, setSelectedProject]);

  if (!selectedProject || isLoadingProject) {
    return <LinearProgress />;
  }

  return (
    <Box>
      <Button
        startIcon={<FontAwesomeIcon icon={faArrowLeft} />}
        onClick={() => navigate('/projects')}
        sx={{ mb: 2 }}
      >
        Quay lại
      </Button>

      <Typography variant="h4" gutterBottom>
        {selectedProject.name}
      </Typography>

      <Paper sx={{ p: 2, mt: 2 }}>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
          <Tab label="Thông tin dự án" />
          <Tab label="Hợp đồng" />
          <Tab label="Hồ sơ dự án" />
          <Tab label="Công việc" />
        </Tabs>

        {tabValue === 0 && (
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Paper sx={{ p: 2 }}>
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
              </Grid>

              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Tiến độ
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <LinearProgress
                      variant="determinate"
                      value={selectedProject.progress}
                      color="primary"
                      sx={{ 
                        mb: 1,
                        height: 16,
                        borderRadius: '8px',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: '8px',
                        },
                      }}
                    />
                    <Typography variant="h4" align="center">
                      {selectedProject.progress}%
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}

            {tabValue === 1 && (
              <Box sx={{ mt: 2 }}>
                {permissionsLoading ? (
                  <LinearProgress />
                ) : (
                  <>
                    {selectedProject.documents
                      .filter((doc) => doc.type === 'contract' && canViewDocumentType(doc.type, doc.name))
                      .length > 0 && (
                      <List sx={{ mb: 2 }}>
                        {selectedProject.documents
                          .filter((doc) => doc.type === 'contract' && canViewDocumentType(doc.type, doc.name))
                          .map((doc) => (
                            <ListItem key={doc.id}>
                            <ListItemText
                                primary={doc.name}
                                secondary={`Hợp đồng - ${formatDate(doc.uploadedAt)}`}
                            />
                          </ListItem>
                        ))}
                      </List>
                    )}
                    {selectedProject.documents.filter((doc) => doc.type === 'contract' && !canViewDocumentType(doc.type, doc.name)).length > 0 && (
                      <Alert severity="warning" sx={{ mb: 2 }}>
                        Có {selectedProject.documents.filter((doc) => doc.type === 'contract' && !canViewDocumentType(doc.type, doc.name)).length} hợp đồng bạn không có quyền xem.
                      </Alert>
                    )}
                    <CommentSection projectId={selectedProject.id} category="contract" />
                  </>
                )}
              </Box>
            )}

        {tabValue === 2 && (
          <Box sx={{ mt: 2 }}>
            {permissionsLoading ? (
              <LinearProgress />
            ) : (
              <>
                {selectedProject.documents
                  .filter((doc) => doc.type !== 'contract' && canViewDocumentType(doc.type, doc.name))
                  .length > 0 && (
                  <List sx={{ mb: 2 }}>
                    {selectedProject.documents
                      .filter((doc) => doc.type !== 'contract' && canViewDocumentType(doc.type, doc.name))
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
                {selectedProject.documents.filter((doc) => doc.type !== 'contract' && !canViewDocumentType(doc.type, doc.name)).length > 0 && (
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    Có {selectedProject.documents.filter((doc) => doc.type !== 'contract' && !canViewDocumentType(doc.type, doc.name)).length} hồ sơ dự án bạn không có quyền xem.
                  </Alert>
                )}
                <CommentSection projectId={selectedProject.id} category="project_files" />
              </>
            )}
          </Box>
        )}

        {tabValue === 3 && (
          <Box sx={{ mt: 2 }}>
            <ProjectTasks projectId={selectedProject.id} />
          </Box>
        )}
      </Paper>
    </Box>
  );
}

