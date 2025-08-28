"use client";
import { useParams } from "next/navigation";
import { use, useEffect, useState } from "react";
import axios from "axios";
import { MoveLeft, MoveDown, Speaker , Eye } from "lucide-react";
import Loading from "@/app/components/Loading";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import WebgazerReadingPage from "../../_component/webgazer-reading";

function normalize(text) {
  return text
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()\"']/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export default function Display() {
  const { user } = useUser();
  const { id } = useParams();
  const [UploadedData, setUploadedData] = useState([]);
  const [generatedData, setGeneratedData] = useState([]);
  const [SelectedContent, setSelectedContent] = useState({});
  const [loading, setLoading] = useState(true);
  const [imageData, setImageData] = useState(null);
  const [voice, setVoice] = useState(true);
  const [readingIndex, setReadingIndex] = useState(0);
  const [userContentread, setUserContentread] = useState([]);
  const [webgazerReading, setWebgazerReading] = useState(false);
  const [lineStartTime, setLineStartTime] = useState(null); 

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  const [contentId, userId,] = id.split("%26");

  useEffect(() => {
    if (!user) return;
    GetContentData();
    console.log("getcontentiscalled");
  }, [user]);

  const GetImageData = async (selected) => {
    try {
      const imageresponse = await axios.post("/api/gen-image", {
        userid: userId,
        contentid: contentId,
        content: selected,
      });
      setImageData(imageresponse.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const GetContentData = async () => {
    try {
      const response = await axios.get(`/api/content?userid=${userId}`);
      const filterUpload = response.data.content.filter(
        (item) => item.type === "UploadContent"
      );
      setUploadedData(filterUpload);
      const filterAi = response.data.content.filter(
        (item) => item.type === "AI-Generated"
      );
      setGeneratedData(filterAi);
      const selected = response.data.content.find(
        (item) => item._id === contentId
      );
      if (selected) {
        setSelectedContent(selected);
        await GetImageData(selected);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleVoiceToggle = async () => {
    const newVoiceState = !voice;
    setVoice(newVoiceState);
    setWebgazerReading(!newVoiceState);

    if (newVoiceState) {
      setReadingIndex(0);
      resetTranscript();
      window.location.reload();
    } else {
      setReadingIndex(0);
      resetTranscript();
      SpeechRecognition.stopListening();
    }
  };

  useEffect(() => {
    if (voice) {
      SpeechRecognition.startListening({
        continuous: true,
        language: "en-US",
        interimResults: true,
      });
      setLineStartTime(Date.now());
    } else {
      SpeechRecognition.stopListening();
      resetTranscript();
      setReadingIndex(0);
      setLineStartTime(null); 
    }

    return () => {
      if (voice) {
        SpeechRecognition.stopListening();
      }
    };
  }, [voice, resetTranscript]);

  useEffect(() => {
    let progressTimer;

    if (!voice || !imageData?.content?.content_description) return;

    const totalSentences = imageData.content.content_description.length;

    if (readingIndex >= totalSentences) {
      submitAnalysis();
      return;
    }

    const sentenceObj = imageData.content.content_description[readingIndex];
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

    if (matchPercentage == 1 && sentenceWords.length > 0) {
      progressTimer = setTimeout(() => {
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
        setReadingIndex((prev) => {
          const nextIndex = prev + 1;
          return nextIndex;
        });
        resetTranscript();
        setLineStartTime(Date.now()); 
      }, 500);
    }

    return () => {
      if (progressTimer) {
        clearTimeout(progressTimer);
      }
    };
  }, [transcript, voice, readingIndex, imageData, resetTranscript, lineStartTime]); 

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

  const submitAnalysis = async () => {
    try {
      const voiceResponse = await axios.post("/api/voiceanalysis", {
        userid: userId,
        contentid: contentId,
        title: SelectedContent.title,
        content_description: imageData.content.content_description,
        voice_analysis: userContentread,
      });
      console.log(voiceResponse);
    } catch (error) {
      console.log(error);
    }
  };

const skipLine = () => {

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
        <>
          <Loading />
        </>
      ) : (
        <>
          <div className="flex flex-row items-center justify-between mx-20 mt-10 mb-10">
            <div
              className="flex items-center"
              onClick={() => (window.location.href = "/content")}
            >
              <MoveLeft className="cursor-pointer mr-2 mt-1" />
              <span className="text-2xl font-bold cursor-pointer">Back</span>
            </div>
              <div className="flex items-center gap-4">
              <div className="flex items-center bg-gray-200 rounded-full p-2">
                <div
                  className={`px-4 py-2 rounded-full cursor-pointer transition-all duration-300 flex items-center ${
                    voice
                      ? 'bg-green-400 text-white font-bold'
                      : 'bg-transparent text-gray-500'
                  }`}
                  onClick={() => !voice && handleVoiceToggle()}
                >
                  <Speaker className="mr-1 h-4 w-4" />
                  Voice
                </div>
                <div
                  className={`px-4 py-2 rounded-full cursor-pointer transition-all duration-300 flex items-center ${
                    !voice
                      ? 'bg-green-400 text-white font-bold'
                      : 'bg-transparent text-gray-500'
                  }`}
                  onClick={() => voice && handleVoiceToggle()}
                >
                  <Eye className="mr-1 h-4 w-4" />
                  Eye
                </div>
              </div>
            
              <Button
                className="bg-gradient-to-r from-blue-600 to-violet-600 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-violet-700 transition-all"
                onClick={() =>
                  document
                    .getElementById("content")
                    .scrollIntoView({ behavior: "smooth" })
                }
              >
                Go To All Content <MoveDown className="ml-2" />
              </Button>
            </div>
          </div>
          {webgazerReading && imageData ? (
            <WebgazerReadingPage
              imageData={imageData}
              selectedContent={SelectedContent}
            />
          ) : (
            <>
              <div className="min-h-screen">
                    <div className=" flex flex-row items-center justify-between mx-20 mb-4 p-4 bg-red-50 rounded-lg border border-red-200">
                  <p className=" text-lg text-red-600">
                    Read aloud any word in the current line to highlight it. Look and read all words in the line to see the image.
                  </p>
                  <Button className={"text-white cursor-pointer"} onClick={skipLine}  >skip line</Button>
                  
                </div>
                <div className="mx-20 mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-lg">
                    <strong>Current Transcript:</strong> "{transcript}"
                  </p>
                </div>

                <div className="flex flex-row h-auto mx-20 mt-4 items-start justify-center gap-4">
                  <div className="w-3/5 rounded-lg border border-gray-200 p-6 bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <h1 className="text-3xl font-bold text-blue-600 underline mb-6">
                      {SelectedContent.title}
                    </h1>
                    <div className="text-black text-2xl leading-relaxed flex flex-col ">
                      {imageData?.content?.content_description.map(
                        (item, index) => (
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
                        )
                      )}
                    </div>
                    {voice &&
                      readingIndex >=
                        imageData?.content?.content_description?.length && (
                        <div className="mt-8 p-6 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg border-2 border-green-400 text-center">
                          <div className="text-6xl mb-4">🏆</div>
                          <h2 className="text-4xl font-bold text-green-600 mb-2">
                            Reading Complete!
                          </h2>
                          <p className="text-xl text-gray-700 mb-4">
                            Congratulations! You have successfully completed the
                            entire reading.
                          </p>
                          <p className="text-lg text-gray-600">
                            Great job on your reading journey!
                          </p>
                          <Button
                            onClick={() => (window.location.href = "/content")}
                          >
                            {" "}
                            GO HOME
                          </Button>
                        </div>
                      )}
                  </div>

                  <div className="w-2/5 rounded-lg border border-gray-200 p-6 bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col items-center">
                    <h1 className="text-3xl font-bold mb-4">Image Display</h1>

                    <div className="text-center">
                      {readingIndex <= imageData?.content?.gen_image.length &&
                        readingIndex > 0 && (
                          <>
                            <div className="grid grid-cols-2 gap-4">
                              {Array.from({ length: readingIndex }).map(
                                (_, index) => (
                                  <div
                                    key={index}
                                    className="relative h-auto rounded-lg overflow-hidden m-2 border-2 border-green-400 shadow-lg"
                                  >
                                    <img
                                      src={`data:image/png;base64,${imageData.content.gen_image[index].data}`}
                                      alt={`Image ${index + 1}`}
                                      className="w-full h-full object-cover"
                                    />
                                    <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-sm">
                                      {index + 1}
                                    </div>
                                  </div>
                                )
                              )}
                            </div>{" "}
                          </>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          <div id="content" className="mx-20">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent mt-8 mb-6 mr-auto inline-block">
              Previously Uploaded Content
            </h1>
            <div className="flex flex-row flex-wrap items-center border border-gray-200 rounded-lg bg-gray-50 p-8 shadow-sm ">
              {UploadedData.map((item, index) => (
                <div
                  key={index}
                  onClick={() => {
                    window.location.href = `/content/display/${item._id}&${item.userid}`;
                  }}
                  className="relative w-64 h-64 rounded-lg overflow-hidden m-2 cursor-pointer hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-blue-300 hover:border-2 hover:border-blue-300"
                  style={{
                    backgroundImage:
                      "url(https://png.pngtree.com/background/20230612/original/pngtree-animation-kids-reading-books-picture-image_3370516.jpg)",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  <div className="absolute bottom-0 w-full p-4 bg-gradient-to-t from-black/70 to-transparent backdrop-blur-sm">
                    <h1 className="text-white text-2xl font-bold truncate">
                      {item.title}
                    </h1>
                  </div>
                </div>
              ))}
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent mt-8 mb-6 mr-auto inline-block">
              Previously Generated Content
            </h1>
            <div className="flex flex-row flex-wrap items-center border border-gray-200 rounded-lg bg-gray-50 p-8 shadow-sm mb-20">
              {generatedData.map((item, index) => (
                <div
                  key={index}
                  onClick={() => {
                    window.location.href = `/content/display/${item._id}&${item.userid}`;
                  }}
                  className="relative w-64 h-64 rounded-lg overflow-hidden m-2 cursor-pointer hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-blue-300 hover:border-2 hover:border-blue-300"
                  style={{
                    backgroundImage: `url(https://www.jeffbullas.com/wp-content/uploads/2023/03/AI-story-generator.jpg)`,

                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  <div className="absolute bottom-0 w-full p-4 bg-gradient-to-t from-black/70 to-transparent backdrop-blur-sm">
                    <h1 className="text-white text-2xl font-bold truncate">
                      {item.title}
                    </h1>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}