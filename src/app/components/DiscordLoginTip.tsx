import { Button } from '@mui/material';
import Image from 'next/image';

const DiscordLoginTip = () => {
    return (
        <div className="bg-gray-800 p-4 rounded-md">
            <p className="text-sm text-gray-400">
                To contribute, please log in with Discord.
            </p>
            <Button
                variant="contained"
                sx={{
                    backgroundColor: '#5865F2',
                    ':hover': { backgroundColor: '#4752C4' },
                    color: '#FFFFFF',
                    mt: 2,
                    width: '100%',
                }}
                startIcon={
                    <Image
                        src="/discord.svg"
                        alt="Discord Logo"
                        width={20}
                        height={20}
                    />
                }
                href={process.env.NEXT_PUBLIC_DISCORD_AUTHORIZE_URL || ''}
            >
                Log in with Discord
            </Button>
        </div>
    );
};

export default DiscordLoginTip;
