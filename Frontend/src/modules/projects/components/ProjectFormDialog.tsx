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
        expired_days: 10, // Default 10 days
        expired_date: '',
    });

    useEffect(() => {
        if (mode === 'edit' && project) {
            // Format expired_date to YYYY-MM-DD for date input
            const expiredDate = project.expired_date
                ? new Date(project.expired_date).toISOString().split('T')[0]
                : '';
            setFormData({
                title: project.title,
                status: project.status as any,
                client_notes: project.client_notes || '',
                expired_days: 10,
                expired_date: expiredDate,
            });
        } else {
            setFormData({
                title: '',
                status: ProjectStatus.DRAFT,
                client_notes: '',
                expired_days: 10, // Default 10 days
                expired_date: '',
            });
        }
    }, [project, mode, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Prepare data based on mode and correct interface
            const submitData = mode === 'create'
                ? {
                    title: formData.title,
                    status: ProjectStatus.DRAFT, // Always DRAFT for new projects
                    expired_days: formData.expired_days, // Always include (required with default 10)
                } as ProjectCreate
                : {
                    title: formData.title,
                    status: formData.status,
                    client_notes: formData.client_notes || null,
                    expired_date: formData.expired_date ? new Date(formData.expired_date).toISOString() : null,
                } as ProjectUpdate;

            await onSubmit(submitData);
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
                expired_days: 10, // Reset to default
                expired_date: '',
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

                        {/* Only show status field when editing */}
                        {mode === 'edit' && (
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
                        )}

                        {/* Only show client_notes when editing (not in ProjectCreate interface) */}
                        {mode === 'edit' && (
                            <TextField
                                label={t('projects.form.clientNotes')}
                                value={formData.client_notes}
                                onChange={(e) => setFormData({ ...formData, client_notes: e.target.value })}
                                multiline
                                rows={3}
                                fullWidth
                                disabled
                            />
                        )}

                        {/* Expired date field for edit mode */}
                        {mode === 'edit' && (
                            <TextField
                                label={t('projects.form.expiredDate', 'Expiration Date')}
                                value={formData.expired_date}
                                onChange={(e) => setFormData({ ...formData, expired_date: e.target.value })}
                                type="date"
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                helperText={t('projects.form.expiredDateHelp', 'Set the expiration date for client access')}
                            />
                        )}

                        {/* Expired days field for create mode - Required with default 110 */}
                        {mode === 'create' && (
                            <TextField
                                label={t('projects.form.expiredDays', 'Expiration (days)')}
                                value={formData.expired_days}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    expired_days: e.target.value ? parseInt(e.target.value) : 10
                                })}
                                type="number"
                                fullWidth
                                required
                                inputProps={{ min: 1 }}
                                helperText={t('projects.form.expiredDaysHelp', 'Set expiration days for client access (default: 10 days)')}
                            />
                        )}
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
