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
    ChevronsRight
} from 'lucide-react';

const Requests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [actionId, setActionId] = useState(null); // Track specific loading rows

    useEffect(() => {
        loadRequests();
    }, []);

    const loadRequests = async () => {
        setLoading(true);
        setError(false);
        try {
            const res = await getWasteRequests();
            setRequests(res.data);
        } catch (err) {
            console.error("Failed to load global disposal manifest indexes:", err);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (id, currentRequest, newStatus) => {
        setActionId(id);
        try {
            await updateWasteRequest(id, {
                ...currentRequest,
                status: newStatus
            });
            // Optimistic inline state updates to ensure responsive layout behavior
            setRequests(prev => prev.map(req => 
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
                setRequests(prev => prev.filter(req => req.request_id !== id));
            } catch (err) {
                console.error("Failed to drop request index row:", err);
                alert("Operation failed. Could not detach asset logs from database registry.");
            }
        }
    };

    // Style helper for mapping status tags cleanly
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

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
            
            {/* --- COMPONENT DASHBOARD HEADER --- */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        Waste Collection Manifests
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                        Monitor active citizen requests, approve routes, and clear logistics dispatch tickets.
                    </p>
                </div>
                
                <button 
                    onClick={loadRequests}
                    disabled={loading}
                    className="inline-flex items-center justify-center space-x-2 bg-white hover:bg-slate-50 text-slate-700 text-sm font-bold py-2 px-4 border border-slate-200 rounded-lg shadow-sm transition duration-150 active:scale-95 disabled:opacity-60"
                >
                    <RefreshCw className={`h-4 w-4 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
                    <span>Sync Manifests</span>
                </button>
            </div>

            {error && (
                <div className="flex items-center space-x-3 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                    <p className="text-sm text-red-700 font-medium">
                        Unable to pull active collection queues. Verify network connectivity link layers.
                    </p>
                </div>
            )}

            {/* --- DATA TABLE RESPONSIVE WRAPPER CONTAINER --- */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-100 text-sm text-left">
                        <thead className="bg-slate-50 text-xs font-bold text-slate-400 uppercase tracking-wider">
                            <tr>
                                <th className="p-4 pl-6">Resident Identity</th>
                                <th className="p-4">Material Classification</th>
                                <th className="p-4">Manifest Context</th>
                                <th className="p-4">Disposal Address</th>
                                <th className="p-4">Lifecycle Status</th>
                                <th className="p-4 pr-6 text-right">Workflow Execution Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700 bg-white">
                            {loading ? (
                                /* Skeletons Loaders Loop matrix structure */
                                [1, 2, 3].map(row => (
                                    <tr key={row} className="animate-pulse">
                                        <td className="p-4 pl-6"><div className="h-4 w-16 bg-slate-100 rounded" /></td>
                                        <td className="p-4"><div className="h-4 w-24 bg-slate-100 rounded" /></td>
                                        <td className="p-4"><div className="h-4 w-40 bg-slate-100 rounded" /></td>
                                        <td className="p-4"><div className="h-4 w-32 bg-slate-100 rounded" /></td>
                                        <td className="p-4"><div className="h-5 w-16 bg-slate-100 rounded" /></td>
                                        <td className="p-4 pr-6 text-right"><div className="h-6 w-36 bg-slate-100 rounded ml-auto" /></td>
                                    </tr>
                                ))
                            ) : requests.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-12 text-center text-slate-400">
                                        <div className="h-10 w-10 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <Inbox className="h-5 w-5 text-slate-400" />
                                        </div>
                                        <span className="font-bold text-slate-700 block text-sm">Disposal Logs Cleared</span>
                                        <p className="text-xs mt-1">There are no outstanding resident collection requests on file.</p>
                                    </td>
                                </tr>
                            ) : (
                                requests.map(req => (
                                    <tr key={req.request_id} className="hover:bg-slate-50/40 transition duration-150">
                                        
                                        {/* Resident ID Entity Mapping Column */}
                                        <td className="p-4 pl-6 font-semibold text-slate-900 whitespace-nowrap">
                                            <div className="flex items-center space-x-2">
                                                <User className="h-3.5 w-3.5 text-slate-400" />
                                                <span>Resident #{req.resident_id}</span>
                                            </div>
                                        </td>

                                        {/* Waste Classification Badge Cell */}
                                        <td className="p-4 whitespace-nowrap">
                                            <div className="flex items-center space-x-1.5 text-slate-900 font-bold text-xs">
                                                <Layers className="h-3.5 w-3.5 text-blue-500" />
                                                <span className="capitalize">{req.waste_type}</span>
                                            </div>
                                        </td>

                                        {/* Manifest Plaintext Description Content Box */}
                                        <td className="p-4 max-w-xs">
                                            <div className="flex items-start space-x-1.5">
                                                <FileText className="h-3.5 w-3.5 text-slate-300 mt-0.5 flex-shrink-0" />
                                                <p className="text-xs text-slate-600 truncate hover:text-clip hover:whitespace-normal transition duration-75" title={req.description}>
                                                    {req.description}
                                                </p>
                                            </div>
                                        </td>

                                        {/* Location Coordinates Mapping Area */}
                                        <td className="p-4 max-w-xxs truncate text-xs text-slate-600">
                                            <div className="flex items-center space-x-1.5">
                                                <MapPin className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                                                <span>{req.location}</span>
                                            </div>
                                        </td>

                                        {/* Dynamic Status Badges Segment Row */}
                                        <td className="p-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center gap-1 border px-2.5 py-0.5 rounded-full text-xs font-bold tracking-tight capitalize ${getStatusStyles(req.status)}`}>
                                                {req.status === 'pending' && <Clock className="h-3 w-3" />}
                                                {req.status === 'approved' && <ChevronsRight className="h-3 w-3" />}
                                                {req.status === 'completed' && <CheckCircle2 className="h-3 w-3" />}
                                                {req.status}
                                            </span>
                                        </td>

                                        {/* Actions Workflow Processing Buttons Row */}
                                        <td className="p-4 pr-6 text-right whitespace-nowrap">
                                            <div className="flex items-center justify-end space-x-1.5">
                                                
                                                {/* Phase 1: Request Authorization Approval Action Trigger */}
                                                {req.status === 'pending' && (
                                                    <button 
                                                        onClick={() => handleStatusChange(req.request_id, req, 'approved')}
                                                        disabled={actionId === req.request_id}
                                                        className="inline-flex items-center bg-white border border-slate-200 hover:border-slate-300 text-blue-600 px-2.5 py-1.5 rounded-lg text-xs font-bold shadow-sm transition active:scale-95 disabled:opacity-50"
                                                    >
                                                        Approve
                                                    </button>
                                                )}

                                                {/* Phase 2: Complete and Secure Fulfillment Action Trigger */}
                                                {req.status !== 'completed' && (
                                                    <button 
                                                        onClick={() => handleStatusChange(req.request_id, req, 'completed')}
                                                        disabled={actionId === req.request_id}
                                                        className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1.5 rounded-lg text-xs font-bold shadow-sm shadow-blue-600/10 transition active:scale-95 disabled:opacity-50"
                                                    >
                                                        Resolve
                                                    </button>
                                                )}

                                                {/* Structural Purge Method Execution Block */}
                                                <button 
                                                    onClick={() => handleDeleteRequest(req.request_id)}
                                                    disabled={actionId === req.request_id}
                                                    className="inline-flex items-center justify-center p-1.5 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition"
                                                    title="Erase Request Log Row"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </td>

                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Requests;