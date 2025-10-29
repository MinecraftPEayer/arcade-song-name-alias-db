import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';

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

    return NextResponse.json(
        (
            await axios.get(
                process.env.SONG_DATA_URL?.replace('__type__', type) ?? '',
            )
        ).data,
    );
};
