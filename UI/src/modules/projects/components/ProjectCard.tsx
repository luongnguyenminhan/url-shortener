import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ProjectResponse } from '@/types/project.type';
import { ProjectStatus } from '@/types/project.type';
import type { PhotoWithVersions } from '@/types/photo.type';
import {
    Card,
    CardContent,
    CardMedia,
    Typography,
    Chip,
    Box,
    IconButton,
    Button,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
} from '@mui/material';
import {
    MoreVert as MoreVertIcon,
    ArrowForward as ArrowForwardIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    AccessTime as AccessTimeIcon,
    PhotoLibrary as PhotoLibraryIcon,
} from '@mui/icons-material';

interface ProjectCardProps {
    project: ProjectResponse;
    photos?: PhotoWithVersions[];
    onAction?: (projectId: string, action: 'open' | 'start' | 'details' | 'archive' | 'edit' | 'delete') => void;
}

// Map project status to UI colors
const statusConfig: Record<ProjectStatus, { color: 'primary' | 'warning' | 'error' | 'success' | 'info' | 'default', label: string }> = {
    [ProjectStatus.DRAFT]: { color: 'default', label: 'Draft' }, // Neutral for draft
    [ProjectStatus.CLIENT_SELECTING]: { color: 'warning', label: 'Client Selecting' },
    [ProjectStatus.PENDING_EDIT]: { color: 'info', label: 'Pending Edit' },
    [ProjectStatus.CLIENT_REVIEW]: { color: 'info', label: 'Client Review' },
    [ProjectStatus.COMPLETED]: { color: 'success', label: 'Completed' },
};

export function ProjectCard({ project, photos = [], onAction }: ProjectCardProps) {
    const { t } = useTranslation();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleEdit = () => {
        onAction?.(project.id, 'edit');
        handleMenuClose();
    };

    const handleDelete = () => {
        onAction?.(project.id, 'delete');
        handleMenuClose();
    };

    // Get thumbnail image from first photo
    const thumbnailUrl = photos[0]?.photo_versions?.find((v: any) => v.version_type === 'original')?.image_url
        || 'https://cdn4.iconfinder.com/data/icons/24x24-grid-line-symbols-3-1/1024/photo_album_app_software_mobile-512.png';

    const photoCount = photos.length;

    const getActionButton = () => {
        if (project.status === ProjectStatus.DRAFT) {
            return (
                <Button
                    onClick={() => onAction?.(project.id, 'start')}
                    endIcon={<ArrowForwardIcon />}
                    size="small"
                >
                    {t('projects.actions.start')}
                </Button>
            );
        }
        if (project.status === ProjectStatus.COMPLETED) {
            return (
                <Button
                    onClick={() => onAction?.(project.id, 'details')}
                    endIcon={<ArrowForwardIcon />}
                    size="small"
                >
                    {t('projects.actions.details')}
                </Button>
            );
        }
        return (
            <Button
                onClick={() => onAction?.(project.id, 'open')}
                endIcon={<ArrowForwardIcon />}
                size="small"
            >
                {t('projects.actions.open')}
            </Button>
        );
    };

    const statusStyle = statusConfig[project.status] || statusConfig[ProjectStatus.DRAFT];

    // Format date
    const formattedDate = new Date(project.created_at).toLocaleDateString();

    // Get status translation key
    const getStatusKey = () => {
        switch (project.status) {
            case ProjectStatus.DRAFT: return 'new';
            case ProjectStatus.CLIENT_SELECTING: return 'inReview';
            case ProjectStatus.CLIENT_REVIEW: return 'inReview';
            case ProjectStatus.COMPLETED: return 'completed';
            default: return 'new';
        }
    };

    return (
        <Card
            elevation={0}
            sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                overflow: 'visible', // Allow menu to not be clipped if needed, though usually hidden is safer. keeping hidden for image
                position: 'relative',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 24px -10px rgba(0, 0, 0, 0.15)',
                    borderColor: 'primary.main',
                }
            }}
        >
            <Box sx={{ position: 'relative' }}>
                <CardMedia
                    component="div"
                    sx={{
                        height: 200,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundImage: `url('${thumbnailUrl}')`,
                        borderTopLeftRadius: 12,
                        borderTopRightRadius: 12,
                    }}
                />

                {/* Status Badge Overlay */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: 12,
                        left: 12,
                        display: 'flex',
                        gap: 1
                    }}
                >
                    <Chip
                        label={t(`projects.status.${getStatusKey()}`)}
                        color={statusStyle.color}
                        size="small"
                        sx={{
                            fontWeight: 600,
                            backdropFilter: 'blur(4px)',
                            boxShadow: 1
                        }}
                    />
                </Box>

                {/* More Menu Button Overlay */}
                <IconButton
                    size="small"
                    onClick={handleMenuClick}
                    sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        bgcolor: 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(4px)',
                        '&:hover': {
                            bgcolor: 'rgba(255, 255, 255, 0.95)',
                        }
                    }}
                >
                    <MoreVertIcon fontSize="small" />
                </IconButton>
            </Box>

            <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2.5 }}>
                {/* Header */}
                <Box sx={{ mb: 2 }}>
                    <Typography
                        variant="h6"
                        component="h3"
                        fontWeight="700"
                        noWrap
                        title={project.title}
                        sx={{ fontSize: '1.1rem', mb: 0.5 }}
                    >
                        {project.title}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, color: 'text.secondary' }}>
                        <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            {formattedDate}
                        </Typography>
                        {project.expired_days !== undefined && (
                            <Typography
                                variant="caption"
                                color={(project.expired_days ?? 0) <= 5 ? 'error.main' : 'text.secondary'}
                                sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 500 }}
                            >
                                <AccessTimeIcon sx={{ fontSize: 14 }} />
                                {project.expired_days} {t('common.daysLeft')}
                            </Typography>
                        )}
                    </Box>
                </Box>

                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    PaperProps={{
                        elevation: 3,
                        sx: { borderRadius: 2, minWidth: 150, mt: 1 }
                    }}
                >
                    <MenuItem onClick={handleEdit}>
                        <ListItemIcon>
                            <EditIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>{t('common.edit')}</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
                        <ListItemIcon>
                            <DeleteIcon fontSize="small" color="error" />
                        </ListItemIcon>
                        <ListItemText>{t('common.delete')}</ListItemText>
                    </MenuItem>
                </Menu>

                {/* Details */}
                {project.client_notes && (
                    <Box sx={{
                        mb: 2,
                        p: 1.5,
                        bgcolor: 'action.hover',
                        borderRadius: 2,
                        border: '1px dashed',
                        borderColor: 'divider'
                    }}>
                        <Typography variant="caption" color="text.secondary" fontWeight="600" display="block" mb={0.5}>
                            {t('projects.clientNotes')}:
                        </Typography>
                        <Typography variant="body2" color="text.primary" sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            lineHeight: 1.4
                        }}>
                            {project.client_notes}
                        </Typography>
                    </Box>
                )}

                {/* Footer */}
                <Box
                    sx={{
                        mt: 'auto',
                        pt: 2,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                        <PhotoLibraryIcon sx={{ fontSize: 16 }} />
                        <Typography variant="caption" fontWeight="500">
                            {photoCount}
                        </Typography>
                    </Box>
                    {getActionButton()}
                </Box>
            </CardContent>
        </Card>
    );
}
