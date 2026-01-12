import { useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Box,
    Paper,
    Typography,
    Button,
    IconButton,
    LinearProgress,
    Stack,
    Card,
    CardMedia,
    CardContent,
    Chip,
    Alert,
} from '@mui/material';
import {
    CloudUpload,
    Delete,
    CheckCircle,
    Error as ErrorIcon,
    Refresh,
} from '@mui/icons-material';
import { photoService } from '@/services/photoService';
import { showSuccessToast, showErrorToast } from '@/hooks/useShowToast';

interface FileWithPreview {
    file: File;
    id: string;
    preview: string;
    status: 'pending' | 'uploading' | 'success' | 'error';
    progress: number;
    error?: string;
}

interface PhotoUploadZoneProps {
    projectId: string;
    onUploadComplete?: () => void;
    uploadType?: 'original' | 'edited';
}

export const PhotoUploadZone: React.FC<PhotoUploadZoneProps> = ({
    projectId,
    onUploadComplete,
    uploadType = 'original',
}) => {
    const { t } = useTranslation('projects');
    const [files, setFiles] = useState<FileWithPreview[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const droppedFiles = Array.from(e.dataTransfer.files);
        addFiles(droppedFiles);
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files || []);
        addFiles(selectedFiles);
        // Reset input value để có thể chọn lại cùng file
        e.target.value = '';
    };

    const addFiles = (newFiles: File[]) => {
        const imageFiles = newFiles.filter((file) =>
            file.type.startsWith('image/')
        );

        if (imageFiles.length === 0) {
            showErrorToast(t('upload.onlyImages', 'Vui lòng chỉ chọn file hình ảnh'));
            return;
        }

        const filesWithPreview: FileWithPreview[] = imageFiles.map((file) => ({
            file,
            id: Math.random().toString(36).substring(7),
            preview: URL.createObjectURL(file),
            status: 'pending',
            progress: 0,
        }));

        setFiles((prev) => [...prev, ...filesWithPreview]);
    };

    const removeFile = (id: string) => {
        setFiles((prev) => {
            const fileToRemove = prev.find((f) => f.id === id);
            if (fileToRemove) {
                URL.revokeObjectURL(fileToRemove.preview);
            }
            return prev.filter((f) => f.id !== id);
        });
    };

    const uploadFile = async (fileWithPreview: FileWithPreview): Promise<boolean> => {
        try {
            // Update status to uploading
            setFiles((prev) =>
                prev.map((f) =>
                    f.id === fileWithPreview.id
                        ? { ...f, status: 'uploading', progress: 0 }
                        : f
                )
            );

            // Upload single file with real progress tracking
            const uploadFunc = uploadType === 'edited'
                ? photoService.uploadEditedPhoto
                : photoService.uploadPhoto;

            await uploadFunc(
                projectId,
                fileWithPreview.file,
                (progress) => {
                    setFiles((prev) =>
                        prev.map((f) =>
                            f.id === fileWithPreview.id
                                ? { ...f, progress }
                                : f
                        )
                    );
                }
            );

            // Update status to success
            setFiles((prev) =>
                prev.map((f) =>
                    f.id === fileWithPreview.id
                        ? { ...f, status: 'success', progress: 100 }
                        : f
                )
            );

            return true;
        } catch (error: any) {
            // Update status to error
            setFiles((prev) =>
                prev.map((f) =>
                    f.id === fileWithPreview.id
                        ? {
                            ...f,
                            status: 'error',
                            progress: 0,
                            error: error.response?.data?.message || t('upload.uploadFailed', 'Upload failed'),
                        }
                        : f
                )
            );
            return false;
        }
    };

    const handleUploadAll = async () => {
        const pendingFiles = files.filter((f) => f.status === 'pending' || f.status === 'error');

        if (pendingFiles.length === 0) {
            showErrorToast(t('upload.noFiles', 'Không có file nào để upload'));
            return;
        }

        setIsUploading(true);

        let successCount = 0;
        let failCount = 0;

        // Upload files one by one
        for (const file of pendingFiles) {
            const success = await uploadFile(file);
            if (success) {
                successCount++;
            } else {
                failCount++;
            }
        }

        setIsUploading(false);

        // Show results
        if (successCount > 0) {
            showSuccessToast(t('upload.successCount', 'Đã upload thành công {{count}} ảnh', { count: successCount }));
            onUploadComplete?.();
        }

        if (failCount > 0) {
            showErrorToast(t('upload.failCount', 'Upload thất bại {{count}} ảnh', { count: failCount }));
        }
    };

    const handleClearAll = () => {
        files.forEach((f) => URL.revokeObjectURL(f.preview));
        setFiles([]);
    };

    const handleRetry = async (fileId: string) => {
        const fileToRetry = files.find((f) => f.id === fileId);
        if (fileToRetry) {
            await uploadFile(fileToRetry);
        }
    };

    const pendingCount = files.filter((f) => f.status === 'pending').length;
    const uploadingCount = files.filter((f) => f.status === 'uploading').length;
    const successCount = files.filter((f) => f.status === 'success').length;
    const errorCount = files.filter((f) => f.status === 'error').length;

    return (
        <Box>
            {/* Drop Zone */}
            <Paper
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                sx={{
                    p: 4,
                    mb: 3,
                    border: '2px dashed',
                    borderColor: isDragging ? 'primary.main' : 'divider',
                    bgcolor: isDragging ? 'action.hover' : 'background.paper',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    textAlign: 'center',
                }}
                onClick={() => fileInputRef.current?.click()}
            >
                <CloudUpload sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                    {uploadType === 'edited'
                        ? t('upload.dropZoneTitleEdited', 'Kéo thả ảnh đã chỉnh sửa vào đây hoặc click để chọn')
                        : t('upload.dropZoneTitle', 'Kéo thả ảnh vào đây hoặc click để chọn')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {uploadType === 'edited'
                        ? t('upload.dropZoneSubtitleEdited', 'Upload ảnh đã chỉnh sửa - Hỗ trợ nhiều file cùng lúc')
                        : t('upload.dropZoneSubtitle', 'Hỗ trợ nhiều file cùng lúc')}
                </Typography>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                />
            </Paper>

            {/* File Status Summary */}
            {files.length > 0 && (
                <Stack direction="row" spacing={2} mb={2}>
                    {pendingCount > 0 && (
                        <Chip label={t('upload.statusPending', '{{count}} chờ upload', { count: pendingCount })} color="default" />
                    )}
                    {uploadingCount > 0 && (
                        <Chip label={t('upload.statusUploading', '{{count}} đang upload', { count: uploadingCount })} color="primary" />
                    )}
                    {successCount > 0 && (
                        <Chip label={t('upload.statusSuccess', '{{count}} thành công', { count: successCount })} color="success" />
                    )}
                    {errorCount > 0 && (
                        <Chip label={t('upload.statusError', '{{count}} thất bại', { count: errorCount })} color="error" />
                    )}
                </Stack>
            )}

            {/* File List */}
            {files.length > 0 && (
                <Box sx={{ maxHeight: 400, overflowY: 'auto', mb: 3 }}>
                    <Stack spacing={2}>
                        {files.map((fileWithPreview) => (
                            <Card key={fileWithPreview.id}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <CardMedia
                                        component="img"
                                        sx={{ width: 100, height: 100, objectFit: 'cover' }}
                                        image={fileWithPreview.preview}
                                        alt={fileWithPreview.file.name}
                                    />
                                    <CardContent sx={{ flex: 1 }}>
                                        <Stack spacing={1}>
                                            <Typography variant="subtitle2" noWrap>
                                                {fileWithPreview.file.name}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {(fileWithPreview.file.size / 1024 / 1024).toFixed(2)} MB
                                            </Typography>

                                            {fileWithPreview.status === 'uploading' && (
                                                <Box sx={{ width: '100%' }}>
                                                    <LinearProgress
                                                        variant="determinate"
                                                        value={fileWithPreview.progress}
                                                    />
                                                    <Typography variant="caption" color="text.secondary">
                                                        {fileWithPreview.progress}%
                                                    </Typography>
                                                </Box>
                                            )}

                                            {fileWithPreview.status === 'error' && (
                                                <Alert severity="error" sx={{ py: 0 }}>
                                                    {fileWithPreview.error}
                                                </Alert>
                                            )}
                                        </Stack>
                                    </CardContent>
                                    <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                        {fileWithPreview.status === 'success' && (
                                            <CheckCircle color="success" />
                                        )}
                                        {fileWithPreview.status === 'error' && (
                                            <>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleRetry(fileWithPreview.id)}
                                                    color="primary"
                                                    title={t('upload.retry', 'Thử lại')}
                                                >
                                                    <Refresh />
                                                </IconButton>
                                                <ErrorIcon color="error" />
                                            </>
                                        )}
                                        {fileWithPreview.status !== 'uploading' && (
                                            <IconButton
                                                size="small"
                                                onClick={() => removeFile(fileWithPreview.id)}
                                            >
                                                <Delete />
                                            </IconButton>
                                        )}
                                    </Box>
                                </Box>
                            </Card>
                        ))}
                    </Stack>
                </Box>
            )}

            {/* Action Buttons */}
            {files.length > 0 && (
                <Stack direction="row" spacing={2} justifyContent="flex-end">
                    <Button
                        variant="outlined"
                        onClick={handleClearAll}
                        disabled={isUploading}
                    >
                        {t('upload.clearAll', 'Xóa tất cả')}
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleUploadAll}
                        disabled={isUploading || pendingCount === 0}
                        startIcon={isUploading ? undefined : <CloudUpload />}
                    >
                        {isUploading
                            ? t('upload.uploading', 'Đang upload...')
                            : t('upload.uploadButton', 'Upload {{count}} ảnh', { count: pendingCount })}
                    </Button>
                </Stack>
            )}
        </Box>
    );
};
