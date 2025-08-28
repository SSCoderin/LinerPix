"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { MoveLeft, Star, Upload, Sparkles } from "lucide-react";
import axios from "axios";
import { useUser } from "@clerk/nextjs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Loading from "@/app/components/Loading";
import GetAllUSerContent from "./GetAllUSerContent";
import AdminUserContentView from "./AdminUserContentView";
const charater = [
  {
    name: "realistic",
    description: "photorealistic style with natural lighting",
    image:
      "https://imagef.promeai.pro/imagefilter/gallery/publish/2023/12/04/da5011a01a584e5483bb809d1325ad23.png?width=500&height=500&fit=contain&format=webp",
  },
  {
    name: "cartoon",
    description: "vibrant cartoon style with bold colors",
    image: "https://xinva.ai/wp-content/uploads/2023/12/106.jpg",
  },
  {
    name: "watercolor",
    description: "soft watercolor style with flowing colors",
    image:
      "https://watercolorartsa.com/wp-content/uploads/2022/07/20220713_114411_01-ea2d7e24-768x534.jpg",
  },
  {
    name: "oil painting",
    description: "oil painting style with textured strokes",
    image:
      "https://th.bing.com/th/id/OIP.LrQv3AmYAAXkp_O315eDYwHaFj?w=2560&h=1920&rs=1&pid=ImgDetMain",
  },
  {
    name: "digital art",
    description: "digital art style with smooth gradients",
    image:
      "https://th.bing.com/th/id/OIP.QfQ2oqUwdFKmNuXGvXzuKQHaEO?rs=1&pid=ImgDetMain",
  },
  {
    name: "sketch",
    description: "hand-drawn sketch style with pencil lines",
    image:
      "https://th.bing.com/th/id/OIP.6wy-5RjMBwoKnO6K3MsQHwHaEJ?rs=1&pid=ImgDetMain",
  },
  {
    name: "anime",
    description: "Japanese anime style with stylized features",
    image:
      "https://th.bing.com/th/id/OIP.mNMqJMF4XRUPWv1uHHF9SwHaEK?rs=1&pid=ImgDetMain",
  },
  {
    name: "fairy tale",
    description: "whimsical fairy talestyle with magical elements",
    image:
      "https://st.depositphotos.com/1719108/4406/i/450/depositphotos_44064409-stock-illustration-the-fairy-tale.jpg",
  },
];

