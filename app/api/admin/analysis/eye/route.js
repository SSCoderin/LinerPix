import { NextResponse } from "next/server";
import { Connect } from "@/app/database/Connect";
import Admineyeanalysis from "@/app/models/admin/admineyeanalysis";



export async function POST(req){
    try {
       const { studentid, studentname, content_title,task_id, student_email, content_id,duration, eye_analysis } = await req.json()
        await Connect();
        const newEyeanalysis = await Admineyeanalysis.create({
            studentid: studentid,
            studentname: studentname,
            content_title: content_title,
            task_id: task_id,
            student_email: student_email,
            content_id: content_id,
            duration: duration,
            eye_analysis: eye_analysis,
        });
        return NextResponse.json({ success: true, eyeanalysis: newEyeanalysis });
        
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}




export async function GET(req){
    try {
        const taskid = req.nextUrl.searchParams.get("taskid");
        await Connect();
        const eyeanalysis = await Admineyeanalysis.find({ task_id: taskid });
        return NextResponse.json({ success: true, eyeanalysis: eyeanalysis });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}