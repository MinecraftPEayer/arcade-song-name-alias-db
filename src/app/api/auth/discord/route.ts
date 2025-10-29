import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { MongoClient } from 'mongodb';

export const POST = async (req: NextRequest) => {
    const { code } = await req.json();

    try {
        const resp = await axios.post(
            'https://discord.com/api/oauth2/token',
            new URLSearchParams({
                client_id: process.env.DISCORD_APP_ID!,
                client_secret: process.env.DISCORD_APP_SECRET!,
                grant_type: 'authorization_code',
                code,
                redirect_uri: process.env.DISCORD_APP_REDIRECT_URI!,
            }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            },
        );

        const body = await resp.data;

        if (resp.status === 200) {
            const userInfoResp = await axios.get(
                'https://discord.com/api/users/@me',
                {
                    headers: {
                        Authorization: `Bearer ${body.access_token}`,
                    },
                },
            );

            const userInfo = userInfoResp.data;
            const token = jwt.sign(
                {
                    id: userInfo.id,
                },
                process.env.DISCORD_APP_SECRET!,
                { expiresIn: '7d' },
            );

            const client = new MongoClient(process.env.MONGODB_URI ?? '');
            await client.connect();
            const db = client.db('main');
            const usersCollection = db.collection('users');

            await usersCollection.updateOne(
                { type: 'tokens' },
                {
                    $set: {
                        [`data.${userInfo.id}`]: body.access_token,
                    },
                },
                { upsert: true },
            );

            return NextResponse.json(
                { success: true, token },
                {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                },
            );
        }

        return NextResponse.json(
            { success: false, error: body.error },
            {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                },
            },
        );
    } catch (error) {
        console.error('Error during Discord OAuth:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                },
            },
        );
    }
};
