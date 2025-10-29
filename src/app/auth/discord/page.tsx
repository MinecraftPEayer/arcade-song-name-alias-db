'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import axios from 'axios';
import { createTheme, CssBaseline, ThemeProvider } from '@mui/material';

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
    },
});

const Page = () => {
    const params = useSearchParams();

    useEffect(() => {
        const code = params.get('code');
        const authenticate = async () => {
            const resp = await axios.post('/api/auth/discord', { code });
            const body = resp.data;
            if (body.success) {
                const { token } = body;
                document.cookie = `token=${token}; path=/; max-age=604800`;
                window.location.href = '/';
            }
        };
        if (!code) {
            window.location.href =
                process.env.NEXT_PUBLIC_DISCORD_AUTHORIZE_URL || '';
        } else {
            authenticate();
        }
    }, []);

    return (
        <div className="h-full flex justify-center content-center flex-wrap">
            <ThemeProvider theme={darkTheme}>
                <CssBaseline />
                <p className="text-md text-gray-400">
                    Please wait while we are logging you in...
                </p>
            </ThemeProvider>
        </div>
    );
};

export default Page;
