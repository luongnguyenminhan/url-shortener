import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Box,
    ImageList,
    ImageListItem,
    CircularProgress,
    Typography,
    Checkbox,
    Chip,
    alpha,
    Button,
} from '@mui/material';
import {
    CheckCircle,
    ThumbUp,
    ThumbDown,
    ImageOutlined,
    Edit as EditIcon,
    ExpandMore,
} from '@mui/icons-material';
import type { Photo } from '@/types/photo.type';
import { photoService } from '@/services/photoService';
import { PhotoDetailModal } from './PhotoDetailModal';

interface PhotoGalleryProps {
    photos: Photo[];
    loading?: boolean;
    onPhotoDelete?: (photoId: string) => void;
    onPhotoUpdate?: () => void;
    projectStatus?: string;
    projectId?: string;
    onLoadMore?: () => void;
    hasMore?: boolean;
    loadingMore?: boolean;
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({
    photos,
    loading = false,
    onPhotoDelete,
    onPhotoUpdate,
    projectStatus,
    projectId,
    onLoadMore,
    hasMore = false,
    loadingMore = false,
}) => {
    const { t } = useTranslation(['projects', 'translation']);
    const [hoveredPhoto, setHoveredPhoto] = useState<string | null>(null);
    const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
    const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
    const [loadingImages, setLoadingImages] = useState(true);
    const [detailPhoto, setDetailPhoto] = useState<Photo | null>(null);
    const [detailModalOpen, setDetailModalOpen] = useState(false);

    // Load thumbnail images
    const loadedIds = useRef<Set<string>>(new Set());

    // Load thumbnail images
    useEffect(() => {
        const loadImages = async () => {
            // Find photos that haven't been loaded yet
            const newPhotos = photos.filter(p => !loadedIds.current.has(p.id));

            if (newPhotos.length === 0) {
                setLoadingImages(false);
                return;
            }

            setLoadingImages(true);
            const newUrls: Record<string, string> = {};

            // Load images in batches for better performance
            const batchSize = 10;
            for (let i = 0; i < newPhotos.length; i += batchSize) {
                const batch = newPhotos.slice(i, i + batchSize);
                await Promise.all(
                    batch.map(async (photo) => {
                        try {
                            const url = await photoService.getPhotoImage(photo.id, { w: 400, h: 400, is_thumbnail: true });
                            newUrls[photo.id] = url;
                            loadedIds.current.add(photo.id);
                        } catch (error) {
                            console.error(`Failed to load image for photo ${photo.id}:`, error);
                        }
                    })
                );
            }

            setImageUrls(prev => ({ ...prev, ...newUrls }));
            setLoadingImages(false);
        };

        if (photos.length > 0) {
            loadImages();
        } else {
            setLoadingImages(false);
        }

        // Cleanup blob URLs when component unmounts - handled separately?
        // Actually we should clean up based on diff, but for now simple cleanup on unmount is safer.
        // We can keep the return cleanup below, but we need to be careful not to revoke URLs that are still in use if we re-mount? 
        // The return cleanup below runs on every photo change if in dependency array, which is bad if we merge state.
    }, [photos]);

    // Separate effect for cleanup
    useEffect(() => {
        return () => {
            setImageUrls(currentUrls => {
                Object.values(currentUrls).forEach((url) => {
                    if (url.startsWith('blob:')) {
                        URL.revokeObjectURL(url);
                    }
                });
                return {};
            });
            loadedIds.current.clear();
        };
    }, []);

    const handlePhotoClick = (photo: Photo) => {
        setDetailPhoto(photo);
        setDetailModalOpen(true);
    };

    const handleNavigate = (direction: 'prev' | 'next') => {
        if (!detailPhoto) return;

        const currentIndex = photos.findIndex((p) => p.id === detailPhoto.id);
        if (direction === 'prev' && currentIndex > 0) {
            setDetailPhoto(photos[currentIndex - 1]);
        } else if (direction === 'next') {
            if (currentIndex < photos.length - 1) {
                setDetailPhoto(photos[currentIndex + 1]);
            } else if (hasMore && onLoadMore && !loadingMore) {
                // Trigger auto-load if at the end
                onLoadMore();
                // Note: The modal will update when photos prop changes
            }
        }
    };

    // Note: Selection, approval, and rejection are handled by guest endpoints or admin panel

    const handleBulkSelect = (photoId: string, checked: boolean) => {
        const newSelected = new Set(selectedPhotos);
        if (checked) {
            newSelected.add(photoId);
        } else {
            newSelected.delete(photoId);
        }
        setSelectedPhotos(newSelected);
    };

    const getImageUrl = (photo: Photo): string => {
        return imageUrls[photo.id] || '';
    };

    // Calculate responsive columns
    const getColumns = () => {
        const width = window.innerWidth;
        if (width < 600) return 2;
        if (width < 960) return 3;
        if (width < 1280) return 4;
        return 5;
    };

    const [columns, setColumns] = useState(getColumns());

    useEffect(() => {
        const handleResize = () => setColumns(getColumns());
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if ((loading || loadingImages) && photos.length === 0) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
                <CircularProgress />
            </Box>
        );
    }

    if (photos.length === 0) {
        return (
            <Box
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                minHeight={400}
                gap={2}
            >
                <ImageOutlined sx={{ fontSize: 64, color: 'text.secondary', opacity: 0.5 }} />
                <Typography variant="h6" color="text.secondary">
                    Chưa có ảnh nào
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Tải lên ảnh để bắt đầu
                </Typography>
            </Box>
        );
    }

    return (
        <>
            <ImageList
                cols={columns}
                gap={8}
                sx={{
                    m: 0,
                    width: '100%',
                    // Masonry-like effect for Google Photos style
                    '&.MuiImageList-root': {
                        overflow: 'visible',
                    },
                }}
            >
                {photos.map((photo) => {
                    const isHovered = hoveredPhoto === photo.id;
                    const isSelected = selectedPhotos.has(photo.id);

                    return (
                        <ImageListItem
                            key={photo.id}
                            onMouseEnter={() => setHoveredPhoto(photo.id)}
                            onMouseLeave={() => setHoveredPhoto(null)}
                            sx={{
                                cursor: 'pointer',
                                position: 'relative',
                                overflow: 'hidden',
                                borderRadius: 1,
                                transition: 'all 0.2s ease-in-out',
                                '&:hover': {
                                    transform: 'scale(1.02)',
                                    zIndex: 1,
                                    boxShadow: 3,
                                },
                            }}
                        >
                            {/* Image */}
                            {getImageUrl(photo) ? (
                                <Box
                                    component="img"
                                    src={getImageUrl(photo)}
                                    alt={photo.filename}
                                    loading="lazy"
                                    onClick={() => handlePhotoClick(photo)}
                                    sx={{
                                        width: '100%',
                                        height: 200,
                                        objectFit: 'cover',
                                        display: 'block',
                                        bgcolor: '#f5f5f5',
                                    }}
                                />
                            ) : (
                                <Box
                                    onClick={() => handlePhotoClick(photo)}
                                    sx={{
                                        width: '100%',
                                        height: 200,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        bgcolor: '#f5f5f5',
                                        cursor: 'wait',
                                    }}
                                >
                                    <CircularProgress size={30} />
                                </Box>
                            )}

                            {/* Overlay on hover */}
                            {isHovered && (
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        background: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.5) 100%)',
                                        pointerEvents: 'none',
                                    }}
                                />
                            )}

                            {/* Top overlay - Checkbox */}
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: 8,
                                    left: 8,
                                    right: 8,
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start',
                                    pointerEvents: 'none',
                                }}
                            >
                                <Checkbox
                                    checked={isSelected}
                                    onChange={(e) => {
                                        e.stopPropagation();
                                        handleBulkSelect(photo.id, e.target.checked);
                                    }}
                                    sx={{
                                        color: '#fff',
                                        pointerEvents: 'auto',
                                        '&.Mui-checked': {
                                            color: '#1a73e8',
                                        },
                                        opacity: isHovered || isSelected ? 1 : 0,
                                        transition: 'opacity 0.2s',
                                    }}
                                />

