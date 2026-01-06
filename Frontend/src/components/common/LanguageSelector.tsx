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
                color: '#ffffff',
                '& .MuiSelect-select': {
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                },
                '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#ffffff',
                },
                '& .MuiSvgIcon-root': {
                    color: '#ffffff',
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
