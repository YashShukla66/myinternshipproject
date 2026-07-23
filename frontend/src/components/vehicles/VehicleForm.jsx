import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { createVehicle, updateVehicle } from "../../services/vehicleService";
import { getDrivers } from "../../services/driverService";

export default function VehicleForm({ onSuccess, onCancel, selectedVehicle }) {
    const [form, setForm] = useState({
        registration_number: "",
        vehicle_name: "",
        vehicle_type: "CAR",
        manufacturer: "",
        model: "",
        manufacturing_year: "",
        color: "",
        fuel_type: "PETROL",
        seating_capacity: "",
        mileage: "",
        status: "ACTIVE",
        purchase_date: "",
        insurance_expiry: "",
        assigned_driver: "",
        image: null,
    });
    const [preview, setPreview] = useState(null);
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchDrivers();
    }, []);

    const fetchDrivers = async () => {
        try {
            const response = await getDrivers();
            setDrivers(response.data.results || response.data || []);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        if (selectedVehicle) {
            setForm({
                registration_number: selectedVehicle.registration_number || "",
                vehicle_name: selectedVehicle.vehicle_name || "",
                vehicle_type: selectedVehicle.vehicle_type || "CAR",
                manufacturer: selectedVehicle.manufacturer || "",
                model: selectedVehicle.model || "",
                manufacturing_year: selectedVehicle.manufacturing_year || "",
                color: selectedVehicle.color || "",
                fuel_type: selectedVehicle.fuel_type || "PETROL",
                seating_capacity: selectedVehicle.seating_capacity || "",
                mileage: selectedVehicle.mileage || "",
                status: selectedVehicle.status || "ACTIVE",
                purchase_date: selectedVehicle.purchase_date || "",
                insurance_expiry: selectedVehicle.insurance_expiry || "",
                assigned_driver: selectedVehicle.assigned_driver || "",
                image: null,
            });
            if (selectedVehicle.image) {
                setPreview(selectedVehicle.image);
            }
        }
    }, [selectedVehicle]);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === "image") {
            const file = files[0];
            if (file) {
                setForm({ ...form, image: file });
                setPreview(URL.createObjectURL(file));
            }
        } else {
            setForm({ ...form, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData();

        Object.keys(form).forEach((key) => {
            if (form[key] !== null && form[key] !== "") {
                formData.append(key, form[key]);
            }
        });

        try {
            if (selectedVehicle) {
                await updateVehicle(selectedVehicle.id, formData);
                toast.success("Vehicle updated successfully");
            } else {
                await createVehicle(formData);
                toast.success("Vehicle added successfully");
            }

            if (onSuccess) onSuccess();
        } catch (error) {
            console.error(error);
            toast.error("Failed to save vehicle");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                    <label className="block text-slate-300 font-semibold mb-1.5">Registration Number *</label>
                    <input
                        name="registration_number"
                        placeholder="e.g. DL-01-AB-1234"
                        value={form.registration_number}
                        onChange={handleChange}
                        className="w-full glass-input p-3 rounded-xl focus:outline-none"
                        required
                    />
                </div>

                <div>
                    <label className="block text-slate-300 font-semibold mb-1.5">Vehicle Name *</label>
                    <input
                        name="vehicle_name"
                        placeholder="e.g. Model X Enterprise"
                        value={form.vehicle_name}
                        onChange={handleChange}
                        className="w-full glass-input p-3 rounded-xl focus:outline-none"
                        required
                    />
                </div>

                <div>
                    <label className="block text-slate-300 font-semibold mb-1.5">Manufacturer *</label>
                    <input
                        name="manufacturer"
                        placeholder="e.g. Tesla / Tata"
                        value={form.manufacturer}
                        onChange={handleChange}
                        className="w-full glass-input p-3 rounded-xl focus:outline-none"
                        required
                    />
                </div>

                <div>
                    <label className="block text-slate-300 font-semibold mb-1.5">Model *</label>
                    <input
                        name="model"
                        placeholder="e.g. Dual Motor Long Range"
                        value={form.model}
                        onChange={handleChange}
                        className="w-full glass-input p-3 rounded-xl focus:outline-none"
                        required
                    />
                </div>

                <div>
                    <label className="block text-slate-300 font-semibold mb-1.5">Manufacturing Year *</label>
                    <input
                        type="number"
                        name="manufacturing_year"
                        placeholder="e.g. 2022"
                        value={form.manufacturing_year}
                        onChange={handleChange}
                        className="w-full glass-input p-3 rounded-xl focus:outline-none"
                        required
                    />
                </div>

                <div>
                    <label className="block text-slate-300 font-semibold mb-1.5">Color *</label>
                    <input
                        name="color"
                        placeholder="e.g. Midnight Silver"
                        value={form.color}
                        onChange={handleChange}
                        className="w-full glass-input p-3 rounded-xl focus:outline-none"
                        required
                    />
                </div>

                <div>
                    <label className="block text-slate-300 font-semibold mb-1.5">Fuel Type *</label>
                    <select
                        name="fuel_type"
                        value={form.fuel_type}
                        onChange={handleChange}
                        className="w-full glass-input p-3 rounded-xl focus:outline-none bg-slate-900"
                        required
                    >
                        <option value="PETROL">Petrol</option>
                        <option value="DIESEL">Diesel</option>
                        <option value="CNG">CNG</option>
                        <option value="ELECTRIC">Electric</option>
                    </select>
                </div>

                <div>
                    <label className="block text-slate-300 font-semibold mb-1.5">Seating Capacity *</label>
                    <input
                        type="number"
                        name="seating_capacity"
                        placeholder="e.g. 5"
                        value={form.seating_capacity}
                        onChange={handleChange}
                        className="w-full glass-input p-3 rounded-xl focus:outline-none"
                        required
                    />
                </div>

                <div>
                    <label className="block text-slate-300 font-semibold mb-1.5">Mileage (km) *</label>
                    <input
                        type="number"
                        name="mileage"
                        placeholder="e.g. 15000"
                        value={form.mileage}
                        onChange={handleChange}
                        className="w-full glass-input p-3 rounded-xl focus:outline-none"
                        required
                    />
                </div>

                <div>
                    <label className="block text-slate-300 font-semibold mb-1.5">Vehicle Category *</label>
                    <select
                        name="vehicle_type"
                        value={form.vehicle_type}
                        onChange={handleChange}
                        className="w-full glass-input p-3 rounded-xl focus:outline-none bg-slate-900"
                    >
                        <option value="CAR">Car</option>
                        <option value="BIKE">Bike</option>
                        <option value="TRUCK">Truck</option>
                        <option value="BUS">Bus</option>
                    </select>
                </div>

                <div>
                    <label className="block text-slate-300 font-semibold mb-1.5">Operational Status</label>
                    <select
                        name="status"
                        value={form.status}
                        onChange={handleChange}
                        className="w-full glass-input p-3 rounded-xl focus:outline-none bg-slate-900"
                    >
                        <option value="ACTIVE">Active</option>
                        <option value="MAINTENANCE">Maintenance</option>
                        <option value="INACTIVE">Inactive</option>
                    </select>
                </div>

                <div>
                    <label className="block text-slate-300 font-semibold mb-1.5">Assigned Driver</label>
                    <select
                        name="assigned_driver"
                        value={form.assigned_driver}
                        onChange={handleChange}
                        className="w-full glass-input p-3 rounded-xl focus:outline-none bg-slate-900"
                    >
                        <option value="">-- No Driver Assigned --</option>
                        {drivers.map((driver) => (
                            <option key={driver.id} value={driver.id}>
                                {driver.full_name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-slate-300 font-semibold mb-1.5">Purchase Date *</label>
                    <input
                        type="date"
                        name="purchase_date"
                        value={form.purchase_date}
                        onChange={handleChange}
                        className="w-full glass-input p-3 rounded-xl focus:outline-none"
                        required
                    />
                </div>

                <div>
                    <label className="block text-slate-300 font-semibold mb-1.5">Insurance Expiry *</label>
                    <input
                        type="date"
                        name="insurance_expiry"
                        value={form.insurance_expiry}
                        onChange={handleChange}
                        className="w-full glass-input p-3 rounded-xl focus:outline-none"
                        required
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-slate-300 font-semibold mb-1.5">Vehicle Image Photo</label>
                    <input
                        type="file"
                        name="image"
                        onChange={handleChange}
                        accept="image/*"
                        className="w-full glass-input p-2.5 rounded-xl text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer"
                    />
                    {preview && (
                        <div className="mt-3 flex items-center gap-4 p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                            <img src={preview} alt="Preview" className="w-16 h-16 object-cover rounded-lg border border-slate-700 shadow" />
                            <span className="text-xs text-slate-400">Selected photo preview</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition"
                    >
                        Cancel
                    </button>
                )}
                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-600/30 transition disabled:opacity-50 flex items-center gap-2"
                >
                    {loading ? "Saving..." : selectedVehicle ? "Update Vehicle" : "Create Vehicle"}
                </button>
            </div>
        </form>
    );
}
