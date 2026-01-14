import { ThemeProvider, createTheme } from "@mui/material/styles"
import CssBaseline from "@mui/material/CssBaseline"
import { Box } from "@mui/material"
import { RouterProvider } from "react-router-dom"
import router from "./routers"
import './styles/globals.css'
import "react-toastify/dist/ReactToastify.css"
import { ToastContainer } from "./hooks/useShowToast"

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
  components: {
    MuiTab: {
      styleOverrides: {
        root: {
          // Reset global button styles
          backgroundColor: 'transparent',
          color: 'inherit',
          borderRadius: 0,
          '&:hover': {
            backgroundColor: 'rgba(25, 118, 210, 0.04)', // Light primary wash on hover
            color: 'inherit',
          },
          '&.Mui-selected': {
            backgroundColor: 'transparent',
            color: '#1976d2', // Primary color for selected state
          },
        },
      },
    },
  },
})

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ToastContainer />
      <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <RouterProvider router={router} />
      </Box>
    </ThemeProvider>
  )
}

export default App
