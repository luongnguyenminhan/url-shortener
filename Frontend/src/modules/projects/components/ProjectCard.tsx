import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ProjectResponse } from '@/types/project.type';
import { ProjectStatus } from '@/types/project.type';
import {
    Box,
    Typography,
    IconButton,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Card,
    ListItemButton,
    Chip,
} from '@mui/material';
import {
    Folder as FolderIcon,
    MoreVert as MoreVertIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    FolderOpen as FolderOpenIcon,
    Schedule as ScheduleIcon,
    Share as ShareIcon,
} from '@mui/icons-material';
import { ShareProjectDialog } from './ShareProjectDialog';

interface ProjectCardProps {
    project: ProjectResponse;
    viewMode: 'grid' | 'list';
    onAction?: (projectId: string, action: 'open' | 'edit' | 'delete' | 'share') => void;
}

export function ProjectCard({ project, viewMode, onAction }: ProjectCardProps) {
    const { t } = useTranslation();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [isHovered, setIsHovered] = useState(false);
    const [shareDialogOpen, setShareDialogOpen] = useState(false);

    const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        onAction?.(project.id, 'edit');
        handleMenuClose();
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        onAction?.(project.id, 'delete');
        handleMenuClose();
    };

    const handleShare = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShareDialogOpen(true);
        handleMenuClose();
    };

    const handleOpen = () => {
        onAction?.(project.id, 'open');
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return t('common.today', 'Today');
        if (diffDays === 1) return t('common.yesterday', 'Yesterday');
        if (diffDays < 7) return `${diffDays} ${t('common.daysAgo', 'days ago')}`;

        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const getStatusColor = (status: string): 'default' | 'primary' | 'warning' | 'success' | 'error' | 'info' => {
        switch (status) {
            case ProjectStatus.DRAFT: return 'default';
            case ProjectStatus.CLIENT_SELECTING: return 'warning';
            case ProjectStatus.PENDING_EDIT: return 'info';
            case ProjectStatus.CLIENT_REVIEW: return 'info';
            case ProjectStatus.COMPLETED: return 'success';
            default: return 'default';
        }
    };

    const getStatusLabel = (status: string) => {
        return t(`projects.status.${status}`, status);
    };

    const statusColor = getStatusColor(project.status);
    const statusLabel = getStatusLabel(project.status);

    // Grid View Card (Google Drive style)
    if (viewMode === 'grid') {
        return (
            <Card
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={handleOpen}
                sx={{
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    border: '1px solid',
                    borderColor: 'divider',
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: 2,
                        borderColor: 'primary.main',
                    },
                    borderRadius: 2,
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 1,
                }}
            >
                {/* Folder Icon */}
                <Box sx={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
                    {isHovered ? (
                        <FolderOpenIcon sx={{ fontSize: 64, color: 'primary.main' }} />
                    ) : (
                        <FolderIcon sx={{ fontSize: 64, color: 'primary.main' }} />
                    )}

                    {/* More Menu Button */}
                    <IconButton
                        size="small"
                        onClick={handleMenuClick}
                        sx={{
                            position: 'absolute',
                            top: -8,
                            right: -8,
                            opacity: isHovered ? 1 : 0,
                            transition: 'opacity 0.2s',
                        }}
                    >
                        <MoreVertIcon fontSize="small" />
                    </IconButton>
                </Box>

                {/* Project Title */}
                <Typography
                    variant="body2"
                    sx={{
                        fontWeight: 500,
                        textAlign: 'center',
                        width: '100%',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                    }}
                >
                    {project.title}
                </Typography>

                {/* Status & Images Count */}
                <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <Chip
                        label={statusLabel}
                        color={statusColor}
                        size="small"
                        sx={{ height: 20, fontSize: '0.7rem' }}
                    />
                    {project.images_count > 0 && (
                        <Chip
                            label={`${project.images_count} ${t('projects.images', 'images')}`}
                            size="small"
                            variant="outlined"
                            sx={{ height: 20, fontSize: '0.7rem' }}
                        />
                    )}
                </Box>

                {/* Last Modified */}
                <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ textAlign: 'center' }}
                >
                    {formatDate(project.updated_at)}
                </Typography>

                {/* Context Menu */}
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    onClick={(e) => e.stopPropagation()}
                >
                    <MenuItem onClick={handleEdit}>
                        <ListItemIcon>
                            <EditIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>{t('common.edit', 'Edit')}</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={handleShare}>
                        <ListItemIcon>
                            <ShareIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>{t('projects.share', 'Share')}</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={handleDelete}>
                        <ListItemIcon>
                            <DeleteIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>{t('common.delete', 'Delete')}</ListItemText>
                    </MenuItem>
                </Menu>

                {/* Share Dialog */}
                <ShareProjectDialog
                    open={shareDialogOpen}
                    onClose={() => setShareDialogOpen(false)}
                    projectId={project.id}
                    projectTitle={project.title}
                />
            </Card>
        );
    }

    // List View (Google Drive style)
    return (
        <ListItemButton
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={handleOpen}
            sx={{
                py: 1.5,
                px: 2,
                borderRadius: 1,
                '&:hover': {
                    bgcolor: 'action.hover',
                },
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2 }}>
                {/* Folder Icon */}
                {isHovered ? (
                    <FolderOpenIcon sx={{ fontSize: 24, color: 'primary.main' }} />
                ) : (
                    <FolderIcon sx={{ fontSize: 24, color: 'primary.main' }} />
                )}

                {/* Project Title */}
                <Typography
                    variant="body2"
                    sx={{
                        flexGrow: 1,
                        fontWeight: 500,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                    }}
                >
                    {project.title}
                </Typography>

                {/* Status */}
                <Chip
                    label={statusLabel}
                    color={statusColor}
                    size="small"
                    sx={{
                        height: 24,
                        display: { xs: 'none', md: 'flex' },
                        minWidth: 100
                    }}
                />

                {/* Images Count */}
                {project.images_count > 0 && (
                    <Box sx={{
                        display: { xs: 'none', sm: 'flex' },
                        alignItems: 'center',
                        gap: 0.5,
                        minWidth: 80
                    }}>
                        <ScheduleIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                            {project.images_count} {t('projects.images', 'images')}
                        </Typography>
                    </Box>
                )}

                {/* Last Modified */}
                <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                        minWidth: 120,
                        textAlign: 'right',
                        display: { xs: 'none', sm: 'block' },
                    }}
                >
                    {formatDate(project.updated_at)}
                </Typography>

                {/* More Menu Button */}
                <IconButton
                    size="small"
                    onClick={handleMenuClick}
                    sx={{
                        opacity: isHovered ? 1 : 0,
                        transition: 'opacity 0.2s',
                    }}
                >
                    <MoreVertIcon fontSize="small" />
                </IconButton>

                {/* Context Menu */}
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    onClick={(e) => e.stopPropagation()}
                >
                    <MenuItem onClick={handleEdit}>
                        <ListItemIcon>
                            <EditIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>{t('common.edit', 'Edit')}</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={handleShare}>
                        <ListItemIcon>
                            <ShareIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>{t('projects.share', 'Share')}</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={handleDelete}>
                        <ListItemIcon>
                            <DeleteIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>{t('common.delete', 'Delete')}</ListItemText>
                    </MenuItem>
                </Menu>

                {/* Share Dialog */}
                <ShareProjectDialog
                    open={shareDialogOpen}
                    onClose={() => setShareDialogOpen(false)}
                    projectId={project.id}
                    projectTitle={project.title}
                />
            </Box>
        </ListItemButton>
    );
}
