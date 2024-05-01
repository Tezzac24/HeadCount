import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { createTheme, ThemeProvider } from "@mui/material";
import Test from "./MenuButton";

const theme = createTheme({
  palette: {
    primary: {
      main: "#7EBDC3",
    },
  },
});

export default function ButtonAppBar({ pageName }: { pageName: string }) {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <ThemeProvider theme={theme}>
        <AppBar position="static" color="primary">
          <Toolbar>
            <Test />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              {pageName}
            </Typography>
          </Toolbar>
        </AppBar>
      </ThemeProvider>
    </Box>
  );
}
