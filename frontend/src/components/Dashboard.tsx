import React, { useEffect } from "react";
import PatientDashboard from "./dashboards/PatientDashboard";
import DoctorDashboard from "./dashboards/DoctorDashboard";
import { useAuth } from "@/contexts/AuthContext";
import PharmacistDashBoard from "./dashboards/PharmacistDashboard";
import { useNavigate } from "@tanstack/react-router";

const Dashboard: React.FC = () => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate({ to: '/login', replace: true });
    }
  }, [isLoading, isAuthenticated, navigate]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }
  if (!isAuthenticated) {
    return null;
  }
  
  const renderDashboard = () => {
    console.log("Dashboard user data:", user);
    console.log("User_Type:", user?.User_Type);
    console.log("User object keys:", user ? Object.keys(user) : 'No user');
    console.log("Is user authenticated:", !!user);
    
    // Ensure case-insensitive comparison for user types
    const userType = user?.User_Type?.toLowerCase();
    console.log("Normalized user type for comparison:", userType);
    
    if (userType === 'doctor') {
      return <DoctorDashboard />;
    }
    if (userType === 'patient') {
      return <PatientDashboard />;
    }
    if (userType === 'pharmacist') {
      return <PharmacistDashBoard/>
    }
    return (
      <div>
        <p>Dashboard not available for your user type.</p>
      </div>
    );
  };



  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Healthcare Dashboard.
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Welcome, {user?.First_Name} {user?.Last_Name} ({user?.User_Type})
          </p>
        </div>
        
        {renderDashboard()}
      </div>
    </div>
  );
};

export default Dashboard;
