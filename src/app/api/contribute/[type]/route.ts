import { NextRequest, NextResponse } from "next/server";
import fs from 'fs';
import axios from "axios";

type ContributeData = {
    name: string;
    alias: string[];
}

const filePath = process.env.TEMP_FILE_PATH ?? '/tmp'

const fetchAndSaveSongData = async (type: string) => fs.writeFileSync(filePath + `/songs_${type}.json`, JSON.stringify({ data: (await axios.get(process.env.SONG_DATA_URL?.replace('__type__', type) ?? '')).data, time: Date.now() }))

export const POST = async (req: NextRequest, { params }: { params: Promise<{ type: string }>}) => {
    const type = (await params).type
    const arcadeList = fs.readFileSync('public/arcades.json')
    if (!arcadeList.includes(type)) return NextResponse.json({ code: 404, message: "Not Found" }, { status: 404 })

    if (!fs.existsSync(filePath)) fs.mkdirSync(filePath);
    if (!fs.existsSync(filePath + `/data_${type}.json`)) fs.writeFileSync(filePath + `/data_${type}.json`, '[]', 'utf-8')

    if (!fs.existsSync(filePath + `/songs_${type}.json`)) await fetchAndSaveSongData(type)
    const songData = JSON.parse(fs.readFileSync(filePath + `/songs_${type}.json`, 'utf-8'))
    if (Date.now() - songData.time >= 1000 * 60 * 60 * 24) await fetchAndSaveSongData(type)

    let data = JSON.parse(fs.readFileSync(filePath + `/data_${type}.json`, 'utf-8')) as ContributeData[]
    let body = (await req.json()) as ContributeData;

    if (!body || !body.name || !body.alias) return NextResponse.json({ code: 400, message: 'Bad Request', error: 'wrong syntax or missing name or alias' }, { status: 400 })

    if (!songData.data.songs.map((song: any) => song.title).some((title: string) => title === body.name))
        return NextResponse.json({ code: 400, message: 'Bad Request', error: 'name not exist' }, { status: 400 })

    if (data.some(item => item.name === body.name)) {
        const index = data.indexOf(data.find(item => item.name === body.name)!)

        if (index === -1) return NextResponse.json({ code: 500, message: 'Internal Server Error' }, { status: 500 })

        let nowData = data[index];
        nowData.alias = nowData.alias.filter(item => !body.alias.some(alia => alia === item))
        nowData.alias.push(...body.alias)
        data[index] = nowData
    } else {
        data.push(body);
    }

    fs.writeFileSync(filePath + `/data_${type}.json`, JSON.stringify(data))
    return NextResponse.json({ code: 200, message: 'OK' }, { status: 200 })
}