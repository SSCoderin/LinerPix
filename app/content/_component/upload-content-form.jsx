import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";
import { MoveLeft, Star } from "lucide-react";
import axios from "axios";
import { useUser } from "@clerk/nextjs";

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
export default function UploadContentForm() {
  const { user } = useUser();
  const [uploadData, setUploadData] = useState({
    title: "",
    content: "",
    style: "",
  });
  const HandeluploadData = async () => {
    if (
      uploadData.title === "" ||
      uploadData.content === "" ||
      uploadData.style === ""
    )
      return toast.error("Please fill all the fields");
    try {
      const respose = await axios.post("/api/content", {
        userid: user?.id,
        username: user?.fullName,
        type: "UploadContent",
        style: uploadData.style,
        title: uploadData.title,
        content: uploadData.content,
      });
      console.log(respose.data);
      if (respose.data.success === true) {
        toast.success(respose.data.message);
      }
      setUploadData({ title: "", content: "" });
      window.location.href = "/content";
    } catch (error) {
      toast.error(error.message);
    }
  };
  return (
    <>
     
      <div className=" mx-20 border-2 border-gray-200 rounded-lg bg-gray-50 p-8 space-y-4 w-2/3">
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
