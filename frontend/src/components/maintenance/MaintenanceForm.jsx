import React, { useState, useEffect } from "react";
import { createMaintenanceRecord, updateMaintenanceRecord } from "../../services/maintenanceService";
import { getVehicles } from "../../services/vehicleService";
import { toast } from "react-toastify";

const MaintenanceForm = ({ selectedRecord, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    vehicle: "",
    maintenance_type: "GENERAL",
    service_date: "",
    service_center: "",
    description: "",
    cost: "",
    status: "PENDING",
  });
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchVehicles();
  }, []);

  useEffect(() => {
    if (selectedRecord) {
      setFormData({
        vehicle: selectedRecord.vehicle || "",
        maintenance_type: selectedRecord.maintenance_type || "GENERAL",
        service_date: selectedRecord.service_date || "",
        service_center: selectedRecord.service_center || "",
        description: selectedRecord.description || "",
        cost: selectedRecord.cost || "",
        status: selectedRecord.status || "PENDING",
      });
    }
  }, [selectedRecord]);

  const fetchVehicles = async () => {
    try {
      const res = await getVehicles({});
      setVehicles(res.data.results || res.data || []);
    } catch (error) {
      toast.error("Failed to fetch vehicles");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (selectedRecord) {
        await updateMaintenanceRecord(selectedRecord.id, formData);
        toast.success("Maintenance record updated!");
      } else {
        await createMaintenanceRecord(formData);
        toast.success("Maintenance record created!");
      }
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-xs">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-slate-300 font-semibold mb-1.5">Vehicle *</label>
          <select
            name="vehicle"
            value={formData.vehicle}
            onChange={handleChange}
            required
            className="w-full glass-input p-3 rounded-xl focus:outline-none bg-slate-900"
          >
            <option value="">-- Select Target Vehicle --</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.registration_number} - {v.vehicle_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-slate-300 font-semibold mb-1.5">Maintenance Service Type *</label>
          <select
            name="maintenance_type"
            value={formData.maintenance_type}
            onChange={handleChange}
            className="w-full glass-input p-3 rounded-xl focus:outline-none bg-slate-900"
          >
            <option value="OIL_CHANGE">Oil Change</option>
            <option value="ENGINE">Engine Service</option>
            <option value="BRAKE">Brake Repair</option>
            <option value="TYRE">Tyre Replacement</option>
            <option value="GENERAL">General Service</option>
          </select>
        </div>

        <div>
          <label className="block text-slate-300 font-semibold mb-1.5">Service Date *</label>
          <input
            type="date"
            name="service_date"
            value={formData.service_date}
            onChange={handleChange}
            required
            className="w-full glass-input p-3 rounded-xl focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-slate-300 font-semibold mb-1.5">Service Center / Workshop *</label>
          <input
            type="text"
            name="service_center"
            placeholder="e.g. Apex Authorized Auto Garage"
            value={formData.service_center}
            onChange={handleChange}
            required
            className="w-full glass-input p-3 rounded-xl focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-slate-300 font-semibold mb-1.5">Cost Amount (₹) *</label>
          <input
            type="number"
            step="0.01"
            name="cost"
            placeholder="e.g. 4500.00"
            value={formData.cost}
            onChange={handleChange}
            required
            className="w-full glass-input p-3 rounded-xl focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-slate-300 font-semibold mb-1.5">Status *</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full glass-input p-3 rounded-xl focus:outline-none bg-slate-900"
          >
            <option value="PENDING">Pending</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-slate-300 font-semibold mb-1.5">Detailed Description & Replaced Parts</label>
          <textarea
            name="description"
            placeholder="List parts replaced, technician comments, invoice ref..."
            value={formData.description}
            onChange={handleChange}
            rows="3"
            className="w-full glass-input p-3 rounded-xl focus:outline-none"
          ></textarea>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl transition"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-semibold rounded-xl shadow-lg shadow-amber-600/30 transition disabled:opacity-50"
        >
          {loading ? "Saving..." : selectedRecord ? "Update Record" : "Save Record"}
        </button>
      </div>
    </form>
  );
};

export default MaintenanceForm;
