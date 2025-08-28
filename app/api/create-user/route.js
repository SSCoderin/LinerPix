import { NextResponse } from "next/server";
import { Connect } from "../../database/Connect";
import User from "../../models/userModel";

export async function POST(req) {
  try {
    const { userid, username, useremail } = await req.json();
    
    if (!userid || !username || !useremail) {
      return NextResponse.json({ error: "User data is required" }, { status: 400 });
    }

    await Connect();
    const existingUser = await User.findOne({ id: userid });
    if (existingUser) {
      return NextResponse.json({ message: "User already exists" }, { status: 200 });
    }

    const newUser = await User.create({
      id: userid,
      name: username,
      email: useremail,
      admin: false
    });

    return NextResponse.json({ success: true, user: newUser,calibrated : true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

  export async function GET(req) {
    try {
      const userid = req.nextUrl.searchParams.get("userid");
    
    

      await Connect();
      const user = await User.findOne({ id: userid });
    

      return NextResponse.json({ success: true, user: user });
    } catch (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }