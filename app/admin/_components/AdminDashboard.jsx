import { useState, useEffect } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { useUser } from "@clerk/nextjs";
import {Button} from "@/components/ui/button";

export default function AdminDashboard() {
  const { user } = useUser();
  const [noteMsg, setNoteMsg] = useState("");
  const [noteData, setNoteData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      getAllNotes();
    }
  }, [user]);

  const getAllNotes = async () => {
    try {
      const response = await axios.get("/api/admin/note");
      setNoteData(response.data.adminnote || []);
    } catch (error) {
      console.error("Failed to fetch notes:", error);
    }
  };

  const deleteNote = async (id) => {
    try {
      const response = await axios.delete(`/api/admin/note?id=${id}`);
      if (response.data.success) {
        getAllNotes();
      }
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const addNote = async () => {
    if (!noteMsg.trim()) return;
    try {
      setLoading(true);
      const response = await axios.post(`/api/admin/note`, {
        userid: user?.id,
        note: noteMsg,
      });
      if (response.data.success) {
        setNoteMsg("");
        getAllNotes();
      }
    } catch (error) {
      console.error("Add note failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto mt-10">

      <div className="bg-blue-50 p-4 rounded-lg shadow-md space-y-3">
        <h2 className="text-lg font-medium text-black">Add a Note</h2>
        <Input
          className="w-full border border-gray-300 rounded-md p-2"
          placeholder="Enter a note to broadcast"
          value={noteMsg}
          onChange={(e) => setNoteMsg(e.target.value)}
        />
        <Button
          onClick={addNote}
          disabled={loading || !noteMsg.trim()}
          className="bg-green-600 text-black hover:bg-green-700 transition-all"
        >
          {loading ? "Adding..." : "Add Note"}
        </Button>
      </div>

      <div className="mt-8 space-y-4">
        <h2 className="text-xl font-semibold">Previous Notes</h2>
        {noteData.length === 0 ? (
          <p className="text-gray-500">No notes added yet.</p>
        ) : (
          noteData.map((item, index) => (
            <div
              key={item._id || index}
              className="flex justify-between items-center bg-white border rounded-md px-4 py-3 shadow-sm"
            >
              <p className="text-gray-800">{item.note}</p>
              <Button
                onClick={() => deleteNote(item._id)}
                className="bg-red-500 text-white hover:bg-red-600"
              >
                Delete
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
