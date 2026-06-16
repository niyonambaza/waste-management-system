import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { Megaphone, Trash2, Bell, ShieldAlert } from 'lucide-react';

const NotificationManager = () => {
    // States z'iforomu (Form States)
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [targetRole, setTargetRole] = useState('all');
    const [status, setStatus] = useState('active');

    // States z'urutonde n'imikorere
    const [notifications, setNotifications] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [feedback, setFeedback] = useState({ type: null, text: '' });

    useEffect(() => {
        loadAllNotifications();
    }, []);

    // 1. GUKURURA NOTIFICATIONS ZOSE (READ)
    const loadAllNotifications = () => {
        API.get('/my-notifications?user_id=1&role=admin')
            .then(res => setNotifications(res.data))
            .catch(() => showFeedback('error', 'Byanze gukurura urutonde rwa notifications.'));
    };

    const showFeedback = (type, text) => {
        setFeedback({ type, text });
        setTimeout(() => setFeedback({ type: null, text: '' }), 4000);
    };

    // 2. KOHEREZA UBUTUMWA BUSHYA (CREATE)
    const handleSendNotification = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const payload = {
            title: title.trim(),
            message: message.trim(),
            target_role: targetRole,
            status: status
        };

        API.post('/notifications', payload)
            .then(() => {
                showFeedback('success', 'Ubutumwa bwoherejwe neza mu matsinda yose!');
                setTitle('');
                setMessage('');
                setTargetRole('all');
                setStatus('active');
                loadAllNotifications();
            })
            .catch((err) => {
                showFeedback('error', err.response?.data?.error || 'Guhura n\'ikibazo mu kohereza.');
            })
            .finally(() => { 
                // Hano hahindutse .finally() mu kigwi cya .informants kugira ngo error ikoke
                setIsSubmitting(false);
            });
    };

    // 3. GUSIBA NOTIFICATION (DELETE)
    const handleDelete = (id) => {
        if (!window.confirm("Ese ufite ikizere ko ushaka gusiba iyi notification?")) return;

        API.delete(`/notifications/${id}`)
            .then(() => {
                showFeedback('success', 'Notification yakuwemo neza.');
                loadAllNotifications();
            })
            .catch(() => showFeedback('error', 'Byanze gusibika.'));
    };

    // Guhitamo ibara rya badge rya buri Target Group
    const getRoleBadge = (role) => {
        switch (role?.toLowerCase()) {
            case 'all':
                return 'bg-blue-50 text-blue-700 border-blue-100';
            case 'resident':
                return 'bg-emerald-50 text-emerald-700 border-emerald-100';
            case 'collector':
                return 'bg-amber-50 text-amber-700 border-amber-100';
            case 'staff':
                return 'bg-purple-50 text-purple-700 border-purple-100';
            default:
                return 'bg-slate-50 text-slate-700 border-slate-100';
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* --- CONFIGURATION FORM (CREATION) --- */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm h-fit overflow-hidden">
                <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center space-x-3">
                    <div className="h-9 w-9 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-center">
                        <Megaphone className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="font-black text-slate-800 tracking-tight text-sm sm:text-base">Andika Tangazo</h3>
                        <p className="text-xs text-slate-400 mt-0.5">Kohereza ubutumwa bwihuse muri sisitemu.</p>
                    </div>
                </div>

                <form onSubmit={handleSendNotification} className="p-5 space-y-4">
                    {feedback.text && (
                        <div className={`p-3 rounded-lg border text-xs font-semibold ${
                            feedback.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'
                        }`}>
                            {feedback.text}
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Abo rigenewe (Target Audience)</label>
                        <select 
                            value={targetRole} 
                            onChange={e => setTargetRole(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                        >
                            <option value="all">Bose Hamwe (Everyone)</option>
                            <option value="resident">Abaturage Gusa (Residents)</option>
                            <option value="collector">Abakoleteri Gusa (Collectors)</option>
                            <option value="staff">Abakozi Gusa (Recycling Staff)</option>
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Umutwe w'Itangazo (Title)</label>
                        <input 
                            type="text" 
                            value={title} 
                            onChange={e => setTitle(e.target.value)} 
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition" 
                            placeholder="Urugero: Guhindura amasaha yo gukura imyanda" 
                            required 
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Ubutumwa Nyirizina (Message)</label>
                        <textarea 
                            value={message} 
                            onChange={e => setMessage(e.target.value)} 
                            rows="4"
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition resize-none" 
                            placeholder="Andika amakuru yose hano..." 
                            required 
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Imiterere (Status)</label>
                        <select 
                            value={status} 
                            onChange={e => setStatus(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                        >
                            <option value="active">Ubu Ngubu (Active)</option>
                            <option value="urgent">Ibyihutirwa (Urgent)</option>
                        </select>
                    </div>

                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-bold shadow-sm transition disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? 'Iri kohereza...' : 'Tanga Itangazo'}
                    </button>
                </form>
            </div>

            {/* --- REGISTRY DATA LIST VIEW --- */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h3 className="font-black text-slate-800 tracking-tight text-sm sm:text-base">Amatangazo Yatanzwe</h3>
                        <p className="text-xs text-slate-400 mt-0.5">Urutonde rw'ubutumwa bwose bwanyuze muri sisitemu.</p>
                    </div>
                    <span className="bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full text-xs font-bold">
                        {notifications.length} Zose
                    </span>
                </div>

                <div className="divide-y divide-slate-100 overflow-y-auto max-h-[600px]">
                    {notifications.length === 0 ? (
                        <div className="p-12 text-center text-sm text-slate-400 font-medium">
                            <Bell className="h-8 w-8 text-slate-200 mx-auto mb-2" />
                            Nta matangazo arayandikwa muri registers.
                        </div>
                    ) : (
                        notifications.map(n => (
                            <div key={n.notification_id} className="p-5 hover:bg-slate-50/50 transition flex items-start justify-between gap-4">
                                <div className="space-y-1.5 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className={`px-2 py-0.5 border rounded-full text-[10px] font-black uppercase tracking-wider ${getRoleBadge(n.target_role)}`}>
                                            {n.target_role === 'all' ? 'Bose (All)' : n.target_role}
                                        </span>
                                        {n.status === 'urgent' && (
                                            <span className="bg-red-50 text-red-700 border border-red-100 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                                                <ShieldAlert className="h-2.5 w-2.5" /> Urgent
                                            </span>
                                        )}
                                        <span className="text-[11px] text-slate-400 font-medium">
                                            {new Date(n.created_at).toLocaleDateString('en-GB')}
                                        </span>
                                    </div>
                                    <h4 className="font-black text-slate-900 text-sm tracking-tight">{n.title}</h4>
                                    <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">{n.message}</p>
                                </div>

                                <button 
                                    onClick={() => handleDelete(n.notification_id)}
                                    className="p-2 border border-slate-100 hover:border-red-100 text-slate-400 hover:text-red-600 hover:bg-red-50/60 rounded-lg transition self-center"
                                    title="Siba ubu butumwa"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

        </div>
    );
};

export default NotificationManager;