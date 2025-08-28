"use client";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { useEffect, useState } from "react";
import Loading from "@/app/components/Loading";
import AdminVoiceDisplay from "../_components/adminvoicedisplay";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";

export default function AdminTaskDisplay() {
  const { id } = useParams();
  const { user } = useUser();
  const router = useRouter();
  const [ContentDataArray, setContentDataArray] = useState(null);
  const [loading, setLoading] = useState(false);
  const [datalength, setdatalength] = useState(0);
  const [currentindex, setCurrentindex] = useState(0);
  const [displaynext, setdisplaynext] = useState(false);
  const [displayindex, setdisplayindex] = useState(0);
  const [infopage, setinfopage] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchTaskData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/admin/task?taskid=${id}`);
        const taskData = response.data;
        setContentDataArray(taskData);
        setdatalength(taskData.ContentData.length);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchTaskData();
  }, [id]);

  const handleCurrentData = () => {
    console.log("Current data processed for index:", currentindex);
    setdisplaynext(true);
    setdisplayindex(currentindex + 1);
  };

  const handleNext = () => {
    setdisplaynext(false);
    if (currentindex < datalength - 1) {
      setCurrentindex((prevIndex) => prevIndex + 1);
    }
  };

  const handleSubmit = async () => {
    try {
      const response = await axios.post("/api/admin/submit", {
        userid: user?.id,
        username: user?.fullName,
        task_id: ContentDataArray?.TaskData._id,
      });
      console.log("Task completed, navigating to content page");
      window.location.href = "/content";
    } catch (error) {
      console.log("Error during submit:", error);
    }
  };



  const isLastItem = currentindex === datalength - 1;
  const progressValue = datalength > 0 ? (displayindex / datalength) * 100 : 0;

  return (
    <div className="p-4">
      {loading ? (
        <Loading />
      ) : (
        <>
          {" "}
          {infopage ? (
            <div className="max-w-4xl mx-auto p-8 bg-white rounded-2xl shadow-lg mt-20 space-y-8">
              <h1 className="text-4xl font-bold text-gray-900 border-b pb-4">
                {ContentDataArray?.TaskData.TaskTitle}
              </h1>

              {ContentDataArray?.TaskData.Mode === "Eye" && (
                <div className="space-y-4">
                  <p className="text-xl font-semibold text-blue-600">
                    Eye Tracking Mode
                  </p>
                  <div className="bg-red-50 border-l-4 border-red-400 p-5 rounded-lg">
                    <h2 className="text-red-600 font-bold mb-2">
                      Instructions
                    </h2>
                    <ul className="list-disc list-inside text-red-700 space-y-1">
                      <li>
                        Look at any word in the current line to highlight it.
                      </li>
                      <li>Read all words in the line to see the image.</li>
                    </ul>
                  </div>

                  <div>
                    <p className="text-lg text-gray-700 font-semibold mb-2">
                      Task Content(s):
                    </p>
                    <ul className="list-disc list-inside text-gray-700 ml-4 space-y-1">
                      {ContentDataArray.TaskData.contentTitles.map(
                        (item, index) => (
                          <li key={index}>{item}</li>
                        )
                      )}
                    </ul>
                  </div>
                </div>
              )}

              {ContentDataArray?.TaskData.Mode === "Voice" && (
                <div className="space-y-4">
                  <p className="text-xl font-semibold text-blue-600">
                    Voice Recognition Mode
                  </p>
                  <div className="bg-red-50 border-l-4 border-red-400 p-5 rounded-lg">
                    <h2 className="text-red-600 font-bold mb-2">
                      Instructions
                    </h2>
                    <ul className="list-disc list-inside text-red-700 space-y-1">
                      <li>
                        Read aloud any word in the current line to highlight it.
                      </li>
                      <li>Read all words in the line to see the image.</li>
                    </ul>
                  </div>

                  <div>
                    <p className="text-lg text-gray-700 font-semibold mb-2">
                      Topics Covered:
                    </p>
                    <ul className="list-disc list-inside text-gray-700 ml-4 space-y-1">
                      {ContentDataArray.TaskData.contentTitles.map(
                        (item, index) => (
                          <li key={index}>{item}</li>
                        )
                      )}
                    </ul>
                  </div>
                </div>
              )}

              <div className="bg-green-50 border-l-4 border-green-400 p-5 rounded-lg space-y-2">
                <p className="text-green-800 font-bold">
                  Important Information:
                </p>
                <ul className="list-disc list-inside text-green-700 space-y-1">
                  <li>Do not go back before completing the entire task.</li>
                  <li>
                    After completing each section, click "Next" to move ahead.
                  </li>
                  <li>
                    You cannot return to previous content once you proceed.
                  </li>
                </ul>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={() => setinfopage(false)}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transition duration-300"
                >
                  Start Task
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-row items-center justify-between gap-4 mx-4 sm:mx-20 mb-6">
                <div className="flex-1">
                  <div className="mb-2 font-semibold text-gray-700">
                    Task Progress
                  </div>
                  <Progress
                    value={progressValue}
                    className="w-full h-3 bg-blue-100"
                  />
                  <div className="flex justify-between text-sm text-gray-600 mt-3">
                    <span className="flex items-center">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                        <path
                          fillRule="evenodd"
                          d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Task {displayindex} of {datalength}
                    </span>
                    <span className="flex items-center text-blue-600 font-medium">
                      {Math.round(progressValue)}% Completed
                    </span>
                  </div>
                </div>
                <div>
                  {isLastItem && displaynext ? (
                    <button
                      onClick={handleSubmit}
                      className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 flex items-center"
                    >
                      <span>Complete Task</span>
                      <svg
                        className="w-5 h-5 ml-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </button>
                  ) : (
                    <>
                      {displaynext && (
                        <button
                          onClick={handleNext}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 flex items-center"
                          disabled={currentindex >= datalength - 1}
                        >
                          <span>Next Task</span>
                          <svg
                            className="w-5 h-5 ml-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                          <span className="ml-2">
                            ({currentindex + 2} of {datalength})
                          </span>
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>

              {ContentDataArray &&
                ContentDataArray.ContentData &&
                ContentDataArray.ContentData[currentindex] && (
                  <div className="mb-6">
                    <AdminVoiceDisplay
                      ContentData={{
                        imageData:
                          ContentDataArray.ContentData[currentindex].ImageData,
                        title: ContentDataArray.ContentData[currentindex].title,
                        content_description:
                          ContentDataArray.ContentData[currentindex]
                            .content_description,
                        content_id:
                          ContentDataArray.ContentData[currentindex]._id,
                        task_id: ContentDataArray.TaskData._id,
                        Mode: ContentDataArray?.TaskData.Mode,
                      }}
                      handleCurrentData={handleCurrentData}
                    />
                  </div>
                )}
            </>
          )}
        </>
      )}
    </div>
  );
}
