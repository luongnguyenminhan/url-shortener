import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ProjectList, ProjectToolbar, ProjectFormDialog, DeleteConfirmDialog, ShareProjectDialog } from '../components';
import type { ProjectResponse, ProjectCreate, ProjectUpdate } from '@/types/project.type';
import type { PhotoWithVersions } from '@/types/photo.type';
import type { PaginationMeta } from '@/types/common.type';
import { projectService } from '@/services/projectService';
import {
    Box,
    Container,
    Typography,
    Button,
    Pagination,
    CircularProgress,
    Alert,
} from '@mui/material';
import {
    Add as AddIcon,
} from '@mui/icons-material';

const mockPhotosMap: Record<string, PhotoWithVersions[]> = {
    '1': Array.from({ length: 450 }, (_, i) => ({
        id: `photo-1-${i}`,
        project_id: '1',
        filename: `photo-${i}.jpg`,
        is_selected: i < 100,
        is_approved: i < 50,
        is_rejected: false,
        created_at: '2023-09-24T10:00:00Z',
        updated_at: '2023-09-24T10:00:00Z',
        photo_versions: [{
            id: `version-1-${i}`,
            photo_id: `photo-1-${i}`,
            version_type: 'original' as const,
            image_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=300&fit=crop',
            created_at: '2023-09-24T10:00:00Z',
            updated_at: '2023-09-24T10:00:00Z',
        }]
    })),
    '2': Array.from({ length: 12 }, (_, i) => ({
        id: `photo-2-${i}`,
        project_id: '2',
        filename: `photo-${i}.jpg`,
        is_selected: false,
        is_approved: false,
        is_rejected: false,
        created_at: '2023-10-02T10:00:00Z',
        updated_at: '2023-10-02T10:00:00Z',
        photo_versions: [{
            id: `version-2-${i}`,
            photo_id: `photo-2-${i}`,
            version_type: 'original' as const,
            image_url: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=300&fit=crop',
            created_at: '2023-10-02T10:00:00Z',
            updated_at: '2023-10-02T10:00:00Z',
        }]
    })),
};

export default function ProjectManagementPage() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [projects, setProjects] = useState<ProjectResponse[]>([]);
    const [pagination, setPagination] = useState<PaginationMeta | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Dialog states
    const [formDialogOpen, setFormDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [shareDialogOpen, setShareDialogOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<ProjectResponse | null>(null);
    const [formMode, setFormMode] = useState<'create' | 'edit'>('create');

    const itemsPerPage = 12;

    // Fetch projects from API
    const fetchProjects = async () => {
        setLoading(true);
        setError(null);
        try {
            const skip = (page - 1) * itemsPerPage;
            const response = await projectService.getProjects({
                skip,
                limit: itemsPerPage,
                search: searchQuery || undefined,
            });

            setProjects(response.data || []);
            setPagination(response.pagination || null);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch projects');
            console.error('Error fetching projects:', err);
        } finally {
            setLoading(false);
        }
    };

    // Load projects on mount and when page/search changes
    useEffect(() => {
        fetchProjects();
    }, [page, searchQuery]);

    const handleAction = (projectId: string, action: 'open' | 'start' | 'details' | 'archive' | 'edit' | 'delete' | 'share') => {
        const project = projects.find(p => p.id === projectId);

        if (action === 'edit' && project) {
            setSelectedProject(project);
            setFormMode('edit');
            setFormDialogOpen(true);
        } else if (action === 'delete' && project) {
            setSelectedProject(project);
            setDeleteDialogOpen(true);
        } else if (action === 'share' && project) {
            setSelectedProject(project);
            setShareDialogOpen(true);
        } else if (action === 'details' || action === 'open') {
            navigate(`/admin/projects/${projectId}`);
        } else {
            console.log(`Action ${action} on project ${projectId}`);
        }
    };

    const handleCreateProject = async (data: ProjectCreate | ProjectUpdate) => {
        try {
            if (formMode === 'create') {
                await projectService.createProject(data as ProjectCreate);
            } else if (selectedProject) {
                await projectService.updateProject(selectedProject.id, data as ProjectUpdate);
            }
            await fetchProjects();
        } catch (err: any) {
            console.error('Error saving project:', err);
            throw err;
        }
    };

    const handleDeleteProject = async () => {
        if (!selectedProject) return;

        try {
            await projectService.deleteProject(selectedProject.id);
            await fetchProjects();
        } catch (err: any) {
            console.error('Error deleting project:', err);
            throw err;
        }
    };

    // Reset to page 1 when search query changes
    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        setPage(1);
    };

    const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleOpenCreateDialog = () => {
        setSelectedProject(null);
        setFormMode('create');
        setFormDialogOpen(true);
    };

    const totalPages = pagination?.total_pages || 0;

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 4 }}>
            <Container maxWidth="xl">
                {/* Page Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <Typography variant="h4" component="h1" fontWeight="bold">
                        {t('projects.title')}
                    </Typography>

                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        size="large"
                        onClick={handleOpenCreateDialog}
                    >
                        {t('projects.newProject')}
                    </Button>
                </Box>

                {/* Toolbar: Search & Filters */}
                <ProjectToolbar
                    searchQuery={searchQuery}
                    onSearchChange={handleSearchChange}
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                />

                {/* Error Alert */}
                {error && (
                    <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                        {error}
                    </Alert>
                )}

                {/* Loading State */}
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <>
                        <ProjectList
                            projects={projects}
                            loading={loading}
                            searchQuery={searchQuery}
                            photosMap={mockPhotosMap}
                            onAction={handleAction}
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
                                />
                            </Box>
                        )}
                    </>
                )}

                {/* Dialogs */}
                <ProjectFormDialog
                    open={formDialogOpen}
                    onClose={() => setFormDialogOpen(false)}
                    onSubmit={handleCreateProject}
                    project={selectedProject}
                    mode={formMode}
                />

                <DeleteConfirmDialog
                    open={deleteDialogOpen}
                    onClose={() => setDeleteDialogOpen(false)}
                    onConfirm={handleDeleteProject}
                    projectTitle={selectedProject?.title || ''}
                />

                <ShareProjectDialog
                    open={shareDialogOpen}
                    onClose={() => setShareDialogOpen(false)}
                    projectId={selectedProject?.id || null}
                    projectTitle={selectedProject?.title || ''}
                />
            </Container>
        </Box>
    );
}
