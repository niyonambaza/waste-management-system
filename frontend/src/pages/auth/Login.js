import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login as loginService } from '../../services/authService';
import { AuthContext } from '../../context/authcontext';
import { Mail, Lock, LogIn, Loader2, Recycle } from 'lucide-react';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
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
            // 1. Call the Login API in the Express Backend
            const response = await loginService(formData);
            
            // 2. Save credentials to AuthContext & LocalStorage (User + Token)
            login(response.user); 

            // 3. Dynamically navigate to respective role dashboards
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
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-6 bg-white p-6 sm:p-8 rounded-xl shadow-md border border-slate-100">
                
                {/* --- BRAND LOGO & HEADER (BLUE THEME) --- */}
                <div className="text-center">
                    <div className="flex items-center justify-center space-x-2 mb-3">
                        <div className="h-9 w-9 bg-blue-50 rounded-lg border border-blue-200 flex items-center justify-center shadow-sm">
                            <Recycle className="h-5 w-5 text-blue-600" />
                        </div>
                        <span className="text-2xl font-black tracking-wider text-blue-600">
                            Eco<span className="text-slate-900">Track</span>
                        </span>
                    </div>
                    
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-950 tracking-tight">
                        Account Sign In
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Manage waste and recycling operations seamlessly
                    </p>
                </div>

                {/* Error Notifications */}
                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded text-sm text-red-700 font-medium animate-fade-in">
                        {error}
                    </div>
                )}

                <form className="space-y-4" onSubmit={handleSubmit}>
                    
                    {/* Email Input */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">Email Address</label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-4 w-4 text-slate-400" />
                            </div>
                            <input
                                type="email"
                                name="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md text-sm bg-slate-50/30 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition duration-150"
                                placeholder="name@domain.com"
                            />
                        </div>
                    </div>

                    {/* Password Input */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">Password</label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-4 w-4 text-slate-400" />
                            </div>
                            <input
                                type="password"
                                name="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md text-sm bg-slate-50/30 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition duration-150"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    {/* Submit Action Button */}
                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white transition duration-150 ${
                                loading 
                                ? 'bg-blue-400 cursor-not-allowed' 
                                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                            }`}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                                    Authenticating...
                                </>
                            ) : (
                                <>
                                    <LogIn className="-ml-1 mr-2 h-4 w-4" />
                                    Sign In
                                </>
                            )}
                        </button>
                    </div>
                </form>

                {/* Redirect Link */}
                <div className="text-center pt-2 border-t border-slate-100">
                    <p className="text-xs text-slate-500">
                        Don't have an account yet?{' '}
                        <Link to="/auth/register" className="font-bold text-blue-600 hover:text-blue-700 hover:underline transition">
                            Register here
                        </Link>
                    </p>
                </div>

            </div>
        </div>
    );
};

export default Login;