                                {/* Edited version badge */}
                                {photo.edited_version && (
                                    <Chip
                                        icon={<EditIcon sx={{ fontSize: 14 }} />}
                                        label="Edited"
                                        size="small"
                                        sx={{
                                            bgcolor: '#4caf50',
                                            color: 'white',
                                            fontWeight: 600,
                                            fontSize: '0.7rem',
                                            height: 24,
                                            pointerEvents: 'auto',
                                            '& .MuiChip-icon': {
                                                color: 'white',
                                            },
                                        }}
                                    />
                                )}
                            </Box>

                            {/* Bottom overlay - Status chips */}
                            <Box
                                sx={{
                                    position: 'absolute',
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    p: 1,
                                    display: 'flex',
                                    gap: 0.5,
                                    flexWrap: 'wrap',
                                }}
                            >
                                {photo.is_selected && (
                                    <Chip
                                        label="Đã chọn"
                                        size="small"
                                        icon={<CheckCircle sx={{ fontSize: 14 }} />}
                                        sx={{
                                            height: 24,
                                            fontSize: '0.7rem',
                                            bgcolor: alpha('#1976d2', 0.9),
                                            color: '#fff',
                                            '& .MuiChip-icon': {
                                                color: '#fff',
                                            },
                                        }}
                                    />
                                )}
                                {photo.is_approved && (
                                    <Chip
                                        label="Đã duyệt"
                                        size="small"
                                        icon={<ThumbUp sx={{ fontSize: 14 }} />}
                                        sx={{
                                            height: 24,
                                            fontSize: '0.7rem',
                                            bgcolor: alpha('#2e7d32', 0.9),
                                            color: '#fff',
                                            '& .MuiChip-icon': {
                                                color: '#fff',
                                            },
                                        }}
                                    />
                                )}
                                {photo.is_rejected && (
                                    <Chip
                                        label="Từ chối"
                                        size="small"
                                        icon={<ThumbDown sx={{ fontSize: 14 }} />}
                                        sx={{
                                            height: 24,
                                            fontSize: '0.7rem',
                                            bgcolor: alpha('#d32f2f', 0.9),
                                            color: '#fff',
                                            '& .MuiChip-icon': {
                                                color: '#fff',
                                            },
                                        }}
                                    />
                                )}
                            </Box>
                        </ImageListItem>
                    );
                })}

            </ImageList>

            {hasMore && (
                <Box display="flex" justifyContent="center" mt={4} mb={2}>
                    <Button
                        variant="outlined"
                        onClick={onLoadMore}
                        disabled={loadingMore}
                        startIcon={loadingMore ? <CircularProgress size={20} /> : <ExpandMore />}
                    >
                        {loadingMore ? t('common.loading') : t('shared.loadMore')}
                    </Button>
                </Box>
            )}

            {/* Photo Detail Modal */}
            <PhotoDetailModal
                open={detailModalOpen}
                photo={detailPhoto}
                photos={photos}
                onClose={() => {
                    setDetailModalOpen(false);
                    setDetailPhoto(null);
                }}
                onNavigate={handleNavigate}
                onDelete={onPhotoDelete}
                onPhotoUpdate={onPhotoUpdate}
                projectStatus={projectStatus}
                projectId={projectId}
                hasMore={hasMore}
                loadingMore={loadingMore}
            />
        </>
    );
};
