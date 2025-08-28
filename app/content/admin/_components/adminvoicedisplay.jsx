
"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { MoveLeft, Speaker, Eye } from "lucide-react";
import Loading from "@/app/components/Loading";
import { useUser } from "@clerk/nextjs";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import AdminEyeDisplay from "./admineyedisplay";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
function normalize(text) {
  return text
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()\"']/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export default function AdminVoiceDisplay({ ContentData, handleCurrentData }) {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [voice, setVoice] = useState(ContentData.Mode === "voice");
  const [readingIndex, setReadingIndex] = useState(0);
  const [userContentread, setUserContentread] = useState([]);
  const [webgazerReading, setWebgazerReading] = useState(ContentData.Mode === "Eye");
  const [analysisSubmitted, setAnalysisSubmitted] = useState(false);
  const [lineStartTime, setLineStartTime] = useState(null); 

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  // const handleVoiceToggle = async () => {
  //   const newVoiceState = !voice;
  //   setVoice(newVoiceState);
  //   setWebgazerReading(!newVoiceState);

  //   if (newVoiceState) {
  //     setReadingIndex(0);
  //     resetTranscript();
  //   } else {
  //     setReadingIndex(0);
  //     resetTranscript();
  //     SpeechRecognition.stopListening();
  //   }
  // };


  useEffect(() => {
    const startListening = () => {
      if (voice) {
        SpeechRecognition.startListening({
          continuous: true,
          language: "en-US",
          interimResults: true,
        });
        setLineStartTime(Date.now()); // Set start time when listening begins
      } else {
        SpeechRecognition.stopListening();
        resetTranscript();
        setReadingIndex(0);
        setLineStartTime(null); // Reset start time when listening stops
      }
    };

    startListening();

    return () => {
      if (voice) {
        SpeechRecognition.stopListening();
      }
    };
  }, [voice, resetTranscript]);

  useEffect(() => {
    if (!voice || !ContentData.content_description || analysisSubmitted) return;

    const totalSentences = ContentData.content_description.length;

    if (readingIndex >= totalSentences) {
      submitAnalysis();
      return;
    }

    const sentenceObj = ContentData.content_description[readingIndex];
    if (!sentenceObj) return;

    const sentenceWords = normalize(sentenceObj.text)
      .split(" ")
      .filter((word) => word.length > 0);
    const spokenWords = normalize(transcript)
      .split(" ")
      .filter((word) => word.length > 0);

    const matchedWords = sentenceWords.filter((word) =>
      spokenWords.includes(word)
    );
    const matchPercentage = matchedWords.length / sentenceWords.length;

    if (matchPercentage === 1 && sentenceWords.length > 0) {
      const progressTimer = setTimeout(() => {
        const endTime = Date.now();
        const duration = lineStartTime ? (endTime - lineStartTime) / 1000 : 0; 

        setUserContentread((prev) => [
          ...prev,
          {
            lineindex: readingIndex,
            userReading: transcript,
            duration: duration, 
          },
        ]);
        setReadingIndex((prev) => prev + 1);
        resetTranscript();
        setLineStartTime(Date.now()); 
      }, 500);

      return () => clearTimeout(progressTimer);
    }
  }, [
    transcript,
    voice,
    readingIndex,
    ContentData,
    resetTranscript,
    analysisSubmitted,
    lineStartTime, 
  ]);

  function getWordColoring(sentence, spoken) {
    const sentenceWords = sentence.split(" ");
    const normalizedSentenceWords = normalize(sentence).split(" ");
    const spokenWords = normalize(spoken).split(" ");

    return sentenceWords.map((word, idx) => {
      const normWord = normalizedSentenceWords[idx];
      const matched = spokenWords.includes(normWord);
      return (
        <span
          key={idx}
          style={{
            color: matched ? "green" : "black",
            fontWeight: matched ? "bold" : "normal",
            marginRight: "6px",
            display: "inline-flex",
            flexWrap: "wrap",
            maxWidth: "100%",
            wordBreak: "break-word"
          }}
        >
          {word}
        </span>
      );
    });
  }

  if (!browserSupportsSpeechRecognition) {
    return <span>Your browser does not support speech recognition.</span>;
  }

  const resetAllStates = () => {
    setReadingIndex(0);
    setUserContentread([]);
    resetTranscript();
    setVoice(true);
    setAnalysisSubmitted(false);
    setLineStartTime(Date.now()); 
    // setWebgazerReading(false);

    if (SpeechRecognition) {
      SpeechRecognition.stopListening();
    }
  };

  const submitAnalysis = async () => {
    if (analysisSubmitted) return;

    setAnalysisSubmitted(true);
    try {
      console.log(
        "userContentread reading is submitted",
        user.id,
        ContentData.task_id,
        user?.emailAddresses?.[0]?.emailAddress,
        ContentData.content_id,
        userContentread
      );
      const voiceResponse = await axios.post("/api/admin/analysis/voice", {
        studentid: user?.id,
        studentname: user?.fullName,
        task_id: ContentData.task_id,
        content_title: ContentData.title,
        student_email: user?.emailAddresses?.[0]?.emailAddress,
        content_id: ContentData.content_id,
        voice_analysis: userContentread,
      });

      console.log(voiceResponse);

      console.log("userContentread reading is completed");
      handleCurrentData();
    } catch (error) {
      toast.error(error.message);
      console.log(error);
      setAnalysisSubmitted(false);
    }
  };

  const handleCurrentData_eye = () => {
    handleCurrentData();
  };

  useEffect(() => {
    if (ContentData) {
      resetAllStates();
    }
  }, [ContentData.content_id]);

  if (!ContentData || !ContentData.content_description) {
    return <Loading />;
  }


  const skipLine = () => {
    console.log("skipping the line")
    
      const progressTimer = setTimeout(() => {
        const endTime = Date.now();
        const duration = lineStartTime ? (endTime - lineStartTime) / 1000 : 0; 

        setUserContentread((prev) => [
          ...prev,
          {
            lineindex: readingIndex,
            userReading: transcript,
            duration: duration, 
          },
        ]);
        setReadingIndex((prev) => prev + 1);
        resetTranscript();
        setLineStartTime(Date.now()); 
      }, 500);

      return () => clearTimeout(progressTimer);
  }

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <>
          <div className="flex flex-row items-center justify-between mx-20 mb-10">
            {/* <div
              className="flex items-center"
              onClick={() => (window.location.href = "/content")}
            >
              <MoveLeft className="cursor-pointer mr-2 mt-1" />
              <span className="text-2xl font-bold cursor-pointer">Back</span>
            </div> */}
              <div></div>
            <div className="flex items-center">
              <div className="flex items-center bg-gray-200 rounded-full p-2">
                <div
                  className={`px-4 py-2 rounded-full transition-all duration-300 flex items-center ${
                    ContentData.Mode === 'Voice'
                      ? 'bg-green-400 text-white font-bold'
                      : 'bg-transparent text-gray-200'
                  }`}
                >
                  <Speaker className="mr-1 h-4 w-4" />
                  Voice
                </div>
                <div
                  className={`px-4 py-2 rounded-full transition-all duration-300 flex items-center ${
                    ContentData.Mode === 'Eye'
                      ? 'bg-green-400 text-white font-bold'
                      : 'bg-transparent text-gray-200'
                  }`}
                  
                  
                  
                >
                  <Eye className="mr-1 h-4 w-4" />
                  Eye
                </div>
              </div>
            </div>
                  </div>

          {webgazerReading ? (
            <AdminEyeDisplay
              ContentData={ContentData}
              handleCurrentData_eye={handleCurrentData_eye}
            />
          ) : (
            <>
              <div className="min-h-screen">
                 <div className="flex flex-row items-center justify-between mx-20 mb-4 p-4 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-lg text-red-600">
                    Read aloud any word in the current line to highlight it. Look and read all words in the line to see the image.
                  </p>
                  <Button className={"text-white cursor-pointer"} onClick={() => skipLine()}>skip line {readingIndex+1}</Button>
                </div>
                <div className="mx-20 mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-lg">
                    <strong>Current Transcript:</strong> "{transcript}"
                  </p>
                </div>

                <div className="flex flex-row h-auto mx-20 mt-4 items-start justify-center gap-4">
                  <div className=" rounded-lg border border-gray-200 p-6 bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 w-3/5">
                    <h1 className="text-3xl font-bold text-blue-600 underline mb-6">
                      {ContentData.title}
                    </h1>
                    <div className="text-black text-2xl leading-relaxed flex flex-col">
                      {ContentData.content_description.map((item, index) => (
                        <div key={index}>
                          <div
                            className={`flex flex-row items-center justify-between mb-4 p-3 rounded transition-all duration-300 ${
                              readingIndex === index
                                ? "bg-green-100 border-l-4 border-green-500 shadow-md"
                                : readingIndex > index
                                ? "bg-gray-100 opacity-60"
                                : "bg-white"
                            }`}
                          >
                            <p className="text-3xl font-bold">
                              {readingIndex === index
                                ? getWordColoring(item.text, transcript)
                                : item.text}
                            </p>
                            {readingIndex > index && (
                              <div className="text-green-500 text-2xl ml-4">
                                ✓
                              </div>
                            )}
                            {readingIndex === index && (
                              <div className="text-blue-500 text-sm ml-4 animate-pulse">
                                Reading...
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {voice &&
                      readingIndex >=
                        ContentData.content_description?.length && (
                        <div className="mt-8 p-6 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg border-2 border-green-400 text-center">
                          <div className="text-6xl mb-4">🏆</div>
                          <h2 className="text-4xl font-bold text-green-600 mb-2">
                            Reading Complete!
                          </h2>

                          <p className="text-lg text-gray-600">
                            Great job on your reading journey!
                          </p>
                        </div>
                      )}
                  </div>

                  <div className="w-2/5 rounded-lg border border-gray-200 p-6 bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col items-center">
                    <h1 className="text-3xl font-bold mb-4">Image Display</h1>
                    {/* {readingIndex == 0 &&
                     <div className="text-center text-gray-500 py-8">
                <p className="text-lg text-red-500">
                  Read aloud any word in the current line to highlight it.
                </p>                <p className="text-sm text-red-500">
                  Look and read all words in the line to see the image.
                </p>
               
              </div>

                    } */}

                    <div className="text-center">
                      {ContentData.imageData &&
                        readingIndex <= ContentData.imageData.length &&
                        readingIndex > 0 && (
                          <div className="grid grid-cols-2 gap-4">
                            {Array.from({ length: readingIndex }).map(
                              (_, index) => (
                                <div
                                  key={index}
                                  className="relative h-auto rounded-lg overflow-hidden m-2 border-2 border-green-400 shadow-lg"
                                >
                                  {ContentData.imageData[index] && (
                                    <>
                                      <img
                                        src={`data:image/png;base64,${ContentData.imageData[index].data}`}
                                        alt={`Image ${index + 1}`}
                                        className="w-full h-full object-cover"
                                      />
                                      <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-sm">
                                        {index + 1}
                                      </div>
                                    </>
                                  )}
                                </div>
                              )
                            )}
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </>
  );
}