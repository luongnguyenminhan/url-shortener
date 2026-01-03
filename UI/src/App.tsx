import { ThemeProvider, createTheme } from "@mui/material/styles"
import CssBaseline from "@mui/material/CssBaseline"
import { Box } from "@mui/material"
import { RouterProvider } from "react-router-dom"
import router from "./routers"
import './styles/globals.css'
import "react-toastify/dist/ReactToastify.css"

const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
})

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <RouterProvider router={router} />
      </Box>
    </ThemeProvider>
  )
}

export default App
