import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { Truck, PlusCircle, Trash2, Edit3, CheckCircle2, AlertTriangle, Wrench, X } from 'lucide-react';

const Vehicles = () => {
    const [vehicles, setVehicles] = useState([]);
    const [plateNumber, setPlateNumber] = useState('');
    const [type, setType] = useState('');
    const [capacity, setCapacity] = useState('');
    const [status, setStatus] = useState('available');

    // State management for Editing Mode
    const [editingVehicleId, setEditingVehicleId] = useState(null);
    
    // User Action Feedback Indicators
    const [feedback, setFeedback] = useState({ type: null, text: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => { 
        loadVehicles(); 
    }, []);

    const loadVehicles = () => {
        API.get('/vehicles')
            .then(res => setVehicles(res.data))
            .catch(() => showFeedback('error', 'Failed to retrieve vehicle data registers.'));
    };

    const showFeedback = (type, text) => {
        setFeedback({ type, text });
        setTimeout(() => setFeedback({ type: null, text: '' }), 5000);
    };

    // 1. SAVE MANIFEST (Handles both CREATE and UPDATE)
    const handleSaveVehicle = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        const vehicleData = { 
            plate_number: plateNumber.toUpperCase().trim(), // Force standard clean plate strings
            vehicle_type: type.toLowerCase().trim(),        // Keep values standardized for database normalization
            capacity: parseFloat(capacity), 
            status: status.toLowerCase() 
        };

        try {
            if (editingVehicleId) {
                // UPDATE RECORD
                await API.put(`/vehicles/${editingVehicleId}`, vehicleData);
                showFeedback('success', 'Vehicle logs updated successfully.');
            } else {
                // CREATE NEW RECORD
                await API.post('/vehicles', vehicleData);
                showFeedback('success', 'New fleet vehicle registered successfully.');
            }
            clearForm();
            loadVehicles();
        } catch (err) {
            showFeedback('error', err.response?.data?.error || 'Database rejected vehicle entry.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // 2. DISMISS VEHICLE ENTRY (DELETE)
    const handleDeleteVehicle = async (id) => {
        if (!window.confirm("Are you sure you want to permanently clear this vehicle record?")) return;
        
        try {
            await API.delete(`/vehicles/${id}`);
            showFeedback('success', 'Vehicle record permanently dropped.');
            loadVehicles();
            if (editingVehicleId === id) clearForm();
        } catch (err) {
            showFeedback('error', 'Deletion rejected. Verify no dispatch schedules are active on this asset.');
        }
    };

    // Populates fields for modification and switches workflow to Edit Mode
    const startEdit = (v) => {
        setEditingVehicleId(v.vehicle_id);
        setPlateNumber(v.plate_number);
        setType(v.vehicle_type);
        setCapacity(v.capacity);
        setStatus(v.status);
    };

    const clearForm = () => {
        setEditingVehicleId(null);
        setPlateNumber('');
        setType('');
        setCapacity('');
        setStatus('available');
    };

    // Computes matching status color accents for data scan clarity
    const getStatusStyle = (vStatus) => {
        switch (vStatus.toLowerCase()) {
            case 'available':
                return { bg: 'bg-emerald-50 text-emerald-700 border-emerald-100', icon: <CheckCircle2 className="h-3 w-3" /> };
            case 'assigned':
                return { bg: 'bg-blue-50 text-blue-700 border-blue-100', icon: <Truck className="h-3 w-3" /> };
            case 'maintenance':
                return { bg: 'bg-amber-50 text-amber-700 border-amber-100', icon: <Wrench className="h-3 w-3" /> };
            default:
                return { bg: 'bg-slate-50 text-slate-700 border-slate-100', icon: <AlertTriangle className="h-3 w-3" /> };
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* --- CONFIGURATION FORM --- */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm h-fit overflow-hidden">
                <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center space-x-3">
                    <div className="h-9 w-9 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-center">
                        <Truck className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="font-black text-slate-800 tracking-tight text-sm sm:text-base">
                            {editingVehicleId ? 'Update Vehicle' : 'Register Vehicle'}
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">Manage automated logistics fleet assets.</p>
                    </div>
                </div>

                <form onSubmit={handleSaveVehicle} className="p-5 space-y-4">
                    {feedback.text && (
                        <div className={`p-3.5 rounded-lg border text-xs font-semibold flex items-center space-x-2 ${
                            feedback.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'
                        }`}>
                            <span>{feedback.text}</span>
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Plate Number</label>
                        <input 
                            type="text" 
                            value={plateNumber} 
                            onChange={e => setPlateNumber(e.target.value)} 
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition" 
                            placeholder="e.g., RAE 123 A" 
                            required 
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Vehicle Type</label>
                        <input 
                            type="text" 
                            value={type} 
                            onChange={e => setType(e.target.value)} 
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition" 
                            placeholder="e.g., Tipper, Fuso, Dumper" 
                            required 
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Capacity (Tons)</label>
                        <input 
                            type="number" 
                            step="0.1"
                            value={capacity} 
                            onChange={e => setCapacity(e.target.value)} 
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition" 
                            placeholder="e.g., 5.5"
                            required 
                        />
                    </div>

                    {editingVehicleId && (
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Operational Status</label>
                            <select 
                                value={status} 
                                onChange={e => setStatus(e.target.value)} 
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                            >
                                <option value="available">Available</option>
                                <option value="assigned">Assigned</option>
                                <option value="maintenance">Maintenance</option>
                            </select>
                        </div>
                    )}

                    <div className="pt-2 flex items-center space-x-2">
                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-bold shadow-sm shadow-blue-600/10 transition duration-150 active:scale-[0.99] disabled:opacity-60"
                        >
                            {isSubmitting ? 'Saving changes...' : editingVehicleId ? 'Update Asset' : 'Save Vehicle'}
                        </button>
                        
                        {editingVehicleId && (
                            <button 
                                type="button" 
                                onClick={clearForm}
                                className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-lg transition"
                                title="Cancel Modifications"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* --- FLEET MANAGEMENT REGISTRY VIEW --- */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                <div className="p-5 border-b border-slate-100">
                    <h3 className="font-black text-slate-800 tracking-tight text-sm sm:text-base">Active Fleet Registry</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Overview of active transport logistics units.</p>
                </div>

                <div className="overflow-x-auto">
                    {vehicles.length === 0 ? (
                        <div className="p-8 text-center text-sm text-slate-400 font-medium">No transport vehicles currently logged in the network indexes.</div>
                    ) : (
                        <table className="min-w-full table-auto text-xs sm:text-sm text-left">
                            <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                                <tr>
                                    <th className="p-4">Plate Number</th>
                                    <th className="p-4">Classification</th>
                                    <th className="p-4">Capacity</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                                {vehicles.map(v => {
                                    const style = getStatusStyle(v.status);
                                    return (
                                        <tr key={v.vehicle_id} className="hover:bg-slate-50/60 transition">
                                            <td className="p-4 font-black text-slate-900 tracking-tight">{v.plate_number}</td>
                                            <td className="p-4 capitalize text-slate-500">{v.vehicle_type}</td>
                                            <td className="p-4 font-bold text-slate-800">{v.capacity} Tons</td>
                                            <td className="p-4">
                                                <span className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 border rounded-full text-[11px] font-bold capitalize ${style.bg}`}>
                                                    {style.icon}
                                                    <span>{v.status}</span>
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="inline-flex items-center space-x-1">
                                                    <button 
                                                        onClick={() => startEdit(v)}
                                                        className={`p-1.5 rounded-md border border-slate-100 hover:border-blue-200 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition ${editingVehicleId === v.vehicle_id ? 'bg-blue-50 border-blue-200 text-blue-600' : ''}`}
                                                        title="Modify Entry"
                                                    >
                                                        <Edit3 className="h-3.5 w-3.5" />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDeleteVehicle(v.vehicle_id)}
                                                        className="p-1.5 rounded-md border border-slate-100 hover:border-red-200 text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                                                        title="Drop Entry"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

        </div>
    );
};

export default Vehicles;