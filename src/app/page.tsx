'use client';
import {
    Alert,
    Autocomplete,
    Avatar,
    Button,
    Chip,
    TextField,
    Tooltip,
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import axios from 'axios';
import { useEffect, useState } from 'react';
import MainForm from './components/MainForm';
import DiscordLoginTip from './components/DiscordLoginTip';

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
    },
});

export default function Home() {
    const [arcadeList, setArcadeList] = useState<
        Array<{ id: string; name: string }>
    >([]);
    const [songNameList, setSongNameList] = useState<Array<string>>([]);
    const [selectedArcade, setSelectedArcade] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchList, setSearchList] = useState<
        Array<{ label: string; id: string }>
    >([]);
    const [toastOpen, setToastOpen] = useState(false);
    const [noLogin, setNoLogin] = useState(false);
    const [loggedIn, setLoggedIn] = useState(false);
    const [userInfo, setUserInfo] = useState<{
        id: string;
        username: string;
        avatar: string;
    } | null>(null);

    const [songName, setSongName] = useState('');
    const [aliases, setAliases] = useState<Array<string>>([]);

    useEffect(() => {
        const fetchArcadeList = async () => {
            const response = await axios.get('/arcades.json');
            setArcadeList(response.data);
        };

        const fetchUserInfo = async () => {
            try {
                const response = await axios.get('/api/discordapi/user', {
                    headers: {
                        Authorization: `Bearer ${
                            document.cookie
                                .split('; ')
                                .find((row) => row.startsWith('token='))
                                ?.split('=')[1]
                        }`,
                    },
                    validateStatus: (status) =>
                        status === 200 || status === 401,
                });
                if (response.status === 200) {
                    setLoggedIn(true);
                    setUserInfo(response.data.user);
                } else {
                    setLoggedIn(false);
                    setNoLogin(true);
                }
            } catch {}
        };

        fetchUserInfo();
        fetchArcadeList();
    }, []);

    useEffect(() => {
        if (toastOpen) {
            const timer = setTimeout(() => {
                setToastOpen(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [toastOpen]);

    useEffect(() => {
        const fetchSongData = async () => {
            if (selectedArcade === '') return;
            try {
                const response = await axios.get(
                    `/api/getSongData/${selectedArcade}`,
                );
                const songData = response.data;
                const names = songData.songs.map(
                    (song: { songId: string }) => song.songId,
                );
                setSongNameList(names);
            } catch (error) {
                console.error('Error fetching song data:', error);
            }
        };
        fetchSongData();
    }, [selectedArcade]);

    useEffect(() => {
        const filtering = async () => {
            const filtered = songNameList
                .filter((name) =>
                    name.toLowerCase().includes(searchQuery.toLowerCase()),
                )
                .slice(0, 50);
            setSearchList(
                filtered.map((name, index) => ({
                    label: name,
                    id: index.toString(),
                })),
            );
        };
        filtering();
    }, [searchQuery, songNameList]);

    return (
        <div className="h-full flex justify-center content-center flex-wrap">
            <ThemeProvider theme={darkTheme}>
                <CssBaseline />
                <div className="relative">
                    {!noLogin ? (
                        <MainForm
                            loggedIn={loggedIn}
                            userInfo={userInfo}
                            arcadeList={arcadeList}
                            selectedArcade={selectedArcade}
                            songName={songName}
                            aliases={aliases}
                            searchList={searchList}
                            setSelectedArcade={setSelectedArcade}
                            setSongName={setSongName}
                            setAliases={setAliases}
                            setSearchQuery={setSearchQuery}
                        />
                    ) : (
                        <DiscordLoginTip />
                    )}
                </div>
                <div
                    className={`absolute right-10 bottom-10 transition ${toastOpen ? 'opacity-100' : 'opacity-0'}`}
                >
                    <Alert severity="info">
                        Song data fetched successfully.
                    </Alert>
                </div>
            </ThemeProvider>
        </div>
    );
}
