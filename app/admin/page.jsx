"use client";
import { useState } from "react";
import AdminDashboard from "./_components/AdminDashboard";
import TaskDashboard from "./_components/TaskDashboard";
import ContentDashboard from "./_components/ContentDashboard";
import Header from "../components/Header";
export default function Admin() {
  const [activeTab, setActiveTab] = useState("admin");

  const tabs = [
    { key: "admin", label: "Admin Dashboard" },
    { key: "task", label: "Task Dashboard" },
    { key: "content", label: "Content Dashboard" },
  ];

  return (
    <>
    <Header />
    
    <div className="p-6 md:px-20">

      <div className="flex gap-4 md:gap-6 border-b-2 border-green-400 bg-green-100 py-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-xl font-semibold transition duration-300
              ${
                activeTab === tab.key
                  ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md"
                  : "text-gray-600 hover:text-blue-600 hover:bg-gray-100"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {activeTab === "admin" && <AdminDashboard />}
        {activeTab === "task" && <TaskDashboard />}
        {activeTab === "content" && <ContentDashboard />}
      </div>
    </div>
    </>
  );
}
