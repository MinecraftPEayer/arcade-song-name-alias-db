import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import { MongoClient } from 'mongodb';

export const GET = async (req: NextRequest) => {
    const token = req.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
        return NextResponse.json(
            { message: 'Unauthorized', code: 401 },
            { status: 401 },
        );
    }

    try {
        const decoded = verify(token, process.env.DISCORD_APP_SECRET!);
        const userId = (decoded as { id: string }).id;

        const client = new MongoClient(process.env.MONGODB_URI ?? '');
        await client.connect();
        const db = client.db('main');
        const usersCollection = db.collection('users');

        const userData = await usersCollection.findOne({ type: 'tokens' });

        const accessToken = userData ? userData.data[userId] : null;

        if (!accessToken) {
            return NextResponse.json(
                { message: 'Unauthorized', code: 401 },
                { status: 401 },
            );
        }

        const resp = await fetch('https://discord.com/api/users/@me', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (resp.status !== 200) {
            return NextResponse.json(
                { message: 'Unauthorized', code: 401 },
                { status: 401 },
            );
        }

        const userInfo = await resp.json();

        return NextResponse.json({ user: userInfo }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { message: 'Unauthorized', code: 401 },
            { status: 401 },
        );
    }
};
