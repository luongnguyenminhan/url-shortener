import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ProjectCard, ProjectFormDialog, DeleteConfirmDialog } from '../components';
import type { ProjectResponse, ProjectCreate, ProjectUpdate } from '@/types/project.type';
import { projectService } from '@/services/projectService';
import {
    Box,
    Container,
    Typography,
    TextField,
    InputAdornment,
    CircularProgress,
    Alert,
    Toolbar,
    IconButton,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
} from '@mui/material';
import {
    Search as SearchIcon,
    CreateNewFolder as CreateNewFolderIcon,
    MoreVert as MoreVertIcon,
    ViewModule as ViewModuleIcon,
    ViewList as ViewListIcon,
    Sort as SortIcon,
} from '@mui/icons-material';

export default function ProjectManagementPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [loading, setLoading] = useState(false);
    const [projects, setProjects] = useState<ProjectResponse[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    // Dialog states
    const [formDialogOpen, setFormDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<ProjectResponse | null>(null);
    const [formMode, setFormMode] = useState<'create' | 'edit'>('create');

    // Fetch projects from API
    const fetchProjects = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await projectService.getProjects({
                skip: 0,
                limit: 100,
                search: searchQuery || undefined,
            });

            // Sort by newest first (created_at or updated_at descending)
            const sortedProjects = (response.data || []).sort((a, b) => {
                const dateA = new Date(a.updated_at || a.created_at).getTime();
                const dateB = new Date(b.updated_at || b.created_at).getTime();
                return dateB - dateA; // Newest first
            });

            setProjects(sortedProjects);
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || err.message || 'Failed to fetch projects';
            setError(errorMsg);
            console.error('Error fetching projects:', err);
        } finally {
            setLoading(false);
        }
    };

    // Load projects on mount and when search changes
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchProjects();
        }, 300); // Debounce search

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleAction = (projectId: string, action: 'open' | 'edit' | 'delete' | 'share') => {
        const project = projects.find(p => p.id === projectId);

        if (action === 'edit' && project) {
            setSelectedProject(project);
            setFormMode('edit');
            setFormDialogOpen(true);
        } else if (action === 'delete' && project) {
            setSelectedProject(project);
            setDeleteDialogOpen(true);
        } else if (action === 'open') {
            navigate(`/admin/projects/${projectId}`);
        } else if (action === 'share') {
            // TODO: Implement share functionality
            console.log('Share project:', projectId);
        }
    };

    const handleCreateProject = async (data: ProjectCreate | ProjectUpdate) => {
        try {
            if (formMode === 'create') {
                await projectService.createProject(data as ProjectCreate);
                toast.success(t('projects.createSuccess', 'Project created successfully'));
            } else if (selectedProject) {
                await projectService.updateProject(selectedProject.id, data as ProjectUpdate);
                toast.success(t('projects.updateSuccess', 'Project updated successfully'));
            }
            await fetchProjects();
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || err.message || 'Failed to save project';
            toast.error(errorMsg);
            console.error('Error saving project:', err);
            throw err;
        }
    };

    const handleDeleteProject = async () => {
        if (!selectedProject) return;

        try {
            await projectService.deleteProject(selectedProject.id);
            toast.success(t('projects.deleteSuccess', 'Project deleted successfully'));
            await fetchProjects();
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || err.message || 'Failed to delete project';
            toast.error(errorMsg);
            console.error('Error deleting project:', err);
            throw err;
        }
    };

    const handleOpenCreateDialog = () => {
        setSelectedProject(null);
        setFormMode('create');
        setFormDialogOpen(true);
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
            <Container maxWidth="xl">
                {/* Google Drive-style Toolbar */}
                <Toolbar
                    sx={{
                        px: { xs: 1, sm: 2 },
                        py: 2,
                        gap: 2,
                        flexWrap: 'wrap'
                    }}
                >
                    {/* Search Bar */}
                    <TextField
                        placeholder={t('projects.searchPlaceholder', 'Search projects')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        size="small"
                        sx={{
                            flexGrow: 1,
                            maxWidth: { xs: '100%', sm: 600 },
                            '& .MuiOutlinedInput-root': {
                                bgcolor: 'background.paper',
                                borderRadius: 2,
                            }
                        }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                    />

                    {/* Right Actions */}
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', ml: 'auto' }}>
                        {/* View Toggle */}
                        <IconButton
                            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                            size="small"
                        >
                            {viewMode === 'grid' ? <ViewListIcon /> : <ViewModuleIcon />}
                        </IconButton>

                        {/* More Options */}
                        <IconButton
                            size="small"
                            onClick={(e) => setAnchorEl(e.currentTarget)}
                        >
                            <MoreVertIcon />
                        </IconButton>
                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={() => setAnchorEl(null)}
                        >
                            <MenuItem onClick={() => { handleOpenCreateDialog(); setAnchorEl(null); }}>
                                <ListItemIcon>
                                    <CreateNewFolderIcon fontSize="small" />
                                </ListItemIcon>
                                <ListItemText>{t('projects.newProject', 'New Project')}</ListItemText>
                            </MenuItem>
                            <MenuItem onClick={() => setAnchorEl(null)}>
                                <ListItemIcon>
                                    <SortIcon fontSize="small" />
                                </ListItemIcon>
                                <ListItemText>{t('projects.sortBy', 'Sort by')}</ListItemText>
                            </MenuItem>
                        </Menu>
                    </Box>
                </Toolbar>

                {/* Error Alert */}
                {error && (
                    <Alert severity="error" sx={{ mx: 2, mb: 2 }} onClose={() => setError(null)}>
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
                        {/* Projects Grid/List */}
                        {projects.length === 0 ? (
                            <Box sx={{
                                textAlign: 'center',
                                py: 12,
                                px: 2
                            }}>
                                <CreateNewFolderIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
                                <Typography variant="h6" color="text.secondary" gutterBottom>
                                    {searchQuery
                                        ? t('projects.noProjectsFound', 'No projects found')
                                        : t('projects.noProjects', 'No projects yet')}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {searchQuery
                                        ? t('projects.tryDifferentSearch', 'Try a different search')
                                        : t('projects.createFirstProject', 'Create your first project to get started')}
                                </Typography>
                            </Box>
                        ) : (
                            <Box sx={{
                                display: 'grid',
                                gridTemplateColumns: viewMode === 'grid'
                                    ? {
                                        xs: 'repeat(auto-fill, minmax(140px, 1fr))',
                                        sm: 'repeat(auto-fill, minmax(160px, 1fr))',
                                        md: 'repeat(auto-fill, minmax(180px, 1fr))',
                                    }
                                    : '1fr',
                                gap: viewMode === 'grid' ? 2 : 0,
                                p: 2,
                                pt: 1,
                            }}>
                                {projects.map((project) => (
                                    <ProjectCard
                                        key={project.id}
                                        project={project}
                                        viewMode={viewMode}
                                        onAction={handleAction}
                                    />
                                ))}
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
            </Container>
        </Box>
    );
}
