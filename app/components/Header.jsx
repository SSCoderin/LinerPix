"use client";

import axios from "axios";
import { useState, useEffect } from "react";
import { UserButton, useUser } from "@clerk/nextjs";
import { Zap, AudioLines, Target, LayoutGrid } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation"; 

export default function Header() {
  const { user } = useUser();
  const [admin, setadmin] = useState(false);
  const pathname = usePathname(); 

  useEffect(() => {
    if (!user) return;
    CheckAdmin();
  }, [user]);

  const CheckAdmin = async () => {
    try {
      const response = await axios.get(`/api/create-user?userid=${user.id}`);
      setadmin(response.data.user.admin);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="flex w-full p-2 border-b-2 border-gray-400 bg-white flex-row ">
      {/* Logo */}
      <Link href="/" className="flex items-center space-x-3 cursor-pointer">
        <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg">
          <Zap className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">PicTales</h1>
          <p className="text-sm text-gray-600">Line to Line Pixel Generation</p>
        </div>
      </Link>

      {/* Menu */}
      <div className="ml-auto flex justify-center mr-4 gap-8">
        {admin && (
          <Link
            href="/admin"
            className={`flex flex-row items-center gap-2 cursor-pointer 
              ${pathname === "/admin" ? "text-blue-800" : "text-white hover:text-blue-800"}
            `}
          >
            <h1 className="text-sm font-medium border p-1.5 rounded-2xl bg-gradient-to-r from-blue-300 to-violet-400">
              Admin
            </h1>
          </Link>
        )}

        <Link
          href="/content"
          className={`flex flex-row items-center gap-2 cursor-pointer 
            ${pathname === "/content" ? "text-blue-800" : "text-blue-500 hover:text-blue-800"}
          `}
        >
          <LayoutGrid />
          <h1 className="text-sm font-medium">Content</h1>
        </Link>

        <Link
          href="/content/calibration"
          className={`flex flex-row items-center gap-2 cursor-pointer 
            ${pathname === "/content/calibration" ? "text-blue-800" : "text-blue-500 hover:text-blue-800"}
          `}
        >
          <Target />
          <h1 className="text-sm font-medium">Practice Calibration</h1>
        </Link>

        <Link
          href="/content/analysis"
          className={`flex flex-row items-center gap-2 cursor-pointer 
            ${pathname === "/content/analysis" ? "text-blue-800" : "text-blue-500 hover:text-blue-800"}
          `}
        >
          <AudioLines />
          <h1 className="text-sm font-medium">Analysis</h1>
        </Link>

        <UserButton />
      </div>
    </div>
  );
}
