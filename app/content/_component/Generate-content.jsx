import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import DefaultImage from "../../images/image.png";

export default function GenerateContent({ aigeneratedData }) {
  return (
    <div className="mt-10 mx-20 ">
      <div className="flex flex-row items-center justify-between mb-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent  mr-auto">
          Previously Generated Content
        </h1>
        <Button
          onClick={() => (window.location.href = "/content/ai-create")}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-2.5 rounded-lg font-medium transition-all duration-200 shadow-md"
        >
          <Star />
          Generate Content Using AI
        </Button>
      </div>

      <div className="flex flex-row flex-wrap items-center border border-gray-200 rounded-lg bg-gray-50 p-8 shadow-sm mb-20">
        {aigeneratedData.length > 0 ? (
          <>
            {aigeneratedData.map((item, index) => (
              <div
                key={index}
                onClick={() => {
                  window.location.href = `/content/display/${item._id}&${item.userid}`;
                }}
                className="relative w-60 h-50 rounded-lg overflow-hidden m-2 cursor-pointer hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-blue-300 hover:border-2 hover:border-blue-300"
                style={{
                  backgroundImage:
                    item.first_image !== "null"
                      ? `url(data:image/jpeg;base64,${item.first_image})`
                      : `url(${DefaultImage})`,              
                          backgroundSize: "cover",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              ><div className="absolute top-0 w-fit p-2 rounded-2xl text-white bg-gradient-to-r from-blue-600 to-purple-600 m-1 ">
                <h1>AI-Generated</h1>
                  
                </div>
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
  );
}
