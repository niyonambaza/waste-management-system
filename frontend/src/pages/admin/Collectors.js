import React, { useState, useEffect } from 'react';
import API from '../../services/api'; // Cyangwa aho usanzwe uhamagaza axios/fetch yawe
import { 
    Calendar, 
    Clock, 
    User, 
    Truck, 
    FileText, 
    PlusCircle, 
    Trash2, 
    Edit, 
    RefreshCw, 
    CheckCircle, 
    AlertCircle,
    Inbox
} from 'lucide-react';

const CollectionSchedule = () => {
    // --- STATE MANAGEMENT ---
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [feedback, setFeedback] = useState({ type: null, text: '' });
    const [editMode, setEditMode] = useState(false);
    const [selectedId, setSelectedId] = useState(null);

    // Form states matching backend columns
    const [formData, setFormData] = useState({
        request_id: '',
        collector_id: '',
        vehicle_id: '',
        collection_date: '',
        collection_time: '',
        status: 'scheduled'
    });

    useEffect(() => {
        fetchSchedules();
    }, []);

    // --- 1. FETCH ALL SCHEDULES (GET) ---
    const fetchSchedules = async () => {
        setLoading(true);
        try {
            const res = await API.get('/collection-schedules');
            setSchedules(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Error fetching schedules:", err);
            setFeedback({ type: 'error', text: 'Could not fetch schedules from the system.' });
        } finally {
            setLoading(false);
        }
    };

    // --- 2. HANDLE INPUT CHANGES ---
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: name.endsWith('_id') ? Number(value) : value
        });
    };

    // --- 3. CREATE OR UPDATE (POST / PUT) ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setFeedback({ type: null, text: '' });

        try {
            if (editMode) {
                // PUT Update
                await API.put(`/collection-schedules/${selectedId}`, formData);
                setFeedback({ type: 'success', text: 'Schedule updated successfully!' });
            } else {
                // POST Create
                await API.post('/collection-schedules', formData);
                setFeedback({ type: 'success', text: 'New collection schedule created!' });
            }

            // Reset Form & Refresh
            resetForm();
            fetchSchedules();
        } catch (err) {
            console.error(err);
            setFeedback({ type: 'error', text: err.response?.data?.error || 'Operation failed. Verify inputs.' });
        } finally {
            setSubmitting(false);
        }
    };

    // --- 4. PREPARE EDIT MODE ---
    const handleEditSetup = (schedule) => {
        setEditMode(true);
        setSelectedId(schedule.schedule_id);
        
        // Format date to YYYY-MM-DD to fit in HTML date input
        const formattedDate = schedule.collection_date ? schedule.collection_date.split('T')[0] : '';
        
        setFormData({
            request_id: schedule.request_id || '',
            collector_id: schedule.collector_id || '',
            vehicle_id: schedule.vehicle_id || '',
            collection_date: formattedDate,
            collection_time: schedule.collection_time || '',
            status: schedule.status || 'scheduled'
        });
    };

    // --- 5. PERMANENT DELETE (DELETE) ---
    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to permanently delete this schedule?")) return;

        try {
            await API.delete(`/collection-schedules/${id}`);
            setFeedback({ type: 'success', text: 'Schedule removed successfully.' });
            setSchedules(schedules.filter(s => s.schedule_id !== id));
        } catch (err) {
            console.error(err);
            setFeedback({ type: 'error', text: 'Failed to delete the schedule.' });
        }
    };

    const resetForm = () => {
        setFormData({ request_id: '', collector_id: '', vehicle_id: '', collection_date: '', collection_time: '', status: 'scheduled' });
        setEditMode(false);
        setSelectedId(null);
    };

    // Helper for beautiful badges
    const getStatusStyle = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'cancelled': return 'bg-red-50 text-red-700 border-red-200';
            case 'ongoing': return 'bg-blue-50 text-blue-700 border-blue-200';
            default: return 'bg-amber-50 text-amber-700 border-amber-200';
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-8">
                
                {/* HEADER section */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-6">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                            <Calendar className="h-8 w-8 text-blue-600" />
                            Collection Management Schedules
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">
                            Plan dispatch logistics, assign truck collectors, and update system service frequencies.
                        </p>
                    </div>
                    <button 
                        onClick={fetchSchedules}
                        className="inline-flex items-center justify-center space-x-2 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold py-2.5 px-4 border border-slate-200 rounded-xl shadow-sm transition"
                    >
                        <RefreshCw className={`h-4 w-4 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
                        <span>Sync Board</span>
                    </button>
                </div>

                {/* NOTIFICATIONS BAR */}
                {feedback.text && (
                    <div className={`flex items-center space-x-2.5 p-4 rounded-xl border text-sm font-medium ${
                        feedback.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'
                    }`}>
                        {feedback.type === 'success' ? <CheckCircle className="h-5 w-5 text-emerald-600" /> : <AlertCircle className="h-5 w-5 text-red-600" />}
                        <span>{feedback.text}</span>
                    </div>
                )}

                {/* WORKSPACE GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    
                    {/* FORM COMPONENT */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5 lg:col-span-1">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                                <PlusCircle className="h-5 w-5 text-blue-600" />
                                {editMode ? 'Modify Schedule' : 'Schedule Dispatch'}
                            </h3>
                            {editMode && (
                                <button onClick={resetForm} className="text-xs text-blue-600 hover:underline">
                                    Cancel Edit
                                </button>
                            )}
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                    <FileText className="h-3.5 w-3.5" /> Request ID
                                </label>
                                <input 
                                    type="number" name="request_id" value={formData.request_id} onChange={handleInputChange} 
                                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm" placeholder="e.g., 102" required 
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                    <User className="h-3.5 w-3.5" /> Collector ID
                                </label>
                                <input 
                                    type="number" name="collector_id" value={formData.collector_id} onChange={handleInputChange} 
                                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm" placeholder="e.g., 14" required 
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                    <Truck className="h-3.5 w-3.5" /> Vehicle ID
                                </label>
                                <input 
                                    type="number" name="vehicle_id" value={formData.vehicle_id} onChange={handleInputChange} 
                                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm" placeholder="e.g., 5" required 
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                        <Calendar className="h-3.5 w-3.5" /> Date
                                    </label>
                                    <input 
                                        type="date" name="collection_date" value={formData.collection_date} onChange={handleInputChange} 
                                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm" required 
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                        <Clock className="h-3.5 w-3.5" /> Time
                                    </label>
                                    <input 
                                        type="text" name="collection_time" value={formData.collection_time} onChange={handleInputChange} 
                                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm" placeholder="e.g., 08:30 AM" required 
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                    Status Matrix
                                </label>
                                <select 
                                    name="status" value={formData.status} onChange={handleInputChange} 
                                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm"
                                >
                                    <option value="scheduled">Scheduled</option>
                                    <option value="ongoing">Ongoing</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>

                            <button 
                                type="submit" disabled={submitting}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl text-sm font-bold shadow-sm transition disabled:opacity-50"
                            >
                                {submitting ? 'Processing...' : editMode ? 'Update Schedule Log' : 'Authorize Schedule'}
                            </button>
                        </form>
                    </div>

                    {/* LIVE VIEW REGISTERS */}
                    <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <h3 className="font-bold text-slate-900 text-base">Active Log registries</h3>
                            <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-bold">
                                Count: {schedules.length}
                            </span>
                        </div>

                        {loading ? (
                            <div className="space-y-4 animate-pulse">
                                {[1, 2, 3].map(i => <div key={i} className="h-20 bg-slate-50 rounded-xl" />)}
                            </div>
                        ) : schedules.length === 0 ? (
                            <div className="flex flex-col items-center justify-center text-center p-16 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                                <Inbox className="h-10 w-10 text-slate-400 mb-3" />
                                <h4 className="text-sm font-bold text-slate-700">No Rosters Scheduled</h4>
                                <p className="text-xs text-slate-400 mt-1">There are no active garbage routing schedules registered.</p>
                            </div>
                        ) : (
                            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                                {schedules.map(schedule => (
                                    <div 
                                        key={schedule.schedule_id} 
                                        className="p-4 border border-slate-100 rounded-xl bg-white shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-slate-200 transition"
                                    >
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-3 flex-wrap">
                                                <span className="text-sm font-extrabold text-slate-800">
                                                    Log #{schedule.schedule_id}
                                                </span>
                                                <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-medium">
                                                    Req ID: {schedule.request_id}
                                                </span>
                                                <span className={`text-[10px] font-bold uppercase tracking-wider border px-2 py-0.5 rounded-md ${getStatusStyle(schedule.status)}`}>
                                                    {schedule.status}
                                                </span>
                                            </div>
                                            
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1 text-xs text-slate-500 font-medium">
                                                <div className="flex items-center gap-1"><User className="h-3.5 w-3.5" /> Coll: {schedule.collector_id}</div>
                                                <div className="flex items-center gap-1"><Truck className="h-3.5 w-3.5" /> Veh: {schedule.vehicle_id}</div>
                                                <div className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {schedule.collection_date ? new Date(schedule.collection_date).toLocaleDateString() : 'N/A'}</div>
                                                <div className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {schedule.collection_time}</div>
                                            </div>
                                        </div>

                                        {/* MANAGEMENT CONTROLS */}
                                        <div className="flex items-center gap-2 self-end sm:self-auto">
                                            <button 
                                                onClick={() => handleEditSetup(schedule)}
                                                className="p-2 bg-slate-50 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-xl border border-transparent hover:border-blue-100 transition"
                                                title="Edit Entry"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(schedule.schedule_id)}
                                                className="p-2 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-xl border border-transparent hover:border-red-100 transition"
                                                title="Remove Entry"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default CollectionSchedule;