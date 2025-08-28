import { NextResponse } from "next/server";
import Submitted from "@/app/models/admin/submitted";
import { Connect } from "@/app/database/Connect";

export async function GET(req) {
    try {
        const userid = req.nextUrl.searchParams.get("userid");
        await Connect();
        const submitted = await Submitted.find({userid: userid});
        return NextResponse.json({ success: true, submitted: submitted });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const { userid, username, task_id } = await req.json();
        await Connect();
        const newSubmitted = await Submitted.create({
            userid: userid,
            username: username,
            task_id: task_id,
        });
        return NextResponse.json({ success: true, submitted: newSubmitted });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}