import { Box, TextField, InputAdornment, Button, ToggleButtonGroup, ToggleButton } from '@mui/material';
import {
    Search as SearchIcon,
    FilterList as FilterListIcon,
    Sort as SortIcon,
    GridView as GridViewIcon,
    ViewList as ViewListIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface ProjectToolbarProps {
    searchQuery: string;
    onSearchChange: (value: string) => void;
    viewMode: 'grid' | 'list';
    onViewModeChange: (mode: 'grid' | 'list') => void;
}

export function ProjectToolbar({ searchQuery, onSearchChange, viewMode, onViewModeChange }: ProjectToolbarProps) {
    const { t } = useTranslation();

    return (
        <Box sx={{
            mb: 4,
            display: 'flex',
            gap: 2,
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between'
        }}>
            <TextField
                placeholder={t('projects.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                sx={{ flex: '1 1 300px', maxWidth: 500 }}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon />
                        </InputAdornment>
                    ),
                }}
            />

            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                <Button
                    variant="outlined"
                    startIcon={<FilterListIcon />}
                >
                    {t('projects.filter')}
                </Button>

                <Button
                    variant="outlined"
                    startIcon={<SortIcon />}
                >
                    {t('projects.sortBy')}
                </Button>

                <ToggleButtonGroup
                    value={viewMode}
                    exclusive
                    onChange={(_, newMode) => newMode && onViewModeChange(newMode)}
                    size="small"
                >
                    <ToggleButton value="grid">
                        <GridViewIcon fontSize="small" />
                    </ToggleButton>
                    <ToggleButton value="list">
                        <ViewListIcon fontSize="small" />
                    </ToggleButton>
                </ToggleButtonGroup>
            </Box>
        </Box>
    );
}
