import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import Messages from "./Messages";

const Chat: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-lg text-gray-600">
          Please log in to access the chat feature.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 h-[calc(100vh-120px)]">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Chat
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Communicate securely with doctors, patients, and pharmacists
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg h-[calc(100%-80px)]">
        <Messages />
      </div>
    </div>
  );
};

export default Chat;
