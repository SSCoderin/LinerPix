"use client";
import Header from "@/app/components/Header";
import { Button } from "@/components/ui/button";
import { MoveLeft } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import Loading from "@/app/components/Loading";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import axios from "axios";
import DisplayVoiceAnalysis from "./_components/DisplayVoiceAnalysis";
import DisplayEyeAnalysis from "./_components/DisplayEyeAnalysis";

export default function Analysis() {
  const [loading, setLoading] = useState(true);
  const [VoiceAnalysis, setVoiceAnalysis] = useState([]);
  const [EyeAnalysis, setEyeAnalysis] = useState([]);
  const { user } = useUser();
  const [displayAnalysis, setDisplayAnalysis] = useState(false);
  const [DisplayData, setDisplayData] = useState();
  const [activeTab, setActiveTab] = useState("voice");

  useEffect(() => {
    if (!user) return;
    GetVoiceAnalysis();
    GetEyeAnalysis();
  }, [user]);

  const GetVoiceAnalysis = async () => {
    try {
      const response = await axios.get(`/api/voiceanalysis?userid=${user.id}`);
      setVoiceAnalysis(response.data.voiceanalysis);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const GetEyeAnalysis = async () => {
    try {
      const response = await axios.get(`/api/eyeanalysis?userid=${user.id}`);
      setEyeAnalysis(response.data.eyeanalysis);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading ? (
        <>
          <Loading />
        </>
      ) : (
        <div>
          <Header />
          {displayAnalysis ? (
            <>
            {activeTab === "voice" ? <DisplayVoiceAnalysis VoiceAnalysisData={DisplayData} /> : <DisplayEyeAnalysis eyeanalysisData={DisplayData} />}
           </>
          ) : (
            <>
              <div className="m-20 mt-10">
                <div
                  onClick={() => (window.location.href = "/content")}
                  className="flex flex-row items-center my-10 "
                >
                  <MoveLeft className="cursor-pointer mr-2 mt-1" />
                  <span className="text-2xl font-bold cursor-pointer">
                    Back
                  </span>
                </div>
                <div className="flex flex-row gap-4 my-10">
                  <button
                    onClick={() => setActiveTab("voice")}
                    className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 cursor-pointer ${
                      activeTab === "voice"
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    Voice Analysis
                  </button>
                  <button
                    onClick={() => setActiveTab("gaze")}
                    className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 cursor-pointer ${
                      activeTab === "gaze"
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    Gaze Analysis
                  </button>
                </div>
                {activeTab === "voice" && (
                  <div className="flex flex-row w-full gap-6 flex-wrap p-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl shadow-lg mt-6 border border-gray-200">
                    {VoiceAnalysis.map((item) => (
                      <div
                        key={item._id}
                        className="relative h-48 w-72 rounded-xl overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                      >
                        <div className="absolute inset-0 bg-[url('https://th.bing.com/th/id/OIP.t_lofVkf1V8AZ0z848A1ZwAAAA?rs=1&pid=ImgDetMain')] bg-cover bg-center" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-transparent" />
                        <div className="absolute bottom-0 w-full p-4 space-y-2">
                          <h1 className="text-white text-xl font-bold truncate">
                            {item.title}
                          </h1>
                          <Button
                            onClick={() => {
                              setDisplayData(item);
                              setDisplayAnalysis(true);
                            }}
                            className="w-full cursor-pointer bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border border-white/20 rounded-lg py-2 transition-all duration-200"
                          >
                            View Analysis
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {activeTab === "gaze" && (
                  <div className="flex flex-row w-full gap-6 flex-wrap p-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl shadow-lg mt-6 border border-gray-200">
                    {EyeAnalysis.map((item) => (
                      <div
                        key={item._id}
                        className="relative h-48 w-72 rounded-xl overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                      >
                        <div className="absolute inset-0 bg-[url('https://sightyearseyeclinic.com/images/slide02.jpg')] bg-cover bg-center" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
                        <div className="absolute bottom-0 w-full p-4 space-y-2">
                          <h1 className="text-white text-xl font-bold truncate">
                            {item.title}
                          </h1>
                          <Button
                            onClick={() => {
                              setDisplayData(item);
                              setDisplayAnalysis(true);
                            }}
                            className="w-full cursor-pointer bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border border-white/20 rounded-lg py-2 transition-all duration-200"
                          >
                            View Analysis
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
