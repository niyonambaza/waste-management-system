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
    ShieldAlert,
    User,
    Calendar,
    Package,
    Recycle,
    ChevronRight,
    Home,
    BarChart3,
    Activity,
    Award,
    Zap
} from 'lucide-react';

const ResidentDashboard = () => {
    const { user } = useContext(AuthContext);
    const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0 });
    const [recentRequests, setRecentRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState('');

    useEffect(() => {
        if (user?.id) {
            loadDashboardTelemetry();
        }
        
        // Update time
        const updateTime = () => {
            const now = new Date();
            setCurrentTime(now.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true 
            }));
        };
        updateTime();
        const interval = setInterval(updateTime, 60000);
        return () => clearInterval(interval);
    }, [user?.id]);

    const loadDashboardTelemetry = async () => {
        try {
            const res = await getWasteRequests();
            const personalRequests = res.data.filter(req => req.resident_id === user.id);
            
            const total = personalRequests.length;
            const pending = personalRequests.filter(r => r.status === 'pending' || r.status === 'approved').length;
            const completed = personalRequests.filter(r => r.status === 'completed').length;
            
            setStats({ total, pending, completed });
            setRecentRequests(personalRequests.slice(0, 5));
        } catch (err) {
            console.error("Dashboard metric ingestion pipe encountered a failure:", err);
        } finally {
            setLoading(false);
        }
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    const getWasteTypeColor = (type) => {
        const colors = {
            'organic': 'bg-emerald-100 text-emerald-700',
            'plastic': 'bg-blue-100 text-blue-700',
            'electronic': 'bg-purple-100 text-purple-700',
            'paper': 'bg-amber-100 text-amber-700',
            'metal': 'bg-slate-100 text-slate-700',
            'hazardous': 'bg-red-100 text-red-700'
        };
        return colors[type?.toLowerCase()] || 'bg-gray-100 text-gray-700';
    };

    const getWasteTypeEmoji = (type) => {
        const emojis = {
            'organic': '🌿',
            'plastic': '🧴',
            'electronic': '💻',
            'paper': '📄',
            'metal': '🔩',
            'hazardous': '☣️'
        };
        return emojis[type?.toLowerCase()] || '📦';
    };

    const getStatusBadge = (status) => {
        const styles = {
            'completed': 'bg-emerald-50 text-emerald-700 border-emerald-200',
            'approved': 'bg-blue-50 text-blue-700 border-blue-200',
            'pending': 'bg-amber-50 text-amber-700 border-amber-200',
            'assigned': 'bg-purple-50 text-purple-700 border-purple-200',
            'in_progress': 'bg-cyan-50 text-cyan-700 border-cyan-200',
            'cancelled': 'bg-red-50 text-red-700 border-red-200'
        };
        return styles[status?.toLowerCase()] || 'bg-gray-50 text-gray-700 border-gray-200';
    };

    const getStatusIcon = (status) => {
        const icons = {
            'completed': <CheckCircle2 className="h-3 w-3" />,
            'approved': <CheckCircle2 className="h-3 w-3" />,
            'pending': <Clock className="h-3 w-3" />,
            'assigned': <Clock className="h-3 w-3" />,
            'in_progress': <Activity className="h-3 w-3" />,
            'cancelled': <ShieldAlert className="h-3 w-3" />
        };
        return icons[status?.toLowerCase()] || <Clock className="h-3 w-3" />;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 py-4 px-4 sm:py-6 sm:px-6 lg:py-8 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-6">
                
                {/* --- HERO PROFILE WELCOME LAYER --- */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-6 sm:p-8 lg:p-10 shadow-xl shadow-blue-600/20">
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 opacity-10">
                        <div className="transform translate-x-8 -translate-y-8">
                            <LayoutDashboard className="h-48 w-48 sm:h-64 sm:w-64 text-white" />
                        </div>
                    </div>
                    <div className="absolute bottom-0 left-0 opacity-5">
                        <div className="transform -translate-x-8 translate-y-8">
                            <Recycle className="h-40 w-40 sm:h-56 sm:w-56 text-white" />
                        </div>
                    </div>
                    
                    <div className="relative z-10 space-y-2">
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-blue-200 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm border border-white/10">
                                <Home className="h-3 w-3" />
                                Resident Workspace
                            </span>
                            <span className="text-[10px] sm:text-xs text-blue-300 bg-white/5 px-3 py-1 rounded-full backdrop-blur-sm border border-white/5">
                                {currentTime}
                            </span>
                        </div>
                        
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                            {getGreeting()}, {user?.fullname?.split(' ')[0] || 'Resident'}! 
                        </h1>
                        
                        <p className="text-sm sm:text-base text-blue-100 max-w-xl leading-relaxed">
                            Monitor your localized utility scheduling logs, view corporate announcement bulletins, or request collections.
                        </p>
                    </div>
                </div>

                {/* --- ANALYTICS TELEMETRY SCOREBOARD --- */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    
                    {/* Metric Item: Total Logged */}
                    <div className="group bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                    <BarChart3 className="h-3.5 w-3.5" />
                                    Total Filings
                                </span>
                                <span className="text-2xl sm:text-3xl font-black text-slate-900">
                                    {loading ? (
                                        <span className="inline-block h-8 w-12 bg-slate-200 animate-pulse rounded"></span>
                                    ) : (
                                        stats.total
                                    )}
                                </span>
                            </div>
                            <div className="h-12 w-12 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl flex items-center justify-center text-blue-600 shadow-sm group-hover:scale-110 transition">
                                <TrendingUp className="h-6 w-6" />
                            </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[10px] text-slate-400">
                            <Activity className="h-3 w-3" />
                            <span>Total requests logged</span>
                        </div>
                    </div>

                    {/* Metric Item: Pending / Active Operations */}
                    <div className="group bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                    <Clock className="h-3.5 w-3.5" />
                                    Active Pipelines
                                </span>
                                <span className="text-2xl sm:text-3xl font-black text-amber-600">
                                    {loading ? (
                                        <span className="inline-block h-8 w-12 bg-slate-200 animate-pulse rounded"></span>
                                    ) : (
                                        stats.pending
                                    )}
                                </span>
                            </div>
                            <div className="h-12 w-12 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl flex items-center justify-center text-amber-600 shadow-sm group-hover:scale-110 transition">
                                <Clock className="h-6 w-6" />
                            </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[10px] text-slate-400">
                            <Zap className="h-3 w-3 text-amber-500" />
                            <span>Pending or in progress</span>
                        </div>
                    </div>

                    {/* Metric Item: Completed Records */}
                    <div className="group bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    Resolved Tickets
                                </span>
                                <span className="text-2xl sm:text-3xl font-black text-emerald-600">
                                    {loading ? (
                                        <span className="inline-block h-8 w-12 bg-slate-200 animate-pulse rounded"></span>
                                    ) : (
                                        stats.completed
                                    )}
                                </span>
                            </div>
                            <div className="h-12 w-12 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 shadow-sm group-hover:scale-110 transition">
                                <CheckCircle2 className="h-6 w-6" />
                            </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[10px] text-slate-400">
                            <Award className="h-3 w-3 text-emerald-500" />
                            <span>Successfully completed</span>
                        </div>
                    </div>

                </div>

                {/* --- WORKSPACE SUB-DASHBOARD split GRID LAYOUT --- */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* PANEL A: LIVE TRACKING PREVIEW MATRIX (COLUMNS 1 & 2) */}
                    <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-4 sm:p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-slate-50/50 to-white">
                            <div className="flex items-center space-x-2.5">
                                <div className="p-2 bg-blue-50 rounded-xl">
                                    <History className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-black text-slate-900 text-sm sm:text-base">
                                        Recent Activity
                                    </h3>
                                    <p className="text-[10px] text-slate-400">Your latest collection requests</p>
                                </div>
                            </div>
                            <Link 
                                to="/resident/my-requests" 
                                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition group"
                            >
                                <span>View All</span>
                                <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                            </Link>
                        </div>

                        <div className="p-4 sm:p-6 divide-y divide-slate-100">
                            {loading ? (
                                <div className="space-y-3">
                                    {[1, 2, 3].map(n => (
                                        <div key={n} className="flex items-center justify-between p-3 bg-slate-50 animate-pulse rounded-xl">
                                            <div className="space-y-2">
                                                <div className="h-4 w-32 bg-slate-200 rounded"></div>
                                                <div className="h-3 w-24 bg-slate-200 rounded"></div>
                                            </div>
                                            <div className="h-6 w-16 bg-slate-200 rounded-full"></div>
                                        </div>
                                    ))}
                                </div>
                            ) : recentRequests.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="inline-flex items-center justify-center h-16 w-16 bg-slate-100 rounded-2xl mb-4">
                                        <ShieldAlert className="h-8 w-8 text-slate-400" />
                                    </div>
                                    <p className="text-sm font-medium text-slate-700">No requests found</p>
                                    <p className="text-xs text-slate-400 mt-1">Start by reporting your first disposal</p>
                                    <Link 
                                        to="/resident/create-request"
                                        className="inline-flex items-center gap-1.5 mt-4 text-sm font-bold text-blue-600 hover:text-blue-700"
                                    >
                                        Create Request <ArrowUpRight className="h-4 w-4" />
                                    </Link>
                                </div>
                            ) : (
                                recentRequests.map((req, index) => (
                                    <div 
                                        key={req.request_id} 
                                        className={`py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 rounded-xl px-2 -mx-2 transition ${
                                            index !== recentRequests.length - 1 ? 'border-b border-slate-100' : ''
                                        }`}
                                    >
                                        <div className="min-w-0 space-y-1.5 flex-1">
                                            <div className="flex items-center flex-wrap gap-2">
                                                <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${getWasteTypeColor(req.waste_type)}`}>
                                                    {getWasteTypeEmoji(req.waste_type)}
                                                    {req.waste_type}
                                                </span>
                                                <span className="text-xs text-slate-500 truncate max-w-[200px] sm:max-w-xs">
                                                    {req.description}
                                                </span>
                                            </div>
                                            <div className="flex items-center text-[11px] text-slate-400">
                                                <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                                                <span className="truncate">{req.location}</span>
                                                {req.created_at && (
                                                    <>
                                                        <span className="mx-1.5">•</span>
                                                        <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
                                                        <span>{new Date(req.created_at).toLocaleDateString()}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold border capitalize flex-shrink-0 ${getStatusBadge(req.status)}`}>
                                            {getStatusIcon(req.status)}
                                            {req.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* PANEL B: DIRECT ASSIGNMENT QUICK ACTIONS INDEX PANEL */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-4 sm:p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50/50 to-white">
                            <div className="flex items-center space-x-2.5">
                                <div className="p-2 bg-purple-50 rounded-xl">
                                    <Zap className="h-5 w-5 text-purple-600" />
                                </div>
                                <div>
                                    <h3 className="font-black text-slate-900 text-sm sm:text-base">
                                        Quick Actions
                                    </h3>
                                    <p className="text-[10px] text-slate-400">Common tasks and shortcuts</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="p-4 sm:p-6 space-y-3">
                            <Link 
                                to="/resident/create-request" 
                                className="group w-full inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white p-4 rounded-xl text-sm font-bold shadow-lg shadow-blue-600/20 transition-all duration-200 hover:shadow-xl active:scale-[0.98]"
                            >
                                <div className="p-2 bg-white/20 rounded-lg group-hover:scale-110 transition">
                                    <ClipboardPlus className="h-5 w-5" />
                                </div>
                                <div className="text-left flex-1">
                                    <span className="block font-black">Report New Disposal</span>
                                    <span className="block text-[10px] text-blue-200 font-normal mt-0.5">Log a new collection request</span>
                                </div>
                                <ChevronRight className="h-5 w-5 text-white/50 group-hover:text-white group-hover:translate-x-1 transition" />
                            </Link>

                            <Link 
                                to="/resident/notifications" 
                                className="group w-full inline-flex items-center gap-3 bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-slate-300 text-slate-700 p-4 rounded-xl text-sm font-bold transition-all duration-200 active:scale-[0.98]"
                            >
                                <div className="p-2 bg-amber-50 rounded-lg group-hover:scale-110 transition">
                                    <Bell className="h-5 w-5 text-amber-500" />
                                </div>
                                <div className="text-left flex-1">
                                    <span className="block font-black text-slate-900">Notification Center</span>
                                    <span className="block text-[10px] text-slate-400 font-normal mt-0.5">Check announcements & alerts</span>
                                </div>
                                <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-1 transition" />
                            </Link>

                            <Link 
                                to="/resident/profile" 
                                className="group w-full inline-flex items-center gap-3 bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-slate-300 text-slate-700 p-4 rounded-xl text-sm font-bold transition-all duration-200 active:scale-[0.98]"
                            >
                                <div className="p-2 bg-emerald-50 rounded-lg group-hover:scale-110 transition">
                                    <User className="h-5 w-5 text-emerald-500" />
                                </div>
                                <div className="text-left flex-1">
                                    <span className="block font-black text-slate-900">Profile Settings</span>
                                    <span className="block text-[10px] text-slate-400 font-normal mt-0.5">Manage your account details</span>
                                </div>
                                <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-1 transition" />
                            </Link>
                        </div>

                        {/* Quick Stats Footer */}
                        <div className="px-4 sm:px-6 py-3 bg-slate-50/80 border-t border-slate-200">
                            <div className="flex items-center justify-between text-[10px] text-slate-400">
                                <span className="flex items-center gap-1.5">
                                    <div className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                                    System Online
                                </span>
                                <span>v2.0.1</span>
                            </div>
                        </div>
                    </div>

                </div>

                {/* --- TIPS SECTION --- */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-amber-50 rounded-xl">
                                <Award className="h-5 w-5 text-amber-600" />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 text-sm">Eco-Tip of the Day</h4>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    ♻️ Sort your waste before disposal to help recycling centers process materials more efficiently.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                            <Recycle className="h-4 w-4 text-emerald-500" />
                            <span>Together for a cleaner Rwanda</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ResidentDashboard;