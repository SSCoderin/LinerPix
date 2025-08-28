import { NextResponse } from "next/server";
import { Connect } from "../../database/Connect";
import Aivoiceanalysis from "@/app/models/aivoiceanalysis";
import Voiceanalysis from "@/app/models/voiceanalysis";

import { GoogleGenAI } from "@google/genai";
export async function POST(req) {
  try {
    const { userid, analysis_id } = await req.json();
    await Connect();
    const existdata = await Aivoiceanalysis.findOne({
      analysis_id: analysis_id,
    });
    if (existdata) {
      return NextResponse.json({
        success: true,
        aivoiceanalysis: existdata,
      });
    }
    const userreadingdata = await Voiceanalysis.findById(analysis_id);

    const Geminiaianalysis = await GetAianalysis(userreadingdata);
    const newVoiceanalysis = await Aivoiceanalysis.create({
      userid: userid,
      analysis_id: analysis_id,
      aianalysis: Geminiaianalysis,
    });
    return NextResponse.json({
      success: true,
      aivoiceanalysis: newVoiceanalysis,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function GetAianalysis(userreadingdata) {
  console.log(userreadingdata);
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });
  const config = {
    responseMimeType: "text/plain",
  };
  const model = "gemini-2.0-flash";
  const contents = [
    {
      role: "user",
      parts: [
        {
          text: `You are a professional speech analysis AI and UI expert.

Below is a \`voice_analysis\` array containing lines spoken by a user (child reading a story aloud), and the expected correct lines. Your job is to:

### Tasks:
1. Compare \`userReading\` (spoken line) with the expected correct line (Display both the spoken line and the correct line for good understand).
2. Identify:
   - Misread words
   - Incorrect substitutions (e.g., "petal" instead of "pebble")
   - Skipped or added words
3. Provide:
   - Clear, readable visual comparison: correct parts in **green**, errors in **red**
   - Detailed **feedback paragraph** for each line
   - **3–4 specific improvement recommendations**
   - **Helpful educational links** (e.g., pronunciation help, vocabulary, listening practice)
4. In the top also provid ethe overall user reading score ,also suggest good , bad , improvement suggestions ,excelent ...etc (make sure highlight this)
5.in the last aslo provide the overall suggestion or recommendataion, user streanth ans weakness if found to build a interest and confidence in reading for kids.  
5. Format the entire response as a full HTML **\`<body>\`** section only (no \`<html>\` or \`<head>\` tags)
6. Use **Tailwind CSS** for a modern, professional UI. Use cards, grids, shadows, and soft color palette. Emphasize readability.

---


### these are the Expected lines:

${userreadingdata.content_description.map((items) => items.text)}
}
### user read lines Data:

${userreadingdata.voice_analysis.map((items) => items.userReading)}
`,
        },
      ],
    },
  ];

  const response = await ai.models.generateContentStream({
    model,
    config,
    contents,
  });

  let result = "";
  for await (const chunk of response) {
    result += chunk.text;
  }
  return result;
}
