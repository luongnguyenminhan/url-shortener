import type React from "react"
import { Box, Typography, Button } from "@mui/material"
import { useNavigate } from "react-router-dom"
import { ROUTES } from "../constants"

const NotFoundPage: React.FC = () => {
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
                404
            </Typography>
            <Typography variant="h4" component="h2" gutterBottom>
                Không tìm thấy trang
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph align="center">
                Trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển.
            </Typography>
            <Button variant="contained" color="primary" onClick={() => navigate(ROUTES.HOME)}>
                Quay lại trang chủ
            </Button>
        </Box>
    )
}

export default NotFoundPage
