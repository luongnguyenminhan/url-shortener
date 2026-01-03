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
    LinearProgress,
    Button,
    Avatar,
    AvatarGroup,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
} from '@mui/material';
import {
    MoreVert as MoreVertIcon,
    CheckCircle as CheckCircleIcon,
    ArrowForward as ArrowForwardIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
} from '@mui/icons-material';

interface ProjectCardProps {
    project: ProjectResponse;
    photos?: PhotoWithVersions[];
    onAction?: (projectId: string, action: 'open' | 'start' | 'details' | 'archive' | 'edit' | 'delete') => void;
}

// Map project status to UI colors
const statusConfig: Record<string, { color: 'primary' | 'warning' | 'error' | 'success' | 'info' | 'default' }> = {
    [ProjectStatus.DRAFT]: { color: 'primary' },
    [ProjectStatus.CLIENT_SELECTING]: { color: 'warning' },
    [ProjectStatus.PENDING_EDIT]: { color: 'info' },
    [ProjectStatus.CLIENT_REVIEW]: { color: 'info' },
    [ProjectStatus.COMPLETED]: { color: 'success' },
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
        || 'https://images.unsplash.com/photo-1606216794079-c6c2ba0ba06c?w=400&h=300&fit=crop';

    const photoCount = photos.length;

    // Calculate progress based on status
    const getProgress = () => {
        if (project.status === ProjectStatus.COMPLETED) return 100;
        if (project.status === ProjectStatus.CLIENT_REVIEW) return 75;
        if (project.status === ProjectStatus.PENDING_EDIT) return 50;
        if (project.status === ProjectStatus.CLIENT_SELECTING) return 25;
        return 5;
    };

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
    const progress = getProgress();
    const formattedDate = new Date(project.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

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
            sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                transition: 'all 0.2s',
                '&:hover': {
                    boxShadow: 4,
                }
            }}
        >
            <CardMedia
                component="div"
                sx={{
                    height: 200,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundImage: `url('${thumbnailUrl}')`,
                }}
            />

            <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2.5 }}>
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                    <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
                            <Typography variant="h6" component="h3" fontWeight="bold" sx={{ fontSize: '1.1rem' }}>
                                {project.title}
                            </Typography>
                            <Chip
                                label={t(`projects.status.${getStatusKey()}`)}
                                color={statusStyle.color}
                                size="small"
                                sx={{ height: 24 }}
                            />
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                            Client: {project.client_notes || 'No client info'} • {formattedDate}
                        </Typography>
                    </Box>
                    <IconButton size="small" sx={{ mt: -1 }} onClick={handleMenuClick}>
                        <MoreVertIcon fontSize="small" />
                    </IconButton>
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                    >
                        <MenuItem onClick={handleEdit}>
                            <ListItemIcon>
                                <EditIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText>{t('common.edit')}</ListItemText>
                        </MenuItem>
                        <MenuItem onClick={handleDelete}>
                            <ListItemIcon>
                                <DeleteIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText>{t('common.delete')}</ListItemText>
                        </MenuItem>
                    </Menu>
                </Box>

                {/* Members & Photos Info */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1.5 }}>
                    <AvatarGroup max={2} sx={{
                        '& .MuiAvatar-root': {
                            width: 32,
                            height: 32,
                            fontSize: '0.875rem',
                            border: '2px solid white'
                        }
                    }}>
                        <Avatar alt="Member 1" src="https://i.pravatar.cc/150?img=1" />
                        {photoCount > 50 && <Avatar alt="Member 2" src="https://i.pravatar.cc/150?img=2" />}
                        {photoCount > 100 && <Avatar alt="Member 3" src="https://i.pravatar.cc/150?img=3" />}
                    </AvatarGroup>
                    <Typography variant="body2" color="text.secondary" fontWeight="medium">
                        {photoCount} {t('projects.photos')}
                    </Typography>
                </Box>

                {/* Footer */}
                <Box
                    sx={{
                        mt: 'auto',
                        pt: 2.5,
                        borderTop: 1,
                        borderColor: 'divider',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}
                >
                    {project.status !== ProjectStatus.COMPLETED ? (
                        <Box sx={{ flex: 1, maxWidth: 160 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                                <Typography variant="caption" color="text.secondary" fontWeight="medium">
                                    {t('projects.progress')}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" fontWeight="bold">
                                    {progress}%
                                </Typography>
                            </Box>
                            <LinearProgress
                                variant="determinate"
                                value={progress}
                                sx={{ height: 6, borderRadius: 1 }}
                            />
                        </Box>
                    ) : (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <CheckCircleIcon color="success" fontSize="small" />
                            <Typography variant="caption" color="success.main" fontWeight="medium">
                                {t('projects.statusMessages.sentToClient')}
                            </Typography>
                        </Box>
                    )}
                    {getActionButton()}
                </Box>
            </CardContent>
        </Card>
    );
}
