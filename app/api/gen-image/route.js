import { NextResponse } from "next/server";
import { Connect } from "@/app/database/Connect";
import Genimage from "@/app/models/genimageModel";
import { GoogleGenAI } from "@google/genai";
import Uploadcontent from "@/app/models/uploadcontentModel";

export async function POST(req) {
  console.log("api called");
  try {
    const { userid,contentid, content } = await req.json();
    await Connect();
    const existingData = await Genimage.findOne({ contentid: contentid });

    if (existingData) {
      return NextResponse.json({ content: existingData }, { status: 200 });
    }

    const description = await Getparadescription(content.content);

    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log(description);
    const imageData = description ? await GetImage(description, content.style) : null;

    const newContent = await Genimage.create({
      userid: userid,
      contentid: contentid,
      content: content,
      content_description: description,
      gen_image: imageData,
    });
 await Uploadcontent.updateOne({ _id: contentid }, { $set: { first_image: imageData[0].data } });
    return NextResponse.json({ success: true, content: newContent });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function Getparadescription(content) {
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
          text: `You are given a short story. Split the story into sequential scenes, where each scene corresponds to one major line or event in the story.

    For each scene, generate a JSON object with the following structure:

    line: (The step number of the scene, starting from 1)

    text: (The line or sentence from the original story)

    description: (A detailed visual description of this scene, so that an AI image generator can visualize and draw it. Make sure the description builds visual continuity from the previous scene.)

    Format your result as a JSON array.

    Story Input:
    ${content}`,
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
  const cleanResult = result.replace(/^```json\s*|^\s*```|\s*```$/g, "").trim();

  return JSON.parse(cleanResult);
}





async function GetImage(description, style) {
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });

  const config = {
    responseModalities: ["IMAGE", "TEXT"],
  };

  const model = "gemini-2.0-flash-preview-image-generation";
  const imageDataArray = [];

  const allScenesText = description.map((desc, index) => 
    `Scene ${desc.line}: ${desc.text}\nVisual Description: ${desc.description}`
  ).join('\n\n');

  const contents = [
    {
      role: "user",
      parts: [
        {
          text: `You are given multiple scenes from a children's story. Generate illustrations for ALL scenes provided below.

                CRITICAL REQUIREMENTS:
                - Generate ${description.length} separate illustrations, one for each scene
                - Maintain EXACT character consistency across ALL images - the same character must look identical in every illustration
                - Use ${style} art style for all illustrations
                - Each illustration must be colorful, storybook-style, and suitable for children
                - Match each scene's description exactly
                - Keep the same character appearance, clothing, and features throughout all images

                Here are ALL the scenes to illustrate:
                ${allScenesText}

                Please generate ${description.length} separate images maintaining character consistency throughout. Make Sure to generate all ${description.length} images.`,
        },
      ],
    },
  ];

  try {
    const response = await ai.models.generateContentStream({
      model,
      config,
      contents,
    });

    for await (const chunk of response) {
      if (
        !chunk.candidates ||
        !chunk.candidates[0].content ||
        !chunk.candidates[0].content.parts
      ) {
        continue;
      }

      if (chunk.candidates[0].content.parts[0].inlineData) {
        const inlineData = chunk.candidates[0].content.parts[0].inlineData;
        imageDataArray.push({
          mimeType: inlineData.mimeType,
          data: inlineData.data,
        });
      } else {
        console.log("Text chunk:", chunk.text);
      }
    }
  } catch (error) {
    console.error("Error generating images from Gemini:", error);
    throw error;
  }

  return imageDataArray;
}



    export async function GET(req){
      try {
        const userid = req.nextUrl.searchParams.get("userid");
        await Connect();
        const ImageData = await Genimage.find({ userid: userid });
        return NextResponse.json({ success: true, ImageData });
      } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }