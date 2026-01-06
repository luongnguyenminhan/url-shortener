import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    Typography,
    CircularProgress,
    Alert,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
} from '@mui/material';
import { ContentCopy as CopyIcon, Check as CheckIcon } from '@mui/icons-material';
import { projectService } from '@/services/projectService';
import { showSuccessToast, showErrorToast } from '@/hooks/useShowToast';

interface ShareProjectDialogProps {
    open: boolean;
    onClose: () => void;
    projectId: string;
    projectTitle: string;
}

export function ShareProjectDialog({ open, onClose, projectId, projectTitle }: ShareProjectDialogProps) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [shareLink, setShareLink] = useState<string>('');
    const [expiresInDays, setExpiresInDays] = useState<number>(7);
    const [copied, setCopied] = useState(false);
    const [expiresAt, setExpiresAt] = useState<string>('');

    useEffect(() => {
        const fetchActiveToken = async () => {
            if (open && projectId) {
                try {
                    setLoading(true);
                    const activeToken = await projectService.getActiveProjectToken(projectId);

                    if (activeToken) {
                        const baseUrl = window.location.origin;
                        const link = `${baseUrl}/shared/${projectId}?token=${activeToken.token}`;
                        setShareLink(link);
                        setExpiresAt(activeToken.expires_at);
                    }
                } catch (error) {
                    console.error('Failed to fetch active token:', error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchActiveToken();
    }, [open, projectId]);

    const handleGenerateLink = async () => {
        try {
            setLoading(true);
            const response = await projectService.createProjectToken({
                project_id: projectId,
                expires_in_days: expiresInDays,
            });

            // Tạo share link từ token
            const baseUrl = window.location.origin;
            const link = `${baseUrl}/shared/${projectId}?token=${response.token}`;
            setShareLink(link);
            setExpiresAt(response.expires_at);
            showSuccessToast(t('projects.shareLinkGenerated', 'Share link generated successfully'));
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message;
            let displayMessage = t('projects.shareLinkError', 'Failed to generate share link');

            if (errorMessage === 'project_token_already_exists') {
                displayMessage = t('projects.tokenAlreadyExists', 'A share link already exists for this project. Please wait for it to expire or contact support to revoke it.');
            } else if (errorMessage) {
                displayMessage = errorMessage;
            }

            showErrorToast(displayMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(shareLink);
            setCopied(true);
            showSuccessToast(t('common.copiedToClipboard', 'Copied to clipboard'));
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            showErrorToast(t('common.copyFailed', 'Failed to copy'));
        }
    };

    const handleClose = () => {
        setShareLink('');
        setExpiresAt('');
        setCopied(false);
        onClose();
    };

    const formatExpiryDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            onClick={(e) => e.stopPropagation()}
        >
            <DialogTitle>{t('projects.shareProject', 'Share Project')}</DialogTitle>
            <DialogContent>
                <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                        {t('projects.shareProjectDescription', 'Generate a share link for')}: <strong>{projectTitle}</strong>
                    </Typography>

                    {!shareLink && (
                        <FormControl fullWidth>
                            <InputLabel id="expires-label">
                                {t('projects.expiresIn', 'Expires In')}
                            </InputLabel>
                            <Select
                                labelId="expires-label"
                                value={expiresInDays}
                                label={t('projects.expiresIn', 'Expires In')}
                                onChange={(e) => setExpiresInDays(Number(e.target.value))}
                                disabled={loading}
                            >
                                <MenuItem value={1}>1 {t('common.day', 'day')}</MenuItem>
                                <MenuItem value={3}>3 {t('common.days', 'days')}</MenuItem>
                                <MenuItem value={7}>7 {t('common.days', 'days')}</MenuItem>
                                <MenuItem value={14}>14 {t('common.days', 'days')}</MenuItem>
                                <MenuItem value={30}>30 {t('common.days', 'days')}</MenuItem>
                            </Select>
                        </FormControl>
                    )}

                    {shareLink && (
                        <>
                            <Alert severity="success">
                                {t('projects.linkExpiresAt', 'This link will expire at')}: {formatExpiryDate(expiresAt)}
                            </Alert>
                            <TextField
                                fullWidth
                                value={shareLink}
                                InputProps={{
                                    readOnly: true,
                                }}
                                size="small"
                                multiline
                                rows={2}
                            />
                        </>
                    )}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} disabled={loading}>
                    {t('common.close', 'Close')}
                </Button>
                {shareLink ? (
                    <Button
                        onClick={handleCopyLink}
                        variant="contained"
                        color={copied ? 'success' : 'primary'}
                        startIcon={copied ? <CheckIcon /> : <CopyIcon />}
                    >
                        {copied ? t('common.copied', 'Copied') : t('common.copyLink', 'Copy Link')}
                    </Button>
                ) : (
                    <Button
                        onClick={handleGenerateLink}
                        variant="contained"
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={16} /> : null}
                    >
                        {t('projects.generateLink', 'Generate Link')}
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
}
