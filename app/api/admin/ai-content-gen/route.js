import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { Connect } from "@/app/database/Connect";
export async function POST(req) {
  try {
    const { userid, topic, character, description } = await req.json();
    await Connect();
    const storycontent = await generateStory(topic, description);
  
    return NextResponse.json({ success: true, aiContentData: {
        userid: userid,
        content:{
            type: "AI-Generated",
            title: topic,
            style: character,
            content: storycontent

        }
    } });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function generateStory(topic, description) {
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
          text: `Generate a short simple, ${topic} story for a young child of age 10-12 in short and simple sentences. The story should be about ${description}.`,
        },
      ],
    },
  ];

  const response = await ai.models.generateContentStream({
    model,
    config,
    contents,
  });

  let fullResponse = "";
  for await (const chunk of response) {
    fullResponse += chunk.text;
  }
  return fullResponse;
}
