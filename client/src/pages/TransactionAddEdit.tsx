import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box,
  TextField,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Autocomplete,
  Paper,
  Typography,
  Breadcrumbs,
  Link,
  IconButton,
  styled,
  CircularProgress,
} from '@mui/material';
import { Button } from '../components/common';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import ImageIcon from '@mui/icons-material/Image';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DescriptionIcon from '@mui/icons-material/Description';
import TableChartIcon from '@mui/icons-material/TableChart';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import HomeIcon from '@mui/icons-material/Home';
import SaveIcon from '@mui/icons-material/Save';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { MaterialTransaction } from '../types';
import { useMaterialStore } from '../stores/materialStore';
import { useProjectStore } from '../stores/projectStore';
import { useAuthStore } from '../stores/authStore';
import { materialsAPI } from '../services/api';
import { normalizeMaterialTransaction } from '../utils/normalize';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const transactionSchema = z.object({
  materialId: z.string().min(1, 'Vật tư là bắt buộc'),
  type: z.enum(['import', 'export']),
  quantity: z.number().min(0.01, 'Số lượng phải > 0'),
  projectId: z.string().optional(),
  reason: z.string().min(1, 'Lý do là bắt buộc'),
  attachments: z.array(z.string()).optional(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

export default function TransactionAddEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { transactions, materials, fetchMaterials, updateTransaction } = useMaterialStore();
  const { projects, fetchProjects } = useProjectStore();
  const { user } = useAuthStore();
  const isSubmittingRef = useRef(false);
  const isEditMode = Boolean(id);
  const fileInfoMapRef = useRef<Map<string, { name: string; type: string }>>(new Map());
  const pendingFilesRef = useRef<File[]>([]);
  const deletedFilesRef = useRef<string[]>([]); // Store URLs for deletion
  const attachmentIdMapRef = useRef<Map<string, string>>(new Map()); // Map URL to attachment ID
  const [transaction, setTransaction] = useState<MaterialTransaction | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const transactionId = isEditMode && id ? id : null;

  useEffect(() => {
    if (materials.length === 0) {
      fetchMaterials(1000, 0);
    }
    if (projects.length === 0) {
      fetchProjects();
    }
  }, [materials.length, projects.length, fetchMaterials, fetchProjects]);

  // Fetch transaction by ID when in edit mode
  useEffect(() => {
    const loadTransaction = async () => {
      if (isEditMode && transactionId) {
        setIsLoading(true);
        try {
          // First check if it's already in store
          const foundInStore = transactions.find((t) => String(t.id) === String(transactionId));
          if (foundInStore) {
            setTransaction(foundInStore);
          // Load attachments from new API
          try {
            const attachments = await materialsAPI.getTransactionAttachments(transactionId);
            if (attachments && attachments.length > 0) {
              const attachmentUrls = attachments.map((att: any) => att.fileUrl);
              // Map URLs to attachment IDs for deletion and store file info
              attachments.forEach((att: any) => {
                attachmentIdMapRef.current.set(att.fileUrl, att.id);
                // Store original filename and file type in fileInfoMap
                fileInfoMapRef.current.set(att.fileUrl, {
                  name: att.originalFilename || att.filename,
                  type: att.fileType || 'application/octet-stream',
                });
              });
              // Update transaction with attachments
              setTransaction((prev) => prev ? { ...prev, attachments: attachmentUrls } : null);
            }
          } catch (attError) {
            console.error('Error loading attachments:', attError);
          }
            setIsLoading(false);
            return;
          }
          
          // If not in store, fetch by ID
          const data = await materialsAPI.getTransactionById(transactionId);
          const normalized = normalizeMaterialTransaction(data);
          setTransaction(normalized);
          
          // Load attachments from new API
          try {
            const attachments = await materialsAPI.getTransactionAttachments(transactionId);
            if (attachments && attachments.length > 0) {
              const attachmentUrls = attachments.map((att: any) => att.fileUrl);
              // Map URLs to attachment IDs for deletion and store file info
              attachments.forEach((att: any) => {
                attachmentIdMapRef.current.set(att.fileUrl, att.id);
                // Store original filename and file type in fileInfoMap
                fileInfoMapRef.current.set(att.fileUrl, {
                  name: att.originalFilename || att.filename,
                  type: att.fileType || 'application/octet-stream',
                });
              });
              setTransaction((prev) => prev ? { ...prev, attachments: attachmentUrls } : null);
            }
          } catch (attError) {
            console.error('Error loading attachments:', attError);
          }
        } catch (error: any) {
          console.error('Error fetching transaction:', error);
          setIsLoading(false);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadTransaction();
  }, [isEditMode, transactionId, transactions]);

  // Helper functions
  const isImageUrl = (url: string): boolean => {
    if (!url) return false;
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
    const lowerUrl = url.toLowerCase();
    if (imageExtensions.some(ext => lowerUrl.includes(ext))) return true;
    if (lowerUrl.startsWith('data:image/')) return true;
    const fileInfo = fileInfoMapRef.current.get(url);
    if (lowerUrl.startsWith('blob:') && fileInfo?.type?.startsWith('image/')) return true;
    return false;
  };

  const getFileIcon = (url: string) => {
    if (!url) return <DescriptionIcon />;
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes('.pdf')) return <PictureAsPdfIcon />;
    if (lowerUrl.includes('.xls') || lowerUrl.includes('.xlsx') || lowerUrl.includes('.csv')) return <TableChartIcon />;
    if (lowerUrl.includes('.doc') || lowerUrl.includes('.docx')) return <DescriptionIcon />;
    if (isImageUrl(url)) return <ImageIcon />;
    return <DescriptionIcon />;
  };

  const getFileName = (url: string): string => {
    if (!url) return '';
    const fileInfo = fileInfoMapRef.current.get(url);
    if (fileInfo?.name) return fileInfo.name;
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const fileName = pathname.split('/').pop() || '';
      return fileName || 'File đính kèm';
    } catch {
      const parts = url.split('/');
      const lastPart = parts[parts.length - 1];
      return lastPart || 'File đính kèm';
    }
  };

  const getFileType = (url: string): string => {
    const fileInfo = fileInfoMapRef.current.get(url);
    return fileInfo?.type || 'File đính kèm';
  };

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      materialId: '',
      type: 'import',
      quantity: 0,
      projectId: '',
      reason: '',
      attachments: [],
    },
  });

  const selectedMaterialId = watch('materialId');
  const selectedMaterial = materials.find((m) => m.id === selectedMaterialId);

  useEffect(() => {
    if (transaction) {
      // Don't clear fileInfoMap here - it's already populated when loading attachments from API
      // Only populate if not already set (for backward compatibility with old data)
      if (transaction.attachments && Array.isArray(transaction.attachments)) {
        transaction.attachments.forEach((url: string) => {
          // Only set if not already in map (from API response)
          if (!fileInfoMapRef.current.has(url)) {
            const urlParts = url.split('/');
            const filename = urlParts[urlParts.length - 1];
            const lowerUrl = url.toLowerCase();
            let fileType = 'application/octet-stream';
            if (lowerUrl.includes('.jpg') || lowerUrl.includes('.jpeg') || lowerUrl.includes('.png') || lowerUrl.includes('.gif') || lowerUrl.includes('.webp')) {
              fileType = 'image/jpeg';
            } else if (lowerUrl.includes('.pdf')) {
              fileType = 'application/pdf';
            } else if (lowerUrl.includes('.xls') || lowerUrl.includes('.xlsx')) {
              fileType = 'application/vnd.ms-excel';
            } else if (lowerUrl.includes('.doc') || lowerUrl.includes('.docx')) {
              fileType = 'application/msword';
            } else if (lowerUrl.includes('.csv')) {
              fileType = 'text/csv';
            }
            fileInfoMapRef.current.set(url, { name: filename, type: fileType });
          }
        });
      }

      const checkAndReset = () => {
        const materialExists = !transaction.materialId || materials.some(m => m.id === transaction.materialId);
        const projectExists = !transaction.projectId || projects.some(p => p.id === transaction.projectId);
        
        if (materialExists && projectExists) {
          reset({
            materialId: transaction.materialId || '',
            type: transaction.type || 'import',
            quantity: transaction.quantity || 0,
            projectId: transaction.projectId || '',
            reason: transaction.reason || '',
            attachments: transaction.attachments || [],
          });
        } else {
          setTimeout(checkAndReset, 100);
        }
      };
      
      setTimeout(checkAndReset, 100);
    } else if (!isEditMode) {
      reset({
        materialId: '',
        type: 'import',
        quantity: 0,
        projectId: '',
        reason: '',
        attachments: [],
      });
      fileInfoMapRef.current.clear();
      pendingFilesRef.current = [];
      deletedFilesRef.current = [];
    }
  }, [transaction, isEditMode, reset, materials, projects]);

  const onSubmit = async (data: TransactionFormData) => {
    if (isSubmittingRef.current || isSubmitting) {
      return;
    }

    isSubmittingRef.current = true;

    const blobUrls: string[] = [];

    try {
      if (data.attachments && data.attachments.length > 0) {
        data.attachments.forEach((url: string) => {
          if (url.startsWith('blob:')) {
            blobUrls.push(url);
          }
        });
      }
      
      const selectedMaterialObj = materials.find((m) => m.id === data.materialId);
      const selectedProject = data.projectId ? projects.find((p) => p.id === data.projectId) : null;

      // Don't include attachments in transaction data - they'll be handled separately
      const transactionData = {
        materialId: data.materialId,
        materialName: selectedMaterialObj?.name || '',
        type: data.type,
        quantity: data.quantity,
        unit: selectedMaterialObj?.unit || '',
        projectId: data.projectId || undefined,
        projectName: selectedProject?.name || undefined,
        reason: data.reason,
        performedBy: user?.name || user?.email || '',
      };

      let newTransactionId: string | null = null;
      try {
        if (transaction?.id) {
          await updateTransaction(transaction.id, transactionData);
          newTransactionId = transaction.id;
        } else {
          const { normalizeMaterialTransaction, normalizeMaterial } = await import('../utils/normalize');
          const newTransaction = await materialsAPI.createTransaction(transactionData);
          newTransactionId = newTransaction.id;
          const normalized = normalizeMaterialTransaction(newTransaction);
          const store = useMaterialStore.getState();
          store.transactions = [normalized, ...store.transactions];
          const materialsData = await materialsAPI.getAll();
          const materialsList = Array.isArray(materialsData) 
            ? materialsData.map((m: any) => normalizeMaterial(m))
            : (materialsData.data || []).map((m: any) => normalizeMaterial(m));
          store.materials = materialsList;
        }
      } catch (transactionError: any) {
        console.error('Transaction failed:', transactionError);
        throw transactionError;
      }

      // Handle new file uploads using new API
      if (pendingFilesRef.current.length > 0 && newTransactionId) {
        try {
          await materialsAPI.createTransactionAttachments(newTransactionId, pendingFilesRef.current);
        } catch (uploadError: any) {
          console.error('Error uploading files:', uploadError);
          alert('Giao dịch đã được lưu nhưng không thể tải lên file. Vui lòng thử lại.');
          isSubmittingRef.current = false;
          return;
        }
      }

      // Handle deleted files using new API
      if (deletedFilesRef.current.length > 0 && newTransactionId) {
        for (const deletedUrl of deletedFilesRef.current) {
          // Find attachment ID from map
          const attachmentId = attachmentIdMapRef.current.get(deletedUrl);
          if (attachmentId) {
            try {
              await materialsAPI.deleteTransactionAttachment(attachmentId);
            } catch (deleteError: any) {
              console.error('Error deleting attachment:', deleteError);
            }
          }
        }
      }
      
      blobUrls.forEach((url) => {
        URL.revokeObjectURL(url);
      });
      
      pendingFilesRef.current = [];
      deletedFilesRef.current = [];
      navigate('/materials/transactions');
    } catch (error: any) {
      console.error('Error saving transaction:', error);
      blobUrls.forEach((url) => {
        URL.revokeObjectURL(url);
      });
      alert(error.response?.data?.error || error.message || 'Không thể lưu giao dịch. Vui lòng thử lại.');
    } finally {
      isSubmittingRef.current = false;
    }
  };

  const handleExit = () => {
    navigate('/materials/transactions');
  };

  if (isEditMode && isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link
            component="button"
            variant="body1"
            onClick={() => navigate('/')}
            sx={{ textDecoration: 'none', color: 'text.primary', cursor: 'pointer' }}
          >
            <HomeIcon sx={{ mr: 0.5, verticalAlign: 'middle', fontSize: 20 }} />
            Trang chủ
          </Link>
          <Link
            component="button"
            variant="body1"
            onClick={() => navigate('/materials/transactions')}
            sx={{ textDecoration: 'none', color: 'text.primary', cursor: 'pointer' }}
          >
            Nhập xuất kho
          </Link>
          <Typography color="text.primary">
            {isEditMode ? 'Chỉnh sửa giao dịch' : 'Thêm giao dịch nhập/xuất kho'}
          </Typography>
        </Breadcrumbs>
        
        <Box 
          display="flex" 
          justifyContent="space-between" 
          alignItems="center"
          sx={{
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 2, sm: 0 },
            alignItems: { xs: 'stretch', sm: 'center' },
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            {isEditMode ? 'Chỉnh sửa giao dịch' : 'Thêm giao dịch nhập/xuất kho'}
          </Typography>
          <Box 
            display="flex" 
            gap={1}
            sx={{
              width: { xs: '100%', sm: 'auto' },
              flexDirection: { xs: 'column', sm: 'row' },
            }}
          >
            <Button
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting}
              sx={{
                width: { xs: '100%', sm: 'auto' },
              }}
            >
              {isSubmitting ? 'Đang lưu...' : 'Lưu dữ liệu'}
            </Button>
            <Button
              variant="outlined"
              startIcon={<ExitToAppIcon />}
              onClick={handleExit}
              sx={{
                width: { xs: '100%', sm: 'auto' },
              }}
            >
              Thoát
            </Button>
          </Box>
        </Box>
      </Box>

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Controller
                name="materialId"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    options={materials}
                    getOptionLabel={(option) => option ? `${option.name} (${option.type})` : ''}
                    value={field.value ? materials.find((m) => m.id === field.value) || null : null}
                    onChange={(_, newValue) => field.onChange(newValue?.id || '')}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Vật tư *"
                        placeholder="Tìm kiếm vật tư..."
                        error={!!errors.materialId}
                        helperText={errors.materialId?.message}
                      />
                    )}
                    filterOptions={(options, { inputValue }) => {
                      const searchValue = inputValue.toLowerCase();
                      return options.filter(
                        (option) =>
                          (option.name?.toLowerCase().includes(searchValue) || false) ||
                          (option.type?.toLowerCase().includes(searchValue) || false)
                      );
                    }}
                    isOptionEqualToValue={(option, value) => option?.id === value?.id}
                    key={field.value || 'material-autocomplete'}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth required error={!!errors.type}>
                    <InputLabel>Loại giao dịch *</InputLabel>
                    <Select {...field} label="Loại giao dịch *">
                      <MenuItem value="import">Nhập kho</MenuItem>
                      <MenuItem value="export">Xuất kho</MenuItem>
                    </Select>
                    {errors.type && <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>{errors.type.message}</Typography>}
                  </FormControl>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="quantity"
                control={control}
                render={({ field }) => (
                  <TextField
                    fullWidth
                    label="Số lượng *"
                    type="number"
                    inputProps={{ step: '0.01', min: '0.01' }}
                    error={!!errors.quantity}
                    helperText={errors.quantity?.message || (selectedMaterial ? `Đơn vị: ${selectedMaterial.unit}` : '')}
                    value={field.value || ''}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) || 0;
                      field.onChange(value);
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="projectId"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    options={projects}
                    getOptionLabel={(option) => option ? `${option.name} (${option.investor})` : ''}
                    value={field.value ? projects.find((p) => p.id === field.value) || null : null}
                    onChange={(_, newValue) => field.onChange(newValue?.id || '')}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Dự án"
                        placeholder="Tìm kiếm dự án..."
                        error={!!errors.projectId}
                        helperText={errors.projectId?.message}
                      />
                    )}
                    filterOptions={(options, { inputValue }) => {
                      const searchValue = inputValue.toLowerCase();
                      return options.filter(
                        (option) =>
                          (option.name?.toLowerCase().includes(searchValue) || false) ||
                          (option.investor?.toLowerCase().includes(searchValue) || false)
                      );
                    }}
                    isOptionEqualToValue={(option, value) => option?.id === value?.id}
                    key={field.value || 'project-autocomplete'}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="reason"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Lý do *"
                    multiline
                    rows={3}
                    error={!!errors.reason}
                    helperText={errors.reason?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="attachments"
                control={control}
                render={({ field }) => (
                  <Box>
                    <Box display="flex" alignItems="center" gap={2} mb={field.value && field.value.length > 0 ? 2 : 0}>
                      <Button
                        component="label"
                        role={undefined}
                        variant="outlined"
                        tabIndex={-1}
                        startIcon={<CloudUploadIcon />}
                      >
                        Tải file lên
                        <VisuallyHiddenInput
                          type="file"
                          multiple
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            if (files.length > 0) {
                              pendingFilesRef.current.push(...files);
                              const blobUrls: string[] = [];
                              files.forEach((file) => {
                                const blobUrl = URL.createObjectURL(file);
                                fileInfoMapRef.current.set(blobUrl, {
                                  name: file.name,
                                  type: file.type,
                                });
                                blobUrls.push(blobUrl);
                              });
                              field.onChange([...(field.value || []), ...blobUrls]);
                            }
                            e.target.value = '';
                          }}
                          accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.csv"
                        />
                      </Button>
                      {!field.value || field.value.length === 0 ? (
                        <Typography variant="body2" color="textSecondary">
                          Chọn file để đính kèm (ảnh, PDF, Excel, Word, CSV) - có thể chọn nhiều file
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="textSecondary">
                          Đã chọn {field.value.length} file
                        </Typography>
                      )}
                    </Box>
                    {field.value && field.value.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Grid container spacing={2}>
                          {field.value.map((url, index) => (
                            <Grid item xs={12} sm={6} md={4} key={index}>
                              {isImageUrl(url) ? (
                                <Paper sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 0, position: 'relative' }}>
                                  <IconButton
                                    size="small"
                                    onClick={() => {
                                      const newAttachments = field.value?.filter((_, i) => i !== index) || [];
                                      field.onChange(newAttachments);
                                      fileInfoMapRef.current.delete(url);
                                      
                                      if (url.startsWith('blob:')) {
                                        URL.revokeObjectURL(url);
                                        const fileIndex = pendingFilesRef.current.findIndex((file) => {
                                          const blobUrl = URL.createObjectURL(file);
                                          const matches = blobUrl === url;
                                          URL.revokeObjectURL(blobUrl);
                                          return matches;
                                        });
                                        if (fileIndex !== -1) {
                                          pendingFilesRef.current.splice(fileIndex, 1);
                                        }
                                      } else {
                                        deletedFilesRef.current.push(url);
                                      }
                                    }}
                                    color="error"
                                    sx={{
                                      position: 'absolute',
                                      top: 8,
                                      right: 8,
                                      bgcolor: 'rgba(255, 255, 255, 0.9)',
                                      '&:hover': {
                                        bgcolor: 'rgba(255, 255, 255, 1)',
                                      },
                                    }}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                  <Box
                                    component="img"
                                    src={url}
                                    alt={`Attachment ${index + 1}`}
                                    sx={{
                                      width: '100%',
                                      maxHeight: '200px',
                                      borderRadius: 0,
                                      objectFit: 'contain',
                                      mb: 1,
                                    }}
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.style.display = 'none';
                                    }}
                                  />
                                  <Typography 
                                    variant="caption" 
                                    color="textSecondary" 
                                    noWrap
                                    title={getFileName(url)}
                                    sx={{ 
                                      display: 'block',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap',
                                      width: '100%'
                                    }}
                                  >
                                    {getFileName(url)}
                                  </Typography>
                                </Paper>
                              ) : (
                                <Paper sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 0, position: 'relative' }}>
                                  <IconButton
                                    size="small"
                                    onClick={() => {
                                      const newAttachments = field.value?.filter((_, i) => i !== index) || [];
                                      field.onChange(newAttachments);
                                      fileInfoMapRef.current.delete(url);
                                      
                                      if (url.startsWith('blob:')) {
                                        URL.revokeObjectURL(url);
                                        const fileIndex = pendingFilesRef.current.findIndex((file) => {
                                          const blobUrl = URL.createObjectURL(file);
                                          const matches = blobUrl === url;
                                          URL.revokeObjectURL(blobUrl);
                                          return matches;
                                        });
                                        if (fileIndex !== -1) {
                                          pendingFilesRef.current.splice(fileIndex, 1);
                                        }
                                      } else {
                                        deletedFilesRef.current.push(url);
                                      }
                                    }}
                                    color="error"
                                    sx={{
                                      position: 'absolute',
                                      top: 8,
                                      right: 8,
                                      bgcolor: 'rgba(255, 255, 255, 0.9)',
                                      '&:hover': {
                                        bgcolor: 'rgba(255, 255, 255, 1)',
                                      },
                                    }}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                                    {getFileIcon(url)}
                                    <Box flex={1} sx={{ minWidth: 0, overflow: 'hidden' }}>
                                      <Typography 
                                        variant="body2" 
                                        fontWeight="medium" 
                                        noWrap
                                        title={getFileName(url)}
                                        sx={{ 
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis',
                                          whiteSpace: 'nowrap',
                                          width: '100%'
                                        }}
                                      >
                                        {getFileName(url)}
                                      </Typography>
                                      <Typography 
                                        variant="caption" 
                                        color="textSecondary" 
                                        noWrap
                                        title={getFileType(url)}
                                        sx={{ 
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis',
                                          whiteSpace: 'nowrap',
                                          width: '100%'
                                        }}
                                      >
                                        {getFileType(url)}
                                      </Typography>
                                    </Box>
                                  </Box>
                                  <Link
                                    href={url}
                                    download={getFileName(url)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={async (e) => {
                                      // Ensure download with correct filename
                                      const fileName = getFileName(url);
                                      if (fileName && !url.startsWith('blob:')) {
                                        try {
                                          const response = await fetch(url);
                                          const blob = await response.blob();
                                          const downloadUrl = window.URL.createObjectURL(blob);
                                          const link = document.createElement('a');
                                          link.href = downloadUrl;
                                          link.download = fileName;
                                          document.body.appendChild(link);
                                          link.click();
                                          document.body.removeChild(link);
                                          window.URL.revokeObjectURL(downloadUrl);
                                          e.preventDefault();
                                        } catch (error) {
                                          console.error('Error downloading file:', error);
                                          // Fallback to normal download
                                        }
                                      }
                                    }}
                                    sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.75rem' }}
                                  >
                                    <DownloadIcon fontSize="small" />
                                    <Typography variant="caption">Tải về</Typography>
                                  </Link>
                                </Paper>
                              )}
                            </Grid>
                          ))}
                        </Grid>
                      </Box>
                    )}
                  </Box>
                )}
              />
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
}


