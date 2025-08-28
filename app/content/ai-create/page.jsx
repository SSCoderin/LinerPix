"use client";
import Header from "@/app/components/Header";
import { useUser } from "@clerk/nextjs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { MoveLeft } from "lucide-react";
import axios from "axios";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import Loading from "@/app/components/Loading";
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
export default function AiCreate() {
  const [loading, setLoading] = useState(false);
  const [custom, setCustom] = useState(false);
  const [createData, setCreateData] = useState({
    topictype: "",
    topic: "",
    character: "",
    description: "",
  });
  const { user } = useUser();

  const HandelCreate = async () => {
    if (
      createData.topictype == "" ||
      createData.topic == "" ||
      createData.character == "" ||
      createData.description == ""
    )
      return alert("All fields are required");
      console.log(createData);  
    try {
      setLoading(true);
      const respose = await axios.post("/api/ai-generate", {
        userid: user?.id,
        username: user?.fullName,
        topictype: createData.topictype,
        topic: createData.topic,
        character: createData.character,
        description: createData.description,
      });
      console.log(respose.data);
      if (respose.data.success === true) {
        window.location.href = "/content";
      }
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
          <div
            onClick={() => (window.location.href = "/content")}
            className="flex flex-row items-center mx-20 mt-4 mb-6"
          >
            <MoveLeft className="cursor-pointer mr-2 mt-1" />
            <span className="text-2xl font-bold cursor-pointer">Back</span>
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
                  <SelectItem value="Scary Story">
                    Scary Story
                  </SelectItem>
                  <SelectItem value="Historical Story">
                    Historical Story
                  </SelectItem>
                  <SelectItem value="Bedtime Story">
                    Bedtime Story
                  </SelectItem>
                  <SelectItem value="Motivation Story">
                    Motivation Story
                  </SelectItem>
                </SelectContent>              </Select>{" "}


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
      )}{" "}
    </>
  );
}
