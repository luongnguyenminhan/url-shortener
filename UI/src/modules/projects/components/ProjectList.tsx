import {
    Box,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Chip,
    Button,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Avatar,
    Checkbox,
    TableSortLabel,
    Skeleton,
} from '@mui/material';
import {
    Search as SearchIcon,
    MoreVert as MoreVertIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    ArrowForward as ArrowForwardIcon,
    AccessTime as AccessTimeIcon,
    Share as ShareIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import type { ProjectResponse } from '@/types/project.type';
import { ProjectStatus } from '@/types/project.type';
import type { PhotoWithVersions } from '@/types/photo.type';

interface ProjectListProps {
    projects: ProjectResponse[];
    loading?: boolean;
    searchQuery: string;
    photosMap: Record<string, PhotoWithVersions[]>;
    onAction: (projectId: string, action: 'open' | 'start' | 'details' | 'archive' | 'edit' | 'delete' | 'share') => void;
}

// Map project status to UI colors
const statusConfig: Record<ProjectStatus, { color: 'primary' | 'warning' | 'error' | 'success' | 'info' | 'default', label: string }> = {
    [ProjectStatus.DRAFT]: { color: 'default', label: 'Draft' },
    [ProjectStatus.CLIENT_SELECTING]: { color: 'warning', label: 'Client Selecting' },
    [ProjectStatus.PENDING_EDIT]: { color: 'info', label: 'Pending Edit' },
    [ProjectStatus.CLIENT_REVIEW]: { color: 'info', label: 'Client Review' },
    [ProjectStatus.COMPLETED]: { color: 'success', label: 'Completed' },
};

function ProjectRow({
    project,
    photos,
    onAction,
    selected,
    onSelect
}: {
    project: ProjectResponse,
    photos: PhotoWithVersions[],
    onAction: any,
    selected: boolean,
    onSelect: (id: string) => void
}) {
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
        onAction(project.id, 'edit');
        handleMenuClose();
    };

    const handleDelete = () => {
        onAction(project.id, 'delete');
        handleMenuClose();
    };

    const handleShare = () => {
        onAction(project.id, 'share');
        handleMenuClose();
    };

    const getStatusKey = () => {
        switch (project.status) {
            case ProjectStatus.DRAFT: return 'new';
            case ProjectStatus.CLIENT_SELECTING: return 'inReview';
            case ProjectStatus.CLIENT_REVIEW: return 'inReview';
            case ProjectStatus.COMPLETED: return 'completed';
            default: return 'new';
        }
    };

    const statusStyle = statusConfig[project.status] || statusConfig[ProjectStatus.DRAFT];
    const formattedDate = format(new Date(project.created_at), 'dd/MM/yyyy HH:mm');

    // Get thumbnail image
    const thumbnailUrl = photos[0]?.photo_versions?.find((v: any) => v.version_type === 'thumb' || v.version_type === 'original')?.image_url;

    const getActionButton = () => {
        if (project.status === ProjectStatus.DRAFT) {
            return (
                <Button
                    onClick={() => onAction(project.id, 'start')}
                    endIcon={<ArrowForwardIcon />}
                    size="small"
                    variant="contained"
                    sx={{ borderRadius: 2 }}
                >
                    {t('projects.actions.start')}
                </Button>
            );
        }
        if (project.status === ProjectStatus.COMPLETED) {
            return (
                <Button
                    onClick={() => onAction(project.id, 'details')}
                    endIcon={<ArrowForwardIcon />}
                    size="small"
                    variant="outlined"
                    sx={{ borderRadius: 2 }}
                >
                    {t('projects.actions.details')}
                </Button>
            );
        }
        return (
            <Button
                onClick={() => onAction(project.id, 'open')}
                endIcon={<ArrowForwardIcon />}
                size="small"
                variant="outlined"
                sx={{ borderRadius: 2 }}
            >
                {t('projects.actions.open')}
            </Button>
        );
    };

    return (
        <TableRow
            hover
            selected={selected}
            sx={{
                '&:last-child td, &:last-child th': { border: 0 },
                cursor: 'pointer',
                transition: 'background-color 0.2s',
            }}
            onClick={() => onSelect(project.id)}
        >
            <TableCell padding="checkbox">
                <Checkbox
                    checked={selected}
                    onChange={() => onSelect(project.id)}
                    color="primary"
                />
            </TableCell>
            <TableCell component="th" scope="row">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar
                        src={thumbnailUrl}
                        variant="rounded"
                        sx={{ width: 40, height: 40, bgcolor: 'action.selected' }}
                    >
                        {!thumbnailUrl && project.title.charAt(0)}
                    </Avatar>
                    <Box>
                        <Typography variant="body2" fontWeight="600" color="text.primary">
                            {project.title}
                        </Typography>
                        {project.client_notes && (
                            <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 200, display: 'block' }}>
                                {project.client_notes}
                            </Typography>
                        )}
                    </Box>
                </Box>
            </TableCell>
            <TableCell>
                <Chip
                    label={t(`projects.status.${getStatusKey()}`)}
                    color={statusStyle.color}
                    size="small"
                    variant="filled"
                    sx={{ fontWeight: 600, height: 24 }}
                />
            </TableCell>
            <TableCell>
                <Typography variant="body2" color="text.secondary">{formattedDate}</Typography>
            </TableCell>
            <TableCell>
                {(project.expired_days !== undefined && project.expired_days !== null) ? (
                    <Typography
                        variant="body2"
                        color={(project.expired_days ?? 0) <= 5 ? 'error.main' : 'text.primary'}
                        sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: (project.expired_days ?? 0) <= 5 ? 600 : 400 }}
                    >
                        {(project.expired_days ?? 0) <= 5 && <AccessTimeIcon sx={{ fontSize: 16 }} />}
                        {project.expired_days} {t('projects.form.expiredDaysHelper').replace('Number of days until the project expires', '').trim() ? '' : 'days'}
                    </Typography>
                ) : (
                    <Typography variant="body2" color="text.disabled">—</Typography>
                )}
            </TableCell>
            <TableCell>
                <Typography variant="body2" color="text.secondary">{photos.length}</Typography>
            </TableCell>
            <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                    {getActionButton()}
                    <IconButton size="small" onClick={handleMenuClick}>
                        <MoreVertIcon fontSize="small" />
                    </IconButton>
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    >
                        <MenuItem onClick={handleEdit}>
                            <ListItemIcon>
                                <EditIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText>{t('common.edit')}</ListItemText>
                        </MenuItem>
                        <MenuItem onClick={handleShare}>
                            <ListItemIcon>
                                <ShareIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText>{t('common.share')}</ListItemText>
                        </MenuItem>
                        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
                            <ListItemIcon>
                                <DeleteIcon fontSize="small" color="error" />
                            </ListItemIcon>
                            <ListItemText>{t('common.delete')}</ListItemText>
                        </MenuItem>
                    </Menu>
                </Box>
            </TableCell>
        </TableRow>
    );
}

