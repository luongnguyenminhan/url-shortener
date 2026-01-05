import { useState } from 'react';
import {
    Box,
    Card,
    CardMedia,
    CardContent,
    Typography,
    IconButton,
    Checkbox,
    Chip,
    Stack,
    CircularProgress,
    ImageList,
    ImageListItem,
    ImageListItemBar,
} from '@mui/material';
import {
    CheckCircle,
    Cancel,
    Delete,
} from '@mui/icons-material';
import type { Photo } from '@/types/photo.type';
import { photoService } from '@/services/photoService';

interface PhotoGalleryProps {
    photos: Photo[];
    loading?: boolean;
    onPhotoClick?: (photo: Photo) => void;
    onPhotoSelect?: (photoId: string, selected: boolean) => void;
    onPhotoDelete?: (photoId: string) => void;
    viewMode?: 'grid' | 'list';
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({
    photos,
    loading = false,
    onPhotoClick,
    onPhotoSelect,
    onPhotoDelete,
    viewMode = 'grid',
}) => {
    const [hoveredPhoto, setHoveredPhoto] = useState<string | null>(null);

    const getImageUrl = (photo: Photo): string => {
        // Use the new API endpoint to get photo image
        return photoService.getPhotoImage(photo.id, { w: 400 });
    };

    if (loading) {
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
                <Typography variant="h6" color="text.secondary">
                    Chưa có ảnh nào
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Tải lên ảnh để bắt đầu
                </Typography>
            </Box>
        );
    }

    if (viewMode === 'grid') {
        return (
            <ImageList cols={3} gap={16} sx={{ m: 0 }}>
                {photos.map((photo) => (
                    <ImageListItem
                        key={photo.id}
                        onMouseEnter={() => setHoveredPhoto(photo.id)}
                        onMouseLeave={() => setHoveredPhoto(null)}
                        sx={{ cursor: 'pointer', position: 'relative' }}
                    >
                        <img
                            src={getImageUrl(photo)}
                            alt={photo.filename}
                            loading="lazy"
                            style={{
                                height: 200,
                                objectFit: 'cover',
                                borderRadius: 8,
                            }}
                            onClick={() => onPhotoClick?.(photo)}
                        />
                        <ImageListItemBar
                            title={photo.filename}
                            subtitle={
                                <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
                                    {photo.is_selected && (
                                        <Chip
                                            label="Đã chọn"
                                            size="small"
                                            color="primary"
                                            icon={<CheckCircle />}
                                            sx={{ height: 20 }}
                                        />
                                    )}
                                    {photo.is_approved && (
                                        <Chip
                                            label="Đã duyệt"
                                            size="small"
                                            color="success"
                                            icon={<CheckCircle />}
                                            sx={{ height: 20 }}
                                        />
                                    )}
                                    {photo.is_rejected && (
                                        <Chip
                                            label="Từ chối"
                                            size="small"
                                            color="error"
                                            icon={<Cancel />}
                                            sx={{ height: 20 }}
                                        />
                                    )}
                                </Stack>
                            }
                            actionIcon={
                                hoveredPhoto === photo.id && (
                                    <Box sx={{ display: 'flex', gap: 0.5, mr: 1 }}>
                                        {onPhotoSelect && (
                                            <Checkbox
                                                checked={photo.is_selected}
                                                onChange={(e) => {
                                                    e.stopPropagation();
                                                    onPhotoSelect(photo.id, e.target.checked);
                                                }}
                                                sx={{ color: 'white' }}
                                            />
                                        )}
                                        {onPhotoDelete && (
                                            <IconButton
                                                size="small"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onPhotoDelete(photo.id);
                                                }}
                                                sx={{ color: 'white' }}
                                            >
                                                <Delete fontSize="small" />
                                            </IconButton>
                                        )}
                                    </Box>
                                )
                            }
                            sx={{
                                background:
                                    'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)',
                                borderRadius: '0 0 8px 8px',
                            }}
                        />
                    </ImageListItem>
                ))}
            </ImageList>
        );
    }

    // List view
    return (
        <Stack spacing={2}>
            {photos.map((photo) => (
                <Card
                    key={photo.id}
                    onMouseEnter={() => setHoveredPhoto(photo.id)}
                    onMouseLeave={() => setHoveredPhoto(null)}
                    sx={{ display: 'flex', cursor: 'pointer' }}
                    onClick={() => onPhotoClick?.(photo)}
                >
                    <CardMedia
                        component="img"
                        sx={{ width: 160, height: 120, objectFit: 'cover' }}
                        image={getImageUrl(photo)}
                        alt={photo.filename}
                    />
                    <CardContent sx={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                            <Typography variant="subtitle1" fontWeight="medium">
                                {photo.filename}
                            </Typography>
                            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                                {photo.is_selected && (
                                    <Chip label="Đã chọn" size="small" color="primary" icon={<CheckCircle />} />
                                )}
                                {photo.is_approved && (
                                    <Chip label="Đã duyệt" size="small" color="success" icon={<CheckCircle />} />
                                )}
                                {photo.is_rejected && (
                                    <Chip label="Từ chối" size="small" color="error" icon={<Cancel />} />
                                )}
                            </Stack>
                        </Box>
                        {hoveredPhoto === photo.id && (
                            <Stack direction="row" spacing={1}>
                                {onPhotoSelect && (
                                    <IconButton
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onPhotoSelect(photo.id, !photo.is_selected);
                                        }}
                                    >
                                        <CheckCircle color={photo.is_selected ? 'primary' : 'action'} />
                                    </IconButton>
                                )}
                                {onPhotoDelete && (
                                    <IconButton
                                        color="error"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onPhotoDelete(photo.id);
                                        }}
                                    >
                                        <Delete />
                                    </IconButton>
                                )}
                            </Stack>
                        )}
                    </CardContent>
                </Card>
            ))}
        </Stack>
    );
};
