import { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Box,
    CircularProgress,
    InputAdornment,
    IconButton,
    Snackbar,
    Alert
} from '@mui/material';
import { ContentCopy as ContentCopyIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { projectService } from '@/services/projectService';

interface ShareProjectDialogProps {
    open: boolean;
    onClose: () => void;
    projectId: string | null;
    projectTitle: string;
}

export function ShareProjectDialog({ open, onClose, projectId, projectTitle }: ShareProjectDialogProps) {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [expiresIn, setExpiresIn] = useState(7);
    const [generatedLink, setGeneratedLink] = useState('');
    const [copySuccess, setCopySuccess] = useState(false);

    const handleGenerate = async () => {
        if (!projectId) return;
        setLoading(true);
        try {
            const token = await projectService.createProjectToken(projectId, expiresIn);
            // Construct the sharing link
            const link = `${window.location.origin}/projects/${projectId}?token=${token}`;
            setGeneratedLink(link);
        } catch (error) {
            console.error('Error generating token:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(generatedLink);
        setCopySuccess(true);
    };

    const handleClose = () => {
        setGeneratedLink('');
        setExpiresIn(7);
        setCopySuccess(false);
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                {t('projects.shareProject')}: {projectTitle}
            </DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
                    {!generatedLink && (
                        <TextField
                            label={t('projects.tokenExpiresIn')}
                            type="number"
                            value={expiresIn}
                            onChange={(e) => setExpiresIn(parseInt(e.target.value) || 0)}
                            fullWidth
                            InputProps={{ inputProps: { min: 1 } }}
                        />
                    )}

                    {generatedLink && (
                        <TextField
                            label={t('projects.sharedLink')}
                            value={generatedLink}
                            fullWidth
                            InputProps={{
                                readOnly: true,
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={handleCopy} edge="end">
                                            <ContentCopyIcon />
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                    )}
                </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={handleClose}>
                    {t('common.close')}
                </Button>
                {!generatedLink && (
                    <Button
                        onClick={handleGenerate}
                        variant="contained"
                        disabled={loading || !expiresIn}
                        startIcon={loading ? <CircularProgress size={20} /> : null}
                    >
                        {t('common.generate')}
                    </Button>
                )}
            </DialogActions>

            <Snackbar
                open={copySuccess}
                autoHideDuration={2000}
                onClose={() => setCopySuccess(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity="success" sx={{ width: '100%' }}>
                    {t('common.copied')}
                </Alert>
            </Snackbar>
        </Dialog>
    );
}
