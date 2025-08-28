import { NextResponse } from "next/server";
import { Connect } from "../../database/Connect";
import Eyeanalysis from "@/app/models/eyeanalysis";


export async function POST(req) {
    try {
        const { userid, contentid, title, content_description, duration, eye_analysis } = await req.json();
        await Connect();
        const newEyeanalysis = await Eyeanalysis.create({
            userid: userid,
            contentid: contentid,
            title: title,
            content_description: content_description,
            duration: duration,
            eye_analysis: eye_analysis,
        });
        return NextResponse.json({ success: true, eyeanalysis: newEyeanalysis });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(req) {
    try {
        const userid = req.nextUrl.searchParams.get("userid");
        await Connect();
        const eyeanalysis = await Eyeanalysis.find({ userid: userid });
        return NextResponse.json({ success: true, eyeanalysis: eyeanalysis });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}