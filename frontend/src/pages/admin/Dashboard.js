import React, { useEffect, useState } from 'react';
import API from '../../services/api';
import { Users, Trash2, Truck, RefreshCw, AlertCircle, ArrowUpRight } from 'lucide-react';

const AdminDashboard = () => {
    const [counts, setCounts] = useState({ users: 0, requests: 0, vehicles: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const fetchDashboardData = () => {
        setLoading(true);
        setError(false);
        
        // Simultaneous API execution pipeline
        Promise.all([
            API.get('/users'),
            API.get('/waste-requests'),
            API.get('/vehicles')
        ])
        .then(([usersRes, requestsRes, vehiclesRes]) => {
            setCounts({
                users: usersRes.data.length,
                requests: requestsRes.data.length,
                vehicles: vehiclesRes.data.length
            });
        })
        .catch(err => {
            console.error("Failed to fetch system overview analytics data:", err);
            setError(true);
        })
        .finally(() => {
            setLoading(false);
        });
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
            
            {/* Header Module section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                        Administrative Dashboard
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                        Real-time system operational metrics and infrastructure deployment overview.
                    </p>
                </div>
                
                {/* Refresh Trigger Action button */}
                <button 
                    onClick={fetchDashboardData}
                    disabled={loading}
                    className="inline-flex items-center justify-center space-x-2 bg-white hover:bg-slate-50 text-slate-700 text-sm font-bold py-2 px-4 border border-slate-200 rounded-lg shadow-sm transition duration-150 active:scale-95 disabled:opacity-60"
                >
                    <RefreshCw className={`h-4 w-4 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
                    <span>{loading ? 'Refreshing...' : 'Reload Data'}</span>
                </button>
            </div>

            {/* Error Notification system banner */}
            {error && (
                <div className="flex items-center space-x-3 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                    <p className="text-sm text-red-700 font-medium">
                        System failed to load current telemetry. Please check your network connection and try again.
                    </p>
                </div>
            )}

            {/* --- SYSTEM METRICS ANCHOR DISPLAY GRID --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                
                {/* User Metric Card component */}
                <div className="relative group bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition duration-200 overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-600 group-hover:w-1.5 transition-all" />
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">System Users</h3>
                            {loading ? (
                                <div className="h-8 w-16 bg-slate-100 animate-pulse rounded mt-2" />
                            ) : (
                                <p className="text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">{counts.users}</p>
                            )}
                        </div>
                        <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center shadow-inner border border-blue-100/50">
                            <Users className="h-6 w-6" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-xs text-slate-500 font-medium pt-3 border-t border-slate-50">
                        <span className="text-blue-600 font-bold inline-flex items-center mr-1">
                            Active Accounts <ArrowUpRight className="h-3 w-3 ml-0.5" />
                        </span>
                        monitored inside system
                    </div>
                </div>

                {/* Waste Requests Card component */}
                <div className="relative group bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition duration-200 overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-indigo-600 group-hover:w-1.5 transition-all" />
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Collection Requests</h3>
                            {loading ? (
                                <div className="h-8 w-16 bg-slate-100 animate-pulse rounded mt-2" />
                            ) : (
                                <p className="text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">{counts.requests}</p>
                            )}
                        </div>
                        <div className="h-12 w-12 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center shadow-inner border border-indigo-100/50">
                            <Trash2 className="h-6 w-6" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-xs text-slate-500 font-medium pt-3 border-t border-slate-50">
                        <span className="text-indigo-600 font-bold inline-flex items-center mr-1">
                            Disposal Orders <ArrowUpRight className="h-3 w-3 ml-0.5" />
                        </span>
                        logged at facility ports
                    </div>
                </div>

                {/* Logistics Fleets Card component */}
                <div className="relative group bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition duration-200 overflow-hidden sm:col-span-2 lg:col-span-1">
                    <div className="absolute top-0 left-0 w-1 h-full bg-sky-600 group-hover:w-1.5 transition-all" />
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Fleet Vehicles</h3>
                            {loading ? (
                                <div className="h-8 w-16 bg-slate-100 animate-pulse rounded mt-2" />
                            ) : (
                                <p className="text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">{counts.vehicles}</p>
                            )}
                        </div>
                        <div className="h-12 w-12 bg-sky-50 text-sky-600 rounded-lg flex items-center justify-center shadow-inner border border-sky-100/50">
                            <Truck className="h-6 w-6" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-xs text-slate-500 font-medium pt-3 border-t border-slate-50">
                        <span className="text-sky-600 font-bold inline-flex items-center mr-1">
                            Logistics Units <ArrowUpRight className="h-3 w-3 ml-0.5" />
                        </span>
                        assigned on active routes
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AdminDashboard;