import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/authcontext';
import { Recycle, LogOut, LogIn, UserPlus, Shield, User } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/auth/login');
    };

    // Helper utility to flag active anchor states dynamically
    const isActive = (path) => location.pathname === path;

    return (
        <nav className="bg-green-700 border-b border-green-950 shadow-md sticky top-0 z-50 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    
                    {/* --- ECOTRACK BRAND MODULE BRANDING --- */}
                    <div className="flex-shrink-0">
                        <Link to="/" className="flex items-center space-x-2 group">
                            <div className="h-9 w-9 bg-white/10 rounded-lg border border-white/10 flex items-center justify-center shadow-sm group-hover:bg-white/20 transition duration-150">
                                <Recycle className="h-5 w-5 text-blue-400" />
                            </div>
                            <span className="text-xl font-black tracking-wider text-blue-400">
                                Eco<span className="text-white">Track</span>
                            </span>
                        </Link>
                    </div>

                    {/* --- DYNAMIC UTILITY CONTROLS TRIGGER ROW --- */}
                    <div className="flex items-center space-x-3 sm:space-x-4">
                        {user ? (
                            <>
                                {/* System Access Security Badge */}
                                <div className="hidden md:flex items-center space-x-1.5 bg-white/5 border border-white/10 px-2.5 py-1 rounded-md">
                                    <Shield className="h-3.5 w-3.5 text-blue-400" />
                                    <span className="text-xs font-bold text-green-300 uppercase tracking-wide">Role:</span>
                                    <span className="text-xs font-black uppercase text-white">{user.role}</span>
                                </div>
                                
                                {/* User Meta Context Block */}
                                <div className="flex items-center space-x-2 text-sm text-white bg-white/5 sm:bg-transparent pl-2 pr-3 py-1 sm:p-0 rounded-full sm:rounded-none border border-white/5 sm:border-none">
                                    <div className="h-7 w-7 rounded-full bg-white/10 border border-white/10 flex items-center justify-center">
                                        <User className="h-3.5 w-3.5 text-blue-400" />
                                    </div>
                                    <span className="font-semibold tracking-tight text-white hidden sm:inline max-w-[140px] truncate">
                                        {user.fullname || user.email}
                                    </span>
                                </div>

                                {/* Authenticated System Exit Trigger */}
                                <button
                                    onClick={handleLogout}
                                    className="inline-flex items-center space-x-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 px-3 py-1.5 rounded-lg text-xs font-bold transition duration-150"
                                >
                                    <LogOut className="h-3.5 w-3.5" />
                                    <span className="hidden sm:inline">Log Out</span>
                                </button>
                            </>
                        ) : (
                            <>
                                {/* --- UNAUTHENTICATED REDIRECT LINKS --- */}
                                <Link 
                                    to="/auth/login" 
                                    className={`inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition duration-150 ${
                                        isActive('/auth/login')
                                        ? 'bg-white/10 text-white'
                                        : 'text-green-100 hover:bg-white/5 hover:text-white'
                                    }`}
                                >
                                    <LogIn className="h-3.5 w-3.5 text-blue-400" />
                                    <span>Sign In</span>
                                </Link>
                                
                                <Link 
                                    to="/auth/register" 
                                    className="inline-flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-md shadow-blue-950/50 transition duration-150"
                                >
                                    <UserPlus className="h-3.5 w-3.5" />
                                    <span>Register</span>
                                </Link>
                            </>
                        )}
                    </div>

                </div>
            </div>
        </nav>
    );
};

export default Navbar;