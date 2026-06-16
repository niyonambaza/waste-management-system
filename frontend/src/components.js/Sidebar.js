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

    // Helper utility to detect active path match to trigger high-visibility layouts
    const isActive = (path) => location.pathname === path;

    // Style utility generator for navigation links
    const linkClasses = (path) => `
        flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
        active:scale-[0.98] group
        ${isActive(path) 
            ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/10' 
            : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
        }
    `;

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
                
                {/* Shared Module: Notifications (Available to all logged-in roles) */}
                <Link to={`/${user.role}/notifications`} className={linkClasses(`/${user.role}/notifications`)}>
                    <Bell className={`h-4 w-4 ${isActive(`/${user.role}/notifications`) ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
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
                            <span>Resident Accounts</span>
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

                {/* --- RESIDENT PORTAL ROUTES --- */}
                {user.role === 'resident' && (
                    <>
                        <Link to="/resident/dashboard" className={linkClasses('/resident/dashboard')}>
                            <Home className={`h-4 w-4 ${isActive('/resident/dashboard') ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                            <span>Portal Overview</span>
                        </Link>
                        
                        <Link to="/resident/create-request" className={linkClasses('/resident/create-request')}>
                            <PlusCircle className={`h-4 w-4 ${isActive('/resident/create-request') ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                            <span>Report Disposal</span>
                        </Link>
                        
                        <Link to="/resident/my-request" className={linkClasses('/resident/my-request')}>
                            <History className={`h-4 w-4 ${isActive('/resident/my-request') ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                            <span>My Orders Log</span>
                        </Link>

                        <Link to="/resident/schedule" className={linkClasses('/resident/schedule')}>
                            <Calendar className={`h-4 w-4 ${isActive('/resident/schedule') ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                            <span>Collection Schedule</span>
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