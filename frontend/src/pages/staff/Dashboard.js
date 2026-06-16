import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { Layers, Scale, CalendarRange, RefreshCw, AlertCircle, Inbox } from 'lucide-react';

const StaffDashboard = () => {
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const fetchMaterialsData = () => {
        setLoading(true);
        setError(false);
        API.get('/recycled-materials')
            .then(res => {
                setMaterials(res.data);
            })
            .catch(err => {
                console.error("Failed to load processed inventory logs:", err);
                setError(true);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchMaterialsData();
    }, []);

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
            
            {/* --- COMPONENT DASHBOARD HEADER --- */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                        Facility Operations Portal
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                        Monitor, log, and manage optimized recycled materials inventory classifications.
                    </p>
                </div>
                
                {/* Refresh Content Actions */}
                <button 
                    onClick={fetchMaterialsData}
                    disabled={loading}
                    className="inline-flex items-center justify-center space-x-2 bg-white hover:bg-slate-50 text-slate-700 text-sm font-bold py-2 px-4 border border-slate-200 rounded-lg shadow-sm transition duration-150 active:scale-95 disabled:opacity-60"
                >
                    <RefreshCw className={`h-4 w-4 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
                    <span>{loading ? 'Updating Inventory...' : 'Sync Stock'}</span>
                </button>
            </div>

            {/* Error Telemetry Fallback Alert */}
            {error && (
                <div className="flex items-center space-x-3 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                    <p className="text-sm text-red-700 font-medium">
                        Unable to pull local center asset levels. Please re-authenticate your dashboard session.
                    </p>
                </div>
            )}

            {/* --- PRIMARY STOCK GRID VIEWS --- */}
            {loading ? (
                /* Interactive Material Loading Cards Skeletons */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {[1, 2, 3].map(item => (
                        <div key={item} className="p-5 bg-white border border-slate-100 rounded-xl shadow-sm space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="h-5 w-28 bg-slate-100 rounded animate-pulse" />
                                <div className="h-9 w-9 bg-slate-50 rounded-lg animate-pulse" />
                            </div>
                            <div className="h-6 w-20 bg-slate-100 rounded animate-pulse" />
                            <div className="h-3 w-36 bg-slate-50 rounded animate-pulse pt-2" />
                        </div>
                    ))}
                </div>
            ) : materials.length === 0 ? (
                /* Clean Empty State Message Block */
                <div className="flex flex-col items-center justify-center text-center p-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <div className="h-12 w-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 mb-3">
                        <Inbox className="h-6 w-6" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-700">No Processed Materials</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm">
                        There are currently no recycling metrics items recorded at this management port station.
                    </p>
                </div>
            ) : (
                /* Production Material Elements List */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {materials.map(mat => (
                        <div 
                            key={mat.material_id} 
                            className="relative group bg-white p-5 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition duration-200 overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-1 h-full bg-blue-600 group-hover:w-1.5 transition-all" />
                            
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black tracking-widest text-blue-500 uppercase">
                                        Inventory Item
                                    </span>
                                    <h4 className="font-extrabold text-lg text-slate-900 tracking-tight capitalize">
                                        {mat.material_type}
                                    </h4>
                                </div>
                                <div className="h-9 w-9 bg-blue-50 text-blue-600 border border-blue-100/50 rounded-lg flex items-center justify-center shadow-inner">
                                    <Layers className="h-4 w-4" />
                                </div>
                            </div>

                            <div className="mt-4 flex items-center space-x-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                                <Scale className="h-4 w-4 text-slate-400 flex-shrink-0" />
                                <p className="text-xs text-slate-500 font-medium">
                                    Net Weight Capacity:{' '}
                                    <span className="font-bold text-slate-950 text-sm ml-0.5">
                                        {mat.quantity} Kg
                                    </span>
                                </p>
                            </div>

                            <div className="mt-4 pt-3 border-t border-slate-50 flex items-center text-[11px] text-slate-400 font-semibold space-x-1">
                                <CalendarRange className="h-3.5 w-3.5 text-slate-300" />
                                <span>Logged Receipt Date:</span>
                                <span className="text-slate-600">
                                    {new Date(mat.date_received).toLocaleDateString(undefined, {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                    })}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StaffDashboard;