import { NextResponse } from "next/server";
import { Connect } from "../../database/Connect";
import Uploadcontent from "@/app/models/uploadcontentModel";
import { GoogleGenAI } from "@google/genai";

export async function POST(req) {
  try {
    const { userid,username, topictype, topic  , character, description } = await req.json();
    await Connect();
    const storycontent = await generateStory(topic,topictype, description);
    const newContent = await Uploadcontent.create({
      userid: userid,
      username: username,
      type: "AI-Generated",
      title: topic,
      topictype: topictype,
      style: character,
      content: storycontent,
      first_image: "null",  
    });
    return NextResponse.json({ success: true, content: newContent });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function generateStory(topic,topictype, description) {
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
          text: `Generate a short simple on topictype style ${topictype}, ${topic} story for a young child of age 10-12 in short and simple sentences. The story should be about ${description}.`,
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
