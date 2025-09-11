"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import Loading from "@/app/components/Loading";

export default function GetAllUserContent({HandelContentView}) {
  const [allusercontent, setAllUserContent] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getUserContent();
  }, []);

  const getUserContent = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/allusercontent`);
      window.scrollTo({ top: 800, behavior: "smooth" });

      setAllUserContent(response.data.AllUserContent);
    } catch (error) {
      console.error(error);
    }finally{
      setLoading(false);
    }
  };

  return (
    <div className="mt-10 ">
      {loading ? <>
      <h1 className="text-2xl font-bold"> Loading...</h1>
      <Loading/>
      </> :  <><div className="flex flex-row w-full flex-wrap items-center border border-gray-200 rounded-lg bg-gray-50 p-8 shadow-sm ">
        {allusercontent.length > 0 ? (
          <>
            {Object.values(allusercontent.reduce((acc, item) => {
              if (!acc[item.userid]) {
                acc[item.userid] = [];
              }
              acc[item.userid].push(item);
              return acc;
            }, {})).map((userContent, userIndex) => (
              <div key={userIndex} className="w-full mb-6">
                <h2 className="text-lg font-semibold mb-3 text-gray-700">StudentName: {userContent[0].username ? userContent[0].username : userContent[0].userid}</h2>
                <div className="flex flex-wrap">
                  {userContent.map((item, index) => (
                    <div
                      key={index}
                      onClick={() => {
                        HandelContentView(item._id);
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
                        {item.type === "AI-Generated" && 
                      <div className="absolute top-0 w-fit p-2 rounded-2xl text-white bg-gradient-to-r from-blue-600 to-purple-600 m-1 ">
                        <h1>AI-Generated</h1>

                      </div>
                        }
                      <div className="absolute bottom-0 w-full p-4 bg-gradient-to-t from-black/70 to-transparent backdrop-blur-sm">
                        <h1 className="text-white text-xl font-bold truncate">
                          {item.title}
                        </h1>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </>
        ) : (
          <>
            <h1 className="text-gray-500 font-medium flex justify-center w-full">
              No One haven't uploaded any content yet
            </h1>
          </>
        )}
      </div></>}
      

      
    </div>
  );
}
