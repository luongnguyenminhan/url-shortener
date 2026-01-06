import { useState, useEffect } from 'react';
import { Box, Card, CardContent, Chip, Typography, Stack, Divider, IconButton, Tooltip, useTheme } from '@mui/material';
import {
    CalendarToday,
    Person,
    Info,
    Image as ImageIcon,
    Link as LinkIcon,
    ContentCopy as CopyIcon,
    Edit as EditIcon,
} from '@mui/icons-material';
import type { ProjectDetailResponse } from '@/types/project.type';
import { format } from 'date-fns';
import { projectService } from '@/services/projectService';
import { showSuccessToast } from '@/hooks/useShowToast';

interface ProjectDetailInfoProps {
    project: ProjectDetailResponse;
    onStatusUpdate?: () => void;
}

const statusColors: Record<string, 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error'> = {
    draft: 'default',
    client_selecting: 'primary',
    pending_edit: 'warning',
    client_review: 'secondary',
    completed: 'success',
};

const statusLabels: Record<string, string> = {
    draft: 'Bản nháp',
    client_selecting: 'Khách hàng đang chọn',
    pending_edit: 'Chờ chỉnh sửa',
    client_review: 'Khách hàng đánh giá',
    completed: 'Hoàn thành',
};

export const ProjectDetailInfo: React.FC<ProjectDetailInfoProps> = ({ project, onStatusUpdate }) => {
    const theme = useTheme();
    const [shareLink, setShareLink] = useState<string | null>(null);
    const [expiresAt, setExpiresAt] = useState<string | null>(null);

    useEffect(() => {
        const fetchShareLink = async () => {
            try {
                const activeToken = await projectService.getActiveProjectToken(project.id);
                if (activeToken) {
                    const baseUrl = window.location.origin;
                    const link = `${baseUrl}/shared/${project.id}?token=${activeToken.token}`;
                    setShareLink(link);
                    setExpiresAt(activeToken.expires_at);
                }
            } catch (error) {
                console.error('Failed to fetch share link:', error);
            }
        };

        fetchShareLink();
    }, [project.id]);

    const handleCopyLink = async () => {
        if (shareLink) {
            try {
                await navigator.clipboard.writeText(shareLink);
                showSuccessToast('Đã copy link chia sẻ');
            } catch (error) {
                console.error('Failed to copy:', error);
            }
        }
    };

    return (
        <Card sx={{
            height: '100%',
            bgcolor: theme.palette.mode === 'light' ? '#ffffff' : '#343a40',
            boxShadow: 'var(--shadow-md)',
        }}>
            <CardContent>
                <Typography variant="h5" gutterBottom fontWeight="bold" sx={{ color: theme.palette.mode === 'light' ? '#212121' : '#c2c7d0' }}>
                    {project.title}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                    <Chip
                        label={statusLabels[project.status] || project.status}
                        color={statusColors[project.status] || 'default'}
                        size="small"
                    />
                    {onStatusUpdate && (
                        <Tooltip title="Chỉnh sửa trạng thái">
                            <IconButton
                                size="small"
                                onClick={onStatusUpdate}
                                sx={{
                                    color: theme.palette.mode === 'light' ? '#212121' : '#c2c7d0',
                                    '&:hover': {
                                        bgcolor: theme.palette.mode === 'light' ? '#f5f5f5' : '#1f2d3d',
                                    },
                                }}
                            >
                                <EditIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    )}
                </Box>

                <Divider sx={{ mb: 3, borderColor: theme.palette.mode === 'light' ? '#e0e0e0' : '#4b545c' }} />

                <Stack spacing={2.5}>
                    <Box display="flex" alignItems="center" gap={1.5}>
                        <ImageIcon sx={{ color: theme.palette.mode === 'light' ? '#616161' : '#6c757d' }} />
                        <Box>
                            <Typography variant="caption" display="block" sx={{ color: theme.palette.mode === 'light' ? '#616161' : '#6c757d' }}>
                                Số lượng ảnh
                            </Typography>
                            <Typography variant="body1" fontWeight="medium" sx={{ color: theme.palette.mode === 'light' ? '#212121' : '#c2c7d0' }}>
                                {project.images_count} ảnh
                            </Typography>
                        </Box>
                    </Box>

                    <Box display="flex" alignItems="center" gap={1.5}>
                        <CalendarToday sx={{ color: theme.palette.mode === 'light' ? '#616161' : '#6c757d' }} />
                        <Box>
                            <Typography variant="caption" display="block" sx={{ color: theme.palette.mode === 'light' ? '#616161' : '#6c757d' }}>
                                Ngày tạo
                            </Typography>
                            <Typography variant="body1" sx={{ color: theme.palette.mode === 'light' ? '#212121' : '#c2c7d0' }}>
                                {format(new Date(project.created_at), 'dd/MM/yyyy HH:mm')}
                            </Typography>
                        </Box>
                    </Box>

                    <Box display="flex" alignItems="center" gap={1.5}>
                        <CalendarToday sx={{ color: theme.palette.mode === 'light' ? '#616161' : '#6c757d' }} />
                        <Box>
                            <Typography variant="caption" display="block" sx={{ color: theme.palette.mode === 'light' ? '#616161' : '#6c757d' }}>
                                Cập nhật lần cuối
                            </Typography>
                            <Typography variant="body1" sx={{ color: theme.palette.mode === 'light' ? '#212121' : '#c2c7d0' }}>
                                {format(new Date(project.updated_at), 'dd/MM/yyyy HH:mm')}
                            </Typography>
                        </Box>
                    </Box>

                    {project.expired_date && (
                        <Box display="flex" alignItems="center" gap={1.5}>
                            <CalendarToday sx={{ color: theme.palette.mode === 'light' ? '#616161' : '#6c757d' }} />
                            <Box>
                                <Typography variant="caption" display="block" sx={{ color: theme.palette.mode === 'light' ? '#616161' : '#6c757d' }}>
                                    Ngày hết hạn
                                </Typography>
                                <Typography variant="body1" sx={{ color: '#d32f2f' }}>
                                    {format(new Date(project.expired_date), 'dd/MM/yyyy HH:mm')}
                                </Typography>
                            </Box>
                        </Box>
                    )}

                    <Box display="flex" alignItems="center" gap={1.5}>
                        <Person sx={{ color: theme.palette.mode === 'light' ? '#616161' : '#6c757d' }} />
                        <Box>
                            <Typography variant="caption" display="block" sx={{ color: theme.palette.mode === 'light' ? '#616161' : '#6c757d' }}>
                                ID chủ sở hữu
                            </Typography>
                            <Typography variant="body2" sx={{ wordBreak: 'break-all', color: theme.palette.mode === 'light' ? '#212121' : '#c2c7d0' }}>
                                {project.owner_id}
                            </Typography>
                        </Box>
                    </Box>

                    {shareLink && (
                        <>
                            <Divider sx={{ borderColor: theme.palette.mode === 'light' ? '#e0e0e0' : '#4b545c' }} />
                            <Box display="flex" alignItems="flex-start" gap={1.5}>
                                <LinkIcon sx={{ color: theme.palette.mode === 'light' ? '#616161' : '#6c757d' }} />
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="caption" display="block" sx={{ color: theme.palette.mode === 'light' ? '#616161' : '#6c757d' }}>
                                        Link chia sẻ
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            mt: 0.5,
                                            wordBreak: 'break-all',
                                            color: '#1976d2',
                                            cursor: 'pointer'
                                        }}
                                        onClick={handleCopyLink}
                                    >
                                        {shareLink}
                                    </Typography>
                                    {expiresAt && (
                                        <Typography variant="caption" display="block" sx={{ mt: 0.5, color: theme.palette.mode === 'light' ? '#616161' : '#6c757d' }}>
                                            Hết hạn: {format(new Date(expiresAt), 'dd/MM/yyyy HH:mm')}
                                        </Typography>
                                    )}
                                </Box>
                                <Tooltip title="Copy link">
                                    <IconButton
                                        size="small"
                                        onClick={handleCopyLink}
                                        sx={{
                                            color: theme.palette.mode === 'light' ? '#212121' : '#c2c7d0',
                                            '&:hover': {
                                                bgcolor: theme.palette.mode === 'light' ? '#f5f5f5' : '#1f2d3d',
                                            },
                                        }}
                                    >
                                        <CopyIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        </>
                    )}

                    {project.client_notes && (
                        <>
                            <Divider sx={{ borderColor: theme.palette.mode === 'light' ? '#e0e0e0' : '#4b545c' }} />
                            <Box display="flex" alignItems="flex-start" gap={1.5}>
                                <Info sx={{ color: theme.palette.mode === 'light' ? '#616161' : '#6c757d' }} />
                                <Box>
                                    <Typography variant="caption" display="block" sx={{ color: theme.palette.mode === 'light' ? '#616161' : '#6c757d' }}>
                                        Ghi chú của khách hàng
                                    </Typography>
                                    <Typography variant="body1" sx={{ mt: 0.5, whiteSpace: 'pre-wrap', color: theme.palette.mode === 'light' ? '#212121' : '#c2c7d0' }}>
                                        {project.client_notes}
                                    </Typography>
                                </Box>
                            </Box>
                        </>
                    )}
                </Stack>
            </CardContent>
        </Card>
    );
};