export default function ContentDashboard() {
  const [loading, setloading] = useState(false);
  const [activecontent, setactivecontent] = useState("none");
  const [previousContent, setPreviousContent] = useState([]);
  const { user } = useUser();
  const [displayallusercontent, setdisplayallusercontent] = useState(false);
  const [contentview, setcontentview] = useState(false);
  const [uploadData, setUploadData] = useState({
    type: "Upload",
    title: "",
    content: "",
    style: "",
  });
  const [custom, setCustom] = useState(false);
  const [createData, setCreateData] = useState({
    topictype: "",
    topic: "",
    character: "",
    description: "",
  });
  const [UserSelectedContentAnalysis, setUserSelectedContentAnalysis] =
    useState();

  useEffect(() => {
    if (!user) return;
    Getpreviouscontent();
  }, []);

  const HandelContentView = (item_id) => {
    GetcontentviewData(item_id);
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };
  const GetcontentviewData = async (item_id) => {
    setloading(true);
    try {
      const response = await axios.get(
        `/api/admin/usercontentanalysis?content_id=${item_id}`
      );
      console.log("this is the  cantetnanalysis data", response.data);
      setUserSelectedContentAnalysis(response.data);
      if (response.data.success === true) {
        setcontentview(true);
      }
    } catch (error) {
      console.log(error);
    }finally{
      setloading(false);
    }
  };

  const Getpreviouscontent = async () => {
    try {
      setloading(true);
      const respose = await axios.get(`/api/admin/ai-image-gen`);
      if (respose.data.success === true) {
        setPreviousContent(respose.data.AdminContentData);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setloading(false);
    }
  };

  function AiCreate() {
    const HandelCreate = async () => {
      if (
        createData.topic == "" ||
        createData.topictype == "" ||
        createData.character == "" ||
        createData.description == ""
      )
        return alert("All fields are required");
      console.log(createData);
      try {
        setloading(true);
        const respose = await axios.post("/api/admin/ai-content-gen", {
          userid: user?.id,
          topic: createData.topic,
          topictype: createData.topictype,
          character: createData.character,
          description: createData.description,
        });
        console.log(respose.data);
        if (respose.data.success === true) {
          try {
            const aiimagerespo = await axios.post("/api/admin/ai-image-gen", {
              userid: user?.id,
              content: respose.data.aiContentData.content,
            });
            if (aiimagerespo.data.success === true) {
              toast.success(aiimagerespo.data.message);
            }
          } catch (error) {
            toast.error(error.message);
          }
        }
      } catch (error) {
        toast.error(error.message);
      } finally {
        setloading(false);
      }
    };

    return (
      <>
        <div>
          <div className="flex flex-row items-center mx-20 justify-between ">
            <div
              onClick={() => setactivecontent("none")}
              className="flex flex-row items-center mt-4 mb-6 "
            >
              <MoveLeft className="cursor-pointer mr-2 mt-1" />
              <span className="text-2xl font-bold cursor-pointer">
                Back <span className="text-lg "></span>
              </span>
            </div>
            <Button
              onClick={() => setactivecontent("upload")}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white  rounded-lg font-medium transition-all duration-200 shadow-md"
            >
              <Upload />
              Upload Content
            </Button>
          </div>

          <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-lg p-8 space-y-8 mx-20 mb-20">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Topic type
              </h2>
              <Select
                onValueChange={(value) => {
                  if (value === "custom") {
                    setCustom(true);
                    setCreateData({ ...createData, topictype: "" });
                  } else {
                    setCustom(false);
                    setCreateData({ ...createData, topictype: value });
                  }
                }}
              >
                <SelectTrigger className="w-full md:w-1/2 h-12">
                  <SelectValue placeholder="Select a topic" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    className="text-blue-600 font-semibold"
                    value="custom"
                  >
                    Custom input
                  </SelectItem>
                  <SelectItem value="Random AI Story">
                    Random AI Story
                  </SelectItem>
                  <SelectItem value="Scary Story">Scary Story</SelectItem>
                  <SelectItem value="Historical Story">
                    Historical Story
                  </SelectItem>
                  <SelectItem value="Bedtime Story">Bedtime Story</SelectItem>
                  <SelectItem value="Motivation Story">
                    Motivation Story
                  </SelectItem>
                </SelectContent>{" "}
              </Select>{" "}
              {custom && (
                <Input
                  placeholder="Enter your custom topic"
                  className="w-full md:w-1/2 h-12"
                  onChange={(e) =>
                    setCreateData({ ...createData, topictype: e.target.value })
                  }
                />
              )}
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Topic
              </h2>
              <Input
                placeholder="Enter your topic"
                className="w-full md:w-1/2 h-12"
                onChange={(e) =>
                  setCreateData({ ...createData, topic: e.target.value })
                }
              />
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Style
              </h2>
              <p className="text-gray-600">Select the style of your story</p>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {charater.map((item) => (
                  <div
                    key={item.name}
                    className={` ${
                      item.description === createData.character
                        ? "bg-blue-100"
                        : ""
                    } flex items-center space-x-4 p-4 rounded-xl hover:bg-blue-100 cursor-pointer transition-all duration-200`}
                    onClick={() =>
                      setCreateData({
                        ...createData,
                        character: item.description,
                      })
                    }
                  >
                    <div
                      className={`w-16 h-16 rounded-xl overflow-hidden shadow-lg ${
                        item.description === createData.character
                          ? "border-2 border-blue-600"
                          : ""
                      } `}
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 capitalize">
                      {item.name}
                    </h3>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Story Description
              </h2>
              <Select
                onValueChange={(value) =>
                  setCreateData({ ...createData, description: value })
                }
              >
                <SelectTrigger className="w-full md:w-1/2 h-12">
                  <SelectValue placeholder="Select length" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3-5 sentences">3-5 sentences</SelectItem>
                  <SelectItem value="5-10 sentences">5-10 sentences</SelectItem>
                  <SelectItem value="10-15 sentences">
                    10-15 sentences
                  </SelectItem>
                  <SelectItem value="15-20 sentences">
                    15-20 sentences
                  </SelectItem>
                  <SelectItem value="20-25 sentences">
                    20-25 sentences
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={HandelCreate}
              className="w-full cursor-pointer md:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg"
            >
              Generate Content
            </Button>
          </div>
        </div>
      </>
    );
  }
  function UploadContentForm() {
    const HandeluploadData = async () => {
      if (
        uploadData.title === "" ||
        uploadData.content === "" ||
        uploadData.style === ""
      )
        return toast.error("Please fill all the fields");
      try {
        setloading(true);
        const respose = await axios.post("/api/admin/ai-image-gen", {
          userid: user?.id,
          content: uploadData,
        });
        console.log(respose.data);
        if (respose.data.success === true) {
          toast.success(respose.data.message);
        }
        setUploadData({ title: "", content: "" });
      } catch (error) {
        toast.error(error.message);
      } finally {
        setloading(false);
      }
    };
    return (
      <>
        <div className="flex flex-row items-center mx-20 justify-between ">
          <div
            onClick={() => setactivecontent("none")}
            className="flex flex-row items-center mt-4 mb-6 "
          >
            <MoveLeft className="cursor-pointer mr-2 mt-1" />
            <span className="text-2xl font-bold cursor-pointer">
              Back <span className="text-lg "></span>
            </span>
          </div>
          <Button
            onClick={() => setactivecontent("ai")}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white  rounded-lg font-medium transition-all duration-200 shadow-md"
          >
            <Star />
            Generate Content Using AI
          </Button>
        </div>
        <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-lg p-8 space-y-8 mx-20 mb-20">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Upload Your Content
          </h1>
          <h1 className="text-lg font-semibold text-gray-700">Title</h1>
          <Input
            placeholder="Enter Content Title"
            className="focus:ring-2 focus:ring-blue-500"
            value={uploadData.title}
            onChange={(e) =>
              setUploadData({ ...uploadData, title: e.target.value })
            }
          />
          <h1 className="text-lg font-semibold text-gray-700">Content</h1>
          <Textarea
            placeholder="Enter your content here"
            className="min-h-[200px] focus:ring-2 focus:ring-blue-500"
            value={uploadData.content}
            onChange={(e) =>
              setUploadData({ ...uploadData, content: e.target.value })
            }
          />
          <div className="space-y-4 mb-10">
            <h2 className="text-lg font-semibold text-gray-700 ">Style</h2>
            <p className="text-gray-600">Select the style of your story</p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {charater.map((item) => (
                <div
                  key={item.name}
                  className={` ${
                    item.description === uploadData.style ? "bg-blue-100" : ""
                  } flex items-center space-x-4 p-4 rounded-xl hover:bg-blue-100 cursor-pointer transition-all duration-200`}
                  onClick={() =>
                    setUploadData({ ...uploadData, style: item.description })
                  }
                >
                  <div
                    className={`w-16 h-16 rounded-xl overflow-hidden shadow-lg ${
                      item.description === uploadData.style
                        ? "border-2 border-blue-600"
                        : ""
                    } `}
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 capitalize">
                    {item.name}
                  </h3>
                </div>
              ))}
            </div>
          </div>
          <Button
            onClick={HandeluploadData}
            className="flex bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 ml-auto"
          >
            Submit Content
          </Button>
        </div>
      </>
    );
  }

  return (
    <div className="mb-20">
      {loading ? (
        <>
          {" "}
          <div className="flex justify-center items-center h-screen">
            {activecontent == "upload" || activecontent == "ai" ? (
              <h1>Image Data generating please wait ... </h1>
            ) : (
              ""
            )}
            <Loading />
          </div>
        </>
      ) : (
        <>
          {contentview ? (
            <>
              <div
                onClick={() => setcontentview(false)}
                className="flex flex-row items-center mt-4 mb-6 "
              >
                <MoveLeft className="cursor-pointer mr-2 mt-1" />
                <span className="text-2xl font-bold cursor-pointer">
                  Back <span className="text-lg "></span>
                </span>
              </div>
              <AdminUserContentView
                AnalysisData={UserSelectedContentAnalysis}
              />
            </>
          ) : (
            <>
              {activecontent == "none" && (
                <div className="flex flex-row justify-between mx-20 gap-10 mt-20">
                  <div className="border-dotted border border-blue-400 rounded-2xl p-10 bg-blue-50 w-1/2 flex flex-col items-center">
                    <h1 className="text-2xl font-bold text-blue-900">
                      Upload Your Content Here
                    </h1>
                    <p className="text-sm text-gray-600 m-2">
                      Upload a paragraph, story, or article to generate stunning
                      visuals from it.
                    </p>
                    <Button
                      onClick={() => setactivecontent("upload")}
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
                      onClick={() => setactivecontent("ai")}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-2.5 rounded-lg font-medium transition-all duration-200 shadow-md"
                    >
                      Generate
                    </Button>
                  </div>
                </div>
              )}
              {activecontent == "upload" && <>{UploadContentForm()}</>}
              {activecontent == "ai" && AiCreate()}
              <div className="mt-10 mb-20">
                <h1 className="text-2xl mb-6 font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent  mr-auto flex w-fit">
                  Previously Generated Content
                </h1>
                <div className="flex flex-row w-full flex-wrap items-center border border-gray-200 rounded-lg bg-gray-50 p-8 shadow-sm ">
                  {previousContent.length > 0 ? (
                    <>
                      {previousContent.map((item, index) => (
                        <div
                          key={index}
                          className="relative w-60 h-50 rounded-lg overflow-hidden m-2 cursor-pointer hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-blue-300 hover:border-2 hover:border-blue-300"
                          style={{
                            backgroundImage: `url(data:image/jpeg;base64,${item.ImageData[0].data})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }}
                        >
                          {item.type === "AI-Generated" ? (
                            <div className="absloute top-0 w-fit p-2 bg-gradient-to-r from-blue-500 to-purple-500 m-1 rounded-2xl  ">
                              <h1 className="text-white text-sm font-bold ">
                                {item.type}
                              </h1>
                            </div>
                          ) : (
                            ""
                          )}

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
                        You haven't Created any content yet
                      </h1>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </>
      )}
      <div>
        <h1 className="text-2xl mb-6 font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent  mr-auto flex w-fit">
          Student Generated And Uploaded Content
        </h1>
        <Button
          className={
            "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-2.5 rounded-lg font-medium transition-all duration-200 shadow-md"
          }
          onClick={() => setdisplayallusercontent(!displayallusercontent)}
        >
          {displayallusercontent ? "Hide all" : "Display all"}
        </Button>
        {displayallusercontent && (
          <GetAllUSerContent HandelContentView={HandelContentView} />
        )}
      </div>
    </div>
  );
}
