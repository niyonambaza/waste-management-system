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
    CheckCircle2
} from 'lucide-react';

const Notification = () => {
    const [notifications, setNotifications] = useState([]);
    const [residents, setResidents] = useState([]);
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [userId, setUserId] = useState('');
    
    // Status and state processing telemetry trackers
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(false);
    const [feedback, setFeedback] = useState({ type: null, text: '' });

    useEffect(() => {
        loadComponentData();
    }, []);

    const loadComponentData = async () => {
        setLoading(true);
        setError(false);
        try {
            const [notifRes, userRes] = await Promise.all([
                API.get('/notifications'),
                getUsers()
            ]);
            setNotifications(notifRes.data);
            setResidents(userRes.data);
        } catch (err) {
            console.error("Failed to compile layout notification logs:", err);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

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
            
            // Refresh telemetry logs
            const freshNotifs = await API.get('/notifications');
            setNotifications(freshNotifs.data);
        } catch (err) { 
            console.error(err);
            setFeedback({ type: 'error', text: 'Broadcast processing pipe encountered an unexpected exit error.' });
        } finally {
            setSubmitting(false);
        }
    };

    const toggleStatus = async (id, currentStatus) => {
        const nextStatus = currentStatus === 'unread' ? 'read' : 'unread';
        try {
            await API.put(`/notifications/${id}`, { status: nextStatus });
            // Local state patch to prevent double render delays
            setNotifications(notifications.map(n => 
                n.notification_id === id ? { ...n, status: nextStatus } : n
            ));
        } catch (err) {
            console.error("Could not modify read state parameters:", err);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to permanently delete this notification log?")) {
            try {
                await API.delete(`/notifications/${id}`);
                setNotifications(notifications.filter(n => n.notification_id !== id));
            } catch (err) {
                console.error("Failed to execute targeted record deletion:", err);
                alert("Unable to delete notification tracking metrics from framework registers.");
            }
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
            
            {/* --- COMPONENT PAGE LAYOUT HEADER --- */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        Broadcast Telemetry Center
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                        Dispatch real-time system statements, alert notices, and review localized client logs.
                    </p>
                </div>
                
                <button 
                    onClick={loadComponentData}
                    disabled={loading}
                    className="inline-flex items-center justify-center space-x-2 bg-white hover:bg-slate-50 text-slate-700 text-sm font-bold py-2 px-4 border border-slate-200 rounded-lg shadow-sm transition duration-150"
                >
                    <RefreshCw className={`h-4 w-4 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
                    <span>Sync Channels</span>
                </button>
            </div>

            {error && (
                <div className="flex items-center space-x-3 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                    <p className="text-sm text-red-700 font-medium">
                        Communication grid link failed. Re-authenticate admin session registers.
                    </p>
                </div>
            )}

            {/* --- SPLIT ACTION BOARD MATRIX --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                
                {/* COLUMN 1: NEW DISPATCH DISPATCH FORM PANEL */}
                <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-100 shadow-sm space-y-4">
                    <div className="flex items-center space-x-2.5 border-b border-slate-50 pb-3">
                        <Bell className="h-4 w-4 text-blue-600" />
                        <h3 className="font-extrabold text-slate-900 text-base">Issue Notification</h3>
                    </div>

                    {feedback.text && (
                        <div className={`flex items-start space-x-2.5 p-3 rounded-lg border text-xs font-semibold ${
                            feedback.type === 'success' ? 'bg-blue-50/50 border-blue-200 text-blue-800' : 'bg-red-50/50 border-red-200 text-red-800'
                        }`}>
                            {feedback.type === 'success' ? <CheckCircle2 className="h-4 w-4 text-blue-600 flex-shrink-0" /> : <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />}
                            <span>{feedback.text}</span>
                        </div>
                    )}

                    <form onSubmit={handleSend} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                <User className="h-3.5 w-3.5" /> Recipient Assignment
                            </label>
                            <select 
                                value={userId} 
                                onChange={e => setUserId(e.target.value)} 
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                                required
                            >
                                <option value="">-- Choose Recipient Profile --</option>
                                {residents.map(r => (
                                    <option key={r.user_id} value={r.user_id}>{r.fullname} ({r.role})</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                <Heading className="h-3.5 w-3.5" /> Broadcast Title
                            </label>
                            <input 
                                type="text" 
                                value={title} 
                                onChange={e => setTitle(e.target.value)} 
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition" 
                                placeholder="e.g., Scheduled Core Route Delays"
                                required 
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                <FileText className="h-3.5 w-3.5" /> Notification Content
                            </label>
                            <textarea 
                                value={message} 
                                onChange={e => setMessage(e.target.value)} 
                                rows="4"
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition resize-none" 
                                placeholder="Type structural system alert details or route guidelines..."
                                required
                            />
                        </div>

                        <button 
                            type="submit" 
                            disabled={submitting}
                            className="w-full inline-flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-bold shadow-sm transition active:scale-[0.99] disabled:opacity-60"
                        >
                            <Send className="h-3.5 w-3.5" />
                            <span>{submitting ? 'Transmitting...' : 'Dispatch Notice'}</span>
                        </button>
                    </form>
                </div>

                {/* COLUMN 2 & 3: REALTIME LIVE CHANNELS LOG INDEX VIEWER */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 p-5 sm:p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                        <h3 className="font-extrabold text-slate-900 text-base">Dispatched Notification Registers</h3>
                        <span className="text-xs bg-slate-100 text-slate-500 px-2.5 py-0.5 rounded-full font-bold">
                            Total Records: {notifications.length}
                        </span>
                    </div>

                    {loading ? (
                        <div className="space-y-3 animate-pulse">
                            {[1, 2, 3].map(row => (
                                <div key={row} className="h-20 bg-slate-50 rounded-lg border border-slate-100" />
                            ))}
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center text-center p-12 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                            <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-2">
                                <Inbox className="h-5 w-5" />
                            </div>
                            <h4 className="text-sm font-bold text-slate-700">No History Available</h4>
                            <p className="text-xs text-slate-400 max-w-xs mt-0.5">There are no documented system notification logs issued over this framework registry channel.</p>
                        </div>
                    ) : (
                        <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                            {notifications.map(n => {
                                const isUnread = n.status === 'unread';
                                return (
                                    <div 
                                        key={n.notification_id} 
                                        className={`group relative p-4 rounded-xl border transition flex items-start justify-between gap-4 ${
                                            isUnread 
                                                ? 'bg-blue-50/20 border-blue-100 shadow-sm' 
                                                : 'bg-white border-slate-100 hover:border-slate-200'
                                        }`}
                                    >
                                        {/* Status Strip Accent */}
                                        <div className={`absolute top-0 left-0 h-full w-1 rounded-l-xl ${isUnread ? 'bg-blue-600' : 'bg-slate-300'}`} />

                                        <div className="space-y-1 pl-1">
                                            <div className="flex items-center space-x-2">
                                                <h4 className={`text-sm tracking-tight capitalize ${isUnread ? 'font-extrabold text-slate-900' : 'font-semibold text-slate-700'}`}>
                                                    {n.title}
                                                </h4>
                                                <span className="text-[10px] text-slate-400 font-medium">
                                                    (ID: {n.user_id})
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-500 leading-relaxed max-w-xl">{n.message}</p>
                                        </div>

                                        {/* Actions Execution Workflow Grid Row */}
                                        <div className="flex items-center space-x-1.5 flex-shrink-0">
                                            <button 
                                                onClick={() => toggleStatus(n.notification_id, n.status)}
                                                className={`p-1.5 rounded transition ${
                                                    isUnread 
                                                        ? 'bg-blue-100/50 text-blue-700 hover:bg-blue-100' 
                                                        : 'bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                                                }`}
                                                title={isUnread ? "Mark as Read" : "Mark as Unread"}
                                            >
                                                {isUnread ? <Mail className="h-4 w-4" /> : <MailOpen className="h-4 w-4" />}
                                            </button>
                                            
                                            <button 
                                                onClick={() => handleDelete(n.notification_id)}
                                                className="p-1.5 bg-slate-50 group-hover:bg-red-50 text-slate-400 group-hover:text-red-600 border border-transparent group-hover:border-red-100 rounded transition"
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
    );
};

export default Notification;