import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { Building2, PlusCircle, Trash2, Edit3, MapPin, Phone, X, Loader2 } from 'lucide-react';

const Centers = () => {
    const [centers, setCenters] = useState([]);
    const [name, setName] = useState('');
    const [location, setLocation] = useState('');
    const [phone, setPhone] = useState('');

    // State management for Editing Mode
    const [editingCenterId, setEditingCenterId] = useState(null);
    
    // User Action Feedback Indicators
    const [feedback, setFeedback] = useState({ type: null, text: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => { 
        loadCenters(); 
    }, []);

    const loadCenters = () => {
        API.get('/recycling-centers')
            .then(res => setCenters(res.data))
            .catch(() => showFeedback('error', 'Failed to retrieve recycling center registers.'));
    };

    const showFeedback = (type, text) => {
        setFeedback({ type, text });
        setTimeout(() => setFeedback({ type: null, text: '' }), 5000);
    };

    // 1. SAVE MANIFEST (Handles both CREATE and UPDATE)
    const handleSaveCenter = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        const centerData = { 
            center_name: name.trim(), 
            location: location.trim(), 
            contact_phone: phone.trim() 
        };

        try {
            if (editingCenterId) {
                // UPDATE RECORD
                await API.put(`/recycling-centers/${editingCenterId}`, centerData);
                showFeedback('success', 'Recycling center records updated successfully.');
            } else {
                // CREATE NEW RECORD
                await API.post('/recycling-centers', centerData);
                showFeedback('success', 'New recycling center registered successfully.');
            }
            clearForm();
            loadCenters();
        } catch (err) {
            showFeedback('error', err.response?.data?.error || 'Database rejected center entry.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // 2. DISMISS CENTER RECORD (DELETE)
    const handleDeleteCenter = async (id) => {
        if (!window.confirm("Are you sure you want to permanently clear this recycling center?")) return;
        
        try {
            await API.delete(`/recycling-centers/${id}`);
            showFeedback('success', 'Recycling center permanently dropped.');
            loadCenters();
            if (editingCenterId === id) clearForm();
        } catch (err) {
            showFeedback('error', 'Deletion rejected. Ensure no dependencies exist on this record.');
        }
    };

    // Populates fields for modification and switches workflow to Edit Mode
    const startEdit = (c) => {
        setEditingCenterId(c.center_id);
        setName(c.center_name);
        setLocation(c.location);
        setPhone(c.contact_phone);
    };

    const clearForm = () => {
        setEditingCenterId(null);
        setName('');
        setLocation('');
        setPhone('');
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* --- CONFIGURATION FORM --- */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm h-fit overflow-hidden">
                <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center space-x-3">
                    <div className="h-9 w-9 bg-green-50 border border-green-100 rounded-lg flex items-center justify-center">
                        <Building2 className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                        <h3 className="font-black text-slate-800 tracking-tight text-sm sm:text-base">
                            {editingCenterId ? 'Update Center' : 'Register Center'}
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">Manage regional recycling center hubs.</p>
                    </div>
                </div>

                <form onSubmit={handleSaveCenter} className="p-5 space-y-4">
                    {feedback.text && (
                        <div className={`p-3.5 rounded-lg border text-xs font-semibold flex items-center space-x-2 ${
                            feedback.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'
                        }`}>
                            <span>{feedback.text}</span>
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Center Name</label>
                        <input 
                            type="text" 
                            value={name} 
                            onChange={e => setName(e.target.value)} 
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-600 transition" 
                            placeholder="e.g., Kigali Eco Recycling Hub" 
                            required 
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-slate-400" /> Location / Address
                        </label>
                        <input 
                            type="text" 
                            value={location} 
                            onChange={e => setLocation(e.target.value)} 
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-600 transition" 
                            placeholder="e.g., Nyarugenge, Kigali" 
                            required 
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                            <Phone className="h-3 w-3 text-slate-400" /> Contact Phone
                        </label>
                        <input 
                            type="text" 
                            value={phone} 
                            onChange={e => setPhone(e.target.value)} 
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-600 transition" 
                            placeholder="e.g., +250 788 000 000"
                            required 
                        />
                    </div>

                    <div className="pt-2 flex items-center space-x-2">
                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-sm font-bold shadow-sm shadow-green-600/10 transition duration-150 active:scale-[0.99] disabled:opacity-60"
                        >
                            {isSubmitting ? (
                                <span className="flex items-center justify-center gap-2">
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving...
                                </span>
                            ) : editingCenterId ? (
                                'Update Hub'
                            ) : (
                                'Save Center'
                            )}
                        </button>
                        
                        {editingCenterId && (
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

            {/* --- REGISTRY DATA TABLE VIEW --- */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                <div className="p-5 border-b border-slate-100">
                    <h3 className="font-black text-slate-800 tracking-tight text-sm sm:text-base">Active Processing Facilities</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Overview of registered municipal reclamation locations.</p>
                </div>

                <div className="overflow-x-auto">
                    {centers.length === 0 ? (
                        <div className="p-8 text-center text-sm text-slate-400 font-medium">No processing centers logged in system registers.</div>
                    ) : (
                        <table className="min-w-full table-auto text-xs sm:text-sm text-left">
                            <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                                <tr>
                                    <th className="p-4">Center Identifier</th>
                                    <th className="p-4">Geographic Location</th>
                                    <th className="p-4">Contact Line</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                                {centers.map(c => (
                                    <tr key={c.center_id} className="hover:bg-slate-50/60 transition">
                                        <td className="p-4 font-black text-slate-900 tracking-tight">{c.center_name}</td>
                                        <td className="p-4 text-slate-500">
                                            <span className="inline-flex items-center gap-1">
                                                <MapPin className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                                                {c.location}
                                            </span>
                                        </td>
                                        <td className="p-4 font-bold text-slate-800">
                                            <span className="inline-flex items-center gap-1">
                                                <Phone className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                                                {c.contact_phone}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="inline-flex items-center space-x-1">
                                                <button 
                                                    onClick={() => startEdit(c)}
                                                    className={`p-1.5 rounded-md border border-slate-100 hover:border-green-200 text-slate-400 hover:text-green-600 hover:bg-green-50 transition ${editingCenterId === c.center_id ? 'bg-green-50 border-green-200 text-green-600' : ''}`}
                                                    title="Modify Entry"
                                                >
                                                    <Edit3 className="h-3.5 w-3.5" />
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteCenter(c.center_id)}
                                                    className="p-1.5 rounded-md border border-slate-100 hover:border-red-200 text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                                                    title="Drop Entry"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

        </div>
    );
};

export default Centers;