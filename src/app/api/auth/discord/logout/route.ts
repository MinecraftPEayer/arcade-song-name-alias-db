import { verify } from 'jsonwebtoken';
import { MongoClient } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';

export const DELETE = async (req: NextRequest) => {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
        return NextResponse.json(
            { message: 'Unauthorized', code: 401 },
            { status: 401 },
        );
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = verify(token, process.env.DISCORD_APP_SECRET!);
        const userId = (decoded as { id: string }).id;

        const client = new MongoClient(process.env.MONGODB_URI ?? '');
        await client.connect();
        const db = client.db('main');
        const usersCollection = db.collection('users');

        const userData = await usersCollection.findOne({ type: 'tokens' });

        if (userData && userData.data[userId]) {
            delete userData.data[userId];
            await usersCollection.updateOne(
                { type: 'tokens' },
                { $set: { data: userData.data } },
            );
        }

        return NextResponse.json(
            { message: 'Logged out successfully' },
            { status: 200 },
        );
    } catch {
        return NextResponse.json(
            { message: 'Unauthorized', code: 401 },
            { status: 401 },
        );
    }
};
