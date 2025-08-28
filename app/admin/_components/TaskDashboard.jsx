"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import Loading from "@/app/components/Loading";
import axios from "axios";
import { MoveLeft, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Mode } from "@google/genai";

export default function TaskDashboard() {
  const { user } = useUser();
  const [previousTask, setPreviousTask] = useState([]);
  const [loading, setLoading] = useState(false);
  const [create, setCreate] = useState(false);
  const [modetype, setmodetype] = useState("Eye");
  const [previousContent, setPreviousContent] = useState([]);
  const [selectedContent, setSelectedContent] = useState([]);
  const [admintasktitle, setadmintasktitle] = useState("");

  useEffect(() => {
    if (!user) return;
    getPreviousContent();
    fetchPreviousTask();
  }, [user]);

  const fetchPreviousTask = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/admin/task`);
      setPreviousTask(response.data.TaskData);
    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch previous tasks");
    }
  };

  const getPreviousContent = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `/api/admin/ai-image-gen?userid=${user?.id}`
      );
      if (response.data.success === true) {
        setPreviousContent(response.data.AdminContentData);
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error.message ||
          "Failed to fetch content"
      );
    } finally {
      setLoading(false);
    }
  };

  const HandelSelectContent = (content) => {
    if (selectedContent.includes(content)) {
      setSelectedContent(selectedContent.filter((c) => c !== content));
    } else {
      setSelectedContent([...selectedContent, content]);
    }
  };

  const handleUploadTask = async () => {
    if (!admintasktitle.trim()) {
      toast.error("Please enter a task title");
      return;
    }

    if (selectedContent.length === 0) {
      toast.error("Please select at least one content item");
      return;
    }

    try {
      const taskRepo = await axios.post("/api/admin/task", {
        userid: user?.id,
        TaskTitle: admintasktitle,
        Mode: modetype,
        contentTitles: selectedContent.map((content) => content.title),
        content_ids: selectedContent.map((content) => content._id),
      });

      console.log(taskRepo.data);
      if (taskRepo.data.success === true) {
        toast.success(taskRepo.data.message);
        setSelectedContent([]);
        setadmintasktitle("");
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error.message ||
          "Failed to upload task"
      );
    }
  };

  return (
    <div>
      {loading ? (
        <Loading />
      ) : (
        <>
          {create ? (
            <div>
              <div className="flex flex-row w-full flex-wrap items-center border border-gray-200 rounded-lg bg-gray-50 p-8 shadow-sm">
                {previousContent.length > 0 ? (
                  previousContent.map((item, index) => (
                    <div
                      key={index}
                      className={`relative rounded-lg overflow-hidden m-2 cursor-pointer hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-blue-300 ${
                        selectedContent?.includes(item)
                          ? "border-4 border-blue-500 shadow-lg shadow-blue-300 w-55 h-45"
                          : "w-60 h-50"
                      }`}
                      onClick={() => {
                        HandelSelectContent(item);
                      }}
                      style={{
                        backgroundImage: `url(data:image/jpeg;base64,${item.ImageData[0].data})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    >
                      {item.type === "AI-Generated" && (
                        <div className="absolute top-0 w-fit p-2 bg-gradient-to-r from-blue-500 to-purple-500 m-1 rounded-2xl">
                          <h1 className="text-white text-sm font-bold">
                            {item.type}
                          </h1>
                        </div>
                      )}

                      <div className="absolute bottom-0 w-full p-4 bg-gradient-to-t from-black/70 to-transparent backdrop-blur-sm">
                        <h1 className="text-white text-xl font-bold truncate">
                          {item.title}
                        </h1>
                      </div>
                    </div>
                  ))
                ) : (
                  <h1 className="text-gray-500 font-medium flex justify-center w-full">
                    You haven't created any content yet
                  </h1>
                )}
              </div>

              <div className="flex flex-row items-center mt-10 justify-between">
                <div
                  onClick={() => setCreate(false)}
                  className="flex flex-row items-center mt-4 mb-6 cursor-pointer"
                >
                  <MoveLeft className="cursor-pointer mr-2 mt-1" />
                  <span className="text-2xl font-bold cursor-pointer">
                    Back <span className="text-lg"></span>
                  </span>
                </div>
                <Button
                  onClick={() => (window.location.href = "/admin/content")}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all duration-200 shadow-md"
                >
                  Content Dashboard
                </Button>
              </div>

              <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-lg p-8 space-y-8 mb-20">
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Task Title
                  </h2>
                  <Input
                    placeholder="Task Title"
                    value={admintasktitle}
                    onChange={(e) => setadmintasktitle(e.target.value)}
                  ></Input>
                </div>
                 <div className="space-y-4">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Mode Type
                  </h2>
                  <RadioGroup defaultValue="option-one">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="option-one" id="option-one" onClick={() => setmodetype("Eye")} />
                      <Label htmlFor="option-one">Eye Tracking</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="option-two" id="option-two" onClick={() => setmodetype("Voice")}/>
                      <Label htmlFor="option-two">Voice Recording</Label>
                    </div>
                  </RadioGroup>
                  {modetype}
                  
                </div>

                <div className="space-y-4">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Selected Content
                  </h2>
                  <div className="flex flex-row w-full flex-wrap items-center border border-gray-200 rounded-lg bg-gray-50 p-8 shadow-sm">
                    {selectedContent.length > 0 ? (
                      selectedContent.map((item, index) => (
                        <div
                          key={index}
                          className="relative w-60 h-50 rounded-lg overflow-hidden m-2 cursor-pointer hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-blue-300 hover:border-2 hover:border-blue-300"
                          style={{
                            backgroundImage: `url(data:image/jpeg;base64,${item.ImageData[0].data})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }}
                        >
                          {item.type === "AI-Generated" && (
                            <div className="absolute top-0 w-fit p-2 bg-gradient-to-r from-blue-500 to-purple-500 m-1 rounded-2xl">
                              <h1 className="text-white text-sm font-bold">
                                {item.type}
                              </h1>
                            </div>
                          )}

                          <div className="absolute bottom-0 w-full p-4 bg-gradient-to-t from-black/70 to-transparent backdrop-blur-sm">
                            <h1 className="text-white text-xl font-bold truncate">
                              {item.title}
                            </h1>
                          </div>
                        </div>
                      ))
                    ) : (
                      <h1 className="text-gray-500 font-medium flex justify-center w-full">
                        You haven't selected any content yet (Select at least 1
                        content)
                      </h1>
                    )}
                  </div>
                </div>

                <Button
                  onClick={handleUploadTask}
                  disabled={loading}
                  className="w-full cursor-pointer md:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg disabled:opacity-50"
                >
                  <Upload className="mr-2" />
                  {loading ? "Uploading..." : "Upload Task"}
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="mx-auto border-dotted border-2 border-blue-400 rounded-2xl p-10 bg-blue-50 w-1/2 flex flex-col items-center">
                <h1 className="text-2xl font-bold text-blue-900">
                  Create Task
                </h1>
                <p className="text-sm text-gray-600 m-2">
                  Select multiple Uploaded Content (paragraph, story, or
                  article) to create Task
                </p>
                <Button
                  onClick={() => setCreate(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-2.5 rounded-lg font-medium transition-all duration-200 shadow-md"
                >
                  Create Task
                </Button>
              </div>
              <div className="mt-10 mb-20">
                <h1 className="text-2xl mb-6 font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent mr-auto flex w-fit">
                  Previously Generated Task
                </h1>
                <div className="flex flex-row w-full flex-wrap items-center border border-gray-200 rounded-lg bg-gray-50 p-8 shadow-sm">
                  {previousTask.length > 0 ? (
                    previousTask.map((item, index) => (
                      <div
                      onClick={() => window.location.href = `/admin/adminanalysis/${item._id}`}
                       key={index} className="flex flex-col cursor-pointer m-4 hover:scale-105">
                        <div
                          className="relative w-60 h-44 rounded-xl overflow-hidden cursor-pointer border-2 border-gray-200 hover:scale-105 transition-all duration-300 hover:shadow-xl hover:border-blue-400"
                          style={{
                            backgroundImage: `url(https://cdn3d.iconscout.com/3d/premium/thumb/document-list-10279483-8306870.png)`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }}
                        >
                          <div className="absolute top-0 w-full p-4 bg-gradient-to-b from-black/100 to-black/20">
                            <h1 className="text-white text-xl font-bold truncate">
                              {item.TaskTitle}
                            </h1>
                          </div>
                        </div>
                        <Button 
                          className="mt-3 cursor-pointer w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-2 rounded-lg font-medium transition-all duration-200 shadow-md"
                        >
                          View Analysis
                        </Button>
                      </div>
                    ))
                  ) : (
                    <h1 className="text-gray-500 font-medium flex justify-center w-full">
                      You haven't created any task yet
                    </h1>
                  )}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
