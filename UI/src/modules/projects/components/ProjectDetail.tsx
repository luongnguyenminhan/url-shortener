import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Box,
    Typography,
    Button,
    Chip,
    Container,
    Paper,
    Grid,
    Divider,
    CircularProgress
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    CalendarToday as CalendarIcon,
    Description as DescriptionIcon
} from '@mui/icons-material';
import { projectService } from '@/services/projectService';
import type { ProjectDetailResponse } from '@/types/project.type';
import { ProjectStatus } from '@/types/project.type';
import { ProjectFormDialog } from './ProjectFormDialog';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';

const statusConfig: Record<string, { color: 'primary' | 'warning' | 'error' | 'success' | 'info' | 'default' }> = {
    [ProjectStatus.DRAFT]: { color: 'primary' },
    [ProjectStatus.CLIENT_SELECTING]: { color: 'warning' },
    [ProjectStatus.PENDING_EDIT]: { color: 'info' },
    [ProjectStatus.CLIENT_REVIEW]: { color: 'info' },
    [ProjectStatus.COMPLETED]: { color: 'success' },
};

export default function ProjectDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [project, setProject] = useState<ProjectDetailResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Dialog states
    const [formDialogOpen, setFormDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const fetchProject = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const data = await projectService.getProjectById(id);
            setProject(data);
        } catch (err: any) {
            setError(err.message || 'Failed to load project');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProject();
    }, [id]);

    const handleEditSuccess = async (data: any) => {
        if (!project) return;
        try {
            await projectService.updateProject(project.id, data);
            await fetchProject(); // Refresh data
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteSuccess = async () => {
        if (!project) return;
        try {
            await projectService.deleteProject(project.id);
            navigate('/admin/projects'); // Redirect to list
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error || !project) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Typography color="error" variant="h6">
                    {error || 'Project not found'}
                </Typography>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/admin/projects')}
                    sx={{ mt: 2 }}
                >
                    {t('common.back')}
                </Button>
            </Container>
        );
    }

    const statusStyle = statusConfig[project.status] || statusConfig[ProjectStatus.DRAFT];

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 4 }}>
            <Container maxWidth="lg">
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/admin/projects')}
                    sx={{ mb: 3 }}
                >
                    {t('projects.title')}
                </Button>

                <Paper sx={{ p: 4 }}>
                    {/* Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
                        <Box>
                            <Typography variant="h4" gutterBottom fontWeight="bold">
                                {project.title}
                            </Typography>
                            <Chip
                                label={t(`projects.status.${project.status}`)}
                                color={statusStyle.color}
                            />
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                                variant="outlined"
                                startIcon={<EditIcon />}
                                onClick={() => setFormDialogOpen(true)}
                            >
                                {t('common.edit')}
                            </Button>
                            <Button
                                variant="outlined"
                                color="error"
                                startIcon={<DeleteIcon />}
                                onClick={() => setDeleteDialogOpen(true)}
                            >
                                {t('common.delete')}
                            </Button>
                        </Box>
                    </Box>

                    <Divider sx={{ mb: 4 }} />

                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, md: 8 }}>
                            <Box sx={{ mb: 4 }}>
                                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <DescriptionIcon color="action" />
                                    {t('projects.form.clientNotes')}
                                </Typography>
                                <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                                    {project.client_notes || 'No notes available'}
                                </Typography>
                            </Box>
                        </Grid>

                        <Grid size={{ xs: 12, md: 4 }}>
                            <Paper variant="outlined" sx={{ p: 3, bgcolor: 'background.default' }}>
                                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                    Project Details
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">
                                            Created
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                            <CalendarIcon fontSize="small" color="action" />
                                            <Typography variant="body2">
                                                {new Date(project.created_at).toLocaleDateString()}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">
                                            Last Updated
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                            <CalendarIcon fontSize="small" color="action" />
                                            <Typography variant="body2">
                                                {new Date(project.updated_at).toLocaleDateString()}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>
                            </Paper>
                        </Grid>
                    </Grid>
                </Paper>
            </Container>

            {/* Dialogs */}
            <ProjectFormDialog
                open={formDialogOpen}
                onClose={() => setFormDialogOpen(false)}
                onSubmit={handleEditSuccess}
                project={project}
                mode="edit"
            />

            <DeleteConfirmDialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                onConfirm={handleDeleteSuccess}
                projectTitle={project.title}
            />
        </Box>
    );
}
