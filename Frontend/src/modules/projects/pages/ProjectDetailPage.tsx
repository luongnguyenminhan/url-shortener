import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
    ToggleButtonGroup,
    ToggleButton,
    Fab,
    Dialog,
    DialogTitle,
    DialogContent,
} from '@mui/material';
import {
    ArrowBack,
    Upload,
    GridView,
    ViewList,
    Add,
} from '@mui/icons-material';
import { ProjectDetailInfo } from '../components/ProjectDetailInfo';
import { PhotoGallery } from '../components/PhotoGallery';
import { PhotoUploadZone } from '../components/PhotoUploadZone';
import { projectService } from '@/services/projectService';
import { photoService } from '@/services/photoService';
import type { ProjectDetailResponse } from '@/types/project.type';
import type { PhotoWithVersions } from '@/types/photo.type';
import { showSuccessToast, showErrorToast } from '@/hooks/useShowToast';

export const ProjectDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [project, setProject] = useState<ProjectDetailResponse | null>(null);
    const [photos, setPhotos] = useState<PhotoWithVersions[]>([]);
    const [loading, setLoading] = useState(true);
    const [photosLoading, setPhotosLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [uploadModalOpen, setUploadModalOpen] = useState(false);

    useEffect(() => {
        if (id) {
            loadProjectData();
            loadPhotos();
        }
    }, [id]);

    const loadProjectData = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await projectService.getProjectById(id!);
            setProject(data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Không thể tải thông tin dự án');
            showErrorToast('Không thể tải thông tin dự án');
        } finally {
            setLoading(false);
        }
    };

    const loadPhotos = async () => {
        try {
            setPhotosLoading(true);
            const data = await photoService.getPhotosByProject(id!, { skip: 0, limit: 100 });
            setPhotos(data.data || []);
        } catch (err: any) {
            console.error('Error loading photos:', err);
            showErrorToast('Không thể tải danh sách ảnh');
        } finally {
            setPhotosLoading(false);
        }
    };

    const handlePhotoClick = (photo: PhotoWithVersions) => {
        console.log('Photo clicked:', photo);
        // TODO: Open photo detail modal or navigate to photo detail page
    };

    const handlePhotoSelect = async (photoId: string, selected: boolean) => {
        try {
            await photoService.toggleSelection(photoId, selected);
            setPhotos((prev) =>
                prev.map((p) => (p.id === photoId ? { ...p, is_selected: selected } : p))
            );
            showSuccessToast(selected ? 'Đã chọn ảnh' : 'Đã bỏ chọn ảnh');
        } catch (err: any) {
            showErrorToast('Không thể cập nhật trạng thái ảnh');
        }
    };

    const handlePhotoDelete = async (photoId: string) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa ảnh này?')) {
            return;
        }

        try {
            await photoService.deletePhoto(photoId);
            setPhotos((prev) => prev.filter((p) => p.id !== photoId));
            showSuccessToast('Đã xóa ảnh thành công');
            loadProjectData(); // Reload to update images_count
        } catch (err: any) {
            showErrorToast('Không thể xóa ảnh');
        }
    };

    const handleUploadPhotos = () => {
        setUploadModalOpen(true);
    };

    const handleUploadComplete = () => {
        loadPhotos();
        loadProjectData(); // Reload to update images_count
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
                <Alert severity="error">{error || 'Không tìm thấy dự án'}</Alert>
                <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ mt: 2 }}>
                    Quay lại
                </Button>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            {/* Header with Breadcrumbs */}
            <Box mb={3}>
                <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
                    <Link
                        component="button"
                        variant="body1"
                        onClick={() => navigate('/projects')}
                        sx={{ textDecoration: 'none', cursor: 'pointer' }}
                    >
                        Dự án
                    </Link>
                    <Typography color="text.primary">{project.title}</Typography>
                </Breadcrumbs>

                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" spacing={2} alignItems="center">
                        <IconButton onClick={() => navigate(-1)}>
                            <ArrowBack />
                        </IconButton>
                        <Typography variant="h4" fontWeight="bold">
                            Chi tiết dự án
                        </Typography>
                    </Stack>

                    <Button
                        variant="contained"
                        startIcon={<Upload />}
                        onClick={handleUploadPhotos}
                    >
                        Tải lên ảnh
                    </Button>
                </Stack>
            </Box>

            {/* Main Content */}
            <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', lg: 'row' } }}>
                {/* Left side - Photo Gallery */}
                <Box sx={{ flex: '1 1 auto', minWidth: 0 }}>
                    <Paper sx={{ p: 3 }}>
                        <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                            mb={3}
                        >
                            <Typography variant="h6" fontWeight="bold">
                                Danh sách ảnh ({photos.length})
                            </Typography>

                            <ToggleButtonGroup
                                value={viewMode}
                                exclusive
                                onChange={(_, newMode) => newMode && setViewMode(newMode)}
                                size="small"
                            >
                                <ToggleButton value="grid" aria-label="grid view">
                                    <GridView />
                                </ToggleButton>
                                <ToggleButton value="list" aria-label="list view">
                                    <ViewList />
                                </ToggleButton>
                            </ToggleButtonGroup>
                        </Stack>

                        <PhotoGallery
                            photos={photos}
                            loading={photosLoading}
                            viewMode={viewMode}
                            onPhotoClick={handlePhotoClick}
                            onPhotoSelect={handlePhotoSelect}
                            onPhotoDelete={handlePhotoDelete}
                        />
                    </Paper>
                </Box>

                {/* Right side - Project Info */}
                <Box sx={{ width: { xs: '100%', lg: 400 }, flexShrink: 0 }}>
                    <ProjectDetailInfo project={project} />
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
            >
                <DialogTitle>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6">Upload ảnh</Typography>
                        <IconButton onClick={() => setUploadModalOpen(false)}>
                            <ArrowBack />
                        </IconButton>
                    </Stack>
                </DialogTitle>
                <DialogContent>
                    <PhotoUploadZone
                        projectId={id!}
                        onUploadComplete={handleUploadComplete}
                    />
                </DialogContent>
            </Dialog>
        </Container>
    );
};
