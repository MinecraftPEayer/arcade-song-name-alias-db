import {
    Avatar,
    Tooltip,
    Autocomplete,
    TextField,
    Chip,
    Button,
    Link,
} from '@mui/material';
import axios from 'axios';
import { useState } from 'react';

const MainForm = ({
    loggedIn,
    userInfo,
    arcadeList,
    selectedArcade,
    songName,
    aliases,
    setSelectedArcade,
    setSongName,
    setAliases,
    searchList,
    setSearchQuery,
}: {
    loggedIn: boolean;
    userInfo: { id: string; username: string; avatar: string } | null;
    arcadeList: Array<{ id: string; name: string }>;
    selectedArcade: string;
    songName: string;
    aliases: Array<string>;
    setSelectedArcade: (arcadeId: string) => void;
    setSongName: (songName: string) => void;
    setAliases: (aliases: Array<string>) => void;
    searchList: Array<{ label: string }>;
    setSearchQuery: (query: string) => void;
}) => {
    const [sending, setSending] = useState(false);
    const [submitColor, setSubmitColor] = useState<
        'primary' | 'success' | 'error'
    >('primary');

    const handleSubmit = async () => {
        setSending(true);
        const resp = await axios.post(
            'api/contribute/' + selectedArcade,
            {
                name: songName,
                alias: aliases,
            },
            {
                headers: {
                    Authorization: `Bearer ${
                        document.cookie
                            .split('; ')
                            .find((row) => row.startsWith('token='))
                            ?.split('=')[1]
                    }`,
                },
            },
        );

        if (resp.status === 200) {
            setSubmitColor('success');
            setSending(false);

            setTimeout(() => {
                setSubmitColor('primary');
            }, 3000);
        }
    };
    return (
        <div className="bg-gray-800 p-5 rounded-2xl flex">
            <div>
                <div className="flex h-8 leading-8 mb-4">
                    <p>Contribute as </p>
                    <Avatar
                        src={
                            loggedIn
                                ? `https://cdn.discordapp.com/avatars/${userInfo?.id}/${userInfo?.avatar}.webp`
                                : ''
                        }
                        sx={{
                            width: 32,
                            height: 32,
                            marginLeft: 1,
                            marginRight: 1,
                        }}
                    />
                    <p>
                        <Tooltip
                            title={loggedIn ? userInfo?.id : 'Loading...'}
                            placement="top"
                        >
                            <b>
                                {loggedIn ? userInfo?.username : 'Loading...'}
                            </b>
                        </Tooltip>
                    </p>
                    {loggedIn ? (
                        <Link
                            href="/auth/discord/logout"
                            underline="none"
                            sx={{ ml: 2 }}
                        >
                            Logout
                        </Link>
                    ) : (
                        <></>
                    )}
                </div>
                <div>
                    <Autocomplete
                        sx={{ width: 400 }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Select Arcade"
                                variant="outlined"
                            />
                        )}
                        isOptionEqualToValue={(option, value) =>
                            option === value
                        }
                        options={arcadeList.map((arcade) => ({
                            label: arcade.name,
                            id: arcade.id,
                        }))}
                        disabled={!loggedIn}
                        onChange={(_, value) => {
                            setSelectedArcade(value?.id ?? '');
                            setSongName('');
                            setAliases([]);
                        }}
                    />
                </div>

                <div>
                    <Autocomplete
                        disabled={selectedArcade === ''}
                        sx={{ width: 400, marginTop: 2 }}
                        isOptionEqualToValue={(option, value) =>
                            option === value
                        }
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Song Name"
                                variant="outlined"
                            />
                        )}
                        options={searchList}
                        onInputChange={(_, value) => setSearchQuery(value)}
                        onChange={(_, value) => {
                            setSongName(value?.label ?? '');
                            setAliases([]);
                        }}
                    />
                </div>

                <div>
                    <Autocomplete
                        options={[]}
                        sx={{ width: 400, marginTop: 2 }}
                        multiple
                        freeSolo
                        disabled={songName === ''}
                        defaultValue={[]}
                        value={aliases}
                        renderInput={(props) => (
                            <TextField
                                {...props}
                                label="Alias"
                                variant="outlined"
                            />
                        )}
                        renderValue={(value: readonly string[], getItemProps) =>
                            value.map((option: string, index: number) => {
                                const { key, ...itemProps } = getItemProps({
                                    index,
                                });
                                return (
                                    <Chip
                                        variant="outlined"
                                        label={option}
                                        key={key}
                                        {...itemProps}
                                    />
                                );
                            })
                        }
                        onChange={(_, value) => {
                            setAliases(value);
                        }}
                    />
                </div>

                <div>
                    <Button
                        variant="contained"
                        color={submitColor}
                        disabled={
                            !loggedIn || songName === '' || aliases.length === 0
                        }
                        onClick={handleSubmit}
                        loading={sending}
                        sx={{ width: 400, marginTop: 2 }}
                    >
                        {submitColor === 'success'
                            ? 'Success'
                            : submitColor === 'error'
                              ? 'Failed'
                              : 'Submit'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default MainForm;
