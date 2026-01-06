import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Box,
    Container,
    Typography,
    CircularProgress,
    Alert,
    IconButton,
    Stack,
    Chip,
    Dialog,
    Fade,
    Paper,
    AppBar,
    Toolbar,
    Button,
    Snackbar,
    TextField,
    DialogTitle,
    DialogContent,
    DialogActions,
    Drawer,
    Divider,
} from '@mui/material';
import {
    Close as CloseIcon,
    ChevronLeft,
    ChevronRight,
    Download as DownloadIcon,
    CheckCircle,
    Image as ImageIcon,
    RadioButtonUnchecked,
    Cancel as CancelIcon,
    Send as SendIcon,
} from '@mui/icons-material';
import { projectService } from '@/services/projectService';
import { photoGuestService } from '@/services/photoGuestService';
import type { Photo } from '@/types/photo.type';
import { ProjectStatus, type VerifyProjectTokenResponse } from '@/types/project.type';

export const SharedProjectPage = () => {
    const { id: projectId } = useParams<{ id: string }>();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const { t } = useTranslation('projects');

    const [projectData, setProjectData] = useState<VerifyProjectTokenResponse | null>(null);
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
    const [imageLoaded, setImageLoaded] = useState<Record<string, boolean>>({});
    const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
    const [rejectedPhotos, setRejectedPhotos] = useState<Set<string>>(new Set());
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
    const [password, setPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [verifying, setVerifying] = useState(false);
    const [commentDrawerOpen, setCommentDrawerOpen] = useState(false);
    const [comment, setComment] = useState('');
    const [photoComments, setPhotoComments] = useState<Array<{
        id: string;
        photo_id: string;
        content: string;
        author_type: 'client' | 'admin';
        created_at: string;
        updated_at: string;
    }>>([]);
    const [loadingComments, setLoadingComments] = useState(false);

    // Show password dialog on mount if token exists
    useEffect(() => {
        if (!token || !projectId) {
            setError(t('shared.invalidLink'));
            return;
        }

        // Try to use saved password from localStorage
        const savedPasswordKey = `project_password_${projectId}`;
        const savedPassword = localStorage.getItem(savedPasswordKey);

        if (savedPassword) {
            // Auto-verify with saved password
            setPassword(savedPassword);
            setVerifying(true);
            projectService.verifyProjectToken({
                token,
                password: savedPassword,
            })
                .then(async (response) => {
                    setProjectData(response);
                    setPasswordDialogOpen(false);
                    await loadPhotos(token);
                })
                .catch((error) => {
                    console.error('Auto-verify failed:', error);
                    // Remove invalid saved password
                    localStorage.removeItem(savedPasswordKey);
                    setPassword('');
                    setPasswordDialogOpen(true);
                })
                .finally(() => {
                    setVerifying(false);
                });
        } else {
            // Show password dialog if no saved password
            setPasswordDialogOpen(true);
        }
    }, [token, projectId]);

    // Load comments when photo is selected
    useEffect(() => {
        const loadPhotoComments = async () => {
            if (selectedPhotoIndex === null || !token) {
                setPhotoComments([]);
                return;
            }

            const photo = photos[selectedPhotoIndex];
            if (!photo) return;

            setLoadingComments(true);
            try {
                const photoMeta = await photoGuestService.getPhotoMeta(photo.id, token);
                setPhotoComments(photoMeta.comments || []);
            } catch (error: any) {
                console.error('Failed to load photo comments:', error);
                setPhotoComments([]);
            } finally {
                setLoadingComments(false);
            }
        };

        loadPhotoComments();
    }, [selectedPhotoIndex, photos, token]);

    const handlePasswordSubmit = async () => {
        if (!password.trim()) {
            setPasswordError(t('shared.enterPassword'));
            return;
        }

        if (!token) {
            setPasswordError(t('shared.invalidInfo'));
            return;
        }

        setVerifying(true);
        setPasswordError('');

        try {
            // Call verify project token API
            const response = await projectService.verifyProjectToken({
                token,
                password: password.trim(),
            });

            // Success - save password to localStorage and close dialog
            if (projectId) {
                localStorage.setItem(`project_password_${projectId}`, password.trim());
            }
            setProjectData(response);
            setPasswordDialogOpen(false);
            setPassword('');
            showSnackbar(t('shared.authSuccess'));

            // Load all photos from the project
            await loadPhotos(token);
        } catch (error: any) {
            console.error('Password verification failed:', error);
            const errorMessage = error?.response?.data?.message ||
                error?.message ||
                t('shared.incorrectPassword');
            setPasswordError(errorMessage);
        } finally {
            setVerifying(false);
        }
    };

    const loadPhotos = async (projectToken: string) => {
        setLoading(true);
        setError(null);

        try {
            let allPhotos: Photo[] = [];
            let currentPage = 1;
            const pageSize = 100; // Max allowed by API
            let hasMorePages = true;

            // Fetch all pages
            while (hasMorePages) {
                const response = await photoGuestService.getPhotos({
                    project_token: projectToken,
                    limit: pageSize,
                    skip: (currentPage - 1) * pageSize,
                });

                const photoList = response.data || [];
                allPhotos = [...allPhotos, ...photoList];

                // Check if there are more pages
                const meta = response.meta;
                if (meta && meta.page && meta.total_pages) {
                    hasMorePages = meta.page < meta.total_pages;
                    currentPage++;
                } else {
                    // No pagination info or last page
                    hasMorePages = photoList.length === pageSize;
                    currentPage++;
                }

                // Safety check to prevent infinite loop
                if (currentPage > 100) {
                    console.warn('Too many pages, stopping pagination');
                    break;
                }
            }

            setPhotos(allPhotos);

            // Set initially selected photos
            const initialSelected = new Set(
                allPhotos.filter((p: Photo) => p.is_selected).map((p: Photo) => p.id)
            );
            setSelectedPhotos(initialSelected);
        } catch (error: any) {
            console.error('Failed to load photos:', error);
            const errorMessage = error?.response?.data?.message ||
                error?.message ||
                t('shared.loadPhotoError');
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handlePhotoClick = (index: number, event: React.MouseEvent) => {
        // If clicking on checkbox area, don't open viewer
        const target = event.target as HTMLElement;
        if (target.closest('.photo-checkbox')) {
            return;
        }
        setSelectedPhotoIndex(index);
    };

    const handleToggleSelect = async (photoId: string) => {
        if (!token) return;

        const isCurrentlySelected = selectedPhotos.has(photoId);

        try {
            if (isCurrentlySelected) {
                // Call unselect API
                await photoGuestService.unselectPhoto(photoId, {
                    project_token: token,
                });

                setSelectedPhotos(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(photoId);
                    return newSet;
                });
                setPhotos(prev => prev.map(p =>
                    p.id === photoId ? { ...p, is_selected: false } : p
                ));
                showSnackbar(t('shared.photoDeselected'));
            } else {
                // Call select API
                await photoGuestService.selectPhoto(photoId, {
                    project_token: token,
                });

                setSelectedPhotos(prev => new Set([...prev, photoId]));
                setPhotos(prev => prev.map(p =>
                    p.id === photoId ? { ...p, is_selected: true } : p
                ));
                showSnackbar(t('shared.photoSelected'));
            }
        } catch (error: any) {
            console.error('Failed to toggle photo selection:', error);
            const errorMessage = error?.response?.data?.message || t('shared.errorOccurred');
            showSnackbar(errorMessage);
        }
    };

    const handleRejectPhoto = async (photoId: string) => {
        if (!token) return;

        const isCurrentlyRejected = rejectedPhotos.has(photoId);

        try {
            if (isCurrentlyRejected) {
                // Unreject - using unselect API (can be adjusted based on backend)
                setRejectedPhotos(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(photoId);
                    return newSet;
                });
                setPhotos(prev => prev.map(p =>
                    p.id === photoId ? { ...p, is_rejected: false } : p
                ));
                showSnackbar(t('shared.rejectionRemoved'));
            } else {
                // Reject photo - if selected, unselect first
                if (selectedPhotos.has(photoId)) {
                    await photoGuestService.unselectPhoto(photoId, {
                        project_token: token,
                    });
                    setSelectedPhotos(prev => {
                        const newSet = new Set(prev);
                        newSet.delete(photoId);
                        return newSet;
                    });
                }

                setRejectedPhotos(prev => new Set([...prev, photoId]));
                setPhotos(prev => prev.map(p =>
                    p.id === photoId ? { ...p, is_rejected: true, is_selected: false } : p
                ));
                showSnackbar(t('shared.photoRejected'));
            }
        } catch (error: any) {
            console.error('Failed to reject photo:', error);
            const errorMessage = error?.response?.data?.message || t('shared.errorOccurred');
            showSnackbar(errorMessage);
        }
    };

    const handleSendComment = async () => {
        if (!comment.trim() || selectedPhotoIndex === null || !token) return;

        const photo = photos[selectedPhotoIndex];
        if (!photo) return;

        try {
            // If photo is already selected, just add comment by calling select again with comment
            if (selectedPhotos.has(photo.id)) {
                await photoGuestService.selectPhoto(photo.id, {
                    project_token: token,
                    comment: comment.trim(),
                });
            } else {
                // Select photo with comment
                await photoGuestService.selectPhoto(photo.id, {
                    project_token: token,
                    comment: comment.trim(),
                });
                setSelectedPhotos(prev => new Set([...prev, photo.id]));
                setPhotos(prev => prev.map(p =>
                    p.id === photo.id ? { ...p, is_selected: true } : p
                ));
            }

            showSnackbar(t('shared.commentSent'));
            setComment('');

            // Reload comments
            const photoMeta = await photoGuestService.getPhotoMeta(photo.id, token);
            setPhotoComments(photoMeta.comments || []);
        } catch (error: any) {
            console.error('Failed to send comment:', error);
            const errorMessage = error?.response?.data?.message || t('shared.cannotSendComment');
            showSnackbar(errorMessage);
        }
    };

    const handleSendToPhotographer = async () => {
        if (!projectData || selectedCount === 0) return;

        try {
            // Update project status to pending_edit (gửi cho photographer để edit)
            await projectService.updateProject(projectData.project_id, {
                status: ProjectStatus.PENDING_EDIT,
            });

            showSnackbar(t('shared.sentPhotos', { count: selectedCount }));

            // Reload the page after a short delay to show the success message
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } catch (error: any) {
            console.error('Failed to send to photographer:', error);
            const errorMessage = error?.response?.data?.message || t('shared.errorOccurred');
            showSnackbar(errorMessage);
        }
    };

    const showSnackbar = (message: string) => {
        setSnackbarMessage(message);
        setSnackbarOpen(true);
    };

    const handleCloseViewer = () => {
        setSelectedPhotoIndex(null);
    };

    const handlePrevPhoto = () => {
        if (selectedPhotoIndex !== null && selectedPhotoIndex > 0) {
            setSelectedPhotoIndex(selectedPhotoIndex - 1);
        }
    };

    const handleNextPhoto = () => {
        if (selectedPhotoIndex !== null && selectedPhotoIndex < photos.length - 1) {
            setSelectedPhotoIndex(selectedPhotoIndex + 1);
        }
    };

    const handleDownload = async (photo: Photo) => {
        if (!token) return;

        try {
            const photoUrl = photoGuestService.getPhotoUrl(photo.id, token);
            const link = document.createElement('a');
            link.href = photoUrl;
            link.download = photo.filename || 'photo.jpg';
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Download failed:', error);
        }
    };

    if (loading) {
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight="100vh"
                sx={{ bgcolor: 'var(--bg-primary)' }}
            >
                <Stack alignItems="center" spacing={2}>
                    <CircularProgress size={60} sx={{ color: 'var(--color-primary)' }} />
                    <Typography variant="body1" sx={{ color: 'var(--text-secondary)' }}>
                        {t('shared.loadingProject')}
                    </Typography>
                </Stack>
            </Box>
        );
    }

    if (error) {
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight="100vh"
                sx={{ bgcolor: 'var(--bg-primary)', p: 2 }}
            >
                <Container maxWidth="sm">
                    <Paper
                        elevation={0}
                        sx={{
                            p: 4,
                            textAlign: 'center',
                            borderRadius: 3,
                            border: '1px solid var(--border-primary)',
                            bgcolor: 'var(--bg-secondary)',
                        }}
                    >
                        <Alert
                            severity="error"
                            sx={{
                                mb: 2,
                                bgcolor: 'var(--bg-tertiary)',
                                color: 'var(--text-primary)',
                            }}
                        >
                            {error}
                        </Alert>
                        <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
                            {t('shared.linkExpired')}
                        </Typography>
                    </Paper>
                </Container>
            </Box>
        );
    }

    const selectedPhoto = selectedPhotoIndex !== null ? photos[selectedPhotoIndex] : null;
    const selectedCount = selectedPhotos.size;
    const projectTitle = projectData?.project?.title || 'Dự Án';
    const isClientSelecting = projectData?.project?.status === 'client_selecting';

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'var(--bg-primary)' }}>
            {/* Top App Bar */}
            <AppBar
                position="sticky"
                elevation={0}
                sx={{
                    bgcolor: 'var(--bg-secondary)',
                    borderBottom: '1px solid var(--border-primary)',
                    color: 'var(--text-primary)',
                    boxShadow: 'var(--shadow-sm)',
                }}
            >
                <Toolbar sx={{ gap: 2 }}>
                    <ImageIcon sx={{ color: 'var(--text-secondary)', fontSize: 28 }} />
                    <Box sx={{ flexGrow: 1 }}>
                        <Typography
                            variant="h6"
                            component="div"
                            sx={{
                                fontWeight: 500,
                                color: 'var(--text-primary)',
                                fontSize: '1.25rem',
                                lineHeight: 1.2
                            }}
                        >
                            {projectTitle}
                        </Typography>
                        <Typography
                            variant="caption"
                            sx={{
                                color: 'var(--text-secondary)',
                                display: { xs: 'none', sm: 'block' }
                            }}
                        >
                            {t('shared.photoCount', { count: photos.length })}
                        </Typography>
                    </Box>
                    {selectedCount > 0 && (
                        <>
                            <Chip
                                icon={<CheckCircle />}
                                label={t('shared.selectedCount', { count: selectedCount })}
                                sx={{
                                    bgcolor: 'var(--bg-tertiary)',
                                    color: 'var(--color-primary)',
                                    fontWeight: 500,
                                    '& .MuiChip-icon': {
                                        color: 'var(--color-primary)'
                                    }
                                }}
                            />
                            {isClientSelecting && (
                                <Button
                                    disabled={selectedCount == 0}
                                    variant="contained"
                                    startIcon={<SendIcon />}
                                    sx={{
                                        bgcolor: 'var(--color-success)',
                                        color: 'var(--text-inverse)',
                                        fontWeight: 600,
                                        textTransform: 'none',
                                        px: 3,
                                        boxShadow: 'var(--shadow-md)',
                                        '&:hover': {
                                            bgcolor: '#45a049',
                                            boxShadow: 'var(--shadow-lg)',
                                        },
                                    }}
                                    onClick={handleSendToPhotographer}
                                >
                                    {t('shared.sendToPhotographer')}
                                </Button>
                            )}
                        </>
                    )}
                </Toolbar>
            </AppBar>

            {/* Project Info Section */}
            {projectData && (
                <Container maxWidth="xl" sx={{ pt: 3, pb: 2 }}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            borderRadius: 2,
                            border: '1px solid #e0e0e0',
                            bgcolor: 'white'
                        }}
                    >
                        <Stack spacing={2}>
                            <Box>
                                <Typography variant="h5" fontWeight={600} gutterBottom>
                                    {projectData.project.title}
                                </Typography>
                            </Box>

                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
                                <Box>
                                    <Typography variant="caption" color="text.secondary" display="block">
                                        {t('shared.totalPhotos')}
                                    </Typography>
                                    <Typography variant="h6" fontWeight={600}>
                                        {photos.length}
                                    </Typography>
                                </Box>

                                <Box>
                                    <Typography variant="caption" color="text.secondary" display="block">
                                        {t('shared.selected')}
                                    </Typography>
                                    <Typography variant="h6" fontWeight={600} color="primary.main">
                                        {selectedCount}
                                    </Typography>
                                </Box>

                                <Box>
                                    <Typography variant="caption" color="text.secondary" display="block">
                                        {t('shared.expiresAt')}
                                    </Typography>
                                    <Typography variant="h6" fontWeight={600}>
                                        {new Date(projectData.expires_at).toLocaleDateString('vi-VN')}
                                    </Typography>
                                </Box>
                            </Stack>
                        </Stack>
                    </Paper>
                </Container>
            )}

            {/* Photo Grid */}
            <Container maxWidth="xl" sx={{ py: 3 }}>
                {photos.length === 0 ? (
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minHeight: '60vh',
                        }}
                    >
                        <ImageIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            {t('shared.noPhotos')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {t('shared.noPhotosDesc')}
                        </Typography>
                    </Box>
                ) : (
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: {
                                xs: 'repeat(auto-fill, minmax(150px, 1fr))',
                                sm: 'repeat(auto-fill, minmax(180px, 1fr))',
                                md: 'repeat(auto-fill, minmax(200px, 1fr))',
                            },
                            gap: { xs: 0.5, sm: 1 },
                        }}
                    >
                        {photos.map((photo, index) => {
                            const isSelected = selectedPhotos.has(photo.id);

                            return (
                                <Box
                                    key={photo.id}
                                    onClick={(e) => handlePhotoClick(index, e)}
                                    sx={{
                                        position: 'relative',
                                        paddingBottom: '100%',
                                        overflow: 'hidden',
                                        bgcolor: 'var(--bg-tertiary)',
                                        cursor: 'pointer',
                                        transition: 'opacity 0.2s',
                                        '&:hover': {
                                            opacity: 0.9,
                                            '& .photo-checkbox': {
                                                opacity: 1,
                                            },
                                        },
                                    }}
                                >
                                    {/* Image */}
                                    <Box
                                        component="img"
                                        src={token ? photoGuestService.getPhotoUrl(photo.id, token, 200, 200) : ''}
                                        alt={photo.filename}
                                        loading="lazy"
                                        onLoad={() => setImageLoaded({ ...imageLoaded, [photo.id]: true })}
                                        sx={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                            opacity: imageLoaded[photo.id] ? 1 : 0,
                                            transition: 'opacity 0.3s',
                                        }}
                                    />

                                    {/* Loading indicator */}
                                    {!imageLoaded[photo.id] && (
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                top: '50%',
                                                left: '50%',
                                                transform: 'translate(-50%, -50%)',
                                            }}
                                        >
                                            <CircularProgress size={24} />
                                        </Box>
                                    )}

                                    {/* Selection overlay */}
                                    {isSelected && (
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                right: 0,
                                                bottom: 0,
                                                bgcolor: 'rgba(66, 133, 244, 0.2)',
                                                border: '3px solid #4285f4',
                                                pointerEvents: 'none',
                                            }}
                                        />
                                    )}

                                    {/* Checkbox */}
                                    <Box
                                        className="photo-checkbox"
                                        sx={{
                                            position: 'absolute',
                                            top: 8,
                                            left: 8,
                                            opacity: isSelected ? 1 : 0,
                                            transition: 'opacity 0.2s',
                                            pointerEvents: isClientSelecting ? 'auto' : 'none',
                                        }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (isClientSelecting) {
                                                handleToggleSelect(photo.id);
                                            }
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                bgcolor: isSelected ? 'var(--color-primary)' : 'rgba(0, 0, 0, 0.54)',
                                                borderRadius: '50%',
                                                width: 24,
                                                height: 24,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                border: '2px solid white',
                                                cursor: 'pointer',
                                                '&:hover': {
                                                    transform: 'scale(1.1)',
                                                },
                                            }}
                                        >
                                            {isSelected ? (
                                                <CheckCircle sx={{ fontSize: 20, color: 'white' }} />
                                            ) : (
                                                <RadioButtonUnchecked sx={{ fontSize: 20, color: 'white' }} />
                                            )}
                                        </Box>
                                    </Box>
                                </Box>
                            );
                        })}
                    </Box>
                )}
            </Container>

            {/* Photo Viewer Dialog */}
            <Dialog
                open={selectedPhotoIndex !== null}
                onClose={handleCloseViewer}
                maxWidth={false}
                fullScreen
                TransitionComponent={Fade}
                PaperProps={{
                    sx: {
                        bgcolor: 'rgba(0, 0, 0, 0.95)',
                    },
                }}
            >
                {selectedPhoto && (
                    <Box
                        sx={{
                            position: 'relative',
                            width: '100%',
                            height: '100vh',
                            display: 'flex',
                        }}
                    >
                        {/* Left Side - Image Viewer */}
                        <Box
                            sx={{
                                flex: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                position: 'relative',
                            }}
                        >
                            {/* Top Bar */}
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    p: 2,
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    background: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 100%)',
                                    zIndex: 2,
                                }}
                            >
                                <Typography variant="body1" sx={{ color: 'white', ml: 1 }}>
                                    {selectedPhotoIndex! + 1} / {photos.length}
                                </Typography>

                                <Stack direction="row" spacing={1}>
                                    <IconButton
                                        onClick={() => handleDownload(selectedPhoto)}
                                        sx={{ color: 'white' }}
                                    >
                                        <DownloadIcon />
                                    </IconButton>
                                    <IconButton onClick={handleCloseViewer} sx={{ color: 'white' }}>
                                        <CloseIcon />
                                    </IconButton>
                                </Stack>
                            </Box>

                            {/* Navigation Buttons */}
                            {selectedPhotoIndex! > 0 && (
                                <IconButton
                                    onClick={handlePrevPhoto}
                                    sx={{
                                        position: 'absolute',
                                        left: 16,
                                        color: 'white',
                                        bgcolor: 'rgba(255, 255, 255, 0.1)',
                                        '&:hover': {
                                            bgcolor: 'rgba(255, 255, 255, 0.2)',
                                        },
                                    }}
                                >
                                    <ChevronLeft fontSize="large" />
                                </IconButton>
                            )}

                            {selectedPhotoIndex! < photos.length - 1 && (
                                <IconButton
                                    onClick={handleNextPhoto}
                                    sx={{
                                        position: 'absolute',
                                        right: 16,
                                        color: 'white',
                                        bgcolor: 'rgba(255, 255, 255, 0.1)',
                                        '&:hover': {
                                            bgcolor: 'rgba(255, 255, 255, 0.2)',
                                        },
                                    }}
                                >
                                    <ChevronRight fontSize="large" />
                                </IconButton>
                            )}

                            {/* Main Image */}
                            <Box
                                component="img"
                                src={token ? photoGuestService.getPhotoUrl(selectedPhoto.id, token) : ''}
                                alt={selectedPhoto.filename}
                                sx={{
                                    maxWidth: '90%',
                                    maxHeight: '85vh',
                                    objectFit: 'contain',
                                    userSelect: 'none',
                                }}
                            />

                            {/* Bottom Bar with Selection and Rejection */}
                            <Box
                                sx={{
                                    position: 'absolute',
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    p: 3,
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    gap: 2,
                                    background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)',
                                    zIndex: 2,
                                }}
                            >
                                {/* Chọn Button */}
                                <Button
                                    variant="contained"
                                    size="large"
                                    startIcon={
                                        selectedPhotos.has(selectedPhoto.id) ?
                                            <CheckCircle /> :
                                            <RadioButtonUnchecked />
                                    }
                                    onClick={() => handleToggleSelect(selectedPhoto.id)}
                                    disabled={!isClientSelecting || rejectedPhotos.has(selectedPhoto.id)}
                                    sx={{
                                        bgcolor: selectedPhotos.has(selectedPhoto.id) ? 'var(--color-success)' : 'var(--color-primary)',
                                        color: 'white',
                                        fontWeight: 600,
                                        fontSize: '1rem',
                                        px: 4,
                                        py: 1.5,
                                        borderRadius: 2,
                                        boxShadow: 'var(--shadow-md)',
                                        textTransform: 'none',
                                        '&:hover': {
                                            bgcolor: selectedPhotos.has(selectedPhoto.id) ? '#45a049' : 'var(--color-primary-dark)',
                                            boxShadow: 'var(--shadow-lg)',
                                            transform: 'translateY(-2px)',
                                        },
                                        '&:active': {
                                            transform: 'translateY(0)',
                                        },
                                        transition: 'all 0.2s ease',
                                        '&.Mui-disabled': {
                                            bgcolor: 'rgba(255, 255, 255, 0.3)',
                                            color: 'rgba(255, 255, 255, 0.5)',
                                        },
                                    }}
                                >
                                    {selectedPhotos.has(selectedPhoto.id) ? t('shared.alreadySelected') : t('shared.selectPhoto')}
                                </Button>

                                {/* Từ chối Button */}
                                <Button
                                    variant="contained"
                                    size="large"
                                    startIcon={<CancelIcon />}
                                    onClick={() => handleRejectPhoto(selectedPhoto.id)}
                                    disabled={!isClientSelecting || selectedPhotos.has(selectedPhoto.id)}
                                    sx={{
                                        bgcolor: rejectedPhotos.has(selectedPhoto.id) ? '#d32f2f' : 'var(--color-error)',
                                        color: 'white',
                                        fontWeight: 600,
                                        fontSize: '1rem',
                                        px: 4,
                                        py: 1.5,
                                        borderRadius: 2,
                                        boxShadow: 'var(--shadow-md)',
                                        textTransform: 'none',
                                        '&:hover': {
                                            bgcolor: rejectedPhotos.has(selectedPhoto.id) ? '#c62828' : '#d32f2f',
                                            boxShadow: 'var(--shadow-lg)',
                                            transform: 'translateY(-2px)',
                                        },
                                        '&:active': {
                                            transform: 'translateY(0)',
                                        },
                                        transition: 'all 0.2s ease',
                                        '&.Mui-disabled': {
                                            bgcolor: 'rgba(255, 255, 255, 0.3)',
                                            color: 'rgba(255, 255, 255, 0.5)',
                                        },
                                    }}
                                >
                                    {rejectedPhotos.has(selectedPhoto.id) ? t('shared.alreadyRejected') : t('shared.rejectPhoto')}
                                </Button>
                            </Box>
                        </Box>

                        {/* Right Side - Comment Panel */}
                        <Box
                            sx={{
                                width: { xs: 0, md: 400 },
                                height: '100vh',
                                bgcolor: 'white',
                                display: { xs: 'none', md: 'flex' },
                                flexDirection: 'column',
                                borderLeft: '1px solid #e0e0e0',
                            }}
                        >
                            {/* Comment Header */}
                            <Box sx={{ p: 2, borderBottom: '1px solid var(--border-primary)', bgcolor: 'var(--bg-secondary)' }}>
                                <Typography variant="h6" fontWeight={600} sx={{ color: 'var(--text-primary)' }}>
                                    {t('shared.comments')}
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'var(--text-secondary)' }}>
                                    {!isClientSelecting
                                        ? t('shared.projectEnded')
                                        : selectedPhotos.has(selectedPhoto.id)
                                            ? t('shared.photoSelectedComment')
                                            : t('shared.selectToComment')}
                                </Typography>
                            </Box>

                            {/* Comment List */}
                            <Box sx={{ flex: 1, overflow: 'auto', p: 2, bgcolor: 'var(--bg-primary)' }}>
                                {loadingComments ? (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                                        <CircularProgress size={30} sx={{ color: 'var(--color-primary)' }} />
                                    </Box>
                                ) : photoComments.length === 0 ? (
                                    <Typography variant="body2" align="center" sx={{ py: 4, color: 'var(--text-secondary)' }}>
                                        {t('shared.noComments')}
                                    </Typography>
                                ) : (
                                    <Stack spacing={2}>
                                        {photoComments.map((cmt) => (
                                            <Paper
                                                key={cmt.id}
                                                elevation={0}
                                                sx={{
                                                    p: 2,
                                                    bgcolor: cmt.author_type === 'admin' ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
                                                    borderRadius: 2,
                                                    border: '1px solid var(--border-primary)',
                                                }}
                                            >
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                    <Chip
                                                        label={cmt.author_type === 'admin' ? t('shared.admin') : t('shared.client')}
                                                        size="small"
                                                        color={cmt.author_type === 'admin' ? 'default' : 'primary'}
                                                        sx={{ height: 20, fontSize: '0.7rem' }}
                                                    />
                                                    <Typography variant="caption" sx={{ color: 'var(--text-secondary)' }}>
                                                        {new Date(cmt.created_at).toLocaleString('vi-VN', {
                                                            day: '2-digit',
                                                            month: '2-digit',
                                                            year: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        })}
                                                    </Typography>
                                                </Box>
                                                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', color: 'var(--text-primary)' }}>
                                                    {cmt.content}
                                                </Typography>
                                            </Paper>
                                        ))}
                                    </Stack>
                                )}
                            </Box>

                            {/* Comment Input */}
                            <Box sx={{ p: 2, borderTop: '1px solid var(--border-primary)', bgcolor: 'var(--bg-secondary)' }}>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={3}
                                    placeholder={!isClientSelecting
                                        ? t('shared.projectEnded')
                                        : selectedPhotos.has(selectedPhoto.id)
                                            ? t('shared.writeComment')
                                            : t('shared.selectToComment')}
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    disabled={!isClientSelecting || !selectedPhotos.has(selectedPhoto.id)}
                                    sx={{
                                        mb: 2,
                                        '& .MuiOutlinedInput-root': {
                                            bgcolor: 'var(--bg-primary)',
                                            color: 'var(--text-primary)',
                                            '& fieldset': {
                                                borderColor: 'var(--border-primary)',
                                            },
                                            '&:hover fieldset': {
                                                borderColor: 'var(--border-focus)',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: 'var(--border-focus)',
                                            },
                                        },
                                    }}
                                />
                                <Button
                                    fullWidth
                                    variant="contained"
                                    endIcon={<SendIcon />}
                                    onClick={handleSendComment}
                                    disabled={!isClientSelecting || !comment.trim() || !selectedPhotos.has(selectedPhoto.id)}
                                    sx={{
                                        bgcolor: 'var(--color-warning)',
                                        color: 'var(--text-inverse)',
                                        '&:hover': {
                                            bgcolor: '#f57c00',
                                        },
                                    }}
                                >
                                    {t('shared.sendComment')}
                                </Button>
                            </Box>
                        </Box>
                    </Box>
                )}
            </Dialog>

            {/* Password Dialog */}
            <Dialog
                open={passwordDialogOpen}
                onClose={() => { }} // Prevent closing without password
                maxWidth="xs"
                fullWidth
                disableEscapeKeyDown
            >
                <DialogTitle>{t('shared.passwordRequired')}</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        {t('shared.passwordDesc')}
                    </Typography>
                    <TextField
                        autoFocus
                        fullWidth
                        type="password"
                        label={t('shared.passwordLabel')}
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                            setPasswordError('');
                        }}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter' && !verifying) {
                                handlePasswordSubmit();
                            }
                        }}
                        error={!!passwordError}
                        helperText={passwordError}
                        disabled={verifying}
                        sx={{ mt: 1 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={handlePasswordSubmit}
                        variant="contained"
                        disabled={verifying}
                    >
                        {verifying ? t('shared.verifying') : t('shared.confirm')}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={2000}
                onClose={() => setSnackbarOpen(false)}
                message={snackbarMessage}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            />
        </Box>
    );
};
