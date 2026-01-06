import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Box,
    Container,
    Typography,
    Button,
    IconButton,
    Stack,
    Breadcrumbs,
    Link,
    CircularProgress,
    Alert,
    Paper,
    Fab,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    MenuItem,
    FormControl,
    Select,
    useTheme,
    Pagination,
} from '@mui/material';
import {
    ArrowBack,
    Upload,
    Add,
    Close,
} from '@mui/icons-material';
import type { SelectChangeEvent } from '@mui/material';
import { ProjectDetailInfo } from '../components/ProjectDetailInfo';
import { PhotoGallery } from '../components/PhotoGallery';
import { PhotoUploadZone } from '../components/PhotoUploadZone';
import { projectService } from '@/services/projectService';
import { photoService } from '@/services/photoService';
import type { ProjectDetailResponse } from '@/types/project.type';
import { ProjectStatus } from '@/types/project.type';
import type { Photo } from '@/types/photo.type';
import { showSuccessToast, showErrorToast } from '@/hooks/useShowToast';

export const ProjectDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { t } = useTranslation('projects');
    const theme = useTheme();

    const [project, setProject] = useState<ProjectDetailResponse | null>(null);
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [loading, setLoading] = useState(true);
    const [photosLoading, setPhotosLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [uploadModalOpen, setUploadModalOpen] = useState(false);
    const [statusEditModalOpen, setStatusEditModalOpen] = useState(false);
    const [editingStatus, setEditingStatus] = useState<string>('');
    const [page, setPage] = useState(1);
    const [pageSize] = useState(24);
    const [totalPhotos, setTotalPhotos] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        if (id) {
            loadProjectData();
        }
    }, [id]);

    useEffect(() => {
        if (id) {
            loadPhotos();
        }
    }, [id, page, pageSize]);

    const loadProjectData = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await projectService.getProjectById(id!);
            setProject(data);
        } catch (err: any) {
            setError(err.response?.data?.message || t('detail.loadError', 'Không thể tải thông tin dự án'));
            showErrorToast(t('detail.loadError', 'Không thể tải thông tin dự án'));
        } finally {
            setLoading(false);
        }
    };

    const loadPhotos = async () => {
        try {
            setPhotosLoading(true);
            const result = await photoService.getPhotosByProject(id!, { page, limit: pageSize });
            setPhotos(result.data || []);
            setTotalPhotos(result.meta.total);
            setTotalPages(result.meta.total_pages);
        } catch (err: any) {
            console.error('Error loading photos:', err);
            showErrorToast(t('detail.loadPhotosError', 'Không thể tải danh sách ảnh'));
        } finally {
            setPhotosLoading(false);
        }
    };

    const handlePhotoUpdate = () => {
        loadPhotos();
        loadProjectData(); // Reload to update images_count and photo statuses
    };

    const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handlePhotoDelete = async (photoId: string) => {
        if (!window.confirm(t('detail.deleteConfirm', 'Bạn có chắc chắn muốn xóa ảnh này?'))) {
            return;
        }

        try {
            await photoService.deletePhoto(photoId);
            setPhotos((prev) => prev.filter((p) => p.id !== photoId));
            showSuccessToast(t('detail.deleteSuccess', 'Đã xóa ảnh thành công'));
            loadProjectData(); // Reload to update images_count
        } catch (err: any) {
            showErrorToast(t('detail.deleteError', 'Không thể xóa ảnh'));
        }
    };

    const handleUploadPhotos = () => {
        setUploadModalOpen(true);
    };

    const handleUploadComplete = () => {
        setPage(1); // Reset to first page after upload
        loadPhotos();
        loadProjectData(); // Reload to update images_count
    };

    const handleOpenStatusEdit = () => {
        setEditingStatus(project?.status || '');
        setStatusEditModalOpen(true);
    };

    const handleStatusChange = (event: SelectChangeEvent) => {
        setEditingStatus(event.target.value);
    };

    const handleSaveStatus = async () => {
        if (!id || !editingStatus) return;

        try {
            await projectService.updateProject(id, { status: editingStatus as any });
            showSuccessToast(t('detail.statusUpdateSuccess', 'Đã cập nhật trạng thái'));
            setStatusEditModalOpen(false);
            loadProjectData();
        } catch (err: any) {
            showErrorToast(t('detail.statusUpdateError', 'Không thể cập nhật trạng thái'));
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <CircularProgress />
            </Box>
        );
    }

    if (error || !project) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Alert severity="error">{error || t('detail.notFound', 'Không tìm thấy dự án')}</Alert>
                <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ mt: 2 }}>
                    {t('detail.goBack', 'Quay lại')}
                </Button>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ py: 4, minHeight: '100vh', bgcolor: theme.palette.mode === 'light' ? '#f5f5f5' : '#1f2d3d' }}>
            {/* Header with Breadcrumbs */}
            <Box mb={3}>
                <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
                    <Link
                        component="button"
                        variant="body1"
                        onClick={() => navigate('/projects')}
                        sx={{
                            textDecoration: 'none',
                            cursor: 'pointer',
                            color: theme.palette.mode === 'light' ? '#616161' : '#6c757d'
                        }}
                    >
                        {t('detail.breadcrumb.projects', 'Dự án')}
                    </Link>
                    <Typography sx={{ color: theme.palette.mode === 'light' ? '#212121' : '#c2c7d0' }}>{project.title}</Typography>
                </Breadcrumbs>

                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" spacing={2} alignItems="center">
                        <IconButton
                            onClick={() => navigate(-1)}
                            sx={{
                                color: theme.palette.mode === 'light' ? '#212121' : '#c2c7d0',
                                '&:hover': {
                                    bgcolor: theme.palette.mode === 'light' ? '#f5f5f5' : '#1f2d3d',
                                },
                            }}
                        >
                            <ArrowBack />
                        </IconButton>
                        <Typography variant="h4" fontWeight="bold" sx={{ color: theme.palette.mode === 'light' ? '#212121' : '#c2c7d0' }}>
                            {t('detail.title', 'Chi tiết dự án')}
                        </Typography>
                    </Stack>

                    <Button
                        variant="contained"
                        startIcon={<Upload />}
                        onClick={handleUploadPhotos}
                        sx={{
                            bgcolor: '#1976d2',
                            color: '#ffffff',
                            '&:hover': {
                                bgcolor: '#1565c0',
                            },
                        }}
                    >
                        {t('detail.uploadPhotos', 'Tải lên ảnh')}
                    </Button>
                </Stack>
            </Box>

            {/* Main Content */}
            <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', lg: 'row' } }}>
                {/* Left side - Photo Gallery */}
                <Box sx={{ flex: '1 1 auto', minWidth: 0 }}>
                    <Paper sx={{
                        p: 3,
                        bgcolor: theme.palette.mode === 'light' ? '#ffffff' : '#343a40',
                        boxShadow: 'var(--shadow-md)',
                        borderRadius: 2,
                    }}>
                        <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                            mb={3}
                        >
                            <Typography variant="h6" fontWeight="bold" sx={{ color: theme.palette.mode === 'light' ? '#212121' : '#c2c7d0' }}>
                                {t('detail.photoList', 'Danh sách ảnh')} ({totalPhotos})
                            </Typography>
                            {totalPages > 1 && (
                                <Typography variant="body2" sx={{ color: theme.palette.mode === 'light' ? '#616161' : '#6c757d' }}>
                                    Trang {page} / {totalPages}
                                </Typography>
                            )}
                        </Stack>

                        <PhotoGallery
                            photos={photos}
                            loading={photosLoading}
                            onPhotoDelete={handlePhotoDelete}
                            onPhotoUpdate={handlePhotoUpdate}
                        />

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                                <Pagination
                                    count={totalPages}
                                    page={page}
                                    onChange={handlePageChange}
                                    color="primary"
                                    size="large"
                                    showFirstButton
                                    showLastButton
                                    sx={{
                                        '& .MuiPaginationItem-root': {
                                            color: theme.palette.mode === 'light' ? '#212121' : '#c2c7d0',
                                            '&:hover': {
                                                backgroundColor: theme.palette.mode === 'light' ? '#f5f5f5' : '#1f2d3d',
                                            },
                                            '&.Mui-selected': {
                                                backgroundColor: '#1976d2',
                                                color: '#ffffff',
                                                '&:hover': {
                                                    backgroundColor: '#1565c0',
                                                },
                                            },
                                        },
                                    }}
                                />
                            </Box>
                        )}
                    </Paper>
                </Box>

                {/* Right side - Project Info */}
                <Box sx={{ width: { xs: '100%', lg: 400 }, flexShrink: 0 }}>
                    <ProjectDetailInfo project={project} onStatusUpdate={handleOpenStatusEdit} />
                </Box>
            </Box>

            {/* Floating Action Button for mobile */}
            <Fab
                color="primary"
                aria-label="upload"
                sx={{
                    position: 'fixed',
                    bottom: 16,
                    right: 16,
                    display: { xs: 'flex', sm: 'none' },
                }}
                onClick={handleUploadPhotos}
            >
                <Add />
            </Fab>

            {/* Upload Modal */}
            <Dialog
                open={uploadModalOpen}
                onClose={() => setUploadModalOpen(false)}
                maxWidth="md"
                fullWidth
                sx={{
                    '& .MuiDialog-paper': {
                        bgcolor: theme.palette.mode === 'light' ? '#ffffff' : '#343a40',
                        color: theme.palette.mode === 'light' ? '#212121' : '#c2c7d0',
                    },
                }}
            >
                <DialogTitle sx={{ bgcolor: theme.palette.mode === 'light' ? '#ffffff' : '#343a40', color: theme.palette.mode === 'light' ? '#212121' : '#c2c7d0' }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6">{t('detail.uploadDialog.title', 'Upload ảnh')}</Typography>
                        <IconButton
                            onClick={() => setUploadModalOpen(false)}
                            sx={{
                                color: theme.palette.mode === 'light' ? '#212121' : '#c2c7d0',
                                '&:hover': {
                                    bgcolor: theme.palette.mode === 'light' ? '#f5f5f5' : '#1f2d3d',
                                },
                            }}
                        >
                            <ArrowBack />
                        </IconButton>
                    </Stack>
                </DialogTitle>
                <DialogContent sx={{ bgcolor: theme.palette.mode === 'light' ? '#ffffff' : '#343a40' }}>
                    <PhotoUploadZone
                        projectId={id!}
                        onUploadComplete={handleUploadComplete}
                    />
                </DialogContent>
            </Dialog>

            {/* Status Edit Modal */}
            <Dialog
                open={statusEditModalOpen}
                onClose={() => setStatusEditModalOpen(false)}
                maxWidth="sm"
                fullWidth
                sx={{
                    '& .MuiDialog-paper': {
                        bgcolor: theme.palette.mode === 'light' ? '#ffffff' : '#343a40',
                        color: theme.palette.mode === 'light' ? '#212121' : '#c2c7d0',
                    },
                }}
            >
                <DialogTitle sx={{ bgcolor: theme.palette.mode === 'light' ? '#ffffff' : '#343a40', color: theme.palette.mode === 'light' ? '#212121' : '#c2c7d0' }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6">{t('detail.editStatus', 'Chỉnh sửa trạng thái')}</Typography>
                        <IconButton
                            onClick={() => setStatusEditModalOpen(false)}
                            sx={{
                                color: theme.palette.mode === 'light' ? '#212121' : '#c2c7d0',
                                '&:hover': {
                                    bgcolor: theme.palette.mode === 'light' ? '#f5f5f5' : '#1f2d3d',
                                },
                            }}
                        >
                            <Close />
                        </IconButton>
                    </Stack>
                </DialogTitle>
                <DialogContent sx={{ bgcolor: theme.palette.mode === 'light' ? '#ffffff' : '#343a40', pt: 3 }}>
                    <FormControl fullWidth>
                        <Select
                            value={editingStatus}
                            onChange={handleStatusChange}
                            MenuProps={{
                                PaperProps: {
                                    sx: {
                                        bgcolor: theme.palette.mode === 'light' ? '#ffffff' : '#343a40',
                                        color: theme.palette.mode === 'light' ? '#212121' : '#c2c7d0',
                                        '& .MuiMenuItem-root': {
                                            '&:hover': {
                                                bgcolor: theme.palette.mode === 'light' ? '#f5f5f5' : '#1f2d3d',
                                            },
                                            '&.Mui-selected': {
                                                bgcolor: theme.palette.mode === 'light' ? '#e3f2fd' : '#1565c0',
                                                '&:hover': {
                                                    bgcolor: theme.palette.mode === 'light' ? '#bbdefb' : '#1976d2',
                                                },
                                            },
                                        },
                                    },
                                },
                            }}
                            sx={{
                                color: theme.palette.mode === 'light' ? '#212121' : '#c2c7d0',
                                '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: theme.palette.mode === 'light' ? '#e0e0e0' : '#4b545c',
                                },
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#1976d2',
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#1976d2',
                                },
                                '& .MuiSvgIcon-root': {
                                    color: theme.palette.mode === 'light' ? '#212121' : '#c2c7d0',
                                },
                            }}
                        >
                            <MenuItem value={ProjectStatus.DRAFT}>{t('status.draft', 'Bản nháp')}</MenuItem>
                            <MenuItem value={ProjectStatus.CLIENT_SELECTING}>{t('status.clientSelecting', 'Khách hàng đang chọn')}</MenuItem>
                            <MenuItem value={ProjectStatus.PENDING_EDIT}>{t('status.pendingEdit', 'Chờ chỉnh sửa')}</MenuItem>
                            <MenuItem value={ProjectStatus.CLIENT_REVIEW}>{t('status.clientReview', 'Khách hàng đánh giá')}</MenuItem>
                            <MenuItem value={ProjectStatus.COMPLETED}>{t('status.completed', 'Hoàn thành')}</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions sx={{ bgcolor: theme.palette.mode === 'light' ? '#ffffff' : '#343a40', p: 2 }}>
                    <Button
                        onClick={() => setStatusEditModalOpen(false)}
                        sx={{ color: theme.palette.mode === 'light' ? '#616161' : '#6c757d' }}
                    >
                        {t('detail.cancel', 'Hủy')}
                    </Button>
                    <Button
                        onClick={handleSaveStatus}
                        variant="contained"
                        sx={{
                            bgcolor: '#1976d2',
                            color: '#ffffff',
                            '&:hover': {
                                bgcolor: '#1565c0',
                            },
                        }}
                    >
                        {t('detail.save', 'Lưu')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};
