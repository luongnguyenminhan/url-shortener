import { useState, useEffect } from 'react';
import { Box, Card, CardContent, Chip, Typography, Stack, Divider, IconButton, Tooltip } from '@mui/material';
import {
    CalendarToday,
    Person,
    Info,
    Image as ImageIcon,
    Link as LinkIcon,
    ContentCopy as CopyIcon,
} from '@mui/icons-material';
import type { ProjectDetailResponse } from '@/types/project.type';
import { format } from 'date-fns';
import { projectService } from '@/services/projectService';
import { showSuccessToast } from '@/hooks/useShowToast';

interface ProjectDetailInfoProps {
    project: ProjectDetailResponse;
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

export const ProjectDetailInfo: React.FC<ProjectDetailInfoProps> = ({ project }) => {
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
        <Card sx={{ height: '100%' }}>
            <CardContent>
                <Typography variant="h5" gutterBottom fontWeight="bold">
                    {project.title}
                </Typography>

                <Chip
                    label={statusLabels[project.status] || project.status}
                    color={statusColors[project.status] || 'default'}
                    size="small"
                    sx={{ mb: 3 }}
                />

                <Divider sx={{ mb: 3 }} />

                <Stack spacing={2.5}>
                    <Box display="flex" alignItems="center" gap={1.5}>
                        <ImageIcon color="action" />
                        <Box>
                            <Typography variant="caption" color="text.secondary" display="block">
                                Số lượng ảnh
                            </Typography>
                            <Typography variant="body1" fontWeight="medium">
                                {project.images_count} ảnh
                            </Typography>
                        </Box>
                    </Box>

                    <Box display="flex" alignItems="center" gap={1.5}>
                        <CalendarToday color="action" />
                        <Box>
                            <Typography variant="caption" color="text.secondary" display="block">
                                Ngày tạo
                            </Typography>
                            <Typography variant="body1">
                                {format(new Date(project.created_at), 'dd/MM/yyyy HH:mm')}
                            </Typography>
                        </Box>
                    </Box>

                    <Box display="flex" alignItems="center" gap={1.5}>
                        <CalendarToday color="action" />
                        <Box>
                            <Typography variant="caption" color="text.secondary" display="block">
                                Cập nhật lần cuối
                            </Typography>
                            <Typography variant="body1">
                                {format(new Date(project.updated_at), 'dd/MM/yyyy HH:mm')}
                            </Typography>
                        </Box>
                    </Box>

                    {project.expired_date && (
                        <Box display="flex" alignItems="center" gap={1.5}>
                            <CalendarToday color="action" />
                            <Box>
                                <Typography variant="caption" color="text.secondary" display="block">
                                    Ngày hết hạn
                                </Typography>
                                <Typography variant="body1" color="error">
                                    {format(new Date(project.expired_date), 'dd/MM/yyyy HH:mm')}
                                </Typography>
                            </Box>
                        </Box>
                    )}

                    <Box display="flex" alignItems="center" gap={1.5}>
                        <Person color="action" />
                        <Box>
                            <Typography variant="caption" color="text.secondary" display="block">
                                ID chủ sở hữu
                            </Typography>
                            <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                                {project.owner_id}
                            </Typography>
                        </Box>
                    </Box>

                    {shareLink && (
                        <>
                            <Divider />
                            <Box display="flex" alignItems="flex-start" gap={1.5}>
                                <LinkIcon color="action" />
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="caption" color="text.secondary" display="block">
                                        Link chia sẻ
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            mt: 0.5,
                                            wordBreak: 'break-all',
                                            color: 'primary.main',
                                            cursor: 'pointer'
                                        }}
                                        onClick={handleCopyLink}
                                    >
                                        {shareLink}
                                    </Typography>
                                    {expiresAt && (
                                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                                            Hết hạn: {format(new Date(expiresAt), 'dd/MM/yyyy HH:mm')}
                                        </Typography>
                                    )}
                                </Box>
                                <Tooltip title="Copy link">
                                    <IconButton size="small" onClick={handleCopyLink}>
                                        <CopyIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        </>
                    )}

                    {project.client_notes && (
                        <>
                            <Divider />
                            <Box display="flex" alignItems="flex-start" gap={1.5}>
                                <Info color="action" />
                                <Box>
                                    <Typography variant="caption" color="text.secondary" display="block">
                                        Ghi chú của khách hàng
                                    </Typography>
                                    <Typography variant="body1" sx={{ mt: 0.5, whiteSpace: 'pre-wrap' }}>
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
