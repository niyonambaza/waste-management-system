import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/authcontext';
import { 
    LayoutDashboard, 
    Users, 
    ClipboardList, 
    MapPin, 
    Truck, 
    PlusCircle, 
    History, 
    Home,
    ShieldAlert,
    Bell,
    Layers,
    Calendar,
    BarChart3
} from 'lucide-react';

const Sidebar = () => {
    const { user } = useContext(AuthContext);
    const location = useLocation();

    if (!user) return null;

    const isActive = (path) => location.pathname === path;

    const linkClasses = (path) => `
        flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
        active:scale-[0.98] group
        ${isActive(path) 
            ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/10' 
            : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
        }
    `;

    // Dynamic path finder generator kugira ngo kureba role ifite "s" byoroshe
    const getNotificationPath = () => {
        if (user.role === 'collector') return '/collectors/notifications';
        return `/${user.role}/notifications`;
    };

    return (
        <aside className="w-64 bg-slate-900 border-r border-slate-800/80 text-white min-h-screen flex flex-col hidden md:flex">
            
            {/* --- PANEL ACCESS STATUS CARD --- */}
            <div className="p-4 border-b border-slate-800/60 bg-slate-950/20">
                <div className="flex items-center space-x-3 bg-slate-800/40 rounded-xl p-3 border border-slate-800/50">
                    <div className="h-8 w-8 bg-blue-500/10 border border-blue-500/20 flex items-center justify-center rounded-lg">
                        <ShieldAlert className="h-4 w-4 text-blue-400" />
                    </div>
                    <div>
                        <div className="text-[10px] font-black tracking-widest text-blue-400 uppercase">
                            Access Scope
                        </div>
                        <div className="text-sm font-extrabold text-slate-100 uppercase tracking-tight truncate">
                            {user.role} Control
                        </div>
                    </div>
                </div>
            </div>

            {/* --- CORE NAVIGATION SYSTEM PANEL --- */}
            <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
                
                {/* SAFE NOTIFICATION LINK */}
                <Link to={getNotificationPath()} className={linkClasses(getNotificationPath())}>
                    <Bell className={`h-4 w-4 ${isActive(getNotificationPath()) ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                    <span>Notifications</span>
                </Link>

                <div className="h-px bg-slate-800/50 my-2" />

                {/* --- ADMINISTRATOR UTILITY ROUTES --- */}
                {user.role === 'admin' && (
                    <>
                        <Link to="/admin/dashboard" className={linkClasses('/admin/dashboard')}>
                            <LayoutDashboard className={`h-4 w-4 ${isActive('/admin/dashboard') ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                            <span>System Dashboard</span>
                        </Link>
                        
                        <Link to="/admin/users" className={linkClasses('/admin/users')}>
                            <Users className={`h-4 w-4 ${isActive('/admin/users') ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                            <span>User Management</span>
                        </Link>
                        
                        <Link to="/admin/requests" className={linkClasses('/admin/requests')}>
                            <ClipboardList className={`h-4 w-4 ${isActive('/admin/requests') ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                            <span>Waste Requests</span>
                        </Link>

                        <Link to="/admin/collection-materials" className={linkClasses('/admin/collection-materials')}>
                            <Layers className={`h-4 w-4 ${isActive('/admin/collection-materials') ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                            <span>Collection Materials</span>
                        </Link>

                        <Link to="/admin/staff-schedule" className={linkClasses('/admin/staff-schedule')}>
                            <Calendar className={`h-4 w-4 ${isActive('/admin/staff-schedule') ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                            <span>Staff Schedule</span>
                        </Link>
                        
                        <Link to="/admin/centers" className={linkClasses('/admin/centers')}>
                            <MapPin className={`h-4 w-4 ${isActive('/admin/centers') ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                            <span>Recycling Centers</span>
                        </Link>
                        
                        <Link to="/admin/vehicles" className={linkClasses('/admin/vehicles')}>
                            <Truck className={`h-4 w-4 ${isActive('/admin/vehicles') ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                            <span>Logistics Fleet</span>
                        </Link>

                        <Link to="/admin/reports" className={linkClasses('/admin/reports')}>
                            <BarChart3 className={`h-4 w-4 ${isActive('/admin/reports') ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                            <span>Analytics & Reports</span>
                        </Link>
                    </>
                )}

              {/* --- 🛠️ RECYCLING STAFF PORTAL ROUTES --- */}
{user.role === 'staff' && (
    <>
        <Link to="/staff/dashboard" className={linkClasses('/staff/dashboard')}>
            <LayoutDashboard className={`h-4 w-4 ${isActive('/staff/dashboard') ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
            <span>Staff Dashboard</span>
        </Link>

        <Link to="/staff/materials" className={linkClasses('/staff/materials')}>
            <Layers className={`h-4 w-4 ${isActive('/staff/materials') ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
            <span>Materials Inventory</span>
        </Link>

        {/* Iyi niyo Link nshya y'ama Notification */}
        <Link to="/staff/notifications" className={linkClasses('/staff/notifications')}>
            <Bell className={`h-4 w-4 ${isActive('/staff/notifications') ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
            <span>Notifications</span>
        </Link>
    </>
)}

                {/* --- 🚛 COLLECTOR PORTAL ROUTES --- */}
                {user.role === 'collector' && (
                    <>
                        <Link to="/collectors/dashboard" className={linkClasses('/collectors/dashboard')}>
                            <LayoutDashboard className={`h-4 w-4 ${isActive('/collectors/dashboard') ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                            <span>Collector Dashboard</span>
                        </Link>

                        <Link to="/collectors/assigned" className={linkClasses('/collectors/assigned')}>
                            <ClipboardList className={`h-4 w-4 ${isActive('/collectors/assigned') ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                            <span>Assigned Requests</span>
                        </Link>

                        <Link to="/collectors/schedules" className={linkClasses('/collectors/schedules')}>
                            <Calendar className={`h-4 w-4 ${isActive('/collectors/schedules') ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                            <span>My Schedules</span>
                        </Link>
                    </>
                )}

              {/* --- RESIDENT PORTAL ROUTES --- */}
{user.role === 'resident' && (
    <>
        <Link to="/resident/dashboard" className={linkClasses('/resident/dashboard')}>
            <div className="flex items-center gap-3 flex-1">
                <div className={`p-1.5 rounded-lg ${isActive('/resident/dashboard') ? 'bg-emerald-500/20' : 'bg-transparent group-hover:bg-emerald-500/10'}`}>
                    <Home className={`h-4 w-4 ${isActive('/resident/dashboard') ? 'text-emerald-400' : 'text-slate-400 group-hover:text-emerald-400'}`} />
                </div>
                <span className={isActive('/resident/dashboard') ? 'text-white font-semibold' : 'text-slate-300 group-hover:text-white'}>Portal Overview</span>
            </div>
            {isActive('/resident/dashboard') && (
                <div className="w-1.5 h-6 bg-emerald-400 rounded-full shadow-lg shadow-emerald-400/50"></div>
            )}
        </Link>
        
        <Link to="/resident/create-request" className={linkClasses('/resident/create-request')}>
            <div className="flex items-center gap-3 flex-1">
                <div className={`p-1.5 rounded-lg ${isActive('/resident/create-request') ? 'bg-blue-500/20' : 'bg-transparent group-hover:bg-blue-500/10'}`}>
                    <PlusCircle className={`h-4 w-4 ${isActive('/resident/create-request') ? 'text-blue-400' : 'text-slate-400 group-hover:text-blue-400'}`} />
                </div>
                <span className={isActive('/resident/create-request') ? 'text-white font-semibold' : 'text-slate-300 group-hover:text-white'}>Report Disposal</span>
            </div>
            {isActive('/resident/create-request') && (
                <div className="w-1.5 h-6 bg-blue-400 rounded-full shadow-lg shadow-blue-400/50"></div>
            )}
        </Link>
        
        <Link to="/resident/my-request" className={linkClasses('/resident/my-request')}>
            <div className="flex items-center gap-3 flex-1">
                <div className={`p-1.5 rounded-lg ${isActive('/resident/my-request') ? 'bg-purple-500/20' : 'bg-transparent group-hover:bg-purple-500/10'}`}>
                    <History className={`h-4 w-4 ${isActive('/resident/my-request') ? 'text-purple-400' : 'text-slate-400 group-hover:text-purple-400'}`} />
                </div>
                <span className={isActive('/resident/my-request') ? 'text-white font-semibold' : 'text-slate-300 group-hover:text-white'}>My Orders Log</span>
            </div>
            {isActive('/resident/my-request') && (
                <div className="w-1.5 h-6 bg-purple-400 rounded-full shadow-lg shadow-purple-400/50"></div>
            )}
        </Link>

        <Link to="/resident/schedule" className={linkClasses('/resident/schedule')}>
            <div className="flex items-center gap-3 flex-1">
                <div className={`p-1.5 rounded-lg ${isActive('/resident/schedule') ? 'bg-amber-500/20' : 'bg-transparent group-hover:bg-amber-500/10'}`}>
                    <Calendar className={`h-4 w-4 ${isActive('/resident/schedule') ? 'text-amber-400' : 'text-slate-400 group-hover:text-amber-400'}`} />
                </div>
                <span className={isActive('/resident/schedule') ? 'text-white font-semibold' : 'text-slate-300 group-hover:text-white'}>Collection Schedule</span>
            </div>
            {isActive('/resident/schedule') && (
                <div className="w-1.5 h-6 bg-amber-400 rounded-full shadow-lg shadow-amber-400/50"></div>
            )}
        </Link>

        <Link to="/resident/Setting" className={linkClasses('/resident/Setting')}>
            <div className="flex items-center gap-3 flex-1">
                <div className={`p-1.5 rounded-lg ${isActive('/resident/Setting') ? 'bg-rose-500/20' : 'bg-transparent group-hover:bg-rose-500/10'}`}>
                    <History className={`h-4 w-4 ${isActive('/resident/Setting') ? 'text-rose-400' : 'text-slate-400 group-hover:text-rose-400'}`} />
                </div>
                <span className={isActive('/resident/Setting') ? 'text-white font-semibold' : 'text-slate-300 group-hover:text-white'}>Settings</span>
            </div>
            {isActive('/resident/Setting') && (
                <div className="w-1.5 h-6 bg-rose-400 rounded-full shadow-lg shadow-rose-400/50"></div>
            )}
        </Link>
    </>
)}
            
            </nav>

            {/* --- SIDEBAR INFRASTRUCTURE FOOTER --- */}
            <div className="p-4 border-t border-slate-800/60 bg-slate-950/10 text-center">
                <span className="text-[10px] text-slate-500 font-bold tracking-wider uppercase">
                    EcoTrack Core v1.2.0
                </span>
            </div>
        </aside>
    );
};

export default Sidebar;