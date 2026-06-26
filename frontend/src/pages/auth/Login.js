import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login as loginService } from '../../services/authService';
import { AuthContext } from '../../context/authcontext';
import { 
    Mail, 
    Lock, 
    LogIn, 
    Loader2, 
    Recycle, 
    AlertCircle, 
    X,
    Eye,
    EyeOff,
    Sparkles
} from 'lucide-react';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    
    const { login } = useContext(AuthContext); 
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await loginService(formData);
            login(response.user); 

            const userRole = response.user?.role;

            switch (userRole) {
                case 'admin':
                    navigate('/admin/dashboard');
                    break;
                case 'collector':
                    navigate('/collectors/dashboard');
                    break;
                case 'staff':
                    navigate('/staff/dashboard');
                    break;
                case 'resident':
                default:
                    navigate('/resident/dashboard');
                    break;
            }

        } catch (err) {
            setError(err.response?.data?.error || 'Invalid email or password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-4 py-12 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-6 bg-white/80 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-xl border border-slate-200/60">
                
                {/* --- BRAND LOGO & HEADER --- */}
                <div className="text-center">
                    <div className="flex items-center justify-center space-x-2 mb-3">
                        <div className="relative">
                            <div className="h-14 w-14 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                                <Recycle className="h-7 w-7 text-white" />
                            </div>
                            <Sparkles className="h-3 w-3 text-yellow-300 absolute -top-1 -right-1 animate-pulse" />
                        </div>
                        <span className="text-2xl font-black tracking-tight">
                            <span className="text-blue-600">Eco</span>
                            <span className="text-slate-900">Track</span>
                        </span>
                    </div>
                    
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                        Welcome Back
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Sign in to manage waste and recycling operations
                    </p>
                </div>

                {/* --- ERROR NOTIFICATIONS --- */}
                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl flex items-start space-x-3">
                        <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-700 flex-1">{error}</p>
                        <button onClick={() => setError('')} className="text-red-400 hover:text-red-600">
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                )}

                {/* --- LOGIN FORM --- */}
                <form className="space-y-4" onSubmit={handleSubmit}>
                    
                    {/* Email Input */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            Email Address
                        </label>
                        <div className="relative rounded-xl shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-slate-400" />
                            </div>
                            <input
                                type="email"
                                name="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl text-sm bg-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition placeholder-slate-400"
                                placeholder="name@domain.com"
                            />
                        </div>
                    </div>

                    {/* Password Input */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            Password
                        </label>
                        <div className="relative rounded-xl shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-slate-400" />
                            </div>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className="block w-full pl-10 pr-12 py-3 border border-slate-200 rounded-xl text-sm bg-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition placeholder-slate-400"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                            >
                                {showPassword ? (
                                    <EyeOff className="h-5 w-5" />
                                ) : (
                                    <Eye className="h-5 w-5" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Forgot Password Link */}
                    <div className="flex items-center justify-end">
                        <Link 
                            to="/auth/forgot-password" 
                            className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline transition"
                        >
                            Forgot Password?
                        </Link>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl text-sm font-bold text-white transition-all duration-150 ${
                                loading 
                                ? 'bg-blue-400 cursor-not-allowed' 
                                : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 active:scale-[0.98]'
                            }`}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin h-5 w-5" />
                                    Authenticating...
                                </>
                            ) : (
                                <>
                                    <LogIn className="h-5 w-5" />
                                    Sign In
                                </>
                            )}
                        </button>
                    </div>
                </form>

                {/* --- FOOTER --- */}
                <div className="text-center pt-2 border-t border-slate-100">
                    <p className="text-xs text-slate-500">
                        Don't have an account?{' '}
                        <Link to="/auth/register" className="font-bold text-blue-600 hover:text-blue-700 hover:underline transition">
                            Register here
                        </Link>
                    </p>
                </div>

                {/* --- VERSION INFO --- */}
                <div className="text-center">
                    <p className="text-[10px] text-slate-400 flex items-center justify-center gap-2">
                        <span>🔒 EcoTrack v2.0</span>
                        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                        <span>Secure Login</span>
                    </p>
                </div>

            </div>
        </div>
    );
};

export default Login;