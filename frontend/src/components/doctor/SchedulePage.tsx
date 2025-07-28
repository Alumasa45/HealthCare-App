import React, { useEffect, useState } from "react";
import { Calendar, Clock, Plus, Edit2, Trash2, Save, X } from "lucide-react";
import { scheduleApi } from "@/api/schedules";
import { useAuth } from "@/contexts/AuthContext";
import { doctorApi } from "@/api/doctors";
import { toast } from "sonner";
import type { DoctorSchedule } from "@/api/interfaces/schedule";

const SchedulePage: React.FC = () => {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<DoctorSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingSchedule, setIsAddingSchedule] = useState(false);
  const [editingScheduleId, setEditingScheduleId] = useState<number | null>(
    null
  );
  const [scheduleForm, setScheduleForm] = useState({
    Day_Of_The_Week: "",
    Start_Time: "",
    End_Time: "",
    Slot_Duration: 30,
    Is_Active: true,
  });

  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  useEffect(() => {
    fetchSchedules();
  }, [user?.User_id]);

  const fetchSchedules = async () => {
    if (!user?.User_id) return;

    try {
      setLoading(true);
      setError(null);

      let doctorId = user.Doctor_id;
      if (!doctorId && user.User_Type === "Doctor") {
        const doctorData = await doctorApi.findByUserId(user.User_id);
        doctorId = doctorData.Doctor_id;
      }

      if (!doctorId) {
        setError("Doctor ID not found");
        return;
      }

      const schedulesData = await scheduleApi.findByDoctorId(doctorId);
      setSchedules(schedulesData);
    } catch (error) {
      console.error("Error fetching schedules:", error);
      setError("Failed to load schedules");
      toast.error("Failed to load schedules");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSchedule = async () => {
    if (!user?.User_id) return;

    try {
      let doctorId = user.Doctor_id;
      if (!doctorId && user.User_Type === "Doctor") {
        const doctorData = await doctorApi.findByUserId(user.User_id);
        doctorId = doctorData.Doctor_id;
      }

      if (!doctorId) {
        toast.error("Doctor ID not found");
        return;
      }

      const scheduleData = {
        ...scheduleForm,
        Doctor_id: doctorId,
      };

      if (editingScheduleId) {
        await scheduleApi.update(editingScheduleId, scheduleData);
        toast.success("Schedule updated successfully");
      } else {
        await scheduleApi.create(scheduleData);
        toast.success("Schedule created successfully");
      }

      setIsAddingSchedule(false);
      setEditingScheduleId(null);
      setScheduleForm({
        Day_Of_The_Week: "",
        Start_Time: "",
        End_Time: "",
        Slot_Duration: 30,
        Is_Active: true,
      });
      fetchSchedules();
    } catch (error) {
      console.error("Error saving schedule:", error);
      toast.error("Failed to save schedule");
    }
  };

  const handleEditSchedule = (schedule: DoctorSchedule) => {
    setEditingScheduleId(schedule.Schedule_id);
    setScheduleForm({
      Day_Of_The_Week: schedule.Day_Of_The_Week,
      Start_Time: schedule.Start_Time,
      End_Time: schedule.End_Time,
      Slot_Duration: schedule.Slot_Duration || 30,
      Is_Active: schedule.Is_Active ?? true,
    });
    setIsAddingSchedule(true);
  };

  const handleDeleteSchedule = async (scheduleId: number) => {
    if (confirm("Are you sure you want to delete this schedule?")) {
      try {
        await scheduleApi.delete(scheduleId);
        toast.success("Schedule deleted successfully");
        fetchSchedules();
      } catch (error) {
        console.error("Error deleting schedule:", error);
        toast.error("Failed to delete schedule");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Calendar className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Error Loading Schedule
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchSchedules}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              My Schedule
            </h1>
            <p className="text-gray-600">
              Manage your weekly availability and time slots
            </p>
          </div>
          <button
            onClick={() => setIsAddingSchedule(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Schedule</span>
          </button>
        </div>
      </div>

      {/* Add/Edit Schedule Form */}
      {isAddingSchedule && (
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingScheduleId ? "Edit Schedule" : "Add New Schedule"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Day of Week
              </label>
              <select
                value={scheduleForm.Day_Of_The_Week}
                onChange={(e) =>
                  setScheduleForm({
                    ...scheduleForm,
                    Day_Of_The_Week: e.target.value,
                  })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="">Select Day</option>
                {daysOfWeek.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Time
              </label>
              <input
                type="time"
                value={scheduleForm.Start_Time}
                onChange={(e) =>
                  setScheduleForm({
                    ...scheduleForm,
                    Start_Time: e.target.value,
                  })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Time
              </label>
              <input
                type="time"
                value={scheduleForm.End_Time}
                onChange={(e) =>
                  setScheduleForm({ ...scheduleForm, End_Time: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Slot Duration (minutes)
              </label>
              <input
                type="number"
                value={scheduleForm.Slot_Duration}
                onChange={(e) =>
                  setScheduleForm({
                    ...scheduleForm,
                    Slot_Duration: parseInt(e.target.value),
                  })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                min="15"
                max="120"
                step="15"
              />
            </div>
          </div>
          <div className="flex items-center mt-4">
            <input
              type="checkbox"
              id="isActive"
              checked={scheduleForm.Is_Active}
              onChange={(e) =>
                setScheduleForm({
                  ...scheduleForm,
                  Is_Active: e.target.checked,
                })
              }
              className="h-4 w-4 text-blue-600 rounded"
            />
            <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
              Active
            </label>
          </div>
          <div className="flex space-x-3 mt-4">
            <button
              onClick={handleSaveSchedule}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>{editingScheduleId ? "Update" : "Save"}</span>
            </button>
            <button
              onClick={() => {
                setIsAddingSchedule(false);
                setEditingScheduleId(null);
                setScheduleForm({
                  Day_Of_The_Week: "",
                  Start_Time: "",
                  End_Time: "",
                  Slot_Duration: 30,
                  Is_Active: true,
                });
              }}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 flex items-center space-x-2"
            >
              <X className="h-4 w-4" />
              <span>Cancel</span>
            </button>
          </div>
        </div>
      )}

      {/* Schedule Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {schedules.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No schedule found
            </h3>
            <p className="text-gray-600">
              Add your weekly schedule to start managing appointments.
            </p>
          </div>
        ) : (
          schedules.map((schedule) => (
            <div
              key={schedule.Schedule_id}
              className="bg-white rounded-lg shadow border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">
                  {schedule.Day_Of_The_Week}
                </h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditSchedule(schedule)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteSchedule(schedule.Schedule_id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {schedule.Start_Time} - {schedule.End_Time}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  Slot Duration: {schedule.Slot_Duration || 30} minutes
                </div>
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      schedule.Is_Active ? "bg-green-500" : "bg-red-500"
                    }`}
                  ></div>
                  <span className="text-sm text-gray-600">
                    {schedule.Is_Active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SchedulePage;
