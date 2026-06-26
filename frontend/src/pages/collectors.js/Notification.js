import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/authcontext';
import { 
    Bell, Send, Trash2, Edit3, ShieldAlert, Users, SendToBack, 
    AlertCircle, Check, X, Inbox, MessageSquare, Clock, 
    UserCheck, Filter, Search, ChevronDown, ChevronUp,
    Loader2, Calendar, Tag, Eye, Archive, Reply, RefreshCw
} from 'lucide-react';

const CollectorNotification = () => {
    const { user } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('inbox');
    const [inboxFilter, setInboxFilter] = useState('admin');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState('newest');
    const [showFilters, setShowFilters] = useState(false);
    
    // Form States
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [currentEditId, setCurrentEditId] = useState(null);

    // Data States
    const [adminNotifications, setAdminNotifications] = useState([]); 
    const [teamNotifications, setTeamNotifications] = useState([]);  
    const [sentNotifications, setSentNotifications] = useState([]);  
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [unreadCount, setUnreadCount] = useState(0);

    // 1. FETCH INBOX DATA
    const fetchInboxData = async () => {
        try {
            const resAdmin = await fetch(`http://localhost:5000/api/notifications/admin`);
            if (resAdmin.ok) {
                const dataAdmin = await resAdmin.json();
                setAdminNotifications(Array.isArray(dataAdmin) ? dataAdmin : []);
            }

            const resTeam = await fetch(`http://localhost:5000/api/notifications/team`);
            if (resTeam.ok) {
                const dataTeam = await resTeam.json();
                setTeamNotifications(Array.isArray(dataTeam) ? dataTeam : []);
            }

            // Calculate unread count
            const allUnread = [
                ...(Array.isArray(adminNotifications) ? adminNotifications : []),
                ...(Array.isArray(teamNotifications) ? teamNotifications : [])
            ].filter(n => !n.is_read).length;
            setUnreadCount(allUnread);
        } catch (err) { 
            setError('Failed to fetch notifications.'); 
        }
    };

    // 2. FETCH SENT DATA
    const fetchSentData = async () => {
        if (!user?.id) return;
        try {
            const res = await fetch(`http://localhost:5000/api/my-sent-notifications/${user.id}`);
            const data = await res.json();
            setSentNotifications(Array.isArray(data) ? data : []);
        } catch (err) { 
            setError('Failed to fetch sent notifications.'); 
        }
    };

    useEffect(() => {
        if (user?.id) {
            fetchInboxData();
            fetchSentData();
        }
    }, [user]);

    // 3. SUBMIT NOTIFICATION (CREATE OR UPDATE)
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title || !message) {
            setError('Please fill in both title and message.');
            setTimeout(() => setError(''), 3000);
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            if (isEditing) {
                const res = await fetch(`http://localhost:5000/api/notifications/update/${currentEditId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ title, message })
                });
                if (res.ok) {
                    setSuccess('Notification updated successfully!');
                    setIsEditing(false);
                    setCurrentEditId(null);
                }
            } else {
                await fetch('http://localhost:5000/api/collector-notifications', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sender_id: user.id, title, message })
                });
                setSuccess('Notification sent successfully!');
            }
            setTitle('');
            setMessage('');
            fetchSentData();
            fetchInboxData();
            
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('Operation failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // 4. START EDIT
    const startEdit = (item) => {
        setIsEditing(true);
        setCurrentEditId(item.notification_id);
        setTitle(item.title || '');
        setMessage(item.message || '');
    };

    // 5. DELETE NOTIFICATION
    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this notification permanently?")) return;
        
        try {
            const res = await fetch(`http://localhost:5000/api/notifications/delete/${id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                setSuccess('Notification deleted successfully!');
                setSentNotifications(sentNotifications.filter(n => n.notification_id !== id));
                fetchInboxData();
                setTimeout(() => setSuccess(''), 3000);
            }
        } catch (err) {
            setError('Delete operation failed.');
        }
    };

    // 6. MARK AS READ
    const markAsRead = async (id) => {
        try {
            await fetch(`http://localhost:5000/api/notifications/read/${id}`, {
                method: 'PUT'
            });
            fetchInboxData();
        } catch (err) {
            console.error('Failed to mark as read');
        }
    };

    // 7. FILTER AND SORT NOTIFICATIONS
    const getFilteredNotifications = (notifications) => {
        let filtered = [...notifications];
        
        // Search filter
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase().trim();
            filtered = filtered.filter(n => 
                n.title?.toLowerCase().includes(term) ||
                n.message?.toLowerCase().includes(term)
            );
        }
        
        // Sort
        if (sortOrder === 'newest') {
            filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        } else {
            filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        }
        
        return filtered;
    };

    const filteredAdmin = getFilteredNotifications(adminNotifications);
    const filteredTeam = getFilteredNotifications(teamNotifications);
    const filteredSent = getFilteredNotifications(sentNotifications);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 py-6 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto space-y-6">
                
                {/* --- HEADER --- */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
                    <div className="flex items-center space-x-4">
                        <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-3 rounded-xl shadow-lg shadow-blue-600/20">
                            <Bell className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                                Notifications Center
                            </h1>
                            <p className="text-sm text-slate-500 mt-0.5">
                                Manage communications and team alerts
                                {unreadCount > 0 && (
                                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                                        {unreadCount} unread
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => {
                                fetchInboxData();
                                fetchSentData();
                            }}
                            disabled={loading}
                            className="inline-flex items-center space-x-2 bg-white hover:bg-slate-50 text-slate-700 text-sm font-bold py-2 px-4 border border-slate-200 rounded-lg shadow-sm transition duration-150 active:scale-95 disabled:opacity-60"
                        >
                            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                            <span className="hidden sm:inline">Refresh</span>
                        </button>
                    </div>
                </div>

                {/* --- ALERTS --- */}
                {error && (
                    <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-start space-x-3">
                        <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                        <p className="text-sm font-semibold text-red-800 flex-1">{error}</p>
                        <button onClick={() => setError('')} className="text-red-400 hover:text-red-600">
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                )}
                
                {success && (
                    <div className="p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-lg flex items-start space-x-3">
                        <Check className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <p className="text-sm font-medium text-emerald-800 flex-1">{success}</p>
                        <button onClick={() => setSuccess('')} className="text-emerald-400 hover:text-emerald-600">
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                )}

                {/* --- MAIN NAVIGATION TABS --- */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-slate-200">
                        <div className="flex space-x-1">
                            <button 
                                onClick={() => setActiveTab('inbox')}
                                className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
                                    activeTab === 'inbox' 
                                        ? 'bg-blue-600 text-white shadow-sm' 
                                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                                }`}
                            >
                                <span className="flex items-center gap-2">
                                    <Inbox className="h-4 w-4" />
                                    Inbox
                                    {unreadCount > 0 && (
                                        <span className="inline-flex items-center justify-center h-5 w-5 bg-white/20 rounded-full text-[10px]">
                                            {unreadCount}
                                        </span>
                                    )}
                                </span>
                            </button>
                            <button 
                                onClick={() => setActiveTab('sent')}
                                className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
                                    activeTab === 'sent' 
                                        ? 'bg-blue-600 text-white shadow-sm' 
                                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                                }`}
                            >
                                <span className="flex items-center gap-2">
                                    <Send className="h-4 w-4" />
                                    Sent & Compose
                                </span>
                            </button>
                        </div>
                        
                        {activeTab === 'inbox' && (
                            <div className="flex items-center gap-2 mt-2 sm:mt-0">
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
                                >
                                    <Filter className="h-4 w-4" />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* --- TAB 1: INBOX --- */}
                    {activeTab === 'inbox' && (
                        <div className="p-4 space-y-4">
                            {/* Search and Filters */}
                            <div className="space-y-3">
                                <div className="relative">
                                    <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                                    <input
                                        type="text"
                                        placeholder="Search notifications..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                                    />
                                </div>
                                
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={() => setInboxFilter('admin')}
                                        className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                                            inboxFilter === 'admin' 
                                                ? 'bg-amber-100 text-amber-700 border-amber-200' 
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                    >
                                        <ShieldAlert className="h-3.5 w-3.5" />
                                        <span>Admin ({filteredAdmin.length})</span>
                                    </button>
                                    <button
                                        onClick={() => setInboxFilter('team')}
                                        className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                                            inboxFilter === 'team' 
                                                ? 'bg-blue-100 text-blue-700 border-blue-200' 
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                    >
                                        <Users className="h-3.5 w-3.5" />
                                        <span>Team ({filteredTeam.length})</span>
                                    </button>
                                    
                                    <div className="flex-1"></div>
                                    
                                    <button
                                        onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
                                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                                    >
                                        <Clock className="h-3.5 w-3.5" />
                                        {sortOrder === 'newest' ? 'Newest' : 'Oldest'}
                                        {sortOrder === 'newest' ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
                                    </button>
                                    
                                    {(searchTerm || inboxFilter !== 'admin') && (
                                        <button
                                            onClick={() => {
                                                setSearchTerm('');
                                                setInboxFilter('admin');
                                            }}
                                            className="text-xs text-red-500 hover:text-red-700 font-medium"
                                        >
                                            Clear
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Notifications List */}
                            <div className="space-y-3">
                                {inboxFilter === 'admin' ? (
                                    filteredAdmin.length > 0 ? (
                                        filteredAdmin.map((msg) => (
                                            <div 
                                                key={msg.notification_id} 
                                                className={`p-4 bg-amber-50/40 border border-amber-200/60 rounded-xl shadow-sm relative overflow-hidden transition hover:shadow-md ${
                                                    !msg.is_read ? 'border-l-4 border-l-amber-500' : ''
                                                }`}
                                                onClick={() => !msg.is_read && markAsRead(msg.notification_id)}
                                            >
                                                <div className="absolute top-0 left-0 bottom-0 w-1 bg-amber-500" />
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <span className="text-[9px] uppercase font-black tracking-widest text-amber-600 bg-amber-100 px-2 py-0.5 rounded">
                                                                Official Announcement
                                                            </span>
                                                            {!msg.is_read && (
                                                                <span className="text-[9px] font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full animate-pulse">
                                                                    New
                                                                </span>
                                                            )}
                                                        </div>
                                                        <h3 className="text-sm font-bold text-slate-900 mt-2">{msg.title || 'No Title'}</h3>
                                                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">{msg.message || 'No Content'}</p>
                                                        <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-400">
                                                            <span className="flex items-center gap-1">
                                                                <Calendar className="h-3 w-3" />
                                                                {msg.created_at ? new Date(msg.created_at).toLocaleString() : ''}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <Eye className="h-3 w-3" />
                                                                {msg.is_read ? 'Read' : 'Unread'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            markAsRead(msg.notification_id);
                                                        }}
                                                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                        title="Mark as read"
                                                    >
                                                        <Check className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-12">
                                            <Inbox className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                                            <p className="text-sm text-slate-400 font-medium">No admin announcements</p>
                                            <p className="text-xs text-slate-300 mt-1">All clear from headquarters</p>
                                        </div>
                                    )
                                ) : (
                                    filteredTeam.length > 0 ? (
                                        filteredTeam.map((msg) => (
                                            <div 
                                                key={msg.notification_id} 
                                                className={`p-4 bg-white border border-slate-200 rounded-xl shadow-sm relative overflow-hidden transition hover:shadow-md ${
                                                    !msg.is_read ? 'border-l-4 border-l-blue-500' : ''
                                                }`}
                                                onClick={() => !msg.is_read && markAsRead(msg.notification_id)}
                                            >
                                                <div className="absolute top-0 left-0 bottom-0 w-1 bg-blue-500" />
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <span className="text-[9px] uppercase font-black tracking-widest text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                                                                Team Update
                                                            </span>
                                                            {!msg.is_read && (
                                                                <span className="text-[9px] font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full animate-pulse">
                                                                    New
                                                                </span>
                                                            )}
                                                        </div>
                                                        <h3 className="text-sm font-bold text-slate-900 mt-2">{msg.title || 'Team Alert'}</h3>
                                                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">{msg.message || 'No Content'}</p>
                                                        <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-400">
                                                            <span className="flex items-center gap-1">
                                                                <Calendar className="h-3 w-3" />
                                                                {msg.created_at ? new Date(msg.created_at).toLocaleString() : ''}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <UserCheck className="h-3 w-3" />
                                                                From: {msg.sender_name || 'Team Member'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            markAsRead(msg.notification_id);
                                                        }}
                                                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                        title="Mark as read"
                                                    >
                                                        <Check className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-12">
                                            <Users className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                                            <p className="text-sm text-slate-400 font-medium">No team messages</p>
                                            <p className="text-xs text-slate-300 mt-1">Stay tuned for updates from colleagues</p>
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                    )}

                    {/* --- TAB 2: SENT & COMPOSE --- */}
                    {activeTab === 'sent' && (
                        <div className="p-4">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Compose Form */}
                                <div className="lg:col-span-1">
                                    <div className="bg-gradient-to-br from-blue-50 to-white p-5 rounded-xl border border-blue-100 shadow-sm">
                                        <h3 className="text-xs font-black uppercase text-blue-600 tracking-wider flex items-center gap-2">
                                            {isEditing ? (
                                                <><Edit3 className="h-4 w-4" /> Edit Notification</>
                                            ) : (
                                                <><Send className="h-4 w-4" /> Compose New</>
                                            )}
                                        </h3>
                                        <p className="text-[10px] text-slate-400 mt-1 mb-4">
                                            {isEditing ? 'Update your existing notification' : 'Send an alert to your team members'}
                                        </p>
                                        
                                        <form onSubmit={handleSubmit} className="space-y-4">
                                            <div>
                                                <label className="text-xs font-bold text-slate-600 block mb-1">
                                                    Subject <span className="text-red-400">*</span>
                                                </label>
                                                <input 
                                                    type="text" 
                                                    value={title} 
                                                    onChange={(e) => setTitle(e.target.value)}
                                                    placeholder="e.g., Road closure update"
                                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-600 block mb-1">
                                                    Message <span className="text-red-400">*</span>
                                                </label>
                                                <textarea 
                                                    value={message} 
                                                    onChange={(e) => setMessage(e.target.value)}
                                                    placeholder="Type your message here..."
                                                    rows="4"
                                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition resize-none"
                                                    required
                                                />
                                            </div>
                                            <div className="flex gap-2">
                                                <button 
                                                    type="submit" 
                                                    disabled={loading}
                                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition shadow-sm shadow-blue-600/20 disabled:opacity-60"
                                                >
                                                    {loading ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : isEditing ? (
                                                        <><Check className="h-4 w-4" /> Update</>
                                                    ) : (
                                                        <><Send className="h-4 w-4" /> Send</>
                                                    )}
                                                </button>
                                                {isEditing && (
                                                    <button 
                                                        type="button"
                                                        onClick={() => { 
                                                            setIsEditing(false); 
                                                            setTitle(''); 
                                                            setMessage(''); 
                                                        }}
                                                        className="px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-bold transition"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </form>
                                    </div>
                                </div>

                                {/* Sent Notifications List */}
                                <div className="lg:col-span-2">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-2">
                                            <SendToBack className="h-4 w-4" />
                                            Sent Items ({filteredSent.length})
                                        </h3>
                                        {filteredSent.length > 0 && (
                                            <button
                                                onClick={() => {
                                                    if (window.confirm('Delete all sent notifications?')) {
                                                        // Bulk delete logic here
                                                    }
                                                }}
                                                className="text-xs text-red-500 hover:text-red-700 font-medium"
                                            >
                                                Clear All
                                            </button>
                                        )}
                                    </div>
                                    
                                    <div className="space-y-3">
                                        {filteredSent.map((msg) => (
                                            <div key={msg.notification_id} className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <Tag className="h-3.5 w-3.5 text-slate-400" />
                                                        <h4 className="text-sm font-bold text-slate-900 truncate">{msg.title || 'No Title'}</h4>
                                                    </div>
                                                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{msg.message || 'No Content'}</p>
                                                    <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-400">
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="h-3 w-3" />
                                                            {msg.created_at ? new Date(msg.created_at).toLocaleString() : ''}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <UserCheck className="h-3 w-3" />
                                                            Sent by you
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 flex-shrink-0">
                                                    <button 
                                                        onClick={() => startEdit(msg)}
                                                        className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-blue-600 transition"
                                                        title="Edit"
                                                    >
                                                        <Edit3 className="h-4 w-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(msg.notification_id)}
                                                        className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600 transition"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        
                                        {filteredSent.length === 0 && (
                                            <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-200 border-dashed">
                                                <SendToBack className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                                                <p className="text-sm text-slate-400 font-medium">No sent notifications</p>
                                                <p className="text-xs text-slate-300 mt-1">Your sent messages will appear here</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CollectorNotification;