import { useState } from "react";
import { useAskNuru, type UserRole } from "@/hooks/useAskNuru";

export function ExampleChatComponent() {
  const [message, setMessage] = useState("");
  const [role, setRole] = useState<UserRole>("patient");
  const [userId] = useState("user123"); // This would come from your auth context

  const askNuru = useAskNuru();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) return;

    try {
      const result = await askNuru.mutateAsync({
        message,
        role,
        userId,
      });

      console.log("AI Response:", result.reply);
      console.log("Full response data:", result);

      // Handle the response in your UI
      setMessage(""); // Clear the input
    } catch (error) {
      console.error("Error getting AI response:", error);
    }
  };

  return (
    <div className="p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Select Role:</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            className="border rounded px-3 py-2"
          >
            <option value="patient">Patient</option>
            <option value="doctor">Doctor</option>
            <option value="pharmacist">Pharmacist</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Message:</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask your question here..."
            className="w-full border rounded px-3 py-2"
            rows={3}
          />
        </div>

        <button
          type="submit"
          disabled={askNuru.isPending || !message.trim()}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {askNuru.isPending ? "Asking..." : "Ask Nuru"}
        </button>
      </form>

      {askNuru.error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
          Error: {askNuru.error.message}
        </div>
      )}
    </div>
  );
}

// Example usage in a component with just the hook:
export function SimpleHookExample() {
  const askNuru = useAskNuru();

  const handleQuickAsk = async () => {
    try {
      const response = await askNuru.mutateAsync({
        message: "What are the symptoms of flu?",
        role: "patient",
        userId: "user123",
      });

      alert(`AI Response: ${response.reply}`);
    } catch (error) {
      alert("Error getting response");
    }
  };

  return (
    <button onClick={handleQuickAsk} disabled={askNuru.isPending}>
      {askNuru.isPending ? "Loading..." : "Ask Quick Question"}
    </button>
  );
}
