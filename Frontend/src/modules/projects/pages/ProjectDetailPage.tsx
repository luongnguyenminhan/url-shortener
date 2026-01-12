import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Box,
    Container,
    Typography,
    Button,
    IconButton,
    Paper,
    Grid,
    Chip,
    Stack,
    Tabs,
    Tab,
    CircularProgress,
    MenuItem,
    FormControl,
    Select,
    Alert
} from '@mui/material';
import {
    ArrowBack,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Share as ShareIcon,
    CloudUpload,
    FilterList,
    Image as ImageIcon
} from '@mui/icons-material';
import { projectService } from '@/services/projectService';
import { photoService } from '@/services/photoService';
import type { ProjectResponse, ProjectUpdate } from '@/types/project.type';
import { ProjectStatus } from '@/types/project.type';
import type { Photo } from '@/types/photo.type';
import { ROUTES } from '@/constants';
import { toast } from 'react-toastify';
import { ProjectFormDialog } from '../components/ProjectFormDialog';
import { ShareProjectDialog } from '../components/ShareProjectDialog';
import { DeleteConfirmDialog } from '../components/DeleteConfirmDialog';
import { PhotoGallery } from '../components/PhotoGallery';
import { PhotoUploadZone } from '../components/PhotoUploadZone';


// Need to create or import ProjectDetailInfo if simpler I can inline it. 
// Step 27 showed ProjectDetailInfo.tsx exists. I will use it.

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function CustomTabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ py: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

