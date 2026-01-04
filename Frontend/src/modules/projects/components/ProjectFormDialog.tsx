import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    MenuItem,
    Box,
    CircularProgress,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { ProjectResponse, ProjectCreate, ProjectUpdate } from '@/types/project.type';
import { ProjectStatus } from '@/types/project.type';

interface ProjectFormDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: ProjectCreate | ProjectUpdate) => Promise<void>;
    project?: ProjectResponse | null;
    mode: 'create' | 'edit';
}

export function ProjectFormDialog({ open, onClose, onSubmit, project, mode }: ProjectFormDialogProps) {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        status: ProjectStatus.DRAFT,
        client_notes: '',
    });

    useEffect(() => {
        if (mode === 'edit' && project) {
            setFormData({
                title: project.title,
                status: project.status as any,
                client_notes: project.client_notes || '',
            });
        } else {
            setFormData({
                title: '',
                status: ProjectStatus.DRAFT,
                client_notes: '',
            });
        }
    }, [project, mode, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSubmit(formData);
            handleClose();
        } catch (error) {
            console.error('Error submitting form:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) {
            setFormData({
                title: '',
                status: ProjectStatus.DRAFT,
                client_notes: '',
            });
            onClose();
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <form onSubmit={handleSubmit}>
                <DialogTitle>
                    {mode === 'create' ? t('projects.createProject') : t('projects.editProject')}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
                        <TextField
                            label={t('projects.form.title')}
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                            fullWidth
                            autoFocus
                        />

                        <TextField
                            label={t('projects.form.status')}
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                            select
                            fullWidth
                            required
                        >
                            {Object.entries(ProjectStatus).map(([_, value]) => (
                                <MenuItem key={value} value={value}>
                                    {t(`projects.status.${value}`)}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            label={t('projects.form.clientNotes')}
                            value={formData.client_notes}
                            onChange={(e) => setFormData({ ...formData, client_notes: e.target.value })}
                            multiline
                            rows={3}
                            fullWidth
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={handleClose} disabled={loading}>
                        {t('common.cancel')}
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} /> : null}
                    >
                        {mode === 'create' ? t('common.create') : t('common.save')}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}
