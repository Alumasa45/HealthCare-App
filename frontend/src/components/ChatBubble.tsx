import { useState } from "react";
import { FaRobot, FaComments } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { CocoAssistant } from "./CocoAssistant";

export function ChatBubble() {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <>
      <motion.div
        className="fixed bottom-6 right-6 z-40"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 2, duration: 0.5, type: "spring" }}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {/* Tooltip */}
        <AnimatePresence>
          {showTooltip && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="absolute bottom-full right-0 mb-3 bg-gray-800 dark:bg-gray-700 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap shadow-lg transition-colors duration-300"
            >
              Chat with Coco AI
              <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-800 dark:border-t-gray-700"></div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pulse effect */}
        <div className="absolute inset-0 bg-purple-500 dark:bg-purple-400 rounded-full animate-ping opacity-20 transition-colors duration-300"></div>

        {/* Chat bubble icon */}
        <div className="relative bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 dark:from-purple-400 dark:to-purple-500 dark:hover:from-purple-500 dark:purple:to-blue-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group">
          <FaComments className="text-xl group-hover:scale-110 transition-transform duration-300" />

          <div className="absolute -top-1 -right-1 bg-purple-500 dark:bg-purple-400 text-white rounded-full p-1 transition-colors duration-300">
            <FaRobot className="text-xs" />
          </div>
        </div>
      </motion.div>
      <CocoAssistant />
    </>
  );
}
