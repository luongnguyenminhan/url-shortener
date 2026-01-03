import { Box, CircularProgress, Typography } from "@mui/material"

const LoadingScreen = ({ message = "Đang tải..." }) => {
    return (
        <Box
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            minHeight="100vh"
            gap={2}
        >
            <CircularProgress />
            <Typography variant="body1" color="text.secondary">
                {message}
            </Typography>
        </Box>
    )
}

export default LoadingScreen
