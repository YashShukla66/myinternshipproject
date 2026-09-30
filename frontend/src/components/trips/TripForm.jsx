import React, { useState, useEffect, useRef } from 'react';
import { createTrip, updateTrip } from '../../services/tripService';
import { getDrivers } from '../../services/driverService';
import { getVehicles } from '../../services/vehicleService';
import { toast } from 'react-toastify';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in Leaflet + React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Component to auto-fit map bounds to markers and route
const MapFitter = ({ markers, routePath }) => {
  const map = useMap();
  useEffect(() => {
    if (routePath.length > 0) {
      const bounds = L.latLngBounds(routePath);
      map.fitBounds(bounds, { padding: [30, 30] });
    } else if (markers.length > 0) {
      const bounds = L.latLngBounds(markers.map(m => [m.lat, m.lng]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 10 });
    }
  }, [markers, routePath, map]);
  return null;
};

const center = [20.5937, 78.9629]; // Center of India

export default function TripForm({ selectedTrip, onSuccess, onCancel }) {
  const localToUTCISO = (localStr) => {
    if (!localStr) return null;
    return new Date(localStr).toISOString();
  };

  const utcToLocalInput = (utcStr) => {
    if (!utcStr) return '';
    const d = new Date(utcStr);
    const offset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - offset).toISOString().slice(0, 16);
  };

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
    start_time: getLocalDateTimeString(30),
    end_time: getLocalDateTimeString(90),
    distance: '',
    status: 'SCHEDULED',
    notes: ''
  });

  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingRoute, setLoadingRoute] = useState(false);

  // Map States
  const [markers, setMarkers] = useState([]);
  const [routePath, setRoutePath] = useState([]);
  const originRef = useRef();
  const destRef = useRef();

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

  async function calculateRoute() {
    if (!originRef.current.value || !destRef.current.value) {
      toast.warning('Please enter both Origin and Destination');
      return;
    }
    
    setLoadingRoute(true);
    const sourceStr = originRef.current.value;
    const destStr = destRef.current.value;

    setFormData(prev => ({
      ...prev,
      source: sourceStr,
      destination: destStr
    }));

    try {
      // 1. Geocode Source using free Nominatim API
      const sourceRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(sourceStr)}`);
      const sourceData = await sourceRes.json();
      if (!sourceData || sourceData.length === 0) throw new Error("Origin not found. Try a more specific location.");
      const sLat = parseFloat(sourceData[0].lat);
      const sLon = parseFloat(sourceData[0].lon);

      // 2. Geocode Destination
      const destRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destStr)}`);
      const destData = await destRes.json();
      if (!destData || destData.length === 0) throw new Error("Destination not found. Try a more specific location.");
      const dLat = parseFloat(destData[0].lat);
      const dLon = parseFloat(destData[0].lon);

      setMarkers([
        { lat: sLat, lng: sLon, label: "Origin: " + sourceData[0].display_name.split(',')[0] },
        { lat: dLat, lng: dLon, label: "Destination: " + destData[0].display_name.split(',')[0] }
      ]);

      // 3. Get Route via Free OSRM API
      const routeRes = await fetch(`https://router.project-osrm.org/route/v1/driving/${sLon},${sLat};${dLon},${dLat}?overview=full&geometries=geojson`);
      const routeData = await routeRes.json();
      
      if (routeData.code !== "Ok") throw new Error("Could not calculate driving route between these locations.");

      const routeDistanceKm = (routeData.routes[0].distance / 1000).toFixed(1);
      
      // OSRM returns coordinates as [lon, lat], Leaflet Polyline expects [lat, lon]
      const coordinates = routeData.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
      
      setRoutePath(coordinates);
      setFormData(prev => ({ ...prev, distance: routeDistanceKm }));
      
      toast.success('Route calculated successfully!');
    } catch (error) {
      toast.error(error.message || 'Error calculating route.');
      console.error(error);
    } finally {
      setLoadingRoute(false);
    }
  }

  function clearRoute() {
    setRoutePath([]);
    setMarkers([]);
    if(originRef.current) originRef.current.value = '';
    if(destRef.current) destRef.current.value = '';
    setFormData(prev => ({
      ...prev,
      source: '',
      destination: '',
      distance: ''
    }));
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    let currentSource = formData.source;
    let currentDest = formData.destination;
    
    if (originRef.current && originRef.current.value) {
       currentSource = originRef.current.value;
    }
    if (destRef.current && destRef.current.value) {
       currentDest = destRef.current.value;
    }
    
    setLoading(true);

    const payload = {
      ...formData,
      source: currentSource,
      destination: currentDest,
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
        {/* Basic Information */}
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
              <option key={d.id} value={d.id}>
                {d.full_name} ({d.status === 'AVAILABLE' ? 'Available' : d.status === 'ON_TRIP' ? 'On Trip' : d.status})
              </option>
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

        {/* Map and Routing Section (Leaflet) */}
        <div className="md:col-span-2 bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <label className="block text-slate-300 font-semibold mb-1.5">Origin / Source *</label>
              <input
                type="text"
                name="source"
                placeholder="e.g. Nagpur"
                defaultValue={formData.source}
                ref={originRef}
                className="w-full glass-input p-3 rounded-xl focus:outline-none bg-slate-800"
                required
              />
            </div>

            <div className="flex-1 relative">
              <label className="block text-slate-300 font-semibold mb-1.5">Destination *</label>
              <input
                type="text"
                name="destination"
                placeholder="e.g. Mumbai"
                defaultValue={formData.destination}
                ref={destRef}
                className="w-full glass-input p-3 rounded-xl focus:outline-none bg-slate-800"
                required
              />
            </div>

            <div className="flex items-end pb-[2px] gap-2">
              <button
                type="button"
                onClick={calculateRoute}
                disabled={loadingRoute}
                className="px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition disabled:opacity-50"
              >
                {loadingRoute ? 'Locating...' : 'Calculate Route'}
              </button>
              <button
                type="button"
                onClick={clearRoute}
                className="px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition"
              >
                Clear
              </button>
            </div>
          </div>
          
          {/* Leaflet Map display */}
          <div className="w-full h-64 rounded-xl overflow-hidden border border-slate-700/50 mb-3 z-0 relative" style={{ zIndex: 0 }}>
            <MapContainer 
              center={center} 
              zoom={4} 
              style={{ width: '100%', height: '100%' }}
              zoomControl={true}
            >
              {/* Dark themed tile layer using CartoDB */}
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              />
              
              {markers.map((m, idx) => (
                <Marker key={idx} position={[m.lat, m.lng]}>
                  <Popup>{m.label}</Popup>
                </Marker>
              ))}

              {routePath.length > 0 && (
                <Polyline 
                  positions={routePath} 
                  color="#818cf8" // indigo-400
                  weight={4}
                  opacity={0.8}
                />
              )}

              <MapFitter markers={markers} routePath={routePath} />
            </MapContainer>
          </div>
          
          <div className="flex items-center gap-2">
             <label className="text-slate-300 font-semibold">Calculated Distance (km):</label>
             <input
              type="number"
              step="0.1"
              name="distance"
              placeholder="e.g. 1420.5"
              value={formData.distance}
              onChange={handleChange}
              className="glass-input p-2 rounded-xl focus:outline-none w-32 bg-slate-800/50"
              required
            />
          </div>
        </div>

        {/* Date/Time Information */}
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

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-800 mt-6">
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
