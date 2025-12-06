import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  LinearProgress,
  Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useProjectStore } from '../stores/projectStore';
import { formatDate } from '../utils/dateFormat';
import SiteLogForm from '../components/forms/SiteLogForm';
import DeleteConfirmDialog from '../components/DeleteConfirmDialog';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

export default function SiteLogs() {
  const { siteLogs, siteLogsTotal, isLoading, fetchSiteLogs, fetchProjects } = useProjectStore();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedSiteLog, setSelectedSiteLog] = useState<any>(null);

  useEffect(() => {
    fetchSiteLogs(undefined, rowsPerPage, page);
    fetchProjects();
  }, [fetchSiteLogs, fetchProjects, rowsPerPage, page]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  if (isLoading) {
    return <LinearProgress />;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">Nhật ký công trường</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => {
          setSelectedSiteLog(null);
          setFormOpen(true);
        }}>
          Thêm nhật ký
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Ngày</TableCell>
              <TableCell>Dự án</TableCell>
              <TableCell>Thời tiết</TableCell>
              <TableCell>Mô tả công việc</TableCell>
              <TableCell>Vấn đề</TableCell>
              <TableCell>Người ghi</TableCell>
              <TableCell>Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {siteLogs.map((log) => (
                <TableRow key={log.id} hover>
                  <TableCell>
                    {formatDate(log.date)}
                  </TableCell>
                  <TableCell>{log.projectName}</TableCell>
                  <TableCell>
                    <Chip label={log.weather} size="small" />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ maxWidth: 400 }}>
                      <Typography variant="body2" noWrap>
                        {log.workDescription}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ maxWidth: 300 }}>
                      <Typography variant="body2" noWrap color={log.issues ? 'text.primary' : 'text.secondary'}>
                        {log.issues || 'Không có'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{log.createdBy || '-'}</TableCell>
                  <TableCell>
                    <Tooltip title="Chỉnh sửa">
                      <IconButton 
                        size="small"
                        onClick={() => {
                          setSelectedSiteLog(log);
                          setFormOpen(true);
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={siteLogsTotal}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Số dòng mỗi trang:"
        />
      </TableContainer>

      <SiteLogForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setSelectedSiteLog(null);
          fetchSiteLogs(undefined, rowsPerPage, page);
        }}
        siteLog={selectedSiteLog}
      />
    </Box>
  );
}

