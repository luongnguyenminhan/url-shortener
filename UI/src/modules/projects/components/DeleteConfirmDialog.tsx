import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    CircularProgress,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

interface DeleteConfirmDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    projectTitle: string;
}

export function DeleteConfirmDialog({ open, onClose, onConfirm, projectTitle }: DeleteConfirmDialogProps) {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);

    const handleConfirm = async () => {
        setLoading(true);
        try {
            await onConfirm();
            onClose();
        } catch (error) {
            console.error('Error deleting project:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{t('projects.deleteProject')}</DialogTitle>
            <DialogContent>
                <Typography>
                    {t('projects.deleteConfirmMessage', { title: projectTitle })}
                </Typography>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose} disabled={loading}>
                    {t('common.cancel')}
                </Button>
                <Button
                    onClick={handleConfirm}
                    variant="contained"
                    color="error"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : null}
                >
                    {t('common.delete')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
