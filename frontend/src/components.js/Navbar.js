import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/authcontext';
import { 
    Recycle, 
    LogOut, 
    LogIn, 
    UserPlus, 
    Shield, 
    User,
    Menu,
    X,
    Home,
    LayoutDashboard,
    Settings,
    Bell,
    ChevronDown,
    UserCircle,
    Leaf,
    Sparkles
} from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/auth/login');
        setMobileMenuOpen(false);
        setDropdownOpen(false);
    };

    const isActive = (path) => location.pathname === path;

    // Get user dashboard link based on role
    const getDashboardLink = () => {
        if (!user) return '/auth/login';
        switch (user.role) {
            case 'admin': return '/admin/dashboard';
            case 'resident': return '/resident/dashboard';
            case 'collector': return '/collectors/dashboard';
            case 'staff':
            case 'recycling_staff': return '/staff/dashboard';
            default: return '/auth/login';
        }
    };

    // Get user role badge color
    const getRoleColor = (role) => {
        const colors = {
            'admin': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
            'resident': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
            'collector': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
            'staff': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
            'recycling_staff': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
        };
        return colors[role] || 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    };

    // Get user role icon
    const getRoleIcon = (role) => {
        switch (role) {
            case 'admin': return <Shield className="h-3.5 w-3.5" />;
            case 'resident': return <Home className="h-3.5 w-3.5" />;
            case 'collector': return <User className="h-3.5 w-3.5" />;
            case 'staff':
            case 'recycling_staff': return <User className="h-3.5 w-3.5" />;
            default: return <User className="h-3.5 w-3.5" />;
        }
    };

    return (
        <nav className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 border-b border-blue-700/30 shadow-xl sticky top-0 z-50 w-full">
            <div className="max-w-full px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 sm:h-20">
                    
                    {/* --- ECOTRACK BRAND MODULE --- */}
                    <div className="flex-shrink-0">
                        <Link to="/" className="flex items-center space-x-3 group">
                            <div className="relative h-11 w-11 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:shadow-emerald-500/50 transition duration-300 group-hover:scale-105">
                                <Recycle className="h-6 w-6 text-white" />
                                <div className="absolute -top-1 -right-1">
                                    <Sparkles className="h-3 w-3 text-yellow-300 animate-pulse" />
                                </div>
                            </div>
                            <div className="flex items-baseline">
                                <span className="text-2xl font-black tracking-tight">
                                    <span className="text-emerald-400">Eco</span>
                                    <span className="text-white">Track</span>
                                </span>
                                <span className="ml-2 hidden lg:inline-block text-[10px] font-bold uppercase tracking-widest text-emerald-300/60 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                                    ♻️ Green
                                </span>
                            </div>
                        </Link>
                    </div>

                    {/* --- DESKTOP NAVIGATION --- */}
                    <div className="hidden md:flex items-center space-x-5">
                        {user ? (
                            <>
                                {/* System Access Security Badge */}
                                <div className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl border ${getRoleColor(user.role)} backdrop-blur-sm`}>
                                    {getRoleIcon(user.role)}
                                    <span className="text-[10px] font-bold uppercase tracking-wider">
                                        {user.role === 'recycling_staff' ? 'Staff' : user.role}
                                    </span>
                                </div>
                                
                                {/* User Profile Dropdown */}
                                <div className="relative">
                                    <button
                                        onClick={() => setDropdownOpen(!dropdownOpen)}
                                        className="flex items-center space-x-3 text-white hover:bg-white/10 px-4 py-2 rounded-xl transition duration-150 border border-transparent hover:border-white/10"
                                    >
                                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-lg ring-2 ring-emerald-400/30">
                                            {user.fullname ? user.fullname.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                        <div className="hidden lg:block text-left">
                                            <p className="font-semibold text-sm text-white leading-tight">
                                                {user.fullname || user.email}
                                            </p>
                                            <p className="text-[10px] text-blue-300/70">{user.email}</p>
                                        </div>
                                        <ChevronDown className={`h-4 w-4 text-white/60 transition duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {/* Dropdown Menu */}
                                    {dropdownOpen && (
                                        <>
                                            <div 
                                                className="fixed inset-0 z-40"
                                                onClick={() => setDropdownOpen(false)}
                                            />
                                            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-fadeIn">
                                                <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-blue-50">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                                            {user.fullname ? user.fullname.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase() || 'U'}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-800">{user.fullname || 'User'}</p>
                                                            <p className="text-xs text-slate-500">{user.email}</p>
                                                            <span className={`inline-block mt-1 text-[8px] font-bold px-2 py-0.5 rounded-full ${getRoleColor(user.role)}`}>
                                                                {user.role}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="p-2">
                                                    <Link
                                                        to={getDashboardLink()}
                                                        onClick={() => setDropdownOpen(false)}
                                                        className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-slate-700 hover:bg-emerald-50 rounded-xl transition group"
                                                    >
                                                        <div className="p-1.5 bg-emerald-100 rounded-lg group-hover:bg-emerald-200 transition">
                                                            <LayoutDashboard className="h-4 w-4 text-emerald-600" />
                                                        </div>
                                                        <span>Dashboard</span>
                                                    </Link>
                                                    <Link
                                                        to="/resident/setting"
                                                        onClick={() => setDropdownOpen(false)}
                                                        className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-slate-700 hover:bg-blue-50 rounded-xl transition group"
                                                    >
                                                        <div className="p-1.5 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition">
                                                            <Settings className="h-4 w-4 text-blue-600" />
                                                        </div>
                                                        <span>Settings</span>
                                                    </Link>
                                                    <div className="border-t border-slate-100 my-1"></div>
                                                    <button
                                                        onClick={handleLogout}
                                                        className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl transition group"
                                                    >
                                                        <div className="p-1.5 bg-red-100 rounded-lg group-hover:bg-red-200 transition">
                                                            <LogOut className="h-4 w-4" />
                                                        </div>
                                                        <span>Logout</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                {/* Unauthenticated Links */}
                                <Link 
                                    to="/auth/login" 
                                    className={`inline-flex items-center space-x-2 px-5 py-2.5 text-sm font-bold rounded-xl transition duration-150 ${
                                        isActive('/auth/login')
                                        ? 'bg-white/10 text-white border border-white/20'
                                        : 'text-blue-100 hover:bg-white/5 hover:text-white border border-transparent hover:border-white/10'
                                    }`}
                                >
                                    <LogIn className="h-4 w-4 text-emerald-400" />
                                    <span>Sign In</span>
                                </Link>
                                
                                <Link 
                                    to="/auth/register" 
                                    className="inline-flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/30 transition duration-150 hover:scale-105 hover:shadow-emerald-500/50"
                                >
                                    <UserPlus className="h-4 w-4" />
                                    <span>Get Started</span>
                                </Link>
                            </>
                        )}
                    </div>

                    {/* --- MOBILE MENU TOGGLE --- */}
                    <div className="md:hidden flex items-center">
                        {user ? (
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="text-white hover:bg-white/10 p-2.5 rounded-xl transition"
                            >
                                {mobileMenuOpen ? (
                                    <X className="h-6 w-6" />
                                ) : (
                                    <Menu className="h-6 w-6" />
                                )}
                            </button>
                        ) : (
                            <div className="flex items-center space-x-2">
                                <Link 
                                    to="/auth/login" 
                                    className="text-white hover:bg-white/10 px-4 py-2 rounded-xl text-xs font-bold transition"
                                >
                                    Login
                                </Link>
                                <Link 
                                    to="/auth/register" 
                                    className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-lg shadow-emerald-500/30"
                                >
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* --- MOBILE MENU (Slide Down) --- */}
                {mobileMenuOpen && user && (
                    <div className="md:hidden py-4 border-t border-blue-700/30 space-y-2 animate-slideDown">
                        {/* User Info */}
                        <div className="flex items-center space-x-3 px-4 py-4 bg-white/5 rounded-2xl border border-white/5">
                            <div className="h-14 w-14 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold text-xl shadow-lg ring-2 ring-emerald-400/30">
                                {user.fullname ? user.fullname.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-white text-base truncate">
                                    {user.fullname || user.email}
                                </p>
                                <p className="text-xs text-blue-300 truncate">{user.email}</p>
                                <span className={`inline-block mt-1 text-[8px] font-bold px-2 py-0.5 rounded-full ${getRoleColor(user.role)}`}>
                                    {user.role}
                                </span>
                            </div>
                        </div>

                        {/* Mobile Navigation Links */}
                        <div className="space-y-1">
                            <Link
                                to={getDashboardLink()}
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-center gap-3 px-4 py-3 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition"
                            >
                                <LayoutDashboard className="h-5 w-5 text-emerald-400" />
                                Dashboard
                            </Link>
                            <Link
                                to="/resident/setting"
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-center gap-3 px-4 py-3 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition"
                            >
                                <Settings className="h-5 w-5 text-slate-400" />
                                Settings
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition"
                            >
                                <LogOut className="h-5 w-5" />
                                Logout
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;