import React from 'react'
import { Select, MenuItem, Box, type SelectChangeEvent } from '@mui/material'
import { useLanguage } from '../../hooks/useLanguage'

const LanguageSelector: React.FC = () => {
    const { currentLanguage, changeLanguage, languages } = useLanguage()

    const handleChange = (event: SelectChangeEvent) => {
        changeLanguage(event.target.value)
    }

    return (
        <Select
            value={currentLanguage}
            onChange={handleChange}
            size="small"
            sx={{
                minWidth: 120,
                '& .MuiSelect-select': {
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                },
            }}
        >
            {languages.map((lang) => (
                <MenuItem key={lang.code} value={lang.code}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span>{lang.name}</span>
                    </Box>
                </MenuItem>
            ))}
        </Select>
    )
}

export default LanguageSelector
