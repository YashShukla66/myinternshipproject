import React, { useState, useEffect } from 'react';
import { createDriver, updateDriver } from '../../services/driverService';
import { toast } from 'react-toastify';

export default function DriverForm({ selectedDriver, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    license_number: '',
    address: '',
    date_of_birth: '',
    joining_date: '',
    status: 'AVAILABLE',
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedDriver) {
      setFormData({
        full_name: selectedDriver.full_name || '',
        email: selectedDriver.email || '',
        phone: selectedDriver.phone || '',
        license_number: selectedDriver.license_number || '',
        address: selectedDriver.address || '',
        date_of_birth: selectedDriver.date_of_birth || '',
        joining_date: selectedDriver.joining_date || '',
        status: selectedDriver.status || 'AVAILABLE',
      });
      setPreview(selectedDriver.image || null);
    }
  }, [selectedDriver]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = new FormData();
    for (const key in formData) {
      data.append(key, formData[key]);
    }
    if (image) {
      data.append('image', image);
    }

    try {
      if (selectedDriver) {
        await updateDriver(selectedDriver.id, data);
        toast.success('Driver updated successfully');
      } else {
        await createDriver(data);
        toast.success('Driver created successfully');
      }
      onSuccess();
    } catch (error) {
      toast.error('Failed to save driver');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-xs">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-slate-300 font-semibold mb-1.5">Full Name *</label>
          <input
            type="text"
            name="full_name"
            placeholder="e.g. John Doe"
            value={formData.full_name}
            onChange={handleChange}
            className="w-full glass-input p-3 rounded-xl focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-slate-300 font-semibold mb-1.5">Email Address *</label>
          <input
            type="email"
            name="email"
            placeholder="driver@fleet.com"
            value={formData.email}
            onChange={handleChange}
            className="w-full glass-input p-3 rounded-xl focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-slate-300 font-semibold mb-1.5">Phone Number *</label>
          <input
            type="text"
            name="phone"
            placeholder="+1 555-0192"
            value={formData.phone}
            onChange={handleChange}
            className="w-full glass-input p-3 rounded-xl focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-slate-300 font-semibold mb-1.5">License Number *</label>
          <input
            type="text"
            name="license_number"
            placeholder="DL-9948102"
            value={formData.license_number}
            onChange={handleChange}
            className="w-full glass-input p-3 rounded-xl focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-slate-300 font-semibold mb-1.5">Date of Birth *</label>
          <input
            type="date"
            name="date_of_birth"
            value={formData.date_of_birth}
            onChange={handleChange}
            className="w-full glass-input p-3 rounded-xl focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-slate-300 font-semibold mb-1.5">Joining Date *</label>
          <input
            type="date"
            name="joining_date"
            value={formData.joining_date}
            onChange={handleChange}
            className="w-full glass-input p-3 rounded-xl focus:outline-none"
            required
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-slate-300 font-semibold mb-1.5">Availability Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full glass-input p-3 rounded-xl focus:outline-none bg-slate-900"
            required
          >
            <option value="AVAILABLE">AVAILABLE</option>
            <option value="ON_TRIP">ON_TRIP</option>
            <option value="LEAVE">LEAVE</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-slate-300 font-semibold mb-1.5">Residential Address *</label>
          <textarea
            name="address"
            placeholder="Street address, city, state, zip"
            value={formData.address}
            onChange={handleChange}
            className="w-full glass-input p-3 rounded-xl focus:outline-none"
            rows="3"
            required
          ></textarea>
        </div>

        <div className="md:col-span-2">
          <label className="block text-slate-300 font-semibold mb-1.5">Profile Photo</label>
          <input
            type="file"
            onChange={handleImageChange}
            accept="image/*"
            className="w-full glass-input p-2.5 rounded-xl text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-500 cursor-pointer"
          />
          {preview && (
            <div className="mt-3 flex items-center gap-3 p-3 bg-slate-900/60 rounded-xl border border-slate-800">
              <img src={preview} alt="Preview" className="w-12 h-12 rounded-full object-cover border border-slate-700 shadow" />
              <span className="text-xs text-slate-400">Photo preview</span>
            </div>
          )}
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
          className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-600/30 transition disabled:opacity-50"
        >
          {loading ? "Saving..." : selectedDriver ? 'Update Driver' : 'Create Driver'}
        </button>
      </div>
    </form>
  );
}
