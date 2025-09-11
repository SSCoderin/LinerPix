import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { StickyNote, ClipboardList } from "lucide-react";

export default function AdminDisplayContent() {
  const { user } = useUser();
  const [TaskData, setTaskData] = useState([]);
  const [noteData, setNoteData] = useState([]);
  const [statusData, setStatusData] = useState([]);

  useEffect(() => {
    if (!user) return;
    FetchTaskData();
    getAllNotes();
    CheckStatus();
  }, []);

  const FetchTaskData = async () => {
    try {
      const response = await axios.get(`/api/admin/task`);
      setTaskData(response.data.TaskData);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch previous tasks");
    }
  };

  const getAllNotes = async () => {
    try {
      const response = await axios.get("/api/admin/note");
      setNoteData(response.data.adminnote || []);
    } catch (error) {
      console.error("Failed to fetch notes:", error);
    }
  };

  const CheckStatus = async () => {
    try {
    const response = await axios.get(`/api/admin/submit?userid=${user.id}`);
    setStatusData(response.data.submitted);
  }catch (error) {
    console.error("Failed to fetch notes:", error);
  }
}

  const handleCardClick = (taskId) => {
    if (!statusData.some(status => status.task_id === taskId)) {
      window.location.href = `content/admin/${taskId}`;
    } else {
      toast.error("This task has already been completed!");
    }
  };

  return (
    <div className="bg-red-50  pb-20 py-10">
    <div className="mt-10 mx-6 md:mx-20 ">
      <div className="flex flex-col gap-8">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-red-500 to-purple-500 bg-clip-text text-transparent  mr-auto ">
                  Your Current Task
                </h1>
        <div className="bg-white border-2 border-red-200 rounded-xl shadow p-6">
          
          <div className="flex items-center mb-4">
            <StickyNote className="text-red-500 animate-bounce mr-2" />
            <h2 className="text-xl font-semibold bg-gradient-to-r from-red-500 to-purple-500 bg-clip-text text-transparent   mr-auto ">
              Important Notes
            </h2>
          </div>
          {noteData.length > 0 ? (
            <ul className="space-y-2">
              {noteData.map((item, index) => (
                <li
                  key={index}
                  className="border-l-4 border-red-400 pl-4 text-gray-700 font-medium"
                >
                  {item.note}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No notes available.</p>
          )}
        </div>
   
        <div className="flex flex-row w-full flex-wrap items-center gap-4 border-2 border-red-200 rounded-xl shadow p-6">
          {TaskData.length > 0 ? (
            TaskData.map((item, index) => (
              <div
                key={index}


                onClick={() => handleCardClick(item._id)}
                className={`relative w-60 h-44 rounded-xl overflow-hidden cursor-pointer border-2 border-gray-200 ${
                  !statusData.some(status => status.task_id === item._id) 
                  ? "hover:scale-105 transition-all duration-300 hover:shadow-xl hover:border-blue-400"
                  : "opacity-50 cursor-not-allowed"
                }`}
                style={{
                  backgroundImage: `url(https://static.vecteezy.com/system/resources/thumbnails/007/470/513/small_2x/important-business-checklist-planning-for-shopping-reminder-or-project-priority-task-list-3d-render-photo.jpg)`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                {statusData.some(status => status.task_id === item._id) ? (
                  <div className="absolute top-0 w-fit px-2 py-1 rounded-2xl text-white bg-gradient-to-r from-green-400 to-green-600 m-1">
                    <h1>Completed</h1>
                  </div>
                ) : (
                  <div className="absolute top-0 w-fit px-2 py-1 rounded-2xl text-white bg-gradient-to-r from-red-600 to-purple-600 m-1">
                    <h1>Pending..</h1>
                  </div>
                )}
                <div className="absolute bottom-0 w-full p-4 bg-gradient-to-t from-black/100 to-black/10">
                  <h1 className="text-white text-xl font-bold truncate">
                    {item.TaskTitle}
                  </h1>
                </div>
              </div>
            ))
          ) : (
            <h1 className="text-gray-500 font-medium flex justify-center w-full">
              Haven't any task yet
            </h1>
          )}
        </div>
      </div>
    </div>
    </div>
  );
}
