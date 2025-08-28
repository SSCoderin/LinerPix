import { NextResponse } from "next/server";
import { Connect } from "../../database/Connect";
import Uploadcontent from "@/app/models/uploadcontentModel";



export async function GET(req) {
    try {
        await Connect();
        
       
        
        const content = await Uploadcontent.find().lean();
        return NextResponse.json({ success: true, AllUserContent: content });
    } catch (error) {
        console.error("Error in GET request:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}