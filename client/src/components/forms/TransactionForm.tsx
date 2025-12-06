import { useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Autocomplete,
  Box,
  Typography,
  IconButton,
  Link,
  Paper,
  styled,
} from '@mui/material';
import { Button } from '../common';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import ImageIcon from '@mui/icons-material/Image';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DescriptionIcon from '@mui/icons-material/Description';
import TableChartIcon from '@mui/icons-material/TableChart';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

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
import { MaterialTransaction } from '../../types';
import { useMaterialStore } from '../../stores/materialStore';
import { useProjectStore } from '../../stores/projectStore';
import { useAuthStore } from '../../stores/authStore';
import { materialsAPI } from '../../services/api';

const transactionSchema = z.object({
  materialId: z.string().min(1, 'Vật tư là bắt buộc'),
  type: z.enum(['import', 'export']),
  quantity: z.number().min(0.01, 'Số lượng phải > 0'),
  projectId: z.string().optional(),
  reason: z.string().min(1, 'Lý do là bắt buộc'),
  attachments: z.array(z.string()).optional(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface TransactionFormProps {
  open: boolean;
  onClose: () => void;
  transaction?: MaterialTransaction | null;
}

export default function TransactionForm({ open, onClose, transaction }: TransactionFormProps) {
  const { updateTransaction, materials, fetchMaterials } = useMaterialStore();
  const { projects, fetchProjects } = useProjectStore();
  const { user } = useAuthStore();
  const isSubmittingRef = useRef(false);
  const fileInfoMapRef = useRef<Map<string, { name: string; type: string }>>(new Map());
  const pendingFilesRef = useRef<File[]>([]); // Store files to upload on submit
  const deletedFilesRef = useRef<string[]>([]); // Store file URLs to delete after successful update

  // Helper function to check if URL is an image
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

  // Helper function to get file type icon
  const getFileIcon = (url: string) => {
    if (!url) return <DescriptionIcon />;
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes('.pdf')) return <PictureAsPdfIcon />;
    if (lowerUrl.includes('.xls') || lowerUrl.includes('.xlsx') || lowerUrl.includes('.csv')) return <TableChartIcon />;
    if (lowerUrl.includes('.doc') || lowerUrl.includes('.docx')) return <DescriptionIcon />;
    if (isImageUrl(url)) return <ImageIcon />;
    return <DescriptionIcon />;
  };

  // Helper function to get file name from URL
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
      // If URL parsing fails, try to extract from string
      const parts = url.split('/');
      const lastPart = parts[parts.length - 1];
      return lastPart || 'File đính kèm';
    }
  };

  // Helper function to get file type from URL
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

  useEffect(() => {
    if (!open) {
      isSubmittingRef.current = false;
      return;
    }

    // Ensure materials and projects are loaded when form opens
    if (materials.length === 0) {
      fetchMaterials(1000, 0);
    }
    if (projects.length === 0) {
      fetchProjects();
    }

    if (transaction) {
      // Populate file info for attachments
      fileInfoMapRef.current.clear();
      if (transaction.attachments && Array.isArray(transaction.attachments)) {
        transaction.attachments.forEach((url: string) => {
          // Try to extract filename from URL
          const urlParts = url.split('/');
          const filename = urlParts[urlParts.length - 1];
          // Try to determine file type from URL or filename
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
          fileInfoMapRef.current.set(url, {
            name: filename,
            type: fileType,
          });
        });
      }
      
      // Wait for materials and projects to be available before resetting
      const checkAndReset = () => {
        // Check if materials are loaded and contain the transaction's material
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
          // Retry after a short delay if materials/projects not ready
          setTimeout(checkAndReset, 100);
        }
      };
      
      // Start checking after a short delay
      const timer = setTimeout(checkAndReset, 100);
      
      return () => clearTimeout(timer);
    } else {
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
  }, [transaction?.id, open, reset, materials.length, projects.length, fetchMaterials, fetchProjects]);

  const selectedMaterial = materials.find((m) => m.id === selectedMaterialId);

  const onSubmit = async (data: TransactionFormData) => {
    if (isSubmittingRef.current || isSubmitting) {
      return;
    }

    isSubmittingRef.current = true;

    // Track uploaded files for rollback if transaction fails
    let uploadedUrls: string[] = [];
    const blobUrls: string[] = [];
    const serverUrls: string[] = [];

    try {
      // Separate blob URLs (new files) from server URLs (existing files)
      if (data.attachments && data.attachments.length > 0) {
        data.attachments.forEach((url: string) => {
          if (url.startsWith('blob:')) {
            blobUrls.push(url);
          } else {
            serverUrls.push(url);
          }
        });
      }
      
      const selectedMaterialObj = materials.find((m) => m.id === data.materialId);
      const selectedProject = data.projectId ? projects.find((p) => p.id === data.projectId) : null;

      // Step 1: Create or update transaction FIRST (without new files, only existing server URLs)
      // If files were deleted, we need to update attachments immediately to remove them from database
      const finalAttachments = serverUrls.length > 0 ? serverUrls : (deletedFilesRef.current.length > 0 ? [] : undefined);
      const transactionData = {
        materialId: data.materialId,
        materialName: selectedMaterialObj?.name || '',
        type: data.type,
        quantity: data.quantity,
        unit: selectedMaterialObj?.unit || '',
        projectId: data.projectId || undefined,
        projectName: selectedProject?.name || undefined,
        reason: data.reason,
        // Include existing server URLs (files that remain), or empty array if files were deleted
        attachments: finalAttachments,
        performedBy: user?.name || user?.email || '',
      };

      let newTransactionId: string | null = null;
      try {
        if (transaction?.id) {
          await updateTransaction(transaction.id, transactionData);
        } else {
          const { normalizeMaterialTransaction, normalizeMaterial } = await import('../../utils/normalize');
          const newTransaction = await materialsAPI.createTransaction(transactionData);
          newTransactionId = newTransaction.id;
          // Add to store manually
          const normalized = normalizeMaterialTransaction(newTransaction);
          const store = useMaterialStore.getState();
          store.transactions = [normalized, ...store.transactions];
          // Refresh materials to get updated stock
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

      // Step 2: Only upload files AFTER transaction is successfully created/updated
      if (pendingFilesRef.current.length > 0) {
        try {
          const response = await materialsAPI.uploadTransactionFiles(pendingFilesRef.current);
          uploadedUrls = response.files || [];
        } catch (uploadError: any) {
          console.error('Error uploading files after transaction:', uploadError);
          alert('Giao dịch đã được lưu nhưng không thể tải lên file. Vui lòng thử lại.');
          isSubmittingRef.current = false;
          return;
        }
      }

      // Step 3: Update transaction with all attachments (existing + newly uploaded)
      // Also update if files were deleted (to remove them from database)
      // Use API directly to avoid duplicate success notification
      if (uploadedUrls.length > 0 || deletedFilesRef.current.length > 0) {
        const allAttachments = [...serverUrls, ...uploadedUrls];
        const updateData = {
          attachments: allAttachments.length > 0 ? allAttachments : undefined,
        };

        try {
          const transactionIdToUpdate = transaction?.id || newTransactionId;
          if (transactionIdToUpdate) {
            // Call API directly instead of using store to avoid duplicate notification
            const { normalizeMaterialTransaction } = await import('../../utils/normalize');
            const response = await materialsAPI.updateTransaction(transactionIdToUpdate, updateData);
            const updatedTransaction = normalizeMaterialTransaction(response);
            // Update store manually without showing notification
            const store = useMaterialStore.getState();
            store.transactions = store.transactions.map((t) =>
              t.id === transactionIdToUpdate ? updatedTransaction : t
            );
          }
        } catch (updateError: any) {
          console.error('Error updating transaction with attachments:', updateError);
          // If update fails, delete uploaded files
          if (uploadedUrls.length > 0) {
            for (const fileUrl of uploadedUrls) {
              try {
                const urlParts = fileUrl.split('/');
                const filename = urlParts[urlParts.length - 1];
                await materialsAPI.deleteTransactionFile(filename);
              } catch (deleteError: any) {
                console.error('Error deleting uploaded file:', deleteError);
              }
            }
          }
          throw updateError;
        }
      }
      
      // Only delete files after transaction is successfully created/updated
      if (deletedFilesRef.current.length > 0) {
        for (const fileUrl of deletedFilesRef.current) {
          try {
            // Extract filename from URL for deletion
            const urlParts = fileUrl.split('/');
            const filename = urlParts[urlParts.length - 1];
            await materialsAPI.deleteTransactionFile(filename);
          } catch (error: any) {
            console.error('Error deleting file from server:', error);
            // Continue deleting other files even if one fails
          }
        }
      }
      
      // Clean up blob URLs
      blobUrls.forEach((url) => {
        URL.revokeObjectURL(url);
      });
      
      // Clear pending and deleted files only after successful transaction
      pendingFilesRef.current = [];
      deletedFilesRef.current = [];
      onClose();
    } catch (error: any) {
      console.error('Error saving transaction:', error);
      // Clean up blob URLs even if transaction failed
      blobUrls.forEach((url) => {
        URL.revokeObjectURL(url);
      });
      // Don't clear pendingFilesRef and deletedFilesRef if transaction failed
      // so user can retry without re-selecting files
      alert(error.response?.data?.error || error.message || 'Không thể lưu giao dịch. Vui lòng thử lại.');
    } finally {
      isSubmittingRef.current = false;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>{transaction ? 'Chỉnh sửa giao dịch' : 'Thêm giao dịch nhập/xuất kho'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
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
                        label="Vật tư"
                        placeholder="Tìm kiếm vật tư..."
                        required
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
                    <InputLabel>Loại giao dịch</InputLabel>
                    <Select {...field} label="Loại giao dịch">
                      <MenuItem value="import">Nhập kho</MenuItem>
                      <MenuItem value="export">Xuất kho</MenuItem>
                    </Select>
                    {errors.type && <span style={{ color: 'red', fontSize: '0.75rem', marginTop: '3px' }}>{errors.type.message}</span>}
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
                    {...field}
                    fullWidth
                    label="Số lượng"
                    type="number"
                    inputProps={{ step: '0.01', min: '0.01' }}
                    error={!!errors.quantity}
                    helperText={errors.quantity?.message || (selectedMaterial ? `Đơn vị: ${selectedMaterial.unit}` : '')}
                    required
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
                    label="Lý do"
                    multiline
                    rows={3}
                    error={!!errors.reason}
                    helperText={errors.reason?.message}
                    required
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
                              // Store files to upload later (on submit)
                              pendingFilesRef.current.push(...files);
                              
                              // Create blob URLs for preview
                              const blobUrls: string[] = [];
                              files.forEach((file) => {
                                const blobUrl = URL.createObjectURL(file);
                                fileInfoMapRef.current.set(blobUrl, {
                                  name: file.name,
                                  type: file.type,
                                });
                                blobUrls.push(blobUrl);
                              });
                              
                              // Add blob URLs to form for preview
                              field.onChange([...(field.value || []), ...blobUrls]);
                            }
                            // Reset input to allow selecting same file again
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
                                    onClick={async () => {
                                      const newAttachments = field.value?.filter((_, i) => i !== index) || [];
                                      field.onChange(newAttachments);
                                      fileInfoMapRef.current.delete(url);
                                      
                                      // Handle blob URLs (new files not yet uploaded)
                                      if (url.startsWith('blob:')) {
                                        URL.revokeObjectURL(url);
                                        // Remove corresponding file from pendingFilesRef
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
                                        // Handle server URLs - mark for deletion after successful update
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
                                  <Typography variant="caption" color="textSecondary" noWrap>
                                    {getFileName(url)}
                                  </Typography>
                                </Paper>
                              ) : (
                                <Paper sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 0, position: 'relative' }}>
                                  <IconButton
                                    size="small"
                                    onClick={async () => {
                                      const newAttachments = field.value?.filter((_, i) => i !== index) || [];
                                      field.onChange(newAttachments);
                                      fileInfoMapRef.current.delete(url);
                                      
                                      // Handle blob URLs (new files not yet uploaded)
                                      if (url.startsWith('blob:')) {
                                        URL.revokeObjectURL(url);
                                        // Remove corresponding file from pendingFilesRef
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
                                        // Handle server URLs - mark for deletion after successful update
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
                                    <Box flex={1} sx={{ minWidth: 0 }}>
                                      <Typography variant="body2" fontWeight="medium" noWrap>
                                        {getFileName(url)}
                                      </Typography>
                                      <Typography variant="caption" color="textSecondary" noWrap>
                                        {getFileType(url)}
                                      </Typography>
                                    </Box>
                                  </Box>
                                  <Link
                                    href={url}
                                    download={getFileName(url)}
                                    target="_blank"
                                    rel="noopener noreferrer"
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
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Hủy</Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {transaction ? 'Cập nhật' : 'Thêm'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

