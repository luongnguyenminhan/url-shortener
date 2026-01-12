import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import type { SelectChangeEvent } from '@mui/material';
import {
    Box,
    Container,
    Typography,
    Button,
    TextField,
    InputAdornment,
    IconButton,
    ToggleButtonGroup,
    ToggleButton,
    Pagination,
    FormControl,
    Select,
    MenuItem,
    Grid,
    CircularProgress,
    Stack,
    Paper,
} from '@mui/material';
import {
    Add as AddIcon,
    Search as SearchIcon,
    GridView as GridViewIcon,
    ViewList as ViewListIcon,
    FilterList as FilterListIcon
} from '@mui/icons-material';
import { useDebounce } from 'use-debounce';
import { projectService } from '@/services/projectService';
import { ProjectCard } from '../components/ProjectCard';
import { ProjectFormDialog } from '../components/ProjectFormDialog';
import { DeleteConfirmDialog } from '../components/DeleteConfirmDialog';
import type { ProjectResponse } from '@/types/project.type';
import { ROUTES } from '@/constants';
import { toast } from 'react-toastify';

const PAGE_SIZE = 12;

const ProjectManagementPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    // State
    const [projects, setProjects] = useState<ProjectResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch] = useDebounce(searchQuery, 500);
    const [sortBy, setSortBy] = useState('updated_at');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    // Dialog state
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [deleteGroupId, setDeleteGroupId] = useState<string | null>(null);

    // Fetch projects
    const fetchProjects = async () => {
        try {
            setLoading(true);
            const response = await projectService.getProjects({
                page,
                page_size: PAGE_SIZE,
                search: debouncedSearch,
                sort_by: sortBy,
                sort_order: sortOrder
            });
            setProjects(response.data);
            setTotalPages(response.meta.total_pages);
        } catch (error) {
            console.error('Failed to fetch projects:', error);
            toast.error(t('projects.fetchError', 'Failed to calculate projects'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, [page, debouncedSearch, sortBy, sortOrder]);

    // Handlers
    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value);
        setPage(1); // Reset to first page on search
    };

    const handleSortChange = (event: SelectChangeEvent) => {
        const value = event.target.value;
        if (value === 'name_asc') {
            setSortBy('title');
            setSortOrder('asc');
        } else if (value === 'name_desc') {
            setSortBy('title');
            setSortOrder('desc');
        } else if (value === 'newest') {
            setSortBy('created_at');
            setSortOrder('desc');
        } else if (value === 'oldest') {
            setSortBy('created_at');
            setSortOrder('asc');
        } else if (value === 'updated_desc') {
            setSortBy('updated_at');
            setSortOrder('desc');
        }
        setPage(1);
    };

    const handleViewModeChange = (_event: React.MouseEvent<HTMLElement>, newMode: 'grid' | 'list' | null) => {
        if (newMode !== null) {
            setViewMode(newMode);
        }
    };

    const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);
    };

    const handleProjectAction = (projectId: string, action: 'open' | 'edit' | 'delete' | 'share') => {
        if (action === 'open') {
            navigate(ROUTES.ADMIN.PROJECT_DETAIL(projectId));
        } else if (action === 'edit') {
            // Edit logic usually handled by a dialog with context or state, 
            // for now we might need to implement edit opening.
            // But let's verify if ProjectCard handles edit internally or if we need to pass a handler.
            // Looking at ProjectCard, it calls onAction('edit').
            // We'll need state for the edit dialog. 
            // Simplification: We'll add edit handling later or rely on the Detail page for editing.
            // Actually, common pattern is to open the same form dialog.
        } else if (action === 'delete') {
            setDeleteGroupId(projectId);
        }
    };

    // Create/Edit Handler (Placeholder for now, assuming Create only for the button)
    // Create Handler
    const handleCreateProject = async (data: any) => {
        try {
            await projectService.createProject(data);
            fetchProjects();
            setCreateDialogOpen(false);
            toast.success(t('projects.createSuccess', 'Project created successfully'));
        } catch (error) {
            console.error('Failed to create project:', error);
            toast.error(t('projects.createError', 'Failed to create project'));
        }
    };

    const handleDeleteConfirm = async () => {
        if (!deleteGroupId) return;
        try {
            await projectService.deleteProject(deleteGroupId);
            toast.success(t('projects.deleteSuccess', 'Project deleted successfully'));
            fetchProjects();
        } catch (error) {
            console.error('Failed to delete project:', error);
            toast.error(t('projects.deleteError', 'Failed to delete project'));
        } finally {
            setDeleteGroupId(null);
        }
    };

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                        {t('projects.title', 'Projects')}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        {t('projects.subtitle', 'Manage your photography projects')}
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setCreateDialogOpen(true)}
                    sx={{ px: 4, py: 1.5, borderRadius: 2 }}
                >
                    {t('projects.newProject', 'New Project')}
                </Button>
            </Box>

            {/* Toolbar */}
            <Paper sx={{ p: 2, mb: 4, borderRadius: 2 }} elevation={0} variant="outlined">
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
                    <TextField
                        placeholder={t('common.search', 'Search projects...')}
                        value={searchQuery}
                        onChange={handleSearchChange}
                        size="small"
                        fullWidth
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon color="action" />
                                </InputAdornment>
                            ),
                        }}
                        sx={{ maxWidth: { md: 400 } }}
                    />

                    <Box sx={{ flexGrow: 1 }} />

                    <Stack direction="row" spacing={2} alignItems="center" width={{ xs: '100%', md: 'auto' }}>
                        <FormControl size="small" sx={{ minWidth: 200 }}>
                            <Select
                                value={
                                    sortBy === 'created_at' && sortOrder === 'desc' ? 'newest' :
                                        sortBy === 'created_at' && sortOrder === 'asc' ? 'oldest' :
                                            sortBy === 'title' && sortOrder === 'asc' ? 'name_asc' :
                                                sortBy === 'title' && sortOrder === 'desc' ? 'name_desc' :
                                                    'updated_desc'
                                }
                                onChange={handleSortChange}
                                displayEmpty
                                startAdornment={
                                    <InputAdornment position="start">
                                        <FilterListIcon fontSize="small" />
                                    </InputAdornment>
                                }
                            >
                                <MenuItem value="updated_desc">{t('sort.updatedNewest', 'Last Updated')}</MenuItem>
                                <MenuItem value="newest">{t('sort.newest', 'Newest Created')}</MenuItem>
                                <MenuItem value="oldest">{t('sort.oldest', 'Oldest Created')}</MenuItem>
                                <MenuItem value="name_asc">{t('sort.nameAsc', 'Name (A-Z)')}</MenuItem>
                                <MenuItem value="name_desc">{t('sort.nameDesc', 'Name (Z-A)')}</MenuItem>
                            </Select>
                        </FormControl>

                        <ToggleButtonGroup
                            value={viewMode}
                            exclusive
                            onChange={handleViewModeChange}
                            size="small"
                        >
                            <ToggleButton value="grid">
                                <GridViewIcon />
                            </ToggleButton>
                            <ToggleButton value="list">
                                <ViewListIcon />
                            </ToggleButton>
                        </ToggleButtonGroup>
                    </Stack>
                </Stack>
            </Paper>

            {/* Content */}
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress />
                </Box>
            ) : projects.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Typography variant="h6" color="text.secondary">
                        {t('projects.noProjects', 'No projects found')}
                    </Typography>
                    {searchQuery && (
                        <Button onClick={() => setSearchQuery('')} sx={{ mt: 2 }}>
                            {t('common.clearSearch', 'Clear Search')}
                        </Button>
                    )}
                </Box>
            ) : (
                <>
                    {viewMode === 'grid' ? (
                        <Grid container spacing={3}>
                            {projects.map((project) => (
                                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={project.id} display="flex" justifyContent="center">
                                    <ProjectCard
                                        project={project}
                                        viewMode="grid"
                                        onAction={handleProjectAction}
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    ) : (
                        <Stack spacing={2}>
                            {projects.map((project) => (
                                <ProjectCard
                                    key={project.id}
                                    project={project}
                                    viewMode="list"
                                    onAction={handleProjectAction}
                                />
                            ))}
                        </Stack>
                    )}

                    {/* Pagination */}
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                        <Pagination
                            count={totalPages}
                            page={page}
                            onChange={handlePageChange}
                            color="primary"
                            size="large"
                        />
                    </Box>
                </>
            )}

            {/* Dialogs */}
            <ProjectFormDialog
                open={createDialogOpen}
                onClose={() => setCreateDialogOpen(false)}
                onSubmit={handleCreateProject}
                mode="create"
            />

            <DeleteConfirmDialog
                open={Boolean(deleteGroupId)}
                onClose={() => setDeleteGroupId(null)}
                onConfirm={handleDeleteConfirm}
                projectTitle={projects.find(p => p.id === deleteGroupId)?.title || ''}
            />
        </Container>
    );
};

export default ProjectManagementPage;
