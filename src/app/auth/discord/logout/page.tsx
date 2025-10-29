'use client';

import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';
import axios from 'axios';
import { useEffect } from 'react';

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
    },
});

const Page = () => {
    useEffect(() => {
        const logout = async () => {
            const resp = await axios.delete('/api/auth/discord/logout', {
                headers: {
                    Authorization: `Bearer ${
                        document.cookie
                            .split('; ')
                            .find((row) => row.startsWith('token='))
                            ?.split('=')[1]
                    }`,
                },
                validateStatus: (status) => status === 200 || status === 401,
            });

            if (resp.status === 200) {
                document.cookie = `token=; path=/; max-age=0`;
            }

            await new Promise((resolve) => setTimeout(resolve, 3000));

            window.location.href = '/';
        };

        logout();
    }, []);

    return (
        <div className="h-full flex justify-center content-center flex-wrap">
            <ThemeProvider theme={darkTheme}>
                <CssBaseline />
                <p className="text-md text-gray-400">
                    You have been logged out.
                </p>
            </ThemeProvider>
        </div>
    );
};

export default Page;
