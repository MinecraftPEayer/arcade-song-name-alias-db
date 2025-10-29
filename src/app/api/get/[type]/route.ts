import { MongoClient } from 'mongodb';
import fs from 'fs';
import { NextRequest, NextResponse } from 'next/server';

export const GET = async (
    req: NextRequest,
    { params }: { params: Promise<{ type: string }> },
) => {
    const type = (await params).type;

    const arcadeList = JSON.parse(
        fs.readFileSync('public/arcades.json', 'utf-8'),
    );
    if (
        !arcadeList
            .map((arcade: { id: string; name: string }) => arcade.id)
            .includes(type)
    )
        return NextResponse.json(
            { code: 404, message: 'Not Found' },
            { status: 404 },
        );

    const client = new MongoClient(process.env.MONGODB_URI ?? '');
    await client.connect();

    const data = (
        (await client
            .db('main')
            .collection('arcades')
            .findOne({ type: type })) as ArcadeData | null
    )?.data.map((item) => ({
        name: item.name,
        alias: item.alias.map((alia) => alia.alia),
    }));
    if (!data) {
        return NextResponse.json([]);
    }
    return NextResponse.json(data);
};
