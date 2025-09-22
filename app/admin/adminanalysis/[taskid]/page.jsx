"use client";
import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import axios from "axios";
import { MoveLeft, Search, X } from "lucide-react";
import DisplayVoiceAnalysis from "../../../content/analysis/_components/DisplayVoiceAnalysis";
import DisplayEyeAnalysis from "../../../content/analysis/_components/DisplayEyeAnalysis";
import Loading from "@/app/components/Loading";
import DisplayAllAnalysis from "../../_components/DisplayAllAnalysis";

export default function TaskAnalysis() {
  const [voiceAnalysis, setVoiceAnalysis] = useState([]);
  const [eyeAnalysis, setEyeAnalysis] = useState([]);
  const [activeTab, setActiveTab] = useState("voice");
  const [taskdetails, setTaskdetails] = useState();
  const [viewDetails, setViewDetails] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [DisplayAllVoiceAnalysisData, setDisplayAllVoiceAnalysisData] =
    useState([]);
  const [DisplayAllEyeAnalysisData, setDisplayAllEyeAnalysisData] = useState(
    []
  );
  const [contentDescription, setContentDescription] = useState();
  const [currentDisplayVoiceData, setCurrentDisplayVoiceData] = useState({
    title: "",
    content_description: [],
    voice_analysis: [],
  });
  const [currentDisplayEyeData, setCurrentDisplayEyeData] = useState({
    duration: [],
    title: "",
    content_description: [],
    eye_analysis: [],
  });
  const { taskid } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const voiceResponse = await axios.get(
          `/api/admin/analysis/voice?taskid=${taskid}`
        );
        const eyeResponse = await axios.get(
          `/api/admin/analysis/eye?taskid=${taskid}`
        );
        const taskdetails = await axios.get(`/api/admin/task?taskid=${taskid}`);
        setTaskdetails(taskdetails.data);
        setVoiceAnalysis(voiceResponse.data.voiceanalysis || []);
        setEyeAnalysis(eyeResponse.data.eyeanalysis || []);
      } catch (err) {
        toast.error("Failed to fetch analysis data.");
        setError(err.message || "An unknown error occurred.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [taskid]);

  const combineDataByEmail = (data) => {
    const combinedData = {};

    data.forEach((item) => {
      const email = item.student_email;
      if (!combinedData[email]) {
        combinedData[email] = {
          student_email: email,
          studentname: item.studentname,
          analyses: [],
        };
      }

      combinedData[email].analyses.push({
        content_id: item.content_id,
        content_title: item.content_title,
        voice_analysis: item.voice_analysis,
        eye_analysis: item.eye_analysis,
        duration: item.duration,
        originalItem: item,
      });
    });

    return Object.values(combinedData);
  };

  const filteredData = useMemo(() => {
    const currentData = activeTab === "voice" ? voiceAnalysis : eyeAnalysis;
    const combinedData = combineDataByEmail(currentData);

    if (!searchQuery.trim()) {
      return combinedData;
    }

    return combinedData.filter(
      (student) =>
        student.studentname.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.student_email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [voiceAnalysis, eyeAnalysis, activeTab, searchQuery]);

  const clearSearch = () => {
    setSearchQuery("");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  return (
    <>
      {viewDetails ? (
        <>
          <div
            className="flex items-center mx-20 mt-10"
            onClick={() => setViewDetails(false)}
          >
            <MoveLeft className="cursor-pointer mr-2 mt-1" />
            <span className="text-2xl font-bold cursor-pointer">Back</span>
          </div>
          {activeTab === "voice" ? (
            <DisplayVoiceAnalysis
              VoiceAnalysisData={currentDisplayVoiceData}
              Displayback={false}
              ai = {false}
            />
          ) : activeTab === "AllAnalysis" ? (
            <DisplayAllAnalysis
              ContentDiscription={contentDescription}
              voiceAnalysisData={DisplayAllVoiceAnalysisData}
              eyeAnalysisData={DisplayAllEyeAnalysisData}
            />
          ) : (
            <DisplayEyeAnalysis
              eyeanalysisData={currentDisplayEyeData}
              Displayback={false}
            />
          )}
        </>
      ) : (
        <div className="mx-20 mt-10">
          <div
            className="flex items-center mb-6"
            onClick={() => (window.location.href = "/admin")}
          >
            <MoveLeft className="cursor-pointer mr-2 mt-1" />
            <span className="text-2xl font-bold cursor-pointer">Back</span>
          </div>

          <div className="flex flex-row w-full flex-wrap items-center border border-gray-200 rounded-lg bg-gray-50 p-4 shadow-sm">
            {taskdetails.ContentData.map((item, index) => (
              <div
                key={index}
                onClick={() => {
                  setContentDescription(item.content_description);
                  setDisplayAllVoiceAnalysisData(
                    voiceAnalysis.filter((element) => {
                      return element.content_id === item._id;
                    })
                  );
                  setDisplayAllEyeAnalysisData(
                    eyeAnalysis.filter((element) => {
                      return element.content_id === item._id;
                    })
                  );
                  setViewDetails(true);

                  setActiveTab("AllAnalysis");
                }}
                className="relative w-40 h-30 rounded-lg overflow-hidden m-2 cursor-pointer hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-blue-300 hover:border-2 hover:border-blue-300"
                style={{
                  backgroundImage: `url(${item.ImageData[0]})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                {item.type === "AI-Generated" ? (
                  <div className="absolute top-0 w-fit p-2 bg-gradient-to-r from-blue-500 to-purple-500 m-1 rounded-2xl">
                    <h1 className="text-white text-sm font-bold">
                      {item.type}
                    </h1>
                  </div>
                ) : (
                  ""
                )}

                <div className="absolute bottom-0 w-full p-2 bg-gradient-to-t from-black/70 to-transparent backdrop-blur-sm">
                  <h1 className="text-white text-sm font-bold truncate">
                    {item.title}
                  </h1>
                </div>
              </div>
            ))}
          </div>

          <div className="mb-8">
            <div className="flex border-b border-gray-200">
              <button
                className={`py-3 px-6 text-lg font-medium transition-colors duration-200 ${
                  activeTab === "voice"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("voice")}
              >
                Voice Analysis ({voiceAnalysis.length})
              </button>
              <button
                className={`py-3 px-6 text-lg font-medium transition-colors duration-200 ${
                  activeTab === "eye"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("eye")}
              >
                Eye Analysis ({eyeAnalysis.length})
              </button>
            </div>
          </div>

          <div className="mb-6">
            <div className="relative max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by student name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
              {searchQuery && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    onClick={clearSearch}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>
            {searchQuery && (
              <p className="mt-2 text-sm text-gray-600">
                Showing {filteredData.length} student(s) matching "{searchQuery}
                "
              </p>
            )}
          </div>

          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-2xl font-bold text-green-500 mb-6 capitalize">
              {activeTab} Analysis
            </h2>

            {filteredData.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                {searchQuery
                  ? `No students found matching "${searchQuery}"`
                  : `No ${activeTab} analysis data available for this task.`}
              </p>
            ) : (
              <div className="flex flex-col gap-6">
                {filteredData.map((student) => (
                  <div
                    key={student.student_email}
                    className="bg-gray-50 border border-gray-200 rounded-lg p-5 hover:shadow-lg transition-shadow duration-200"
                  >
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
                      <div className="flex flex-col">
                        <h3 className="text-xl font-bold text-gray-800">
                          {student.studentname}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          Email: {student.student_email}
                        </p>
                        <p className="text-blue-600 text-sm font-medium">
                          {student.analyses.length} content(s) analyzed
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {student.analyses.map((analysis, index) => (
                        <div
                          key={`${student.student_email}-${analysis.content_id}-${index}`}
                          className="bg-white border border-gray-100 rounded-md p-4 flex items-center justify-between"
                        >
                          <div className="flex flex-col">
                            <h4 className="text-lg font-semibold text-blue-600">
                              {analysis.content_title}
                            </h4>
                            <p className="text-gray-500 text-sm">
                              Content ID: {analysis.content_id}
                            </p>
                          </div>

                          <button
                            onClick={() => {
                              const contentData = taskdetails.ContentData.find(
                                (element) => element._id === analysis.content_id
                              );

                              if (activeTab === "voice") {
                                setCurrentDisplayVoiceData({
                                  voice_analysis: analysis.voice_analysis,
                                  title: analysis.content_title,
                                  content_description:
                                    contentData?.content_description,
                                });
                              } else if (activeTab === "eye") {
                                setCurrentDisplayEyeData({
                                  eye_analysis: analysis.eye_analysis,
                                  title: analysis.content_title,
                                  duration: analysis.originalItem.duration,
                                  content_description:
                                    contentData?.content_description,
                                });
                              }
                              setViewDetails(true);
                            }}
                            className="inline-flex items-center px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
                          >
                            View Details
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="ml-2 h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
