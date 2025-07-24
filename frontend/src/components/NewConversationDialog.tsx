import React, { useState, useEffect } from "react";
import { X, Search, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { userApi } from "@/api/users";
import type { User as UserInterface } from "@/api/interfaces/user";

interface NewConversationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateConversation: (userId: number, name: string) => void;
}

const NewConversationDialog: React.FC<NewConversationDialogProps> = ({
  isOpen,
  onClose,
  onCreateConversation,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<UserInterface[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserInterface[]>([]);
  const [loading, setLoading] = useState(false);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        // Use public endpoint to avoid authentication issues
        const allUsers = await userApi.listUsersPublic();

        // Filter out the current user and ensure type safety
        const filteredUsers = allUsers
          .filter(
            (u) => u.User_id !== parseInt(String(currentUser?.User_id || "0"))
          )
          .map((user) => ({
            User_id: user.User_id || 0,
            First_Name: user.First_Name || "",
            Last_Name: user.Last_Name || "",
            Email: user.Email || "",
            User_Type: user.User_Type || "Patient",
            Password: "", // Don't include password
            Phone_Number: "", // Don't include sensitive data
            Date_of_Birth: "",
            Gender: "Other" as const,
            Account_Status: "Active" as const,
            Created_at: new Date(),
          }));

        setUsers(filteredUsers);
        setFilteredUsers(filteredUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
        // Show user-friendly error message
        alert("Unable to load users. Please try again later.");
        setUsers([]);
        setFilteredUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [currentUser]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = users.filter(
        (user) =>
          user.First_Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.Last_Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.Email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchTerm, users]);

  const handleSelectUser = (user: UserInterface) => {
    const fullName = `${user.First_Name} ${user.Last_Name}`;
    onCreateConversation(user.User_id, fullName);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">New Conversation</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search for users..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="max-h-60 overflow-y-auto">
            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading users...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                No users found
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div
                  key={user.User_id}
                  className="flex items-center p-3 hover:bg-gray-50 rounded-md cursor-pointer"
                  onClick={() => handleSelectUser(user)}
                >
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                    <User className="w-5 h-5 text-gray-500" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {user.First_Name} {user.Last_Name}
                    </h3>
                    <div className="flex items-center text-sm">
                      <span className="text-gray-500">{user.Email}</span>
                      <span className="mx-2 text-gray-300">•</span>
                      <span
                        className={`${
                          user.User_Type === "Doctor"
                            ? "text-blue-600"
                            : user.User_Type === "Patient"
                            ? "text-green-600"
                            : "text-purple-600"
                        }`}
                      >
                        {user.User_Type}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewConversationDialog;
