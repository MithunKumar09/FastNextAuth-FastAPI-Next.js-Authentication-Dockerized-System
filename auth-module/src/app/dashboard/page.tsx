"use client";
import { useState, useEffect } from "react";
import { Button, message, Input } from "antd";
import { EditOutlined, LogoutOutlined, UserOutlined, SaveOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      console.log("User data retrieved from localStorage:", parsedUser);
      setUser(parsedUser);
      setEditedName(parsedUser.name);
    } else {
      console.log("No user data found in localStorage.");
    }
  }, []);

  const handleLogout = () => {
    console.log("Logging out, removing user data...");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    message.success("Logged out successfully");
    router.push("/auth/register");
  };

  const updateProfile = async () => {
    if (!user) return;
  
    const token = localStorage.getItem("token");
    if (!token) {
      message.error("Authentication required. Please log in again.");
      router.push("/auth/login");
      return;
    }
  
    try {
      setLoading(true);
      const response = await fetch("http://localhost:8000/update-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ name: editedName }),
      });
  
      if (response.status === 401) {
        message.error("Session expired. Please log in again.");
        localStorage.removeItem("token");
        router.push("/auth/login");
        return;
      }
  
      const data = await response.json();
      if (response.ok) {
        message.success("Profile updated successfully");
        const updatedUser = { ...user, name: editedName };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
        setIsEditing(false);
      } else {
        message.error(data.detail || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      message.error("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 text-white p-6">
      {/* Profile Section */}
      <div className="relative bg-white rounded-full p-1 shadow-xl hover:shadow-2xl transition-all duration-300">
        <div className="w-32 h-32 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
          <UserOutlined className="text-6xl text-white" />
        </div>
      </div>

      {/* User Info */}
      <div className="mt-6 text-center">
        {isEditing ? (
          <Input
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            className="text-black w-64 text-center"
          />
        ) : (
          <h2 className="text-2xl font-bold">{user?.name || "John Doe"}</h2>
        )}
        <p className="text-lg text-gray-200">{user?.email || "johndoe@example.com"}</p>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 space-y-4">
        {isEditing ? (
          <Button
            type="primary"
            icon={<SaveOutlined />}
            className="w-48 bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 transition-all"
            onClick={updateProfile}
            loading={loading}
          >
            Save Profile
          </Button>
        ) : (
          <Button
            type="primary"
            icon={<EditOutlined />}
            className="w-48 bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 transition-all"
            onClick={() => setIsEditing(true)}
          >
            Edit Profile
          </Button>
        )}

        <Button
          type="primary"
          danger
          icon={<LogoutOutlined />}
          className="w-48 bg-gradient-to-r from-red-400 to-red-600 hover:from-red-500 hover:to-red-700 transition-all"
          onClick={handleLogout}
        >
          Logout
        </Button>
      </div>
    </div>
  );
}