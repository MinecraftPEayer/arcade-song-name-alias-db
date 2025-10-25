"use client"
import { TextField } from '@mui/material'
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
    },
});

export default function Home() {
    return (
        <div className="h-full flex justify-center content-center flex-wrap">
            <ThemeProvider theme={darkTheme}>
                <CssBaseline />
                <div className="bg-gray-800 p-5 rounded-2xl">
                </div>
            </ThemeProvider>
        </div>
    );
}
