import { NextResponse } from "next/server";
import Adminnote from "@/app/models/admin/adminnote";
import { Connect } from "@/app/database/Connect";


export async function POST(req) {
    try {
        const { userid, note } = await req.json();
        await Connect();
        const newContent = await Adminnote.create({
            userid: userid,
            note: note,
        });
        return NextResponse.json({ success: true, content: newContent });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
export async function GET(req) {
    try {
        await Connect();
        const adminnote = await Adminnote.find();
        return NextResponse.json({ success: true, adminnote: adminnote });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        const id = req.nextUrl.searchParams.get("id");
        await Connect();
        const adminnote = await Adminnote.findByIdAndDelete(id);
        return NextResponse.json({ success: true, adminnote: adminnote });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}