import React, { useEffect, useState } from 'react';
import { getWasteRequests, updateWasteRequest } from '../../services/requestService';
import API from '../../services/api';
import { 
    ClipboardList, 
    Trash2, 
    CheckCircle2, 
    Clock, 
    MapPin, 
    FileText, 
    User, 
    RefreshCw, 
    AlertCircle, 
    Inbox,
    Layers,
    ChevronsRight,
    Search,
    Filter,
    Calendar,
    Truck,
    Package,
    X,
    Eye,
    ChevronDown,
    ChevronUp,
    Loader2,
    BarChart3,
    TrendingUp,
    CheckCircle,
    XCircle,
    Clock as ClockIcon
} from 'lucide-react';

const Requests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [actionId, setActionId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [wasteTypeFilter, setWasteTypeFilter] = useState('all');
    const [sortOrder, setSortOrder] = useState('newest');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        approved: 0,
        completed: 0
    });

    useEffect(() => {
        loadRequests();
    }, []);

    const loadRequests = async () => {
        setLoading(true);
        setError(false);
        try {
            const res = await getWasteRequests();
            setRequests(res.data);
            updateStats(res.data);
        } catch (err) {
            console.error("Failed to load global disposal manifest indexes:", err);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    const updateStats = (data) => {
        const pending = data.filter(r => r.status === 'pending').length;
        const approved = data.filter(r => r.status === 'approved').length;
        const completed = data.filter(r => r.status === 'completed').length;
        setStats({
            total: data.length,
            pending,
            approved,
            completed
        });
    };

    const handleStatusChange = async (id, currentRequest, newStatus) => {
        setActionId(id);
        try {
            await updateWasteRequest(id, {
                ...currentRequest,
                status: newStatus
            });
            setRequests(prev => prev.map(req => 
                req.request_id === id ? { ...req, status: newStatus } : req
            ));
            updateStats(requests.map(req => 
                req.request_id === id ? { ...req, status: newStatus } : req
            ));
        } catch (err) {
            console.error("Failed to transition lifecycle state:", err);
            alert("System error. Unable to modify disposal ticket status parameters.");
        } finally {
            setActionId(null);
        }
    };

    const handleDeleteRequest = async (id) => {
        if (window.confirm("Are you sure you want to permanently erase this waste request log from system histories?")) {
            try {
                await API.delete(`/waste-requests/${id}`);
                const updated = requests.filter(req => req.request_id !== id);
                setRequests(updated);
                updateStats(updated);
            } catch (err) {
                console.error("Failed to drop request index row:", err);
                alert("Operation failed. Could not detach asset logs from database registry.");
            }
        }
    };

    const getStatusStyles = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed':
                return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'approved':
                return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'pending':
            default:
                return 'bg-amber-50 text-amber-700 border-amber-200';
        }
    };

    const getStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed':
                return <CheckCircle2 className="h-3 w-3" />;
            case 'approved':
                return <ChevronsRight className="h-3 w-3" />;
            case 'pending':
            default:
                return <Clock className="h-3 w-3" />;
        }
    };

    const getWasteTypeColor = (type) => {
        const colors = {
            'organic': 'bg-emerald-100 text-emerald-700 border-emerald-200',
            'plastic': 'bg-blue-100 text-blue-700 border-blue-200',
            'paper': 'bg-amber-100 text-amber-700 border-amber-200',
            'glass': 'bg-purple-100 text-purple-700 border-purple-200',
            'metal': 'bg-slate-100 text-slate-700 border-slate-200',
            'electronic': 'bg-rose-100 text-rose-700 border-rose-200',
            'hazardous': 'bg-red-100 text-red-700 border-red-200'
        };
        return colors[type?.toLowerCase()] || 'bg-gray-100 text-gray-700 border-gray-200';
    };

    const getWasteTypeIcon = (type) => {
        const icons = {
            'organic': <Package className="h-3 w-3" />,
            'plastic': <Package className="h-3 w-3" />,
            'paper': <FileText className="h-3 w-3" />,
            'glass': <Package className="h-3 w-3" />,
            'metal': <Package className="h-3 w-3" />,
            'electronic': <Package className="h-3 w-3" />,
            'hazardous': <AlertCircle className="h-3 w-3" />
        };
        return icons[type?.toLowerCase()] || <Package className="h-3 w-3" />;
    };

    // Filter and sort requests
    const getFilteredRequests = () => {
        let filtered = [...requests];
        
        // Search filter
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase().trim();
            filtered = filtered.filter(req => 
                req.description?.toLowerCase().includes(term) ||
                req.location?.toLowerCase().includes(term) ||
                req.waste_type?.toLowerCase().includes(term) ||
                req.resident_id?.toString().includes(term)
            );
        }
        
        // Status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(req => req.status === statusFilter);
        }
        
        // Waste type filter
        if (wasteTypeFilter !== 'all') {
            filtered = filtered.filter(req => req.waste_type === wasteTypeFilter);
        }
        
        // Sort
        if (sortOrder === 'newest') {
            filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        } else {
            filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        }
        
        return filtered;
    };

    const filteredRequests = getFilteredRequests();
    const uniqueWasteTypes = [...new Set(requests.map(r => r.waste_type))].filter(Boolean);

    // View request details
    const viewDetails = (request) => {
        setSelectedRequest(request);
        setShowDetailModal(true);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 py-6 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-6">
                
                {/* --- HEADER --- */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
                    <div className="flex items-center space-x-4">
                        <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-3 rounded-xl shadow-lg shadow-blue-600/20">
                            <ClipboardList className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                                Waste Collection Manifests
                            </h2>
                            <p className="text-sm text-slate-500 mt-0.5">
                                Monitor active citizen requests, approve routes, and clear logistics dispatch tickets.
                            </p>
                        </div>
                    </div>
                    
                    <button 
                        onClick={loadRequests}
                        disabled={loading}
                        className="inline-flex items-center justify-center space-x-2 bg-white hover:bg-slate-50 text-slate-700 text-sm font-bold py-2.5 px-4 border border-slate-200 rounded-lg shadow-sm transition duration-150 active:scale-95 disabled:opacity-60"
                    >
                        <RefreshCw className={`h-4 w-4 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
                        <span>{loading ? 'Syncing...' : 'Sync Manifests'}</span>
                    </button>
                </div>

                {/* --- STATISTICS CARDS --- */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total</p>
                                <p className="text-2xl font-black text-slate-900">{stats.total}</p>
                            </div>
                            <div className="h-10 w-10 bg-slate-100 rounded-lg flex items-center justify-center">
                                <ClipboardList className="h-5 w-5 text-slate-600" />
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending</p>
                                <p className="text-2xl font-black text-amber-600">{stats.pending}</p>
                            </div>
                            <div className="h-10 w-10 bg-amber-50 rounded-lg flex items-center justify-center">
                                <Clock className="h-5 w-5 text-amber-600" />
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Approved</p>
                                <p className="text-2xl font-black text-blue-600">{stats.approved}</p>
                            </div>
                            <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center">
                                <ChevronsRight className="h-5 w-5 text-blue-600" />
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Completed</p>
                                <p className="text-2xl font-black text-emerald-600">{stats.completed}</p>
                            </div>
                            <div className="h-10 w-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- ERROR ALERT --- */}
                {error && (
                    <div className="flex items-center space-x-3 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                        <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                        <p className="text-sm text-red-700 font-medium flex-1">
                            Unable to pull active collection queues. Verify network connectivity link layers.
                        </p>
                        <button onClick={() => setError(false)} className="text-red-400 hover:text-red-600">
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                )}

                {/* --- SEARCH AND FILTERS --- */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1 relative">
                            <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Search by description, location, waste type, or resident ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                            />
                        </div>
                        
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="inline-flex items-center space-x-2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition"
                            >
                                <Filter className="h-4 w-4" />
                                <span>Filters</span>
                                {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </button>
                            
                            {(searchTerm || statusFilter !== 'all' || wasteTypeFilter !== 'all') && (
                                <button
                                    onClick={() => {
                                        setSearchTerm('');
                                        setStatusFilter('all');
                                        setWasteTypeFilter('all');
                                    }}
                                    className="px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>
                    
                    {showFilters && (
                        <div className="mt-3 pt-3 border-t border-slate-200">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                                        Status
                                    </label>
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    >
                                        <option value="all">All Statuses</option>
                                        <option value="pending">Pending</option>
                                        <option value="approved">Approved</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                                        Waste Type
                                    </label>
                                    <select
                                        value={wasteTypeFilter}
                                        onChange={(e) => setWasteTypeFilter(e.target.value)}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    >
                                        <option value="all">All Types</option>
                                        {uniqueWasteTypes.map(type => (
                                            <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                                        Sort Order
                                    </label>
                                    <select
                                        value={sortOrder}
                                        onChange={(e) => setSortOrder(e.target.value)}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    >
                                        <option value="newest">Newest First</option>
                                        <option value="oldest">Oldest First</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* --- DATA TABLE --- */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-4 py-4 sm:px-6 bg-gradient-to-r from-slate-50 to-white border-b border-slate-200 flex justify-between items-center">
                        <div>
                            <h3 className="text-sm font-bold text-slate-700">
                                Collection Requests
                                <span className="ml-2 text-xs font-normal text-slate-400">
                                    ({filteredRequests.length} {filteredRequests.length === 1 ? 'request' : 'requests'})
                                </span>
                            </h3>
                        </div>
                        <div className="text-xs text-slate-400">
                            {loading && <span className="flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Loading...</span>}
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        {loading ? (
                            <div className="p-12 text-center">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-t-blue-600"></div>
                                <p className="mt-3 text-sm text-slate-500">Loading manifests...</p>
                            </div>
                        ) : filteredRequests.length === 0 ? (
                            <div className="p-12 text-center">
                                <div className="inline-flex items-center justify-center h-16 w-16 bg-slate-100 rounded-full mb-4">
                                    <Inbox className="h-8 w-8 text-slate-400" />
                                </div>
                                <h3 className="text-sm font-bold text-slate-700">No requests found</h3>
                                <p className="text-sm text-slate-400 mt-1">
                                    {searchTerm || statusFilter !== 'all' || wasteTypeFilter !== 'all' 
                                        ? 'Try adjusting your filters' 
                                        : 'No waste collection requests in the system'}
                                </p>
                            </div>
                        ) : (
                            <table className="min-w-full divide-y divide-slate-200 text-sm text-left">
                                <thead className="bg-slate-50/80 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    <tr>
                                        <th className="px-4 sm:px-6 py-3">Resident</th>
                                        <th className="px-4 sm:px-6 py-3 hidden sm:table-cell">Waste Type</th>
                                        <th className="px-4 sm:px-6 py-3 hidden md:table-cell">Description</th>
                                        <th className="px-4 sm:px-6 py-3 hidden lg:table-cell">Location</th>
                                        <th className="px-4 sm:px-6 py-3">Status</th>
                                        <th className="px-4 sm:px-6 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                    {filteredRequests.map(req => (
                                        <tr key={req.request_id} className="hover:bg-slate-50/60 transition duration-150 group">
                                            
                                            {/* Resident */}
                                            <td className="px-4 sm:px-6 py-3 sm:py-4">
                                                <div className="flex items-center space-x-2">
                                                    <div className="h-8 w-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-xs">
                                                        {req.resident_id?.toString().slice(0, 2) || 'R'}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-slate-900 text-sm">
                                                            Resident #{req.resident_id}
                                                        </p>
                                                        <div className="flex items-center gap-1 text-xs text-slate-400 sm:hidden">
                                                            <span className="capitalize">{req.waste_type}</span>
                                                            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                                            <span className="truncate max-w-[80px]">{req.location}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Waste Type - Hidden on mobile */}
                                            <td className="px-4 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full border ${getWasteTypeColor(req.waste_type)}`}>
                                                    {getWasteTypeIcon(req.waste_type)}
                                                    <span className="capitalize">{req.waste_type}</span>
                                                </span>
                                            </td>

                                            {/* Description - Hidden on tablet */}
                                            <td className="px-4 sm:px-6 py-3 sm:py-4 hidden md:table-cell">
                                                <div className="flex items-start gap-1.5 max-w-xs">
                                                    <FileText className="h-3.5 w-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                                                    <p className="text-xs text-slate-600 truncate" title={req.description}>
                                                        {req.description || 'No description'}
                                                    </p>
                                                </div>
                                            </td>

                                            {/* Location - Hidden on desktop */}
                                            <td className="px-4 sm:px-6 py-3 sm:py-4 hidden lg:table-cell">
                                                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                                                    <MapPin className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                                                    <span className="truncate max-w-[150px]">{req.location}</span>
                                                </div>
                                            </td>

                                            {/* Status */}
                                            <td className="px-4 sm:px-6 py-3 sm:py-4">
                                                <span className={`inline-flex items-center gap-1 border px-2.5 py-1 rounded-full text-xs font-bold tracking-tight capitalize ${getStatusStyles(req.status)}`}>
                                                    {getStatusIcon(req.status)}
                                                    {req.status}
                                                </span>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-4 sm:px-6 py-3 sm:py-4 text-right">
                                                <div className="flex items-center justify-end space-x-1.5">
                                                    <button 
                                                        onClick={() => viewDetails(req)}
                                                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition"
                                                        title="View Details"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </button>
                                                    
                                                    {req.status === 'pending' && (
                                                        <button 
                                                            onClick={() => handleStatusChange(req.request_id, req, 'approved')}
                                                            disabled={actionId === req.request_id}
                                                            className="inline-flex items-center bg-white border border-slate-200 hover:border-slate-300 text-blue-600 px-2.5 py-1.5 rounded-lg text-xs font-bold shadow-sm transition active:scale-95 disabled:opacity-50"
                                                        >
                                                            {actionId === req.request_id ? (
                                                                <Loader2 className="h-3 w-3 animate-spin" />
                                                            ) : (
                                                                'Approve'
                                                            )}
                                                        </button>
                                                    )}

                                                    {req.status !== 'completed' && (
                                                        <button 
                                                            onClick={() => handleStatusChange(req.request_id, req, 'completed')}
                                                            disabled={actionId === req.request_id}
                                                            className="inline-flex items-center bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1.5 rounded-lg text-xs font-bold shadow-sm shadow-emerald-600/10 transition active:scale-95 disabled:opacity-50"
                                                        >
                                                            {actionId === req.request_id ? (
                                                                <Loader2 className="h-3 w-3 animate-spin" />
                                                            ) : (
                                                                'Complete'
                                                            )}
                                                        </button>
                                                    )}

                                                    <button 
                                                        onClick={() => handleDeleteRequest(req.request_id)}
                                                        disabled={actionId === req.request_id}
                                                        className="inline-flex items-center justify-center p-1.5 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition"
                                                        title="Delete Request"
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

                {/* --- DETAIL MODAL --- */}
                {showDetailModal && selectedRequest && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                            <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="bg-blue-600 p-2 rounded-lg">
                                        <ClipboardList className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900">Request Details</h3>
                                        <p className="text-xs text-slate-500">Request #{selectedRequest.request_id}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setShowDetailModal(false)}
                                    className="p-2 hover:bg-slate-100 rounded-lg transition"
                                >
                                    <X className="h-5 w-5 text-slate-500" />
                                </button>
                            </div>
                            
                            <div className="p-6 space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Resident ID</label>
                                        <p className="text-sm font-semibold text-slate-900 mt-1">#{selectedRequest.resident_id}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status</label>
                                        <p className="mt-1">
                                            <span className={`inline-flex items-center gap-1 border px-2.5 py-1 rounded-full text-xs font-bold capitalize ${getStatusStyles(selectedRequest.status)}`}>
                                                {getStatusIcon(selectedRequest.status)}
                                                {selectedRequest.status}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Waste Type</label>
                                    <p className="text-sm font-semibold text-slate-900 mt-1 capitalize">{selectedRequest.waste_type}</p>
                                </div>
                                
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Location</label>
                                    <div className="flex items-center gap-2 mt-1">
                                        <MapPin className="h-4 w-4 text-slate-400" />
                                        <p className="text-sm text-slate-700">{selectedRequest.location}</p>
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Description</label>
                                    <div className="flex items-start gap-2 mt-1">
                                        <FileText className="h-4 w-4 text-slate-400 mt-0.5" />
                                        <p className="text-sm text-slate-700">{selectedRequest.description || 'No description provided'}</p>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Created At</label>
                                        <p className="text-sm text-slate-700 mt-1">
                                            {selectedRequest.created_at ? new Date(selectedRequest.created_at).toLocaleString() : 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Last Updated</label>
                                        <p className="text-sm text-slate-700 mt-1">
                                            {selectedRequest.updated_at ? new Date(selectedRequest.updated_at).toLocaleString() : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="pt-4 border-t border-slate-200 flex flex-wrap gap-2">
                                    {selectedRequest.status === 'pending' && (
                                        <button 
                                            onClick={() => {
                                                handleStatusChange(selectedRequest.request_id, selectedRequest, 'approved');
                                                setShowDetailModal(false);
                                            }}
                                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-bold transition"
                                        >
                                            Approve Request
                                        </button>
                                    )}
                                    {selectedRequest.status !== 'completed' && (
                                        <button 
                                            onClick={() => {
                                                handleStatusChange(selectedRequest.request_id, selectedRequest, 'completed');
                                                setShowDetailModal(false);
                                            }}
                                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-lg text-sm font-bold transition"
                                        >
                                            Mark as Completed
                                        </button>
                                    )}
                                    <button 
                                        onClick={() => {
                                            handleDeleteRequest(selectedRequest.request_id);
                                            setShowDetailModal(false);
                                        }}
                                        className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-bold transition"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- FOOTER --- */}
                <div className="text-center text-xs text-slate-400 border-t border-slate-200 pt-6">
                    <p>Waste collection manifest system • All requests are tracked and audited</p>
                </div>
            </div>
        </div>
    );
};

export default Requests;