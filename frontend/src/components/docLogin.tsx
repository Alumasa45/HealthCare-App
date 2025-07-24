import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import { doctorApi } from "@/api/doctors";
import { getErrorMessage } from "@/utils/errorUtils";

const DoctorLogin = () => {
  const [License_number, setLicenseNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!License_number.trim()) {
      toast.error('Please enter your license number');
      return;
    }
    setIsLoading(true);

    try {
      console.log("Attempting login with license:", License_number)
      const { token, user, doctor } = await doctorApi.login({ License_number });
      
      // Combine user and doctor data
      const userData = {
        ...user,
        Doctor_id: doctor.Doctor_id // Add Doctor_id to user data
      };
      
      // Store authentication data
      localStorage.setItem('authToken', token);
      localStorage.setItem('userData', JSON.stringify(userData));
      localStorage.setItem('currentDoctor', JSON.stringify(doctor));
      
      toast.success(`Welcome back, Dr. ${user.Last_Name || doctor.License_Number}!`);
      navigate({
        to: '/doctorDashboard',
        replace: true,
      });
    } catch (error: unknown) {
      console.error('Login error:', error);
      const errorMessage = getErrorMessage(error);
      if (errorMessage.includes('500')) {
        toast.error('Server error. Please try again later.');
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6">Doctor Login</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700">
            License Number
          </label>
          <input
            type="text"
            id="licenseNumber"
            value={License_number}
            onChange={(e) => setLicenseNumber(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter your license number"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default DoctorLogin;