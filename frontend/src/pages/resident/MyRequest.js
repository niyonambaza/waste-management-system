import React, { useEffect, useState, useContext } from 'react';
import { getWasteRequests } from '../../services/requestService';
import { AuthContext } from '../../context/authcontext';
import API from '../../services/api';
import { 
    ClipboardList, 
    Search, 
    Filter, 
    Trash2, 
    MapPin, 
    Clock, 
    CheckCircle2, 
    ChevronsRight, 
    RefreshCw, 
    Inbox, 
    FileText 
} from 'lucide-react';

const MyRequest = () => {
    const { user } = useContext(AuthContext);
    const [myRequests, setMyRequests] = useState([]);
    const [filteredRequests, setFilteredRequests] = useState([]);
    
    // Core functional feature states
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (user?.id) {
            loadUserRequests();
        }
    }, [user?.id]);

    // Live filtering pipeline execution handler
    useEffect(() => {
        let updateList = myRequests.filter(req => 
            req.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            req.waste_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            req.location?.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (statusFilter !== 'all') {
            updateList = updateList.filter(req => req.status?.toLowerCase() === statusFilter.toLowerCase());
        }

        setFilteredRequests(updateList);
    }, [searchTerm, statusFilter, myRequests]);

    const loadUserRequests = async () => {
        setLoading(true);
        setError(false);
        try {
            const res = await getWasteRequests();
            // Client side sorting isolation layer targeting active resident account
            const personalLogs = res.data.filter(req => req.resident_id === user.id);
            setMyRequests(personalLogs);
            setFilteredRequests(personalLogs);
        } catch (err) {
            console.error("Could not fetch personal request index:", err);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelRequest = async (id) => {
        if (window.confirm("Are you sure you want to cancel and delete this pending collection request?")) {
            try {
                await API.delete(`/waste-requests/${id}`);
                setMyRequests(prev => prev.filter(req => req.request_id !== id));
            } catch (err) {
                console.error("Cancellation request rejected by core:", err);
                alert("Unable to drop order request. Please reload and try again.");
            }
        }
    };

    const getBadgeStyle = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
            case 'approved': return 'bg-blue-50 text-blue-700 border-blue-100';
            case 'pending': default: return 'bg-amber-50 text-amber-700 border-amber-100';
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
            
            {/* --- WORKSPACE IDENTIFIER SECTION --- */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
                        My Collection History
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                        Track current manifests processing status, review landmarks, or retract open tickets.
                    </p>
                </div>
                
                <button 
                    onClick={loadUserRequests}
                    disabled={loading}
                    className="inline-flex items-center justify-center space-x-2 bg-white hover:bg-slate-50 text-slate-700 text-sm font-bold py-2 px-4 border border-slate-200 rounded-lg shadow-sm transition active:scale-95"
                >
                    <RefreshCw className={`h-4 w-4 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
                    <span>Refresh Tickets</span>
                </button>
            </div>

            {/* --- UTILITY FILTER CONTROLS HUB --- */}
            <div className="flex flex-col md:flex-row items-center gap-3 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <div className="relative w-full md:flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input 
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by descriptions, waste variants, locations..."
                        className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition placeholder-slate-400"
                    />
                </div>
                
                <div className="flex items-center space-x-2 w-full md:w-auto">
                    <Filter className="h-4 w-4 text-slate-400 hidden sm:block" />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full md:w-44 px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-medium text-slate-700"
                    >
                        <option value="all">All Lifecycles</option>
                        <option value="pending">Pending Review</option>
                        <option value="approved">Approved Orders</option>
                        <option value="completed">Completed History</option>
                    </select>
                </div>
            </div>

            {/* --- LAYOUT COLLECTION MATRIX INTERFACE --- */}
            {loading ? (
                /* Dynamic Grid Placeholder Skeletons */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2].map(item => (
                        <div key={item} className="p-5 bg-white border border-slate-100 rounded-xl space-y-4 animate-pulse">
                            <div className="flex justify-between"><div className="h-4 w-20 bg-slate-100 rounded" /><div className="h-5 w-16 bg-slate-50 rounded-full" /></div>
                            <div className="h-4 w-full bg-slate-100 rounded" />
                            <div className="h-3 w-28 bg-slate-50 rounded" />
                        </div>
                    ))}
                </div>
            ) : filteredRequests.length === 0 ? (
                /* Enhanced Empty Fallback Interface */
                <div className="flex flex-col items-center justify-center text-center p-12 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                    <div className="h-12 w-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 mb-3">
                        <Inbox className="h-6 w-6" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-700">No Orders Matched</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm">
                        {myRequests.length === 0 
                            ? "You haven't logged any disposal manifest orders into EcoTrack yet." 
                            : "No logged items coordinate with your search filter requirements."}
                    </p>
                </div>
            ) : (
                /* Interactive Personal Cards Blueprint */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredRequests.map(req => (
                        <div 
                            key={req.request_id} 
                            className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between"
                        >
                            <div className="space-y-3">
                                <div className="flex justify-between items-start gap-4">
                                    <span className="font-black text-xs text-blue-600 uppercase tracking-widest bg-blue-50/60 border border-blue-100/50 px-2 py-0.5 rounded">
                                        {req.waste_type}
                                    </span>
                                    
                                    <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border capitalize ${getBadgeStyle(req.status)}`}>
                                        {req.status === 'pending' && <Clock className="h-3 w-3" />}
                                        {req.status === 'approved' && <ChevronsRight className="h-3 w-3" />}
                                        {req.status === 'completed' && <CheckCircle2 className="h-3 w-3" />}
                                        {req.status}
                                    </span>
                                </div>

                                <div className="flex items-start space-x-2 text-slate-700">
                                    <FileText className="h-4 w-4 text-slate-300 mt-0.5 flex-shrink-0" />
                                    <p className="text-sm leading-relaxed text-slate-600 break-words">{req.description}</p>
                                </div>
                            </div>

                            <div className="mt-5 pt-3 border-t border-slate-50 flex items-center justify-between text-xs gap-4">
                                <div className="flex items-center text-slate-400 min-w-0">
                                    <MapPin className="h-3.5 w-3.5 text-slate-300 mr-1 flex-shrink-0" />
                                    <span className="truncate" title={req.location}>{req.location}</span>
                                </div>

                                {/* Active Cancellation Option for Unprocessed Tickets */}
                                {req.status === 'pending' && (
                                    <button 
                                        onClick={() => handleCancelRequest(req.request_id)}
                                        className="inline-flex items-center space-x-1 text-red-500 hover:text-red-700 font-bold transition flex-shrink-0 ml-auto bg-red-50/30 hover:bg-red-50 px-2 py-1 rounded"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                        <span>Cancel</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyRequest;