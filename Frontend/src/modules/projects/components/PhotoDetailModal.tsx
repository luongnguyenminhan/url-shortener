import { useState, useEffect } from 'react';
import {
    Dialog,
    Box,
    IconButton,
    Typography,
    Stack,
    Divider,
    CircularProgress,
    Alert,
    Avatar,
    TextField,
    Paper,
    Select,
    MenuItem,
    FormControl,
} from '@mui/material';
import {
    Close,
    NavigateBefore,
    NavigateNext,
    Info as InfoIcon,
    ChatBubbleOutline,
    Send,
    CheckCircle,
    CloudUpload,
} from '@mui/icons-material';
import type { Photo, PhotoComment } from '@/types/photo.type';
import { photoService } from '@/services/photoService';
import { formatDistanceToNow, format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Button } from '@mui/material';
import { showSuccessToast, showErrorToast } from '@/hooks/useShowToast';

interface PhotoDetailModalProps {
    open: boolean;
    photo: Photo | null;
    photos: Photo[];
    onClose: () => void;
    onNavigate: (direction: 'prev' | 'next') => void;
    onDelete?: (photoId: string) => void;
    onApprove?: (photoId: string) => void;
    onReject?: (photoId: string) => void;
    onToggleSelect?: (photoId: string, selected: boolean) => void;
    projectStatus?: string;
    projectId?: string;
}

export const PhotoDetailModal: React.FC<PhotoDetailModalProps> = ({
    open,
    photo,
    photos,
    onClose,
    onNavigate,
    onDelete,
    onApprove,
    onReject,
    onToggleSelect,
    projectStatus,
    projectId,
}) => {
    const [imageUrl, setImageUrl] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [comments, setComments] = useState<PhotoComment[]>([]);
    const [loadingComments, setLoadingComments] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showInfo, setShowInfo] = useState(true);
    const [newComment, setNewComment] = useState('');
    const [selectedVersion, setSelectedVersion] = useState<'original' | 'edited'>('original');
    const [uploading, setUploading] = useState(false);

    const currentIndex = photos.findIndex((p) => p.id === photo?.id);
    const hasPrev = currentIndex > 0;
    const hasNext = currentIndex < photos.length - 1;

    useEffect(() => {
        if (photo && open) {
            loadPhotoData();
        }

        return () => {
            if (imageUrl && imageUrl.startsWith('blob:')) {
                URL.revokeObjectURL(imageUrl);
            }
        };
    }, [photo?.id, open, selectedVersion]);

    const loadPhotoData = async () => {
        if (!photo) return;

        setLoading(true);
        setLoadingComments(true);
        setError(null);

        try {
            // Load full-size image with selected version
            const url = await photoService.getPhotoImage(photo.id, {
                is_thumbnail: false,
                version: selectedVersion
            });
            setImageUrl(url);
            setError(null); // Clear any previous errors

            // Load metadata with comments
            try {
                const metadata = await photoService.getPhotoMeta(photo.id);
                setComments(metadata.comments || []);
            } catch (err) {
                console.error('Failed to load comments:', err);
                setComments([]);
            }
        } catch (err: any) {
            console.error('Failed to load photo:', err);
            const errorMsg = selectedVersion === 'edited' && !photo.edited_version
                ? 'Ảnh chưa có phiên bản đã chỉnh sửa'
                : 'Không thể tải ảnh';
            setError(errorMsg);
            // Reset to original version if edited version fails
            if (selectedVersion === 'edited' && !photo.edited_version) {
                setSelectedVersion('original');
            }
        } finally {
            setLoading(false);
            setLoadingComments(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowLeft' && hasPrev) {
            onNavigate('prev');
        } else if (e.key === 'ArrowRight' && hasNext) {
            onNavigate('next');
        } else if (e.key === 'Escape') {
            onClose();
        }
    };

    const formatTime = (dateString: string) => {
        try {
            const date = new Date(dateString);
            const now = new Date();
            const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

            if (diffInHours < 24) {
                return formatDistanceToNow(date, {
                    addSuffix: true,
                    locale: vi,
                });
            }
            return format(date, 'dd/MM/yyyy HH:mm', { locale: vi });
        } catch {
            return dateString;
        }
    };

    const handleSendComment = () => {
        if (newComment.trim()) {
            // TODO: Implement send comment API
            console.log('Sending comment:', newComment);
            setNewComment('');
        }
    };

    const handleUploadEditedPhoto = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files || event.target.files.length === 0 || !photo || !projectId) {
            return;
        }

        const file = event.target.files[0];
        setUploading(true);

        try {
            await photoService.uploadEditedPhoto(projectId, file);
            // Switch to edited version to show the new photo
            setSelectedVersion('edited');
            // Reload photo data to update metadata
            await loadPhotoData();
            // Show success message
            showSuccessToast('Đã tải lên ảnh đã chỉnh sửa thành công');
        } catch (err: any) {
            console.error('Failed to upload edited photo:', err);
            const errorMessage = err?.response?.data?.message || 'Không thể tải lên ảnh đã chỉnh sửa';
            showErrorToast(errorMessage);
        } finally {
            setUploading(false);
            // Reset input
            event.target.value = '';
        }
    };

    if (!photo) return null;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth={false}
            fullScreen
            onKeyDown={handleKeyDown}
            sx={{
                '& .MuiDialog-paper': {
                    bgcolor: '#ffffff',
                    color: '#202124',
                },
            }}
        >
            {/* Header - Google Drive Style */}
            <Box
                sx={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 1300,
                    bgcolor: '#f8f9fa',
                    borderBottom: '1px solid #e8eaed',
                }}
            >
                <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    px={2}
                    py={1}
                >
                    <Stack direction="row" alignItems="center" spacing={2}>
                        <IconButton onClick={onClose} size="medium">
                            <Close />
                        </IconButton>
                        <Typography
                            variant="body1"
                            noWrap
                            sx={{
                                maxWidth: 400,
                                fontWeight: 500,
                                color: '#202124'
                            }}
                        >
                            {photo.filename}
                        </Typography>
                    </Stack>

                    <Stack direction="row" spacing={1} alignItems="center">
                        <IconButton
                            onClick={() => setShowInfo(!showInfo)}
                            size="medium"
                            sx={{
                                bgcolor: showInfo ? '#e8f0fe' : 'transparent',
                                color: showInfo ? '#1967d2' : '#5f6368',
                                '&:hover': {
                                    bgcolor: showInfo ? '#e8f0fe' : '#f1f3f4',
                                }
                            }}
                        >
                            <InfoIcon />
                        </IconButton>
                    </Stack>
                </Stack>
            </Box>

            {/* Main Content */}
            <Box sx={{ display: 'flex', height: '100vh', pt: '56px' }}>
                {/* Left: Image Viewer */}
                <Box
                    sx={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        bgcolor: '#f8f9fa',
                    }}
                >
                    {/* Previous Button */}
                    {hasPrev && (
                        <IconButton
                            onClick={() => onNavigate('prev')}
                            sx={{
                                position: 'absolute',
                                left: 16,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                bgcolor: 'white',
                                boxShadow: '0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)',
                                '&:hover': {
                                    bgcolor: 'white',
                                    boxShadow: '0 1px 3px 0 rgba(60,64,67,0.3), 0 4px 8px 3px rgba(60,64,67,0.15)',
                                },
                                zIndex: 1,
                            }}
                        >
                            <NavigateBefore />
                        </IconButton>
                    )}

                    {/* Image */}
                    {loading ? (
                        <CircularProgress sx={{ color: '#1a73e8' }} />
                    ) : error ? (
                        <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>
                    ) : (
                        <Box
                            component="img"
                            src={imageUrl}
                            alt={photo.filename}
                            sx={{
                                maxWidth: showInfo ? 'calc(100% - 32px)' : 'calc(100% - 32px)',
                                maxHeight: 'calc(100% - 32px)',
                                objectFit: 'contain',
                                borderRadius: 1,
                            }}
                        />
                    )}

                    {/* Next Button */}
                    {hasNext && (
                        <IconButton
                            onClick={() => onNavigate('next')}
                            sx={{
                                position: 'absolute',
                                right: 16,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                bgcolor: 'white',
                                boxShadow: '0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)',
                                '&:hover': {
                                    bgcolor: 'white',
                                    boxShadow: '0 1px 3px 0 rgba(60,64,67,0.3), 0 4px 8px 3px rgba(60,64,67,0.15)',
                                },
                                zIndex: 1,
                            }}
                        >
                            <NavigateNext />
                        </IconButton>
                    )}
                </Box>

                {/* Right: Sidebar with Info & Comments - Google Drive Style */}
                {showInfo && (
                    <Box
                        sx={{
                            width: 360,
                            bgcolor: '#ffffff',
                            borderLeft: '1px solid #e8eaed',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                            height: '100vh',
                        }}
                    >
                        {/* Info Section - Fixed */}
                        <Box
                            sx={{
                                p: 3,
                                maxHeight: '60vh',
                                overflowY: 'auto',
                                borderBottom: '1px solid #e8eaed',
                            }}
                        >
                            <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                                <InfoIcon sx={{ color: '#5f6368', fontSize: 20 }} />
                                <Typography
                                    variant="subtitle1"
                                    sx={{
                                        fontWeight: 500,
                                        color: '#202124'
                                    }}
                                >
                                    Thông tin chi tiết
                                </Typography>
                            </Stack>

                            <Stack spacing={2.5}>
                                {/* Version Selector */}
                                <Box>
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: '#5f6368',
                                            textTransform: 'uppercase',
                                            fontSize: '0.6875rem',
                                            fontWeight: 500,
                                            letterSpacing: '0.07em'
                                        }}
                                        display="block"
                                        mb={0.5}
                                    >
                                        Phiên bản ảnh
                                    </Typography>
                                    <FormControl fullWidth size="small">
                                        <Select
                                            value={selectedVersion}
                                            onChange={(e) => setSelectedVersion(e.target.value as 'original' | 'edited')}
                                            sx={{
                                                fontSize: '0.875rem',
                                                '& .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: '#dadce0',
                                                },
                                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: '#1a73e8',
                                                },
                                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: '#1a73e8',
                                                },
                                            }}
                                        >
                                            <MenuItem value="original" sx={{ fontSize: '0.875rem' }}>
                                                Ảnh gốc (Original)
                                            </MenuItem>
                                            <MenuItem
                                                value="edited"
                                                disabled={!photo.edited_version}
                                                sx={{
                                                    fontSize: '0.875rem',
                                                    '&.Mui-disabled': {
                                                        opacity: 0.5,
                                                    }
                                                }}
                                            >
                                                Ảnh đã chỉnh sửa (Edited)
                                                {!photo.edited_version && ' - Chưa có'}
                                            </MenuItem>
                                        </Select>
                                    </FormControl>
                                </Box>

                                {/* Upload Edited Photo - Only show when status is pending_edit */}
                                {projectStatus === 'pending_edit' && (
                                    <Box>
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                color: '#5f6368',
                                                textTransform: 'uppercase',
                                                fontSize: '0.6875rem',
                                                fontWeight: 500,
                                                letterSpacing: '0.07em'
                                            }}
                                            display="block"
                                            mb={0.5}
                                        >
                                            Tải lên ảnh đã chỉnh sửa
                                        </Typography>
                                        <Button
                                            component="label"
                                            variant="outlined"
                                            fullWidth
                                            startIcon={uploading ? <CircularProgress size={20} /> : <CloudUpload />}
                                            disabled={uploading}
                                            sx={{
                                                textTransform: 'none',
                                                borderColor: '#dadce0',
                                                color: '#1a73e8',
                                                '&:hover': {
                                                    borderColor: '#1a73e8',
                                                    bgcolor: '#f1f3f4',
                                                },
                                            }}
                                        >
                                            {uploading ? 'Đang tải lên...' : 'Chọn ảnh đã edit'}
                                            <input
                                                type="file"
                                                hidden
                                                accept="image/*"
                                                onChange={handleUploadEditedPhoto}
                                            />
                                        </Button>
                                    </Box>
                                )}

                                {/* Status */}
                                <Box>
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: '#5f6368',
                                            textTransform: 'uppercase',
                                            fontSize: '0.6875rem',
                                            fontWeight: 500,
                                            letterSpacing: '0.07em'
                                        }}
                                        display="block"
                                        mb={0.5}
                                    >
                                        Trạng thái
                                    </Typography>
                                    <Stack direction="row" alignItems="center" spacing={0.5}>
                                        {photo.is_selected ? (
                                            <>
                                                <CheckCircle sx={{ fontSize: 16, color: '#1a73e8' }} />
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        color: '#1a73e8',
                                                        fontSize: '0.875rem',
                                                        fontWeight: 500
                                                    }}
                                                >
                                                    Đã chọn
                                                </Typography>
                                            </>
                                        ) : (
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    color: '#5f6368',
                                                    fontSize: '0.875rem'
                                                }}
                                            >
                                                Chưa chọn
                                            </Typography>
                                        )}
                                    </Stack>
                                </Box>

                                {/* File name */}
                                <Box>
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: '#5f6368',
                                            textTransform: 'uppercase',
                                            fontSize: '0.6875rem',
                                            fontWeight: 500,
                                            letterSpacing: '0.07em'
                                        }}
                                        display="block"
                                        mb={0.5}
                                    >
                                        Tên file
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            wordBreak: 'break-all',
                                            color: '#202124',
                                            fontSize: '0.875rem'
                                        }}
                                    >
                                        {photo.filename}
                                    </Typography>
                                </Box>

                                {/* Upload date */}
                                <Box>
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: '#5f6368',
                                            textTransform: 'uppercase',
                                            fontSize: '0.6875rem',
                                            fontWeight: 500,
                                            letterSpacing: '0.07em'
                                        }}
                                        display="block"
                                        mb={0.5}
                                    >
                                        Ngày tải lên
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: '#202124',
                                            fontSize: '0.875rem'
                                        }}
                                    >
                                        {formatTime(photo.created_at)}
                                    </Typography>
                                </Box>
                            </Stack>
                        </Box>

                        {/* Comments Section - Scrollable */}
                        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                            <Box sx={{ p: 3, pb: 2, flexShrink: 0 }}>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                    <ChatBubbleOutline sx={{ color: '#5f6368', fontSize: 20 }} />
                                    <Typography
                                        variant="subtitle1"
                                        sx={{
                                            fontWeight: 500,
                                            color: '#202124'
                                        }}
                                    >
                                        Bình luận
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: '#5f6368',
                                            ml: 'auto'
                                        }}
                                    >
                                        {comments.length}
                                    </Typography>
                                </Stack>
                            </Box>

                            {/* Comments List */}
                            <Box sx={{ flex: 1, overflow: 'auto', px: 3 }}>
                                {loadingComments ? (
                                    <Box display="flex" justifyContent="center" py={4}>
                                        <CircularProgress size={24} sx={{ color: '#1a73e8' }} />
                                    </Box>
                                ) : comments.length === 0 ? (
                                    <Box
                                        sx={{
                                            textAlign: 'center',
                                            py: 6,
                                            color: '#5f6368'
                                        }}
                                    >
                                        <ChatBubbleOutline sx={{ fontSize: 48, opacity: 0.3, mb: 2 }} />
                                        <Typography variant="body2">
                                            Chưa có bình luận nào
                                        </Typography>
                                    </Box>
                                ) : (
                                    <Stack spacing={3} pb={2}>
                                        {comments.map((comment) => (
                                            <Box key={comment.id}>
                                                <Stack direction="row" spacing={1.5} alignItems="flex-start">
                                                    <Avatar
                                                        sx={{
                                                            width: 32,
                                                            height: 32,
                                                            bgcolor: comment.author_type === 'admin'
                                                                ? '#1a73e8'
                                                                : '#ea4335',
                                                            fontSize: '0.875rem',
                                                            fontWeight: 500
                                                        }}
                                                    >
                                                        {comment.author_type === 'admin' ? 'A' : 'K'}
                                                    </Avatar>
                                                    <Box flex={1}>
                                                        <Stack
                                                            direction="row"
                                                            justifyContent="space-between"
                                                            alignItems="center"
                                                            mb={0.5}
                                                        >
                                                            <Typography
                                                                variant="subtitle2"
                                                                sx={{
                                                                    color: '#202124',
                                                                    fontWeight: 500,
                                                                    fontSize: '0.875rem'
                                                                }}
                                                            >
                                                                {comment.author_type === 'admin'
                                                                    ? 'Quản trị viên'
                                                                    : 'Khách hàng'}
                                                            </Typography>
                                                            <Typography
                                                                variant="caption"
                                                                sx={{
                                                                    color: '#5f6368',
                                                                    fontSize: '0.75rem'
                                                                }}
                                                            >
                                                                {formatTime(comment.created_at)}
                                                            </Typography>
                                                        </Stack>
                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                                                whiteSpace: 'pre-wrap',
                                                                color: '#3c4043',
                                                                fontSize: '0.875rem',
                                                                lineHeight: 1.5
                                                            }}
                                                        >
                                                            {comment.content}
                                                        </Typography>
                                                    </Box>
                                                </Stack>
                                            </Box>
                                        ))}
                                    </Stack>
                                )}
                            </Box>

                            {/* Add Comment Input */}
                            <Box
                                sx={{
                                    p: 2,
                                    borderTop: '1px solid #e8eaed',
                                    bgcolor: '#ffffff'
                                }}
                            >
                                <Paper
                                    elevation={0}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'flex-end',
                                        border: '1px solid #dadce0',
                                        borderRadius: '24px',
                                        bgcolor: '#f8f9fa',
                                        '&:focus-within': {
                                            bgcolor: '#ffffff',
                                            border: '2px solid #1a73e8',
                                        },
                                        overflow: 'hidden',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <TextField
                                        fullWidth
                                        multiline
                                        maxRows={4}
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder="Thêm bình luận..."
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendComment();
                                            }
                                        }}
                                        variant="standard"
                                        sx={{
                                            px: 2,
                                            py: 1,
                                            '& .MuiInputBase-root': {
                                                fontSize: '0.875rem',
                                                '&::before, &::after': {
                                                    display: 'none',
                                                },
                                            },
                                        }}
                                    />
                                    <IconButton
                                        onClick={handleSendComment}
                                        disabled={!newComment.trim()}
                                        size="small"
                                        sx={{
                                            mr: 1,
                                            mb: 1,
                                            color: newComment.trim() ? '#1a73e8' : '#dadce0',
                                        }}
                                    >
                                        <Send fontSize="small" />
                                    </IconButton>
                                </Paper>
                            </Box>
                        </Box>
                    </Box>
                )}
            </Box>
        </Dialog>
    );
};
