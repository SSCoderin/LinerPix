import { NextResponse } from "next/server";
import { Connect } from "../../database/Connect";
import Voiceanalysis from "@/app/models/voiceanalysis";

export async function POST(req) {
    try {
        const { userid,contentid, title, content_description, voice_analysis } = await req.json();
        await Connect();
        const newVoiceanalysis = await Voiceanalysis.create({
            userid: userid,
            contentid: contentid,
            title: title,
            content_description: content_description,
            voice_analysis: voice_analysis,
        });
        return NextResponse.json({ success: true, voiceanalysis: newVoiceanalysis });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(req) {
    try {
        const userid = req.nextUrl.searchParams.get("userid");
        await Connect();
        const voiceanalysis = await Voiceanalysis.find({ userid: userid });
        return NextResponse.json({ success: true, voiceanalysis: voiceanalysis });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}