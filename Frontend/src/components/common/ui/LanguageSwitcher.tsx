import { Box, Button, Menu, MenuItem } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import LanguageIcon from '@mui/icons-material/Language';

export function LanguageSwitcher() {
    const { i18n } = useTranslation();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLanguageChange = (language: string) => {
        i18n.changeLanguage(language);
        handleClose();
    };

    const languages = [
        { code: 'en', name: 'English' },
        { code: 'vi', name: 'Tiếng Việt' },
    ];

    const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

    return (
        <Box>
            <Button
                variant="text"
                onClick={handleClick}
                startIcon={<LanguageIcon />}
                sx={{
                    color: 'var(--text-primary)',
                    textTransform: 'none',
                    fontSize: 'var(--font-size-sm)',
                    minWidth: 'auto',
                    px: 1,
                }}
            >
                {currentLanguage.name}
            </Button>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                PaperProps={{
                    sx: {
                        backgroundColor: 'var(--bg-primary)',
                        border: '1px solid var(--border-primary)',
                        minWidth: '120px',
                    },
                }}
            >
                {languages.map((language) => (
                    <MenuItem
                        key={language.code}
                        onClick={() => handleLanguageChange(language.code)}
                        selected={i18n.language === language.code}
                        sx={{
                            color: 'var(--text-primary)',
                            backgroundColor: i18n.language === language.code ? 'var(--bg-secondary)' : 'transparent',
                            '&:hover': {
                                backgroundColor: 'var(--bg-secondary)',
                            },
                            fontSize: 'var(--font-size-sm)',
                        }}
                    >
                        {language.name}
                    </MenuItem>
                ))}
            </Menu>
        </Box>
    );
}