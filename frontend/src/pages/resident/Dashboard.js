import React, { useEffect, useState, useContext } from 'react';
import { getWasteRequests } from '../../services/requestService';
import { AuthContext } from '../../context/authcontext';
import { Link } from 'react-router-dom';
import { 
    LayoutDashboard, 
    ClipboardPlus, 
    History, 
    Bell, 
    TrendingUp, 
    Clock, 
    CheckCircle2, 
    MapPin, 
    ArrowUpRight, 
    ShieldAlert 
} from 'lucide-react';

const ResidentDashboard = () => {
    const { user } = useContext(AuthContext);
    const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0 });
    const [recentRequests, setRecentRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.id) {
            loadDashboardTelemetry();
        }
    }, [user?.id]);

    const loadDashboardTelemetry = async () => {
        try {
            const res = await getWasteRequests();
            // Isolate data belonging exclusively to the authenticated resident
            const personalRequests = res.data.filter(req => req.resident_id === user.id);
            
            // Calculate real-time counts
            const total = personalRequests.length;
            const pending = personalRequests.filter(r => r.status === 'pending' || r.status === 'approved').length;
            const completed = personalRequests.filter(r => r.status === 'completed').length;
            
            setStats({ total, pending, completed });
            // Keep only the 3 most recent entries for the preview layout feed
            setRecentRequests(personalRequests.slice(0, 3));
        } catch (err) {
            console.error("Dashboard metric ingestion pipe encountered a failure:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
            
            {/* --- HERO PROFILE WELCOME LAYER --- */}
            <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
                <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-10 translate-y-10 pointer-events-none">
                    <LayoutDashboard className="h-64 w-64" />
                </div>
                <div className="relative z-10 space-y-1">
                    <span className="text-xs font-bold uppercase tracking-widest text-blue-200">Resident Workspace</span>
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                        Welcome Back, {user?.fullname || 'Resident'}
                    </h1>
                    <p className="text-sm text-blue-100 max-w-xl">
                        Monitor your localized utility scheduling logs, view corporate announcement bulletins, or request collections.
                    </p>
                </div>
            </div>

            {/* --- ANALYTICS TELEMETRY SCOREBOARD --- */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* Metric Item: Total Logged */}
                <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
                    <div className="space-y-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Total Filings</span>
                        <span className="text-2xl font-black text-slate-900">{loading ? '...' : stats.total}</span>
                    </div>
                    <div className="h-10 w-10 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center text-slate-500">
                        <TrendingUp className="h-5 w-5" />
                    </div>
                </div>

                {/* Metric Item: Pending / Active Operations */}
                <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
                    <div className="space-y-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Active Pipelines</span>
                        <span className="text-2xl font-black text-amber-600">{loading ? '...' : stats.pending}</span>
                    </div>
                    <div className="h-10 w-10 bg-amber-50 border border-amber-100 rounded-lg flex items-center justify-center text-amber-600">
                        <Clock className="h-5 w-5" />
                    </div>
                </div>

                {/* Metric Item: Completed Records */}
                <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
                    <div className="space-y-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Resolved Tickets</span>
                        <span className="text-2xl font-black text-emerald-600">{loading ? '...' : stats.completed}</span>
                    </div>
                    <div className="h-10 w-10 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center justify-center text-emerald-600">
                        <CheckCircle2 className="h-5 w-5" />
                    </div>
                </div>

            </div>

            {/* --- WORKSPACE SUB-DASHBOARD split GRID LAYOUT --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                
                {/* PANEL A: LIVE TRACKING PREVIEW MATRIX (COLUMNS 1 & 2) */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <History className="h-4 w-4 text-slate-400" />
                            <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">Recent Request Activity</h3>
                        </div>
                        <Link to="/resident/my-requests" className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-0.5 group">
                            <span>View Full Logs</span>
                            <ArrowUpRight className="h-3 w-3 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </Link>
                    </div>

                    <div className="p-5 divide-y divide-slate-50">
                        {loading ? (
                            [1, 2].map(n => <div key={n} className="h-14 bg-slate-50 animate-pulse rounded-lg mb-2" />)
                        ) : recentRequests.length === 0 ? (
                            <div className="text-center py-8 text-slate-400 text-xs">
                                <ShieldAlert className="h-6 w-6 mx-auto text-slate-300 mb-1.5" />
                                No historical or open disposal manifests found.
                            </div>
                        ) : (
                            recentRequests.map(req => (
                                <div key={req.request_id} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4 text-xs sm:text-sm">
                                    <div className="min-w-0 space-y-1">
                                        <div className="flex items-center space-x-2">
                                            <span className="font-black text-slate-900 text-xs uppercase bg-slate-100 px-1.5 py-0.5 rounded">
                                                {req.waste_type}
                                            </span>
                                            <span className="text-slate-400 text-xs truncate max-w-[180px] sm:max-w-xs">{req.description}</span>
                                        </div>
                                        <div className="flex items-center text-slate-400 text-[11px]">
                                            <MapPin className="h-3 w-3 mr-1" /> {req.location}
                                        </div>
                                    </div>
                                    
                                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border capitalize flex-shrink-0 ${
                                        req.status === 'completed' 
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                                            : req.status === 'approved' 
                                            ? 'bg-blue-50 text-blue-700 border-blue-100' 
                                            : 'bg-amber-50 text-amber-700 border-amber-100'
                                    }`}>
                                        {req.status}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* PANEL B: DIRECT ASSIGNMENT QUICK ACTIONS INDEX PANEL */}
                <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-100 shadow-sm space-y-4">
                    <h3 className="font-extrabold text-slate-900 text-sm sm:text-base border-b border-slate-50 pb-3">
                        Operational Shortcuts
                    </h3>
                    
                    <div className="space-y-2">
                        <Link 
                            to="/resident/create-request" 
                            className="w-full inline-flex items-center space-x-3 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl text-xs sm:text-sm font-bold shadow-sm shadow-blue-600/10 transition active:scale-[0.98]"
                        >
                            <ClipboardPlus className="h-4 w-4" />
                            <div className="text-left">
                                <span className="block font-black">Report New Disposal</span>
                                <span className="block text-[10px] text-blue-200 font-normal mt-0.5">Inject an updated logistics manifest</span>
                            </div>
                        </Link>

                        <Link 
                            to="/resident/notifications" 
                            className="w-full inline-flex items-center space-x-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 p-3 rounded-xl text-xs sm:text-sm font-bold transition active:scale-[0.98]"
                        >
                            <Bell className="h-4 w-4 text-slate-400" />
                            <div className="text-left">
                                <span className="block font-black text-slate-900">Notification Center</span>
                                <span className="block text-[10px] text-slate-400 font-normal mt-0.5">Read public server notices</span>
                            </div>
                        </Link>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ResidentDashboard;