export const ProjectDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { t } = useTranslation(['projects', 'translation']);

    const [project, setProject] = useState<ProjectResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [tabValue, setTabValue] = useState(0);

    // Photos State
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [photosLoading, setPhotosLoading] = useState(false);
    const [photoFilter, setPhotoFilter] = useState<'all' | 'selected' | 'edited'>('all');
    const [skip, setSkip] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    // Dialogs
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [shareDialogOpen, setShareDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [uploadType, setUploadType] = useState<'original' | 'edited'>('original');

    const fetchProject = useCallback(async () => {
        if (!id) return;
        try {
            setLoading(true);
            const data = await projectService.getProjectById(id);
            setProject(data);
        } catch (error) {
            console.error('Failed to load project:', error);
            toast.error(t('detail.loadError', 'Failed to load project details'));
            navigate(ROUTES.ADMIN.PROJECTS);
        } finally {
            setLoading(false);
        }
    }, [id, navigate, t]);

    const fetchPhotos = useCallback(async (reset = false) => {
        if (!id) return;
        try {
            setPhotosLoading(true);
            const currentSkip = reset ? 0 : skip;
            const response = await photoService.getPhotosByProject(id, {
                skip: currentSkip,
                limit: 10,
                status: photoFilter === 'all' ? undefined : photoFilter,
                sort_by: 'created_at',
                sort_order: 'desc'
            });

            if (reset) {
                setPhotos(response.data);
            } else {
                setPhotos(prev => {
                    const newPhotos = response.data.filter(newItem => !prev.some(prevItem => prevItem.id === newItem.id));
                    return [...prev, ...newPhotos];
                });
            }

            setHasMore(currentSkip + 10 < response.meta.total);
            if (reset) setSkip(10);
            else setSkip(prev => prev + 10);

        } catch (error) {
            console.error('Failed to load photos:', error);
            toast.error(t('detail.loadPhotosError', 'Failed to load photos'));
        } finally {
            setPhotosLoading(false);
        }
    }, [id, skip, photoFilter, t]);

    useEffect(() => {
        fetchProject();
    }, [fetchProject]);

    useEffect(() => {
        // Reset and fetch photos when filter or tab changes to photos (index 1)
        if (tabValue === 1) {
            setSkip(0); // Reset skip state manually before fetch
            // But fetch inside useEffect is tricky with state updates.
            // Better to just call fetchPhotos(true)
            fetchPhotos(true);
        }
    }, [tabValue, photoFilter]); // Exclude fetchPhotos from deps to avoid loop if not memoized properly

    // Handlers
    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    const handleDeleteProject = async () => {
        if (!id) return;
        try {
            await projectService.deleteProject(id);
            toast.success(t('detail.deleteSuccess', 'Project deleted successfully'));
            navigate(ROUTES.ADMIN.PROJECTS);
        } catch (error) {
            console.error('Failed to delete project:', error);
            toast.error(t('detail.deleteError', 'Failed to delete project'));
        }
    };

    const handleUpdateProject = async (data: any) => {
        if (!id) return;
        try {
            await projectService.updateProject(id, data as ProjectUpdate);
            toast.success(t('detail.updateSuccess', 'Project updated'));
            fetchProject();
            setEditDialogOpen(false);
        } catch (error) {
            console.error('Failed to update project:', error);
            toast.error(t('detail.updateError', 'Failed to update project'));
        }
    };

    const handlePhotoUpdate = () => {
        fetchPhotos(true);
        fetchProject(); // Refresh counts
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case ProjectStatus.DRAFT: return 'default';
            case ProjectStatus.CLIENT_SELECTING: return 'warning';
            case ProjectStatus.PENDING_EDIT: return 'info';
            case ProjectStatus.CLIENT_REVIEW: return 'info';
            case ProjectStatus.COMPLETED: return 'success';
            default: return 'default';
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress />
            </Box>
        );
    }

    if (!project) return null;

    return (
        <Container maxWidth="xl" sx={{ py: 3 }}>
            {/* Header */}
            <Stack direction="row" alignItems="center" spacing={2} mb={3}>
                <IconButton onClick={() => navigate(ROUTES.ADMIN.PROJECTS)}>
                    <ArrowBack />
                </IconButton>
                <Box flexGrow={1}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                        <Typography variant="h5" fontWeight="bold">
                            {project.title}
                        </Typography>
                        <Chip
                            label={t(`status.${project.status}`, project.status)}
                            color={getStatusColor(project.status) as any}
                            size="small"
                        />
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                        {t('common.updated', 'Updated')} {new Date(project.updated_at).toLocaleDateString()}
                    </Typography>
                </Box>
                <Stack direction="row" spacing={1}>
                    <Button
                        variant="outlined"
                        startIcon={<ShareIcon />}
                        onClick={() => setShareDialogOpen(true)}
                    >
                        {t('common.share', 'Share')}
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={<EditIcon />}
                        onClick={() => setEditDialogOpen(true)}
                    >
                        {t('common.edit', 'Edit')}
                    </Button>
                    <Button
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => setDeleteDialogOpen(true)}
                    >
                        {t('common.delete', 'Delete')}
                    </Button>
                </Stack>
            </Stack>

            <Paper sx={{ mb: 3 }}>
                <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
                    <Tab label={t('tabs.overview', 'Overview')} />
                    <Tab label={t('tabs.photos', 'Photos')} />
                    <Tab label={t('tabs.upload', 'Upload')} />
                </Tabs>

                {/* Overview Tab */}
                <CustomTabPanel value={tabValue} index={0}>
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} px={2}>
                        <Box flex={2}>
                            {/* Reusing existing component if possible or inline */}
                            {/* Based on file list, ProjectDetailInfo.tsx exists. We should import it. */}
                            {/* But for now, let's keep it simple and inline basic info as I haven't read that file specifically, 
                                wait, I listed it but didn't read it. I'll stick to inline to ensure no props mismatch, 
                                or I can read it if I want to be perfect. 
                                Looking at the time, inline is safer. */}
                            <Stack spacing={2}>
                                <Paper variant="outlined" sx={{ p: 2 }}>
                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                        {t('info.clientNotes', 'Client Notes')}
                                    </Typography>
                                    <Typography variant="body1">
                                        {project.client_notes || t('common.noNotes', 'No notes provided')}
                                    </Typography>
                                </Paper>

                                <Paper variant="outlined" sx={{ p: 2 }}>
                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                        {t('stats', 'Statistics')}
                                    </Typography>
                                    <Grid container spacing={2}>
                                        <Grid item xs={6} sm={3}>
                                            <Stack alignItems="center">
                                                <ImageIcon color="primary" fontSize="large" />
                                                <Typography variant="h4">{project.images_count}</Typography>
                                                <Typography variant="caption">Total Photos</Typography>
                                            </Stack>
                                        </Grid>
                                        {/* We could add more stats if available in response */}
                                    </Grid>
                                </Paper>
                            </Stack>
                        </Box>
                        <Box flex={1}>
                            <Alert severity="info" sx={{ mb: 2 }}>
                                {t('expiryInfo', 'Project expires in')} {
                                    project.expired_date
                                        ? Math.ceil((new Date(project.expired_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                                        : 'N/A'
                                } {t('common.days', 'days')}
                            </Alert>
                        </Box>
                    </Stack>
                </CustomTabPanel>

                {/* Photos Tab */}
                <CustomTabPanel value={tabValue} index={1}>
                    <Box px={2}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                            <FormControl size="small" sx={{ minWidth: 150 }}>
                                <Select
                                    value={photoFilter}
                                    onChange={(e) => setPhotoFilter(e.target.value as any)}
                                    displayEmpty
                                    startAdornment={<FilterList fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />}
                                >
                                    <MenuItem value="all">{t('filter.all', 'All Photos')}</MenuItem>
                                    <MenuItem value="selected">{t('filter.selected', 'Selected')}</MenuItem>
                                    <MenuItem value="edited">{t('filter.edited', 'Edited')}</MenuItem>
                                </Select>
                            </FormControl>
                            <Button
                                variant="contained"
                                startIcon={<CloudUpload />}
                                onClick={() => {
                                    setTabValue(2); // Switch to upload tab
                                }}
                            >
                                {t('common.upload', 'Upload New')}
                            </Button>
                        </Stack>

                        <PhotoGallery
                            photos={photos}
                            loading={photosLoading}
                            onPhotoUpdate={handlePhotoUpdate}
                            onPhotoDelete={async (id) => {
                                await photoService.deletePhoto(id);
                                handlePhotoUpdate();
                            }}
                            projectStatus={project.status}
                            projectId={project.id}
                            onLoadMore={() => fetchPhotos(false)}
                            hasMore={hasMore}
                            loadingMore={photosLoading}
                        />
                    </Box>
                </CustomTabPanel>

                {/* Upload Tab */}
                <CustomTabPanel value={tabValue} index={2}>
                    <Box maxWidth="800px" mx="auto">
                        <Stack spacing={3}>
                            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                                <Tabs
                                    value={uploadType}
                                    onChange={(_, v) => setUploadType(v)}
                                    centered
                                >
                                    <Tab value="original" label={t('upload.original', 'Original Photos')} />
                                    <Tab value="edited" label={t('upload.edited', 'Edited Photos')} />
                                </Tabs>
                            </Box>

                            <PhotoUploadZone
                                projectId={project.id}
                                uploadType={uploadType}
                                onUploadComplete={handlePhotoUpdate}
                            />
                        </Stack>
                    </Box>
                </CustomTabPanel>
            </Paper>

            {/* Dialogs */}
            <ProjectFormDialog
                open={editDialogOpen}
                onClose={() => setEditDialogOpen(false)}
                project={project}
                mode="edit"
                onSubmit={handleUpdateProject}
            />

            <ShareProjectDialog
                open={shareDialogOpen}
                onClose={() => setShareDialogOpen(false)}
                projectId={project.id}
                projectTitle={project.title}
            />

            <DeleteConfirmDialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                onConfirm={handleDeleteProject}
                projectTitle={project.title}
            />
        </Container>
    );
};
