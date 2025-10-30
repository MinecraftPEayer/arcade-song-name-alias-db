import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import fs from 'fs';
import axios from 'axios';
import { verify } from 'jsonwebtoken';

const filePath = process.env.TEMP_FILE_PATH ?? '/tmp';

const fetchAndSaveSongData = async (type: string) =>
    fs.writeFileSync(
        filePath + `/songs_${type}.json`,
        JSON.stringify({
            data: (
                await axios.get(
                    process.env.SONG_DATA_URL?.replace('__type__', type) ?? '',
                )
            ).data,
            time: Date.now(),
        }),
    );

export const POST = async (
    req: NextRequest,
    { params }: { params: Promise<{ type: string }> },
) => {
    const token = req.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
        return NextResponse.json(
            { message: 'Unauthorized', code: 401 },
            { status: 401 },
        );
    }

    try {
        const userId = verify(token, process.env.DISCORD_APP_SECRET!) as {
            id: string;
        };
        if (!userId) {
            return NextResponse.json(
                { message: 'Unauthorized', code: 401 },
                { status: 401 },
            );
        }

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

        if (!fs.existsSync(filePath)) fs.mkdirSync(filePath);

        if (!fs.existsSync(filePath + `/songs_${type}.json`))
            await fetchAndSaveSongData(type);
        const songData = JSON.parse(
            fs.readFileSync(filePath + `/songs_${type}.json`, 'utf-8'),
        );
        if (Date.now() - songData.time >= 1000 * 60 * 60 * 24)
            await fetchAndSaveSongData(type);

        const client = new MongoClient(process.env.MONGODB_URI ?? '');
        await client.connect();

        const db = client.db('main');
        const collection = db.collection('arcades');
        let arcadeData = (await collection.findOne({
            type: type,
        })) as ArcadeData | null;
        if (!arcadeData) {
            await collection.insertOne({ type: type });
            arcadeData = (await collection.findOne({
                type: type,
            })) as ArcadeData | null;
        }
        if (!arcadeData)
            return NextResponse.json(
                { code: 500, message: 'Internal Server Error' },
                { status: 500 },
            );

        arcadeData.data = arcadeData.data || [];

        const data = arcadeData.data;
        const body = (await req.json()) as ContributeData;

        if (!body || !body.name || !body.alias)
            return NextResponse.json(
                {
                    code: 400,
                    message: 'Bad Request',
                    error: 'wrong syntax or missing name or alias',
                },
                { status: 400 },
            );

        if (
            !songData.data.songs
                .map((song: { title: string }) => song.title)
                .some((title: string) => title === body.name)
        )
            return NextResponse.json(
                { code: 400, message: 'Bad Request', error: 'name not exist' },
                { status: 400 },
            );

        if (data.some((item) => item.name === body.name)) {
            const index = data.indexOf(
                data.find((item) => item.name === body.name)!,
            );

            if (index === -1)
                return NextResponse.json(
                    { code: 500, message: 'Internal Server Error' },
                    { status: 500 },
                );

            const nowData = data[index];
            body.alias = body.alias.filter(
                (item) => !nowData.alias.some((alia) => alia.alia === item)
            )
            nowData.alias.push(
                ...body.alias.map((alia: string) => ({
                    contributor: userId.id,
                    alia: alia.trim(),
                })),
            );
            data[index] = nowData;
        } else {
            data.push({
                name: body.name,
                alias: body.alias.map((alia) => ({
                    contributor: userId.id,
                    alia: alia,
                })),
            });
        }

        arcadeData.data = data;
        await collection.updateOne(
            { _id: arcadeData._id },
            { $set: { data: arcadeData.data } },
        );
    } catch {
        return NextResponse.json(
            { message: 'Unauthorized', code: 401 },
            { status: 401 },
        );
    }

    return NextResponse.json({ code: 200, message: 'OK' }, { status: 200 });
};
