import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Send, 
  Trash2, 
  CheckCircle, 
  Users, 
  AlertCircle, 
  Clock, 
  UserCheck,
  RefreshCw,
  Search,
  Filter,
  X,
  Loader2,
  ChevronDown,
  ChevronUp,
  Calendar,
  Tag,
  Eye,
  EyeOff,
  Inbox,
  User,
  Shield,
  Truck,
  Home,
  Recycle,
  BarChart3,
  TrendingUp,
  PieChart
} from 'lucide-react';

const NotificationPage = () => {
  // --- STATE MANAGEMENT ---
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [showStats, setShowStats] = useState(true);
  
  // Form State matching your 8 database columns
  const [formData, setFormData] = useState({
    user_id: 0,
    title: '',
    message: '',
    status: 'unread',
    target_role: 'all',
    is_read: 0
  });

  // Stats state
  const [stats, setStats] = useState({
    total: 0,
    read: 0,
    unread: 0,
    byRole: {}
  });

  // --- 1. FETCH NOTIFICATIONS (GET) ---
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/notifications');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Failed to fetch notifications.');
      }
      
      setNotifications(Array.isArray(data) ? data : []);
      updateStats(Array.isArray(data) ? data : []);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // --- 2. UPDATE STATISTICS ---
  const updateStats = (data) => {
    const read = data.filter(n => n.status === 'read' || n.is_read === 1).length;
    const unread = data.filter(n => n.status === 'unread' || n.is_read === 0).length;
    
    const byRole = {};
    data.forEach(n => {
      const role = n.target_role || 'all';
      byRole[role] = (byRole[role] || 0) + 1;
    });

    setStats({
      total: data.length,
      read,
      unread,
      byRole
    });
  };

  // --- 3. HANDLE INPUT CHANGES ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'user_id' || name === 'is_read' ? Number(value) : value
    });
  };

  // --- 4. CREATE NOTIFICATION (POST) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitSuccess('');
    setError('');

    if (!formData.title || !formData.message) {
      setError('Please fill in both title and message.');
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.details || data.error || 'Failed to send notification.');

      setSubmitSuccess('Notification broadcasted successfully!');
      setFormData({ user_id: 0, title: '', message: '', status: 'unread', target_role: 'all', is_read: 0 });
      fetchNotifications();
      
      setTimeout(() => setSubmitSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  // --- 5. MARK AS READ (PUT / UPDATE) ---
  const handleMarkAsRead = async (id, currentTitle, currentMessage) => {
    setSubmitSuccess('');
    setError('');
    try {
      const response = await fetch(`http://localhost:5000/api/notifications/read/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: currentTitle,
          message: currentMessage,
          status: 'read',
          is_read: 1
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update notification.');

      setSubmitSuccess('Notification marked as read.');
      fetchNotifications();
      setTimeout(() => setSubmitSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  // --- 6. DELETE NOTIFICATION (DELETE) ---
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this notification?')) return;
    
    setSubmitSuccess('');
    setError('');
    try {
      const response = await fetch(`http://localhost:5000/api/notifications/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to delete notification.');

      setSubmitSuccess('Notification removed successfully.');
      fetchNotifications();
      setTimeout(() => setSubmitSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  // --- 7. BULK DELETE ---
  const handleBulkDelete = async () => {
    if (!window.confirm('Delete all notifications? This action cannot be undone.')) return;
    
    try {
      const deletePromises = notifications.map(n => 
        fetch(`http://localhost:5000/api/notifications/${n.notification_id}`, { method: 'DELETE' })
      );
      await Promise.all(deletePromises);
      setSubmitSuccess('All notifications cleared.');
      fetchNotifications();
      setTimeout(() => setSubmitSuccess(''), 3000);
    } catch (err) {
      setError('Failed to clear all notifications.');
    }
  };

  // --- 8. MARK ALL AS READ ---
  const handleMarkAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => n.status !== 'read' && n.is_read !== 1);
      const updatePromises = unreadNotifications.map(n =>
        fetch(`http://localhost:5000/api/notifications/read/${n.notification_id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: n.title,
            message: n.message,
            status: 'read',
            is_read: 1
          }),
        })
      );
      await Promise.all(updatePromises);
      setSubmitSuccess('All notifications marked as read.');
      fetchNotifications();
      setTimeout(() => setSubmitSuccess(''), 3000);
    } catch (err) {
      setError('Failed to mark all as read.');
    }
  };

  // --- 9. FILTER AND SORT ---
  const getFilteredNotifications = () => {
    let filtered = [...notifications];
    
    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(n => 
        n.title?.toLowerCase().includes(term) ||
        n.message?.toLowerCase().includes(term) ||
        n.target_role?.toLowerCase().includes(term)
      );
    }
    
    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(n => 
        statusFilter === 'read' ? (n.status === 'read' || n.is_read === 1) : (n.status === 'unread' || n.is_read === 0)
      );
    }
    
    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(n => n.target_role === roleFilter);
    }
    
    // Sort
    if (sortOrder === 'newest') {
      filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else {
      filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    }
    
    return filtered;
  };

  const filteredNotifications = getFilteredNotifications();

  // --- 10. ROLE ICON HELPER ---
  const getRoleIcon = (role) => {
    const icons = {
      'all': <Users className="h-3.5 w-3.5" />,
      'resident': <Home className="h-3.5 w-3.5" />,
      'collector': <Truck className="h-3.5 w-3.5" />,
      'recycling_staff': <Recycle className="h-3.5 w-3.5" />
    };
    return icons[role] || <User className="h-3.5 w-3.5" />;
  };

  const getRoleLabel = (role) => {
    const labels = {
      'all': 'All Users',
      'resident': 'Residents',
      'collector': 'Collectors',
      'recycling_staff': 'Recycling Staff'
    };
    return labels[role] || role;
  };

  const uniqueRoles = [...new Set(notifications.map(n => n.target_role))].filter(Boolean);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 p-3 rounded-xl shadow-lg shadow-emerald-600/20">
              <Bell className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Notification Control Hub
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Manage broad communication alerts across roles and users
                {stats.unread > 0 && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                    {stats.unread} unread
                  </span>
                )}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={fetchNotifications}
              disabled={loading}
              className="inline-flex items-center space-x-2 bg-white hover:bg-slate-50 text-slate-700 text-sm font-bold py-2.5 px-4 border border-slate-200 rounded-lg shadow-sm transition duration-150 active:scale-95 disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{loading ? 'Loading...' : 'Refresh'}</span>
            </button>
          </div>
        </div>

        {/* --- ALERTS --- */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm font-semibold text-red-800 flex-1">{error}</p>
            <button onClick={() => setError('')} className="text-red-400 hover:text-red-600">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        
        {submitSuccess && (
          <div className="mt-6 p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-lg flex items-start space-x-3">
            <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm font-medium text-emerald-800 flex-1">{submitSuccess}</p>
            <button onClick={() => setSubmitSuccess('')} className="text-emerald-400 hover:text-emerald-600">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* --- STATISTICS CARDS --- */}
        {showStats && (
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total</p>
                  <p className="text-2xl font-black text-slate-900">{stats.total}</p>
                </div>
                <div className="h-10 w-10 bg-slate-100 rounded-lg flex items-center justify-center">
                  <Bell className="h-5 w-5 text-slate-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Read</p>
                  <p className="text-2xl font-black text-emerald-600">{stats.read}</p>
                </div>
                <div className="h-10 w-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                  <Eye className="h-5 w-5 text-emerald-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Unread</p>
                  <p className="text-2xl font-black text-blue-600">{stats.unread}</p>
                </div>
                <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <EyeOff className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Roles</p>
                  <p className="text-2xl font-black text-purple-600">{Object.keys(stats.byRole).length}</p>
                </div>
                <div className="h-10 w-10 bg-purple-50 rounded-lg flex items-center justify-center">
                  <PieChart className="h-5 w-5 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- MAIN GRID --- */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* --- LEFT COLUMN: Compose Form --- */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-white">
              <h2 className="text-sm font-black text-slate-700 flex items-center gap-2">
                <Send className="h-4 w-4 text-emerald-600" />
                Compose Message
              </h2>
              <p className="text-[10px] text-slate-400 mt-0.5">Send alerts to specific users or role groups</p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  User Scope ID
                </label>
                <input 
                  type="number" 
                  name="user_id" 
                  value={formData.user_id} 
                  onChange={handleInputChange} 
                  placeholder="0 for global broadcast"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm transition"
                  required 
                />
                <p className="text-[10px] text-slate-400 mt-1">Use "0" for role-based broadcasts</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Subject <span className="text-red-400">*</span>
                </label>
                <input 
                  type="text" 
                  name="title" 
                  value={formData.title} 
                  onChange={handleInputChange} 
                  placeholder="e.g., Schedule Route Changes"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm transition"
                  required 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Message <span className="text-red-400">*</span>
                </label>
                <textarea 
                  name="message" 
                  value={formData.message} 
                  onChange={handleInputChange} 
                  placeholder="Type your broadcast message here..." 
                  rows="4"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm transition resize-none"
                  required 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Target Audience
                </label>
                <select 
                  name="target_role" 
                  value={formData.target_role} 
                  onChange={handleInputChange} 
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm transition"
                >
                  <option value="all">All Users</option>
                  <option value="resident">Residents</option>
                  <option value="collector">Collectors</option>
                  <option value="recycling_staff">Recycling Staff</option>
                </select>
              </div>

              <button 
                type="submit" 
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-4 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition shadow-sm shadow-emerald-600/20 active:scale-[0.99]"
              >
                <Send className="h-4 w-4" />
                Publish Notification
              </button>
            </form>
          </div>

          {/* --- RIGHT COLUMN: Notification Feed --- */}
          <div className="lg:col-span-2">
            {/* Feed Header with Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-slate-400" />
                <h2 className="text-sm font-bold text-slate-700">Live Feed</h2>
                <span className="text-xs bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full">
                  {filteredNotifications.length}
                </span>
              </div>
              
              <div className="flex flex-wrap items-center gap-2">
                {stats.unread > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1 rounded-lg transition"
                  >
                    Mark all read
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={handleBulkDelete}
                    className="text-xs font-medium text-red-500 hover:text-red-600 hover:bg-red-50 px-3 py-1 rounded-lg transition"
                  >
                    Clear all
                  </button>
                )}
                <button
                  onClick={() => setShowStats(!showStats)}
                  className="text-xs font-medium text-slate-400 hover:text-slate-600 hover:bg-slate-100 px-3 py-1 rounded-lg transition"
                >
                  {showStats ? 'Hide Stats' : 'Show Stats'}
                </button>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search notifications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  />
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition"
                  >
                    <Filter className="h-4 w-4" />
                    <span className="hidden sm:inline">Filters</span>
                    {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                  
                  {(searchTerm || statusFilter !== 'all' || roleFilter !== 'all') && (
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setStatusFilter('all');
                        setRoleFilter('all');
                      }}
                      className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
              
              {showFilters && (
                <div className="mt-3 pt-3 border-t border-slate-200">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                        Status
                      </label>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      >
                        <option value="all">All Statuses</option>
                        <option value="read">Read</option>
                        <option value="unread">Unread</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                        Role
                      </label>
                      <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      >
                        <option value="all">All Roles</option>
                        {uniqueRoles.map(role => (
                          <option key={role} value={role}>{getRoleLabel(role)}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                        Sort
                      </label>
                      <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Notification List */}
            {loading ? (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                <Loader2 className="h-8 w-8 text-emerald-600 animate-spin mx-auto mb-3" />
                <p className="text-sm text-slate-500">Loading notifications...</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                <div className="inline-flex items-center justify-center h-16 w-16 bg-slate-100 rounded-full mb-4">
                  <Inbox className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-sm font-bold text-slate-700">No notifications found</h3>
                <p className="text-sm text-slate-400 mt-1">
                  {searchTerm || statusFilter !== 'all' || roleFilter !== 'all' 
                    ? 'Try adjusting your filters' 
                    : 'No notifications in the system'}
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1 custom-scrollbar">
                {filteredNotifications.map((notif) => {
                  const isRead = notif.status === 'read' || notif.is_read === 1;
                  return (
                    <div 
                      key={notif.notification_id} 
                      className={`p-5 rounded-xl border transition-all duration-200 shadow-sm hover:shadow-md ${
                        isRead 
                          ? 'bg-white border-slate-200 opacity-80' 
                          : 'bg-gradient-to-r from-blue-50/60 to-white border-blue-200 ring-1 ring-blue-100'
                      }`}
                    >
                      {/* Header Row */}
                      <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          {getRoleIcon(notif.target_role || 'all')}
                          <h3 className={`font-bold text-sm ${isRead ? 'text-slate-700' : 'text-slate-900'}`}>
                            {notif.title || 'No Title'}
                          </h3>
                          {!isRead && (
                            <span className="text-[9px] font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full animate-pulse">
                              NEW
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 whitespace-nowrap">
                          <Clock className="h-3 w-3" />
                          <span>
                            {notif.created_at 
                              ? new Date(notif.created_at).toLocaleString([], {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })
                              : '--'}
                          </span>
                        </div>
                      </div>

                      {/* Message */}
                      <p className={`text-sm mb-3 ${isRead ? 'text-slate-500' : 'text-slate-600'}`}>
                        {notif.message || 'No message content available.'}
                      </p>
                      
                      {/* Bottom Bar */}
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center border-t border-slate-100 pt-3 gap-3">
                        <div className="flex flex-wrap gap-2 text-xs font-medium text-slate-500">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-slate-100 rounded-md">
                            <Tag className="h-3 w-3" />
                            {getRoleLabel(notif.target_role || 'all')}
                          </span>
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-slate-100 rounded-md">
                            <User className="h-3 w-3" />
                            UID: {notif.user_id === 0 ? 'Broadcast' : notif.user_id}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-md font-bold uppercase tracking-wider text-[10px] ${
                            isRead ? 'bg-slate-100 text-slate-400' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {isRead ? 'Read' : 'Unread'}
                          </span>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex items-center gap-1.5 self-end sm:self-auto">
                          {!isRead && (
                            <button 
                              onClick={() => handleMarkAsRead(notif.notification_id, notif.title, notif.message)} 
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition shadow-sm"
                            >
                              <CheckCircle className="h-3 w-3" />
                              <span>Read</span>
                            </button>
                          )}
                          <button 
                            onClick={() => handleDelete(notif.notification_id)} 
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition"
                          >
                            <Trash2 className="h-3 w-3" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* --- FOOTER --- */}
        <div className="mt-8 text-center text-xs text-slate-400 border-t border-slate-200 pt-6">
          <p>Notification management system • All broadcasts are tracked and logged</p>
        </div>
      </div>
    </div>
  );
};

export default NotificationPage;