type Order = 'asc' | 'desc';

interface HeadCell {
    id: keyof ProjectResponse | 'photo_count'; // Add computed columns if needed
    label: string;
    numeric: boolean;
    sortable: boolean;
}

const headCells: HeadCell[] = [
    { id: 'title', label: 'projects.form.title', numeric: false, sortable: true },
    { id: 'status', label: 'projects.form.status', numeric: false, sortable: true },
    { id: 'created_at', label: 'common.created', numeric: false, sortable: true },
    { id: 'expired_days', label: 'projects.form.expiredDays', numeric: false, sortable: true },
    { id: 'photo_count' as any, label: 'projects.photos', numeric: true, sortable: false }, // Computed, complicated to sort client side with pagination if mixed, but ok for now
];

export function ProjectList({
    projects,
    loading = false,
    searchQuery,
    photosMap,
    onAction
}: ProjectListProps) {
    const { t } = useTranslation();
    const [order, setOrder] = useState<Order>('desc');
    const [orderBy, setOrderBy] = useState<keyof ProjectResponse>('created_at');
    const [selected, setSelected] = useState<string[]>([]);

    const handleRequestSort = (property: keyof ProjectResponse) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            const newSelected = projects.map((n) => n.id);
            setSelected(newSelected);
            return;
        }
        setSelected([]);
    };

    const handleClick = (id: string) => {
        const selectedIndex = selected.indexOf(id);
        let newSelected: string[] = [];

        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selected, id);
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selected.slice(1));
        } else if (selectedIndex === selected.length - 1) {
            newSelected = newSelected.concat(selected.slice(0, -1));
        } else if (selectedIndex > 0) {
            newSelected = newSelected.concat(
                selected.slice(0, selectedIndex),
                selected.slice(selectedIndex + 1),
            );
        }
        setSelected(newSelected);
    };

    const sortedProjects = useMemo(() => {
        return [...projects].sort((a, b) => {
            const isAsc = order === 'asc';
            if (orderBy === 'expired_days') {
                return isAsc
                    ? (a.expired_days ?? -1) - (b.expired_days ?? -1)
                    : (b.expired_days ?? -1) - (a.expired_days ?? -1);
            }
            if (orderBy === 'created_at') {
                return isAsc
                    ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                    : new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            }
            // Add string sorting for other fields if needed, simplified for numeric/date usually
            return 0;
        });
    }, [projects, order, orderBy]);

    if (projects.length === 0 && !loading) {
        return (
            <Paper
                elevation={0}
                sx={{
                    py: 8,
                    textAlign: 'center',
                    bgcolor: 'background.paper',
                    mt: 4,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2
                }}
            >
                <SearchIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                    {t('projects.noProjectsFound')}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {searchQuery ? t('projects.tryDifferentSearch') : t('projects.createFirstProject')}
                </Typography>
            </Paper>
        );
    }

    return (
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflowX: 'auto' }}>
            <Table sx={{ minWidth: 700 }} aria-label="projects table">
                <TableHead sx={{ bgcolor: 'background.default' }}>
                    <TableRow>
                        <TableCell padding="checkbox">
                            <Checkbox
                                color="primary"
                                indeterminate={selected.length > 0 && selected.length < projects.length}
                                checked={projects.length > 0 && selected.length === projects.length}
                                onChange={handleSelectAllClick}
                            />
                        </TableCell>
                        {headCells.map((headCell) => (
                            <TableCell
                                key={headCell.id}
                                align={headCell.numeric ? 'right' : 'left'}
                                sortDirection={orderBy === headCell.id ? order : false}
                                sx={{ fontWeight: 600 }}
                            >
                                {headCell.sortable ? (
                                    <TableSortLabel
                                        active={orderBy === headCell.id}
                                        direction={orderBy === headCell.id ? order : 'asc'}
                                        onClick={() => handleRequestSort(headCell.id as keyof ProjectResponse)}
                                    >
                                        {t(headCell.label)}
                                    </TableSortLabel>
                                ) : (
                                    t(headCell.label)
                                )}
                            </TableCell>
                        ))}
                        <TableCell align="right" sx={{ fontWeight: 600 }}>{t('common.actions')}</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {loading ? (
                        Array.from(new Array(5)).map((_, index) => (
                            <TableRow key={index}>
                                <TableCell padding="checkbox"><Skeleton variant="rectangular" width={24} height={24} /></TableCell>
                                <TableCell><Box sx={{ display: 'flex', gap: 2 }}><Skeleton variant="rounded" width={40} height={40} /><Box><Skeleton width={120} /><Skeleton width={80} /></Box></Box></TableCell>
                                <TableCell><Skeleton width={80} /></TableCell>
                                <TableCell><Skeleton width={100} /></TableCell>
                                <TableCell><Skeleton width={40} /></TableCell>
                                <TableCell><Skeleton width={40} /></TableCell>
                                <TableCell align="right"><Skeleton width={100} /></TableCell>
                            </TableRow>
                        ))
                    ) : sortedProjects.map((project) => (
                        <ProjectRow
                            key={project.id}
                            project={project}
                            photos={photosMap[project.id] || []}
                            onAction={onAction}
                            selected={selected.indexOf(project.id) !== -1}
                            onSelect={handleClick}
                        />
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
