import React, { useState, useEffect } from 'react';
import { createTrip, updateTrip } from '../../services/tripService';
import { getDrivers } from '../../services/driverService';
import { getVehicles } from '../../services/vehicleService';
import { toast } from 'react-toastify';

export default function TripForm({ selectedTrip, onSuccess, onCancel }) {
  // Convert datetime-local string (local time) to UTC ISO for backend
  const localToUTCISO = (localStr) => {
    if (!localStr) return null;
    // new Date(localStr) correctly treats datetime-local string as local time
    return new Date(localStr).toISOString();
  };

  // Convert UTC ISO (from backend) to local datetime-local format for input
  const utcToLocalInput = (utcStr) => {
    if (!utcStr) return '';
    const d = new Date(utcStr);
    // Adjust for local timezone offset to get correct local time string
    const offset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - offset).toISOString().slice(0, 16);
  };

  // Get local datetime string offset by N minutes from now
  const getLocalDateTimeString = (offsetMinutes = 0) => {
    const d = new Date(Date.now() + offsetMinutes * 60000);
    const offset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - offset).toISOString().slice(0, 16);
  };

  const [formData, setFormData] = useState({
    trip_id: '',
    driver: '',
    vehicle: '',
    source: '',
    destination: '',
    start_time: getLocalDateTimeString(30), // default: 30 mins from now
    end_time: getLocalDateTimeString(90),   // default: 90 mins from now
    distance: '',
    status: 'SCHEDULED',
    notes: ''
  });

  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDropdownData();
  }, []);

  const fetchDropdownData = async () => {
    try {
      const dRes = await getDrivers({ page: 1, limit: 100 });
      const vRes = await getVehicles({ page: 1, limit: 100 });
      setDrivers(dRes.data?.results || dRes.data || []);
      setVehicles(vRes.data?.results || vRes.data || []);
    } catch (error) {
      console.error("Error fetching dropdowns", error);
      toast.error("Failed to load drivers/vehicles");
    }
  };

  useEffect(() => {
    if (selectedTrip) {
      setFormData({
        trip_id: selectedTrip.trip_id || '',
        driver: selectedTrip.driver || '',
        vehicle: selectedTrip.vehicle || '',
        source: selectedTrip.source || '',
        destination: selectedTrip.destination || '',
        // Use utcToLocalInput so returned UTC values display correctly as local time
        start_time: utcToLocalInput(selectedTrip.start_time),
        end_time: utcToLocalInput(selectedTrip.end_time),
        distance: selectedTrip.distance || '',
        status: selectedTrip.status || 'SCHEDULED',
        notes: selectedTrip.notes || ''
      });
    }
  }, [selectedTrip]);

  const calculateAutoStatus = (start, end, currentStatus) => {
    if (currentStatus === 'CANCELLED') return 'CANCELLED';
    if (!start) return 'SCHEDULED';
    const now = new Date();
    const startDate = new Date(start);
    const endDate = end ? new Date(end) : null;

    if (endDate && now >= endDate) {
      return 'COMPLETED';
    } else if (now >= startDate) {
      return 'ONGOING';
    } else {
      return 'SCHEDULED';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedData = { ...formData, [name]: value };

    if (name === 'start_time' || name === 'end_time') {
      const start = name === 'start_time' ? value : formData.start_time;
      const end = name === 'end_time' ? value : formData.end_time;
      updatedData.status = calculateAutoStatus(start, end, formData.status);
    }

    setFormData(updatedData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...formData,
      // Convert local datetime-local strings → proper UTC ISO timestamps for Django
      start_time: localToUTCISO(formData.start_time),
      end_time: localToUTCISO(formData.end_time),
      distance: formData.distance === '' ? null : formData.distance,
    };

    try {
      if (selectedTrip) {
        await updateTrip(selectedTrip.id, payload);
        toast.success('Trip updated successfully');
      } else {
        await createTrip(payload);
        toast.success('Trip created successfully');
      }
      onSuccess();
    } catch (error) {
      toast.error('Failed to save trip');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-xs">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-slate-300 font-semibold mb-1.5">Trip ID / Dispatch Code *</label>
          <input
            type="text"
            name="trip_id"
            placeholder="TRIP-1001"
            value={formData.trip_id}
            onChange={handleChange}
            className="w-full glass-input p-3 rounded-xl focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-slate-300 font-semibold mb-1.5">
            Trip Status (Auto-calculated by time) *
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full glass-input p-3 rounded-xl focus:outline-none bg-slate-900 font-bold text-indigo-300"
            required
          >
            <option value="SCHEDULED">SCHEDULED (Future start time)</option>
            <option value="ONGOING">ONGOING (Active in transit)</option>
            <option value="COMPLETED">COMPLETED (End time passed)</option>
            <option value="CANCELLED">CANCELLED (Manual override)</option>
          </select>
        </div>

        <div>
          <label className="block text-slate-300 font-semibold mb-1.5">Assigned Driver *</label>
          <select
            name="driver"
            value={formData.driver}
            onChange={handleChange}
            className="w-full glass-input p-3 rounded-xl focus:outline-none bg-slate-900"
            required
          >
            <option value="">-- Select Driver --</option>
            {drivers.map(d => (
              <option key={d.id} value={d.id}>{d.full_name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-slate-300 font-semibold mb-1.5">Assigned Vehicle *</label>
          <select
            name="vehicle"
            value={formData.vehicle}
            onChange={handleChange}
            className="w-full glass-input p-3 rounded-xl focus:outline-none bg-slate-900"
            required
          >
            <option value="">-- Select Vehicle --</option>
            {vehicles.map(v => (
              <option key={v.id} value={v.id}>{v.registration_number} - {v.vehicle_name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-slate-300 font-semibold mb-1.5">Origin / Source *</label>
          <input
            type="text"
            name="source"
            placeholder="e.g. New Delhi Hub"
            value={formData.source}
            onChange={handleChange}
            className="w-full glass-input p-3 rounded-xl focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-slate-300 font-semibold mb-1.5">Destination *</label>
          <input
            type="text"
            name="destination"
            placeholder="e.g. Mumbai Central Depot"
            value={formData.destination}
            onChange={handleChange}
            className="w-full glass-input p-3 rounded-xl focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-slate-300 font-semibold mb-1.5">Start Date &amp; Time *</label>
          <input
            type="datetime-local"
            name="start_time"
            value={formData.start_time}
            onChange={handleChange}
            required
            style={{ colorScheme: 'dark' }}
            className="w-full glass-input p-3 rounded-xl focus:outline-none text-white [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-70"
          />
        </div>

        <div>
          <label className="block text-slate-300 font-semibold mb-1.5">End Date &amp; Time <span className="text-slate-500 font-normal">(optional)</span></label>
          <input
            type="datetime-local"
            name="end_time"
            value={formData.end_time}
            onChange={handleChange}
            style={{ colorScheme: 'dark' }}
            className="w-full glass-input p-3 rounded-xl focus:outline-none text-white [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-70"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-slate-300 font-semibold mb-1.5">Distance (km)</label>
          <input
            type="number"
            step="0.1"
            name="distance"
            placeholder="e.g. 1420.5"
            value={formData.distance}
            onChange={handleChange}
            className="w-full glass-input p-3 rounded-xl focus:outline-none"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-slate-300 font-semibold mb-1.5">Notes & Manifest Remarks</label>
          <textarea
            name="notes"
            placeholder="Cargo payload, special route instructions..."
            value={formData.notes}
            onChange={handleChange}
            className="w-full glass-input p-3 rounded-xl focus:outline-none"
            rows="3"
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
          className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-purple-600/30 transition disabled:opacity-50"
        >
          {loading ? 'Saving...' : selectedTrip ? 'Update Trip' : 'Create Trip'}
        </button>
      </div>
    </form>
  );
}
