import { NextResponse } from "next/server";
import Admintask from "@/app/models/admin/admintask";
import AdminContent from "@/app/models/admin/adminContent";
import { Connect } from "@/app/database/Connect";


export async function POST(req) {
    try {
        const { userid, TaskTitle,Mode, contentTitles, content_ids } = await req.json();
        await Connect();
        const newContent = await Admintask.create({
            userid: userid,
            TaskTitle: TaskTitle,
            Mode: Mode,
            contentTitles: contentTitles,
            content_ids: content_ids,
        });
        return NextResponse.json({ success: true, content: newContent });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

  export async function GET(req) {
      try {
        const taskid = req.nextUrl.searchParams.get("taskid");
        if (taskid) {
            await Connect();
            const TaskData = await Admintask.findById(taskid);
            const ContentData = await AdminContent.find({ _id: { $in: TaskData.content_ids } }).select('-__v').lean();
            return NextResponse.json({ success: true, TaskData: TaskData, ContentData: ContentData });
        }
          await Connect();
          const TaskData = await Admintask.find();
          return NextResponse.json({ success: true, TaskData: TaskData });
      } catch (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
      }
  }