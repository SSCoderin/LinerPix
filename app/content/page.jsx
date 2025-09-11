"use client";
import Header from "../components/Header";
import GenerateContent from "./_component/Generate-content";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import UploadContentForm from "./_component/upload-content-form";
import { toast } from "sonner";
import axios from "axios";
import Loading from "../components/Loading";
import { MoveLeft, Star } from "lucide-react";
import AdminDisplayContent from "./_component/adminDisplayContent";
export default function ContentPage() {
  const { user } = useUser();
  const [upload, setUpload] = useState(false);
  const [loading, setLoading] = useState(true);
  const [UploadedData, setUploadedData] = useState([]);
  const [aigeneratedData, setAigeneratedData] = useState([]);

  useEffect(() => {
    if (!user) return;
    getUploadedData();
  }, [user]);

  const getUploadedData = async () => {
    try {
      const response = await axios.get(`/api/content?userid=${user.id}`);
      const filterUpload = response.data.content.filter(
        (item) => item.type === "UploadContent"
      );
      setUploadedData(filterUpload);
      const filterAi = response.data.content.filter(
        (item) => item.type === "AI-Generated"
      );
      setAigeneratedData(filterAi);
      console.log(response.data.content);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Header />
      {loading ? (
        <>
          <Loading />
        </>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6 my-10 mx-20">
            <div className="p-6 flex items-center justify-between bg-gradient-to-r from-blue-500/10 to-purple-500/10">
              <div>
                <h3 className="text-xl font-bold text-slate-800">
                  Welcome back,{" "}
                  <span className="underline">{user?.fullName || "User"}</span>
                </h3>
                <p className="text-slate-600 mt-1">
                  Turn Your Story/Content into Stunning Visuals
                </p>
                <p className="text-slate-600 mt-1">
                  Everything you need to transform reading into an immersive
                  visual experience
                </p>
              </div>
            </div>
          </div>
          {upload ? (
            <div className="mb-20">
              <div className="flex flex-row items-center mx-20 justify-between w-2/3">
                <div
                  onClick={() => setUpload(false)}
                  className="flex flex-row items-center mt-4 mb-6"
                >
                  <MoveLeft className="cursor-pointer mr-2 mt-1" />
                  <span className="text-2xl font-bold cursor-pointer">
                    Back
                  </span>
                </div>
                <Button
                  onClick={() => (window.location.href = "/content/ai-create")}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white  rounded-lg font-medium transition-all duration-200 shadow-md"
                >
                  <Star />
                  Generate Content Using AI
                </Button>
              </div>

              <UploadContentForm />
            </div>
          ) : (
            <>
              <AdminDisplayContent />
              <h1 className="text-2xl flex  w-fit mx-20 font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent mb-6 mr-auto mt-20">
                Create New Content
              </h1>
              <div className="flex flex-row justify-between mx-20 gap-10 ">
                <div className="border-dotted border border-blue-400 rounded-2xl p-10 bg-blue-50 w-1/2 flex flex-col items-center">
                  <h1 className="text-2xl font-bold text-blue-900">
                    Upload Your Content Here
                  </h1>
                  <p className="text-sm text-gray-600 m-2">
                    Upload a paragraph, story, or article to generate stunning
                    visuals from it.
                  </p>
                  <Button
                    onClick={() => setUpload(true)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-2.5 rounded-lg font-medium transition-all duration-200 shadow-md"
                  >
                    Upload Content
                  </Button>
                </div>
                <div
                  className={`border-dotted border border-blue-400 rounded-2xl p-10 w-1/2 flex flex-col items-center bg-[url('https://www.umangsoftware.com/wp-content/uploads/2020/05/ai-bg-1024x478.png')] `}
                >
                  <h1 className="text-2xl font-bold text-white mb-6">
                    Generate Content Using AI
                  </h1>

                  <Button
                    onClick={() =>
                      (window.location.href = "/content/ai-create")
                    }
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-2.5 rounded-lg font-medium transition-all duration-200 shadow-md"
                  >
                    Generate
                  </Button>
                </div>
              </div>
              <div className="mt-10 mx-20 flex flex-col items-center">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent mt-8 mb-6 mr-auto">
                  Previously Uploaded Content
                </h1>
                <div className="flex flex-row w-full flex-wrap items-center border border-gray-200 rounded-lg bg-gray-50 p-8 shadow-sm ">
                  {UploadedData.length > 0 ? (
                    <>
                      {UploadedData.map((item, index) => (
                        <div
                          key={index}
                          onClick={() => {
                            window.location.href = `/content/display/${item._id}&${item.userid}`;
                          }}
                          className="relative w-60 h-50 rounded-lg overflow-hidden m-2 cursor-pointer hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-blue-300 hover:border-2 hover:border-blue-300"
                          style={{
                            backgroundImage: item.first_image
                              ? `url(${item.first_image})`
                              : `url(https://th.bing.com/th/id/OIP.dlsFyeoIz85ZYdETpmDGpQAAAA?rs=1&pid=ImgDetMain)`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }}
                        >
                          <div className="absolute bottom-0 w-full p-4 bg-gradient-to-t from-black/70 to-transparent backdrop-blur-sm">
                            <h1 className="text-white text-xl font-bold truncate">
                              {item.title}
                            </h1>
                          </div>
                        </div>
                      ))}
                    </>
                  ) : (
                    <>
                      <h1 className="text-gray-500 font-medium flex justify-center w-full">
                        You haven't uploaded any content yet
                      </h1>
                    </>
                  )}
                </div>
              </div>
              <div className="mb-20">
                <GenerateContent aigeneratedData={aigeneratedData} />
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
