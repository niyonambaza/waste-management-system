import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../../services/authService';
import { User, Mail, Phone, Lock, ShieldCheck, Loader2, Recycle } from 'lucide-react';

const CreateAccount = () => {
    const [formData, setFormData] = useState({
        fullname: '',
        email: '',
        phone: '',
        password: '',
        role: 'resident'
    });
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
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
        setSuccessMsg('');
        setLoading(true);

        try {
            await register(formData);
            setSuccessMsg('✅ Account created successfully! Redirecting to login...');
            
            setTimeout(() => {
                navigate('/auth/login');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-6 bg-white p-6 sm:p-8 rounded-xl shadow-md border border-gray-100/80">
                
                {/* --- ECOTRACK BRAND LOGO & HEADER --- */}
                <div className="text-center">
                    <div className="flex items-center justify-center space-x-2 mb-3">
                        <div className="h-9 w-9 bg-green-50 rounded-lg border border-green-200 flex items-center justify-center shadow-sm">
                            <Recycle className="h-5 w-5 text-green-600 animate-pulse" />
                        </div>
                        <span className="text-2xl font-black tracking-wider text-green-600">
                            Eco<span className="text-gray-900">Track</span>
                        </span>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-extrabold text-gray-950 tracking-tight">
                        Create New Account
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                        Join the Waste Management & Recycling System
                    </p>
                </div>

                {/* Alert Notifications */}
                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded text-sm text-red-700 font-medium animate-fade-in">
                        {error}
                    </div>
                )}
                {successMsg && (
                    <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded text-sm text-green-700 font-medium animate-fade-in">
                        {successMsg}
                    </div>
                )}

                <form className="space-y-4" onSubmit={handleSubmit}>
                    
                    {/* Full Name Input */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">Full Name</label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                name="fullname"
                                required
                                value={formData.fullname}
                                onChange={handleChange}
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50/30 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition duration-150"
                                placeholder="e.g. John Doe"
                            />
                        </div>
                    </div>

                    {/* Email Input */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">Email Address</label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                                type="email"
                                name="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50/30 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition duration-150"
                                placeholder="name@domain.com"
                            />
                        </div>
                    </div>

                    {/* Phone Input */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">Phone Number</label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Phone className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                                type="tel"
                                name="phone"
                                required
                                value={formData.phone}
                                onChange={handleChange}
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50/30 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition duration-150"
                                placeholder="e.g. 078XXXXXXX"
                            />
                        </div>
                    </div>

                    {/* Password Input */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">Password</label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                                type="password"
                                name="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50/30 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition duration-150"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    {/* Role Selection Dropdown */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">System Role</label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <ShieldCheck className="h-4 w-4 text-gray-400" />
                            </div>
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 bg-white rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition duration-150"
                            >
                                <option value="resident">Resident</option>
                                <option value="collector">Waste Collector</option>
                                <option value="staff">Facility Staff</option>
                                <option value="admin">System Administrator</option>
                            </select>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white transition duration-150 ${
                                loading 
                                ? 'bg-green-400 cursor-not-allowed' 
                                : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
                            }`}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                                    Please wait...
                                </>
                            ) : (
                                'Sign Up'
                            )}
                        </button>
                    </div>
                </form>

                {/* Account Navigation Link */}
                <div className="text-center pt-2 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                        Already have an account?{' '}
                        <Link to="/auth/login" className="font-bold text-green-600 hover:text-green-700 hover:underline transition">
                            Log in here
                        </Link>
                    </p>
                </div>

            </div>
        </div>
    );
};

export default CreateAccount;