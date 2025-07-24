import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useAskCoco } from "@/hooks/useAskCoco";
import { motion, AnimatePresence } from "framer-motion";
import { FaRobot } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function CocoAssistant() {
  const { user } = useAuth();
  const askCocoMutation = useAskCoco();
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "👋 Welcome! I'm Coco, your AI assistant.",
    },
  ]);

  // Update welcome message when user authentication changes
  useEffect(() => {
    const welcomeMessage = getWelcomeMessage(user?.User_Type || "Patient");

    setMessages([
      {
        role: "assistant",
        content: welcomeMessage,
      },
    ]);
  }, [user]);

  function getWelcomeMessage(role: string) {
    switch (role) {
      case "doctor":
        return "👋 Hello, I'm Coco, your AI assistant at NineHertz. I'm here to support you with diagnoses, test suggestions, and treatment planning.";
      case "pharmacy":
        return "👋 Hello, I'm Coco, here to help you suggest medications, dosages, and verify drug interactions.";
      default:
        return "👋 Hello, I'm Coco, your AI assistant here at NineHertz. I'm here to support you with health advice, understanding procedures, and more.";
    }
  }

  const handleSubmit = async () => {
    if (!prompt.trim()) return;

    const userMessage = { role: "user", content: prompt };
    const thinkingMessage = {
      role: "assistant",
      content: "🤖 Coco is thinking...",
    };

    setMessages((prev) => [...prev, userMessage, thinkingMessage]);
    setPrompt("");

    try {
      const response = await askCocoMutation.mutateAsync({
        message: prompt,
        role: user?.User_Type || "Patient",
        User_id: user?.User_id,
      });

      setMessages((prev) => {
        // Remove the "thinking..." message
        const withoutThinking = prev.filter(
          (msg) => msg.content !== "🤖 Coco is thinking..."
        );
        return [
          ...withoutThinking,
          {
            role: "assistant",
            content: response.reply || "Coco could not respond at this time.",
          },
        ];
      });
    } catch (error) {
      setMessages((prev) => {
        // Remove the "thinking..." message
        const withoutThinking = prev.filter(
          (msg) => msg.content !== "🤖 Coco is thinking..."
        );
        return [
          ...withoutThinking,
          {
            role: "assistant",
            content: "Sorry, I encountered an error. Please try again.",
          },
        ];
      });
      console.error("Error getting response from Coco:", error);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 cursor-pointer">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="fixed bottom-4 right-4 z-50 bg-white dark:bg-zinc-800 rounded-full shadow p-3 cursor-pointer"
      >
        <FaRobot className="text-4xl text-blue-500 animate-bounce" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-20 right-4 w-[95vw] md:w-[520px] lg:w-[620px] bg-white dark:bg-zinc-900 backdrop-blur-sm shadow-2xl border border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden z-50"
          >
            <Card className="flex flex-col h-[500px] max-h-[90vh] w-full resize overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between gap-2 p-4 border-b dark:border-zinc-700 font-semibold text-lg">
                <div className="flex items-center gap-2">
                  <FaRobot className="text-blue-500" />
                  Coco – AI Assistant
                </div>
                <Button
                  variant="ghost"
                  className="text-red-500 cursor-pointer"
                  onClick={() => setOpen(false)}
                >
                  ❌
                </Button>
              </div>

              {/* Messages */}
              <div className="flex-1 px-4 py-2 space-y-3 overflow-y-auto pb-24">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`p-3 mb-2 rounded-lg max-w-[90%] whitespace-pre-wrap ${
                      msg.role === "user"
                        ? "ml-auto bg-blue-100 dark:bg-blue-800 text-right"
                        : "bg-zinc-100 dark:bg-zinc-800 text-left"
                    }`}
                  >
                    {msg.content}
                  </div>
                ))}
              </div>

              {/* Input */}
              <div className="flex items-center gap-2 p-4 border-t dark:border-zinc-700">
                <Input
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  placeholder="Ask Coco something medical..."
                  className="flex-1"
                  disabled={askCocoMutation.isPending}
                />
                <Button
                  onClick={handleSubmit}
                  disabled={askCocoMutation.isPending || !prompt.trim()}
                  className="cursor-pointer"
                >
                  {askCocoMutation.isPending ? "..." : "Send"}
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
