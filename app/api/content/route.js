import { NextResponse } from "next/server";
import { Connect } from "../../database/Connect";
import Uploadcontent from "../../models/uploadcontentModel";

export async function POST(req) {
  try {
    const { userid, username, type, title,style, content } = await req.json();
    await Connect();
    const newContent = await Uploadcontent.create({
      userid: userid,
      username: username,
      type: type,
      title: title,
      topictype:"null",
      style: style,
      content: content,
      first_image: "null",
    });
    return NextResponse.json({ success: true, content: newContent });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


export async function GET(req) {
  try {
    const userid = req.nextUrl.searchParams.get("userid");

     
    await Connect();
    const content = await Uploadcontent.find({ userid: userid });
    return NextResponse.json({ success: true, content: content });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
