import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { getUsers } from '../../services/userService';
import { 
    Bell, 
    Send, 
    Trash2, 
    MailOpen, 
    Mail, 
    User, 
    Heading, 
    FileText, 
    RefreshCw, 
    AlertCircle, 
    Inbox,
    CheckCircle2,
    Layers
} from 'lucide-react';

const Notification = () => {
    // --- STATE MANAGEMENT ---
    const [notifications, setNotifications] = useState([]);
    const [residents, setResidents] = useState([]);
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [userId, setUserId] = useState('');
    
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(false);
    const [feedback, setFeedback] = useState({ type: null, text: '' });

    useEffect(() => {
        loadComponentData();
    }, []);

    // --- FETCH DATA ---
    const loadComponentData = async () => {
        setLoading(true);
        setError(false);
        try {
            const [notifRes, userRes] = await Promise.all([
                API.get('/notifications'),
                getUsers()
            ]);
            setNotifications(Array.isArray(notifRes.data) ? notifRes.data : []);
            setResidents(Array.isArray(userRes.data) ? userRes.data : []);
        } catch (err) {
            console.error("Failed to compile layout notification logs:", err);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    // --- DISPATCH NOTIFICATION (POST) ---
    const handleSend = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setFeedback({ type: null, text: '' });

        try {
            await API.post('/notifications', { 
                user_id: userId, 
                title, 
                message, 
                status: 'unread' 
            });
            
            setTitle(''); 
            setMessage(''); 
            setUserId('');
            setFeedback({ type: 'success', text: 'Notification dispatched and broadcasted successfully!' });
            
            // Refresh stream
            const freshNotifs = await API.get('/notifications');
            setNotifications(freshNotifs.data);
        } catch (err) { 
            console.error(err);
            setFeedback({ type: 'error', text: 'Broadcast processing network encountered an unexpected error.' });
        } finally {
            setSubmitting(false);
        }
    };

    // --- TOGGLE READ/UNREAD STATUS (PUT) ---
    const toggleStatus = async (id, currentStatus) => {
        const nextStatus = currentStatus === 'unread' ? 'read' : 'unread';
        try {
            await API.put(`/notifications/${id}`, { status: nextStatus });
            // Local state patch to optimize performance and UI responsiveness
            setNotifications(notifications.map(n => 
                n.notification_id === id ? { ...n, status: nextStatus } : n
            ));
        } catch (err) {
            console.error("Could not modify read status parameters:", err);
        }
    };

    // --- DELETE LOG RECORD (DELETE) ---
    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to permanently delete this notification log?")) {
            try {
                await API.delete(`/notifications/${id}`);
                setNotifications(notifications.filter(n => n.notification_id !== id));
            } catch (err) {
                console.error("Failed to execute targeted record deletion:", err);
                alert("Unable to delete notification tracking metrics from registry channels.");
            }
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-8">
                
                {/* --- DASHBOARD HEADER --- */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-6">
                    <div className="flex items-start gap-4">
                        <div className="bg-blue-600 p-3 rounded-xl text-white shadow-md shadow-blue-500/20 hidden sm:block">
                            <Layers className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                                Broadcast Telemetry Center
                            </h1>
                            <p className="text-sm text-slate-500 mt-1">
                                Dispatch real-time system statements, manage user alert notices, and analyze framework log tracks.
                            </p>
                        </div>
                    </div>
                    
                    <button 
                        onClick={loadComponentData}
                        disabled={loading}
                        className="inline-flex items-center justify-center space-x-2 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold py-2.5 px-4 border border-slate-200 rounded-xl shadow-sm transition active:scale-[0.98] disabled:opacity-50 self-start md:self-auto"
                    >
                        <RefreshCw className={`h-4 w-4 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
                        <span>Sync Channels</span>
                    </button>
                </div>

                {/* --- CRITICAL LINK ALERTS --- */}
                {error && (
                    <div className="flex items-center space-x-3 bg-red-50 border-l-4 border-red-500 p-4 rounded-xl shadow-sm">
                        <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                        <p className="text-sm text-red-700 font-medium">
                            Communication grid link failed. Please re-authenticate your active administrator session registries.
                        </p>
                    </div>
                )}

                {/* --- SPLIT GRID PANEL MATRIX --- */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    
                    {/* COMPOSER PANEL */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5 lg:col-span-1">
                        <div className="flex items-center space-x-2.5 border-b border-slate-100 pb-4">
                            <Bell className="h-5 w-5 text-blue-600" />
                            <h3 className="font-bold text-slate-900 text-base">Issue Notification</h3>
                        </div>

                        {feedback.text && (
                            <div className={`flex items-start space-x-2.5 p-3 rounded-xl border text-xs font-semibold transition-all ${
                                feedback.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'
                            }`}>
                                {feedback.type === 'success' ? (
                                    <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                                ) : (
                                    <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                                )}
                                <span>{feedback.text}</span>
                            </div>
                        )}

                        <form onSubmit={handleSend} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                    <User className="h-3.5 w-3.5" /> Recipient Assignment
                                </label>
                                <select 
                                    value={userId} 
                                    onChange={e => setUserId(e.target.value)} 
                                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                                    required
                                >
                                    <option value="">-- Choose Recipient Profile --</option>
                                    {residents.map(r => (
                                        <option key={r.user_id} value={r.user_id}>
                                            {r.fullname} ({r.role})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                    <Heading className="h-3.5 w-3.5" /> Broadcast Title
                                </label>
                                <input 
                                    type="text" 
                                    value={title} 
                                    onChange={e => setTitle(e.target.value)} 
                                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition" 
                                    placeholder="e.g., Scheduled Core Route Delays"
                                    required 
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                    <FileText className="h-3.5 w-3.5" /> Notification Content
                                </label>
                                <textarea 
                                    value={message} 
                                    onChange={e => setMessage(e.target.value)} 
                                    rows="4"
                                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition resize-none" 
                                    placeholder="Type structural system alert details or route guidelines..."
                                    required
                                />
                            </div>

                            <button 
                                type="submit" 
                                disabled={submitting}
                                className="w-full inline-flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl text-sm font-bold shadow-sm transition active:scale-[0.99] disabled:opacity-60 shadow-blue-500/10"
                            >
                                <Send className="h-4 w-4" />
                                <span>{submitting ? 'Transmitting...' : 'Dispatch Notice'}</span>
                            </button>
                        </form>
                    </div>

                    {/* LIVE MATRIX LOGGER FEED */}
                    <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <h3 className="font-bold text-slate-900 text-base">Dispatched Notification Registers</h3>
                            <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-bold">
                                Total Records: {notifications.length}
                            </span>
                        </div>

                        {loading ? (
                            <div className="space-y-4 animate-pulse">
                                {[1, 2, 3].map(row => (
                                    <div key={row} className="h-24 bg-slate-50 rounded-xl border border-slate-100" />
                                ))}
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center text-center p-16 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                                <div className="h-12 w-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-3">
                                    <Inbox className="h-6 w-6" />
                                </div>
                                <h4 className="text-sm font-bold text-slate-700">No History Available</h4>
                                <p className="text-xs text-slate-400 max-w-xs mt-1">
                                    There are no documented system notification logs issued over this framework registry channel yet.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4 max-h-[580px] overflow-y-auto pr-2 custom-scrollbar">
                                {notifications.map(n => {
                                    const isUnread = n.status === 'unread';
                                    return (
                                        <div 
                                            key={n.notification_id} 
                                            className={`group relative p-4 rounded-xl border transition flex items-start justify-between gap-4 ${
                                                isUnread 
                                                    ? 'bg-gradient-to-r from-blue-50/30 to-transparent border-blue-100 shadow-sm' 
                                                    : 'bg-white border-slate-100 hover:border-slate-200'
                                            }`}
                                        >
                                            {/* Status Accent Line */}
                                            <div className={`absolute top-0 left-0 h-full w-1 rounded-l-xl transition ${isUnread ? 'bg-blue-600' : 'bg-slate-200'}`} />

                                            <div className="space-y-1 pl-2">
                                                <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                                                    <h4 className={`text-sm tracking-tight capitalize ${isUnread ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}>
                                                        {n.title || 'Untitled Notification'}
                                                    </h4>
                                                    <span className="text-[10px] bg-slate-100 font-bold text-slate-500 px-1.5 py-0.5 rounded-md">
                                                        UID: {n.user_id ?? 'N/A'}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-500 leading-relaxed max-w-xl whitespace-pre-wrap">
                                                    {n.message}
                                                </p>
                                            </div>

                                            {/* Action Control Blocks */}
                                            <div className="flex items-center space-x-2 flex-shrink-0">
                                                <button 
                                                    onClick={() => toggleStatus(n.notification_id, n.status)}
                                                    className={`p-2 rounded-xl border transition ${
                                                        isUnread 
                                                            ? 'bg-blue-50 border-blue-100 text-blue-600 hover:bg-blue-100' 
                                                            : 'bg-slate-50 border-transparent text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                                                    }`}
                                                    title={isUnread ? "Mark as Read" : "Mark as Unread"}
                                                >
                                                    {isUnread ? <Mail className="h-4 w-4" /> : <MailOpen className="h-4 w-4" />}
                                                </button>
                                                
                                                <button 
                                                    onClick={() => handleDelete(n.notification_id)}
                                                    className="p-2 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-600 border border-transparent hover:border-red-100 rounded-xl transition"
                                                    title="Delete Log"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Notification;