
"use client";
import {
  MoveLeft,
  CheckCircle,
  XCircle,
  AlertCircle,
  BookOpen,
  Target,
  Volume2,
  Clock,
} from "lucide-react";
import { useState } from "react";
import Loading from "@/app/components/Loading";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import axios from "axios";

export default function DisplayVoiceAnalysis({
  VoiceAnalysisData,
  Displayback = true,
  ai = true,
}) {
  const [activeTab, setActiveTab] = useState("comparison");
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [AIresponse, setAIresponse] = useState();

  const formatDuration = (seconds) => {
    if (!seconds || seconds === 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')+ " min"}`;
  };

  const calculateTotalDuration = () => {
    return VoiceAnalysisData.voice_analysis.reduce((total, item) => {
      return total + (item.duration || 0);
    }, 0);
  };

  const analyzeAllWords = () => {
    const allOriginalWords = [];
    const allUserWords = [];

    VoiceAnalysisData.content_description.forEach((item, lineIndex) => {
      const originalWords = item.text
        .toLowerCase()
        .replace(/[^\w\s]/g, "")
        .split(/\s+/)
        .filter((word) => word.length > 0);

      originalWords.forEach((word) => {
        allOriginalWords.push({ word, lineIndex, originalText: item.text });
      });
    });

    VoiceAnalysisData.voice_analysis.forEach((voiceItem, lineIndex) => {
      if (voiceItem?.userReading) {
        const userWords = voiceItem.userReading
          .toLowerCase()
          .replace(/[^\w\s]/g, "")
          .split(/\s+/)
          .filter((word) => word.length > 0);

        userWords.forEach((word) => {
          allUserWords.push({
            word,
            lineIndex,
            userReading: voiceItem.userReading,
          });
        });
      }
    });

    const wordAnalysis = {
      spokenWords: [],
      extraWords: [],
      missedWords: [],
      totalOriginalWords: allOriginalWords.length,
      totalSpokenWords: allUserWords.length,
    };

    allUserWords.forEach((userWordObj) => {
      const foundInOriginal = allOriginalWords.find(
        (originalWordObj) => originalWordObj.word === userWordObj.word
      );

      if (foundInOriginal) {
        wordAnalysis.spokenWords.push({
          ...userWordObj,
          status: "spoken",
        });
      } else {
        wordAnalysis.extraWords.push({
          ...userWordObj,
          status: "extra",
        });
      }
    });

    allOriginalWords.forEach((originalWordObj) => {
      const foundInSpoken = allUserWords.find(
        (userWordObj) => userWordObj.word === originalWordObj.word
      );

      if (!foundInSpoken) {
        wordAnalysis.missedWords.push({
          ...originalWordObj,
          status: "missed",
        });
      }
    });

    return wordAnalysis;
  };

  const calculateNewAccuracy = () => {
    const analysis = analyzeAllWords();
    const accuracy =
      analysis.totalOriginalWords > 0
        ? Math.round(
            (analysis.spokenWords.length / analysis.totalOriginalWords) * 100
          )
        : 0;

    return {
      accuracy,
      spokenCount: analysis.spokenWords.length,
      extraCount: analysis.extraWords.length,
      missedCount: analysis.missedWords.length,
      totalOriginal: analysis.totalOriginalWords,
      analysis,
    };
  };

  const highlightWordsInLine = (lineText, lineIndex) => {
    const analysis = analyzeAllWords();
    const words = lineText.split(/(\s+)/);

    return words.map((word, wordIndex) => {
      if (/^\s+$/.test(word)) {
        return { text: word, status: "space" };
      }

      const cleanWord = word.toLowerCase().replace(/[^\w]/g, "");
      if (!cleanWord) {
        return { text: word, status: "punctuation" };
      }

      const wasSpoken = analysis.spokenWords.some(
        (spokenWord) => spokenWord.word === cleanWord
      );

      return {
        text: word,
        status: wasSpoken ? "spoken" : "missed",
        cleanWord,
      };
    });
  };

  const highlightUserReading = (userReading, lineIndex) => {
    const analysis = analyzeAllWords();
    const words = userReading.split(/(\s+)/);

    return words.map((word, wordIndex) => {
      if (/^\s+$/.test(word)) {
        return { text: word, status: "space" };
      }

      const cleanWord = word.toLowerCase().replace(/[^\w]/g, "");
      if (!cleanWord) {
        return { text: word, status: "punctuation" };
      }

      const isInOriginal = analysis.spokenWords.some(
        (spokenWord) => spokenWord.word === cleanWord
      );
      const isExtra = analysis.extraWords.some(
        (extraWord) => extraWord.word === cleanWord
      );

      return {
        text: word,
        status: isInOriginal ? "correct" : isExtra ? "extra" : "unknown",
        cleanWord,
      };
    });
  };

  const getUserExtraWords = () => {
    const analysis = analyzeAllWords();
    return analysis.extraWords;
  };

  const GetAnalysis = async () => {
    setLoading(true);
    if (
      !user ||
      !VoiceAnalysisData ||
      (AIresponse !== null && AIresponse !== undefined)
    ) {
      setLoading(false);
      console.log(
        "this is both the id get return ",
        VoiceAnalysisData._id,
        user.id
      );
      return;
    }
    try {
      console.log("this is both the id", VoiceAnalysisData._id, user.id);
      const response = await axios.post("/api/ai-voice", {
        userid: user.id,
        analysis_id: VoiceAnalysisData._id,
      });
      setAIresponse(response.data.aivoiceanalysis);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateOverallStats = () => {
    const newAnalysis = calculateNewAccuracy();
    let completedLines = 0;

    VoiceAnalysisData.voice_analysis.forEach((voiceItem) => {
      if (voiceItem?.userReading) {
        completedLines++;
      }
    });

    return {
      averageAccuracy: newAnalysis.accuracy,
      completionRate: Math.round(
        (completedLines / VoiceAnalysisData.content_description.length) * 100
      ),
      totalWords: newAnalysis.totalOriginal,
      correctWords: newAnalysis.spokenCount,
      extraWords: newAnalysis.extraCount,
      missedWords: newAnalysis.missedCount,
      completedLines,
      totalLines: VoiceAnalysisData.content_description.length,
    };
  };

  const stats = calculateOverallStats();
  const totalDuration = calculateTotalDuration();

  const getSkillLevel = (accuracy) => {
    if (accuracy >= 90)
      return {
        level: "Excellent",
        color: "text-green-600",
        bg: "bg-green-100",
      };
    if (accuracy >= 75)
      return { level: "Good", color: "text-blue-600", bg: "bg-blue-100" };
    if (accuracy >= 60)
      return { level: "Fair", color: "text-yellow-600", bg: "bg-yellow-100" };
    return { level: "Needs Practice", color: "text-red-600", bg: "bg-red-100" };
  };

  const overallSkill = getSkillLevel(stats.averageAccuracy);

  return (
    <div className={`${Displayback && "mt-10"} mx-4 md:mx-20`}>
      {Displayback && (
        <div
          onClick={() => (window.location.href = "/content/analysis")}
          className="flex flex-row items-center mb-6 cursor-pointer hover:text-blue-600 transition-colors"
        >
          <MoveLeft className="mr-2 mt-1" />
          <span className="text-2xl font-bold">Back</span>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
          {VoiceAnalysisData.title}
        </h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center bg-blue-50 px-4 py-2 rounded-full">
            <Clock className="text-blue-500 mr-2" size={20} />
            <span className="font-semibold text-blue-700">
              Total: {formatDuration(totalDuration)}
            </span>
          </div>
          <div className={`px-4 py-2 rounded-full ${overallSkill.bg}`}>
            <span className={`font-semibold ${overallSkill.color}`}>
              {overallSkill.level}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Overall Accuracy</p>
              <p className="text-2xl font-bold text-blue-600">
                {((stats.correctWords / (stats.correctWords + stats.extraWords + stats.missedWords)) * 100).toFixed(1)}%
              </p>
            </div>
            <Target className="text-blue-500" size={24} />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Words Spoken</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.correctWords}
              </p>
            </div>
            <CheckCircle className="text-green-500" size={24} />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Extra Words</p>
              <p className="text-2xl font-bold text-red-600">
                {stats.extraWords}
              </p>
            </div>
            <AlertCircle className="text-red-500" size={24} />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Missed Words</p>
              <p className="text-2xl font-bold text-orange-600">
                {stats.missedWords}
              </p>
            </div>
            <XCircle className="text-orange-500" size={24} />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Words</p>
              <p className="text-2xl font-bold text-purple-600">
                {stats.totalWords}
              </p>
            </div>
            <BookOpen className="text-purple-500" size={24} />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Reading Time</p>
              <p className="text-2xl font-bold text-indigo-600">
                {formatDuration(totalDuration)}
              </p>
            </div>
            <Clock className="text-indigo-500" size={24} />
          </div>
        </div>
      </div>

      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab("comparison")}
          className={`px-6 py-3 font-medium border-b-2 transition-colors ${
            activeTab === "comparison"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Word Analysis
        </button>
        <button
          onClick={() => setActiveTab("summary")}
          className={`px-6 py-3 font-medium border-b-2 transition-colors ${
            activeTab === "summary"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Reading Summary
        </button>
        {ai && (
           <button
          onClick={() => {
            setActiveTab("Ai"), GetAnalysis();
          }}
          className={`px-6 py-3 font-bold text-xl flex animate-pulse text-transparent border-b-2 transition-colors bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500  ${
            activeTab === "Ai"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          AI Analysis
        </button>
        )}
      </div>

      {activeTab === "comparison" && (
        <div className="space-y-6 mb-20">
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">
              Word Analysis Overview
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {stats.correctWords}
                </div>
                <div className="text-sm text-green-700">
                  Words Correctly Spoken
                </div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {stats.extraWords}
                </div>
                <div className="text-sm text-red-700">Extra Words Added</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {stats.missedWords}
                </div>
                <div className="text-sm text-orange-700">Words Missed</div>
              </div>
              <div className="text-center p-4 bg-indigo-50 rounded-lg">
                <div className="text-2xl font-bold text-indigo-600">
                  {formatDuration(totalDuration)}
                </div>
                <div className="text-sm text-indigo-700">Total Reading Time</div>
              </div>
            </div>
          </div>

          {VoiceAnalysisData.content_description.map((item, index) => {
            const voiceItem = VoiceAnalysisData.voice_analysis[index];
            const highlightedWords = highlightWordsInLine(item.text, index);
            const highlightedUserWords = voiceItem?.userReading
              ? highlightUserReading(voiceItem.userReading, index)
              : [];

            return (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Line {index + 1}</h3>
                  <div className="flex items-center space-x-3">
                    {voiceItem?.duration && (
                      <div className="flex items-center bg-indigo-100 px-3 py-1 rounded-full">
                        <Clock className="text-indigo-600 mr-1" size={14} />
                        <span className="text-sm font-medium text-indigo-700">
                          {formatDuration(voiceItem.duration)}
                        </span>
                      </div>
                    )}
                    {voiceItem?.userReading ? (
                      <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded">
                        Attempted
                      </span>
                    ) : (
                      <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                        Not Attempted
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                      <BookOpen size={16} className="mr-2 text-blue-500" />
                      Original Text
                    </h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex flex-wrap gap-1">
                        {highlightedWords.map((wordObj, i) => {
                          if (wordObj.status === "space") {
                            return <span key={i}>{wordObj.text}</span>;
                          } else if (wordObj.status === "punctuation") {
                            return <span key={i}>{wordObj.text}</span>;
                          } else {
                            return (
                              <span
                                key={i}
                                className={`px-1 py-0.5 rounded text-sm ${
                                  wordObj.status === "spoken"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-orange-100 text-orange-800"
                                }`}
                                title={
                                  wordObj.status === "missed"
                                    ? "This word was not spoken"
                                    : "This word was spoken correctly"
                                }
                              >
                                {wordObj.text}
                              </span>
                            );
                          }
                        })}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                      <Volume2 size={16} className="mr-2 text-green-500" />
                      User Reading  
                    </h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      {voiceItem?.userReading ? (
                        <div className="flex flex-wrap gap-1">
                          {highlightedUserWords.map((wordObj, i) => {
                            if (wordObj.status === "space") {
                              return <span key={i}>{wordObj.text}</span>;
                            } else if (wordObj.status === "punctuation") {
                              return <span key={i}>{wordObj.text}</span>;
                            } else {
                              return (
                                <span
                                  key={i}
                                  className={`px-1 py-0.5 rounded text-sm ${
                                    wordObj.status === "correct"
                                      ? "bg-green-100 text-green-800"
                                      : wordObj.status === "extra"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-gray-100 text-gray-800"
                                  }`}
                                  title={
                                    wordObj.status === "correct"
                                      ? "This word is in the original text"
                                      : wordObj.status === "extra"
                                      ? "This word is not in the original text"
                                      : "Unknown word status"
                                  }
                                >
                                  {wordObj.text}
                                </span>
                              );
                            }
                          })}
                        </div>
                      ) : (
                        <p className="text-gray-500 italic">
                          No reading recorded for this line
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {stats.extraWords > 0 && (
            <div className="bg-white border border-red-200 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-red-600 mb-4 flex items-center">
                <AlertCircle size={20} className="mr-2" />
                Extra Words Spoken (Not in Original Text)
              </h3>
              <div className="flex flex-wrap gap-2">
                {getUserExtraWords().map((extraWord, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm"
                    title={`Extra word from line ${extraWord.lineIndex + 1}`}
                  >
                    {extraWord.word}
                  </span>
                ))}
              </div>
              <p className="text-sm text-red-600 mt-2">
                These words were spoken but are not present in the original
                text.
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === "summary" && (
        <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm mb-20">
          <h2 className="text-2xl font-bold mb-6">
            Reading Performance Summary
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
            <div>
              <h3 className="font-semibold text-green-600 mb-4 flex items-center">
                <CheckCircle size={20} className="mr-2" />
                Strengths
              </h3>
              <ul className="space-y-2">
                {stats.averageAccuracy >= 75 && (
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-gray-700">
                      Good word recognition accuracy ({stats.correctWords} words
                      spoken correctly)
                    </span>
                  </li>
                )}
                {stats.extraWords === 0 && (
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-gray-700">
                      No extra words added - stayed focused on the text
                    </span>
                  </li>
                )}
                {stats.completedLines > 0 && (
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-gray-700">
                      Attempted reading practice ({stats.completedLines} lines)
                    </span>
                  </li>
                )}
                {totalDuration > 0 && totalDuration < 60 && (
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-gray-700">
                      Completed reading in a reasonable time ({formatDuration(totalDuration)})
                    </span>
                  </li>
                )}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-orange-600 mb-4 flex items-center">
                <AlertCircle size={20} className="mr-2" />
                Areas for Improvement
              </h3>
              <ul className="space-y-2">
                {stats.missedWords > 0 && (
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-gray-700">
                      {stats.missedWords} words from the original text were not
                      spoken
                    </span>
                  </li>
                )}
                {stats.extraWords > 0 && (
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-gray-700">
                      {stats.extraWords} extra words were added that weren't in
                      the original
                    </span>
                  </li>
                )}
                {stats.averageAccuracy < 75 && (
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-gray-700">
                      Focus on reading all words from the original text
                    </span>
                  </li>
                )}
                {totalDuration > 120 && (
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-gray-700">
                      Consider practicing to improve reading speed and fluency
                    </span>
                  </li>
                )}
              </ul>
            </div>
          </div>

          {/* Duration Breakdown Section */}
          <div className="border-t pt-6">
            <h3 className="font-semibold text-indigo-600 mb-4 flex items-center">
              <Clock size={20} className="mr-2" />
              Reading Time Breakdown
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {VoiceAnalysisData.voice_analysis.map((voiceItem, index) => (
                <div key={index} className="bg-indigo-50 p-4 rounded-lg">
                  <div className="text-sm text-indigo-600 font-medium">
                    Line {index + 1}
                  </div>
                  <div className="text-lg font-bold text-indigo-800">
                    {voiceItem?.duration ? formatDuration(voiceItem.duration) : "0:00"}
                  </div>
                  <div className="text-xs text-indigo-600 mt-1">
                    {voiceItem?.userReading ? "Completed" : "Not attempted"}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-4 bg-indigo-100 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-indigo-800">Total Reading Time:</span>
                <span className="text-xl font-bold text-indigo-800">
                  {formatDuration(totalDuration)}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-8 p-6 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-3">
              Recommendations
            </h3>
            <div className="text-blue-700 space-y-2">
              {stats.missedWords > stats.correctWords && (
                <p>
                  • Focus on reading every word in the text - you missed more
                  words than you spoke correctly
                </p>
              )}
              {stats.extraWords > 0 && (
                <p>
                  • Try to stick closely to the original text and avoid adding
                  extra words
                </p>
              )}
              {stats.averageAccuracy >= 60 && stats.averageAccuracy < 85 && (
                <p>
                  • Practice reading aloud daily to improve word recognition and
                  fluency
                </p>
              )}
              {totalDuration > 120 && (
                <p>
                  • Work on reading fluency to improve your reading speed while maintaining accuracy
                </p>
              )}
              <p>
                • Take your time with each word and follow along with the text
                carefully
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === "Ai" && (
        <>
          {loading ? (
            <>
              <Loading />
            </>
          ) : (
            <>
              <div
                dangerouslySetInnerHTML={{
                  __html: AIresponse.aianalysis
                    .replace("```html", "")
                    .replace("```", ""),
                }}
              />
            </>
          )}
        </>
      )}
    </div>
  );
}