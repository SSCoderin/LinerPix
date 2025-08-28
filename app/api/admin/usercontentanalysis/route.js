import { NextResponse } from "next/server";
import { Connect } from "@/app/database/Connect";
import Eyeanalysis from "@/app/models/eyeanalysis";
import Voiceanalysis from "@/app/models/voiceanalysis";
import Genimage from "@/app/models/genimageModel";


export async function GET(req) {
    try {
        const content_id = req.nextUrl.searchParams.get("content_id");
        await Connect();
        const voiceAnalysis = await Voiceanalysis.find({ contentid: content_id });
        const eyeAnalysis = await Eyeanalysis.find({ contentid: content_id });
        const genimage = await Genimage.find({ contentid: content_id });    
        return NextResponse.json({success: true, voiceAnalysis: voiceAnalysis, eyeAnalysis: eyeAnalysis, genimage: genimage});
        
    } catch (error) {
        
    }
}