import { NextResponse } from "next/server";
import { Connect } from "@/app/database/Connect";
import Adminvoiceanalysis from "@/app/models/admin/adminvoiceanalysis";

export async function POST(req) {
    try {
        await Connect();
        const { studentid, studentname,content_title, task_id, student_email, content_id, voice_analysis } = await req.json();
        
        const newVoiceanalysis = await Adminvoiceanalysis.create({
            studentid,
            studentname,
            content_title,
            task_id,
            student_email,
            content_id,
            voice_analysis,
        });
        
        return NextResponse.json({ success: true, voiceanalysis: newVoiceanalysis });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(req) {
    try {
        const taskid = req.nextUrl.searchParams.get("taskid");
        await Connect();
        const voiceanalysis = await Adminvoiceanalysis.find({ task_id: taskid });
        return NextResponse.json({ success: true, voiceanalysis: voiceanalysis });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}