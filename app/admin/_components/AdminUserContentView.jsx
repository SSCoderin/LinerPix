"use client";
import DisplayEyeAnalysis from "@/app/content/analysis/_components/DisplayEyeAnalysis";
import DisplayVoiceAnalysis from "@/app/content/analysis/_components/DisplayVoiceAnalysis";
export default function AdminUserContentView({ AnalysisData }) {
  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold mb-6">
        User Generated Story & Visuals
      </h1>

      {AnalysisData?.genimage?.map((item, index) => (
        <div
          key={item._id}
          className="bg-white p-6 rounded-lg shadow-md space-y-4"
        >
          <div className="mb-4 space-y-1">
            {item.content_description?.map((desc, i) => (
              <p key={i} className="text-gray-800">
                • {desc.text}
              </p>
            ))}
          </div>

          <div className="flex flex-wrap gap-4 mt-4">
            {item.gen_image?.map((img, imgIdx) => (
              <img
                key={imgIdx}
                src={`data:${img.mimeType};base64,${img.data}`}
                alt={`Scene ${index + 1} - Image ${imgIdx + 1}`}
                className="w-48 h-auto rounded-md border shadow-sm"
              />
            ))}
          </div>
        </div>
      ))}

      {AnalysisData.eyeAnalysis?.map((eyeData, index) => (
        <DisplayEyeAnalysis
          key={index}
          eyeanalysisData={eyeData}
          Displayback={false}
        />
      ))}
      {AnalysisData.voiceAnalysis?.map((voiceData, index) => (
        <DisplayVoiceAnalysis
          key={index}
          VoiceAnalysisData={voiceData}
          Displayback={false}
          ai = {true}
        />
      ))}
    </div>
  );
}
