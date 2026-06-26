import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
    UserPlus, 
    User, 
    Mail, 
    Phone, 
    Lock, 
    CheckCircle, 
    AlertCircle, 
    ArrowRight,
    Eye,
    EyeOff,
    Shield,
    Recycle,
    Sparkles,
    ChevronRight,
    X
} from 'lucide-react';

const RegisterPage = () => {
    const navigate = useNavigate();
    
    // --- STATE MANAGEMENT ---
    const [formData, setFormData] = useState({
        fullname: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        agreeTerms: false
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState({
        score: 0,
        label: 'Weak',
        color: 'red'
    });

    // --- HANDLE INPUT CHANGE ---
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const val = type === 'checkbox' ? checked : value;
        
        setFormData({ 
            ...formData, 
            [name]: val 
        });

        if (name === 'password') {
            checkPasswordStrength(value);
        }
    };

    // --- CHECK PASSWORD STRENGTH ---
    const checkPasswordStrength = (password) => {
        let score = 0;
        if (password.length >= 6) score++;
        if (password.length >= 10) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;

        const strengthMap = {
            0: { label: 'Very Weak', color: 'red' },
            1: { label: 'Weak', color: 'red' },
            2: { label: 'Fair', color: 'orange' },
            3: { label: 'Good', color: 'blue' },
            4: { label: 'Strong', color: 'green' },
            5: { label: 'Very Strong', color: 'emerald' }
        };

        setPasswordStrength({
            score,
            ...strengthMap[score] || strengthMap[0]
        });
    };

    // --- SUBMIT REGISTRATION ---
    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match!');
            setLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long!');
            setLoading(false);
            return;
        }

        if (!formData.agreeTerms) {
            setError('Please agree to the Terms and Conditions.');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fullname: formData.fullname,
                    email: formData.email,
                    phone: formData.phone,
                    password: formData.password
                }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Something went wrong during registration.');
            }

            setSuccess('✅ Account created successfully! Redirecting to login...');
            setFormData({ 
                fullname: '', 
                email: '', 
                phone: '', 
                password: '',
                confirmPassword: '',
                agreeTerms: false
            });
            
            setTimeout(() => {
                navigate('/auth/login');
            }, 2000);
            
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getStrengthColor = () => {
        const colors = {
            'red': 'bg-red-500',
            'orange': 'bg-orange-500',
            'blue': 'bg-blue-500',
            'green': 'bg-green-500',
            'emerald': 'bg-emerald-500'
        };
        return colors[passwordStrength.color] || 'bg-gray-300';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-lg">
                
                {/* --- HEADER --- */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-lg shadow-emerald-500/30 mb-4">
                        <div className="relative">
                            <UserPlus className="h-8 w-8 text-white" />
                            <Sparkles className="h-3 w-3 text-yellow-300 absolute -top-1 -right-1 animate-pulse" />
                        </div>
                    </div>
                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                        Create Account
                    </h2>
                    <p className="mt-2 text-sm text-slate-500">
                        Join EcoTrack and help build a cleaner Rwanda
                    </p>
                </div>

                {/* --- CARD --- */}
                <div className="bg-white/80 backdrop-blur-sm py-8 px-4 shadow-xl rounded-2xl sm:px-10 border border-slate-200/60">
                    
                    {/* --- FEEDBACK --- */}
                    {error && (
                        <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-xl flex items-start space-x-3">
                            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-semibold text-red-800">Registration Error</p>
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                            <button 
                                onClick={() => setError('')}
                                className="ml-auto text-red-400 hover:text-red-600"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    )}
                    
                    {success && (
                        <div className="mb-4 p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-xl flex items-start space-x-3">
                            <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-semibold text-emerald-800">Success!</p>
                                <p className="text-sm text-emerald-700">{success}</p>
                            </div>
                        </div>
                    )}

                    {/* --- FORM --- */}
                    <form onSubmit={handleRegister} className="space-y-5">
                        
                        {/* Full Name */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5">
                                Full Name <span className="text-red-400">*</span>
                            </label>
                            <div className="relative rounded-xl shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-slate-400" />
                                </div>
                                <input 
                                    type="text" 
                                    name="fullname" 
                                    value={formData.fullname} 
                                    onChange={handleChange} 
                                    placeholder="Enter your full name"
                                    className="block w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm placeholder-slate-400 transition bg-white/50"
                                    required 
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5">
                                Email Address <span className="text-red-400">*</span>
                            </label>
                            <div className="relative rounded-xl shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-slate-400" />
                                </div>
                                <input 
                                    type="email" 
                                    name="email" 
                                    value={formData.email} 
                                    onChange={handleChange} 
                                    placeholder="you@example.com"
                                    className="block w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm placeholder-slate-400 transition bg-white/50"
                                    required 
                                />
                            </div>
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5">
                                Phone Number <span className="text-red-400">*</span>
                            </label>
                            <div className="relative rounded-xl shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Phone className="h-5 w-5 text-slate-400" />
                                </div>
                                <input 
                                    type="tel" 
                                    name="phone" 
                                    value={formData.phone} 
                                    onChange={handleChange} 
                                    placeholder="+250 788 000 000"
                                    className="block w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm placeholder-slate-400 transition bg-white/50"
                                    required 
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5">
                                Password <span className="text-red-400">*</span>
                            </label>
                            <div className="relative rounded-xl shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-slate-400" />
                                </div>
                                <input 
                                    type={showPassword ? 'text' : 'password'} 
                                    name="password" 
                                    value={formData.password} 
                                    onChange={handleChange} 
                                    placeholder="Min 6 characters"
                                    className="block w-full pl-10 pr-12 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm placeholder-slate-400 transition bg-white/50"
                                    required 
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
                            
                            {/* Password Strength Indicator */}
                            {formData.password.length > 0 && (
                                <div className="mt-2 space-y-1">
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full transition-all duration-300 ${getStrengthColor()}`}
                                                style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                                            />
                                        </div>
                                        <span className={`text-[10px] font-bold text-${passwordStrength.color}-600`}>
                                            {passwordStrength.label}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-slate-400">
                                        Use 6+ characters with uppercase, number & special character
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5">
                                Confirm Password <span className="text-red-400">*</span>
                            </label>
                            <div className="relative rounded-xl shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Shield className="h-5 w-5 text-slate-400" />
                                </div>
                                <input 
                                    type={showConfirmPassword ? 'text' : 'password'} 
                                    name="confirmPassword" 
                                    value={formData.confirmPassword} 
                                    onChange={handleChange} 
                                    placeholder="Confirm your password"
                                    className="block w-full pl-10 pr-12 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm placeholder-slate-400 transition bg-white/50"
                                    required 
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="h-5 w-5" />
                                    ) : (
                                        <Eye className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                            {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                                    <AlertCircle className="h-3 w-3" />
                                    Passwords do not match
                                </p>
                            )}
                        </div>

                        {/* Terms & Conditions */}
                        <div className="flex items-start gap-3">
                            <input
                                type="checkbox"
                                name="agreeTerms"
                                checked={formData.agreeTerms}
                                onChange={handleChange}
                                className="mt-1 h-4 w-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
                                required
                            />
                            <label className="text-xs text-slate-600">
                                I agree to the{' '}
                                <a href="#" className="text-emerald-600 hover:text-emerald-700 font-semibold">
                                    Terms and Conditions
                                </a>
                                {' '}and{' '}
                                <a href="#" className="text-emerald-600 hover:text-emerald-700 font-semibold">
                                    Privacy Policy
                                </a>
                            </label>
                        </div>

                        {/* Submit Button */}
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full flex justify-center items-center gap-3 py-3.5 px-4 border border-transparent rounded-xl text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/40"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    <span>Creating Account...</span>
                                </>
                            ) : (
                                <>
                                    <span>Create Account</span>
                                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* --- FOOTER --- */}
                    <div className="mt-6 text-center border-t border-slate-100 pt-6">
                        {/* Already have an account */}
                        <p className="text-sm text-slate-500">
                            Already have an account?{' '}
                            <Link 
                                to="/auth/login" 
                                className="font-bold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1 transition"
                            >
                                Sign in
                                <ChevronRight className="h-4 w-4" />
                            </Link>
                        </p>
                        
                        {/* Forgot Password Link - NEW */}
                        <p className="text-xs text-slate-400 mt-2">
                            <Link 
                                to="/auth/forgot-password" 
                                className="text-emerald-600 hover:text-emerald-700 hover:underline transition"
                            >
                                Forgot your password?
                            </Link>
                        </p>

                        {/* EcoTrack Branding */}
                        <div className="mt-3 flex items-center justify-center gap-2 text-xs text-slate-400">
                            <Recycle className="h-4 w-4 text-emerald-500" />
                            <span>EcoTrack Waste Management System</span>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default RegisterPage;