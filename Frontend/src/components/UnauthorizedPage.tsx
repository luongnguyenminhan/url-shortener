import type React from "react"
import { Box, Typography, Button } from "@mui/material"
import { useNavigate } from "react-router-dom"
import { ROUTES } from "../constants"

const UnauthorizedPage: React.FC = () => {
    const navigate = useNavigate()

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "80vh",
            }}
        >
            <Typography variant="h1" component="h1" gutterBottom>
                403
            </Typography>
            <Typography variant="h4" component="h2" gutterBottom>
                Không có quyền truy cập
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph align="center">
                Bạn không có quyền truy cập vào trang này.
            </Typography>
            <Button variant="contained" color="primary" onClick={() => navigate(ROUTES.DASHBOARD)}>
                Quay lại trang chủ
            </Button>
        </Box>
    )
}

export default UnauthorizedPage
