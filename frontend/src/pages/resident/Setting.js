import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../context/authcontext';
import API from '../../services/api';
import { 
    User, 
    Mail, 
    Phone, 
    MapPin, 
    Save, 
    Camera, 
    Lock, 
    Bell, 
    Shield, 
    LogOut,
    AlertCircle,
    CheckCircle2,
    Loader2,
    X,
    Eye,
    EyeOff,
    ChevronRight,
    UserCircle,
    Calendar,
    Smartphone,
    Globe,
    Moon,
    Sun,
    Palette,
    Edit2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ResidentSetting = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    
    // Profile states
    const [fullname, setFullname] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [location, setLocation] = useState('');
    const [bio, setBio] = useState('');
    const [profileImage, setProfileImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    
    // Password states
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    // Notification preferences
    const [notifications, setNotifications] = useState({
        emailAlerts: true,
        smsAlerts: true,
        pushNotifications: true,
        collectionUpdates: true,
        promotionalEmails: false,
        systemAnnouncements: true
    });
    
    // Theme preferences
    const [theme, setTheme] = useState('light');
    
    // UI states
    const [loading, setLoading] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [feedback, setFeedback] = useState({ type: null, text: '' });
    const [activeTab, setActiveTab] = useState('profile');
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (user) {
            setFullname(user.fullname || '');
            setEmail(user.email || '');
            setPhone(user.phone || '');
            setLocation(user.location || '');
            setBio(user.bio || '');
            // Load theme from localStorage
            const savedTheme = localStorage.getItem('theme') || 'light';
            setTheme(savedTheme);
            document.documentElement.className = savedTheme;
        }
    }, [user]);

    // Handle profile image change
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setFeedback({ type: 'error', text: 'Image size must be less than 5MB' });
                return;
            }
            if (!file.type.startsWith('image/')) {
                setFeedback({ type: 'error', text: 'Please select an image file' });
                return;
            }
            setProfileImage(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    // Update profile
    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        setFeedback({ type: null, text: '' });

        try {
            const formData = new FormData();
            formData.append('fullname', fullname);
            formData.append('email', email);
            formData.append('phone', phone);
            formData.append('location', location);
            formData.append('bio', bio);
            if (profileImage) {
                formData.append('profileImage', profileImage);
            }

            const res = await API.put(`/users/${user.id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setFeedback({ type: 'success', text: 'Profile updated successfully!' });
            setIsEditing(false);
            
            // Update user context
            if (res.data) {
                // Update local user data
                Object.assign(user, res.data);
            }
            
            setTimeout(() => setFeedback({ type: null, text: '' }), 3000);
        } catch (err) {
            setFeedback({ 
                type: 'error', 
                text: err.response?.data?.error || 'Failed to update profile.' 
            });
        } finally {
            setLoading(false);
        }
    };

    // Change password
    const handleChangePassword = async (e) => {
        e.preventDefault();
        setPasswordLoading(true);
        setFeedback({ type: null, text: '' });

        if (newPassword !== confirmPassword) {
            setFeedback({ type: 'error', text: 'Passwords do not match.' });
            setPasswordLoading(false);
            return;
        }

        if (newPassword.length < 6) {
            setFeedback({ type: 'error', text: 'Password must be at least 6 characters.' });
            setPasswordLoading(false);
            return;
        }

        try {
            await API.put(`/users/change-password/${user.id}`, {
                currentPassword,
                newPassword
            });

            setFeedback({ type: 'success', text: 'Password changed successfully!' });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            
            setTimeout(() => setFeedback({ type: null, text: '' }), 3000);
        } catch (err) {
            setFeedback({ 
                type: 'error', 
                text: err.response?.data?.error || 'Failed to change password.' 
            });
        } finally {
            setPasswordLoading(false);
        }
    };

    // Update notification preferences
    const handleNotificationChange = (key) => {
        setNotifications(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    // Toggle theme
    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.documentElement.className = newTheme;
    };

    // Handle logout
    const handleLogout = () => {
        if (window.confirm('Are you sure you want to logout?')) {
            logout();
            navigate('/auth/login');
        }
    };

    // Tab navigation items
    const tabs = [
        { id: 'profile', label: 'Profile', icon: <User className="h-4 w-4" /> },
        { id: 'security', label: 'Security', icon: <Shield className="h-4 w-4" /> },
        { id: 'notifications', label: 'Notifications', icon: <Bell className="h-4 w-4" /> },
        { id: 'preferences', label: 'Preferences', icon: <Palette className="h-4 w-4" /> }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 py-6 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                
                {/* --- HEADER --- */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
                    <div className="flex items-center space-x-4">
                        <div className="bg-gradient-to-br from-purple-600 to-purple-700 p-3 rounded-xl shadow-lg shadow-purple-600/20">
                            <UserCircle className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                                Account Settings
                            </h1>
                            <p className="text-sm text-slate-500 mt-0.5">
                                Manage your profile, security, and preferences
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <button
                            onClick={toggleTheme}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 transition"
                        >
                            {theme === 'light' ? (
                                <><Moon className="h-4 w-4" /> Dark Mode</>
                            ) : (
                                <><Sun className="h-4 w-4" /> Light Mode</>
                            )}
                        </button>
                    </div>
                </div>

                {/* --- FEEDBACK --- */}
                {feedback.text && (
                    <div className={`mt-6 p-4 rounded-xl border flex items-start space-x-3 ${
                        feedback.type === 'success' 
                            ? 'bg-emerald-50/80 border-emerald-200' 
                            : 'bg-red-50/80 border-red-200'
                    }`}>
                        {feedback.type === 'success' ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                        ) : (
                            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                        )}
                        <p className={`text-sm font-semibold ${
                            feedback.type === 'success' ? 'text-emerald-800' : 'text-red-800'
                        }`}>
                            {feedback.text}
                        </p>
                        <button 
                            onClick={() => setFeedback({ type: null, text: '' })}
                            className="ml-auto text-slate-400 hover:text-slate-600"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                )}

                {/* --- TABS --- */}
                <div className="mt-6 flex flex-wrap gap-1 border-b border-slate-200 pb-px">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-t-xl transition ${
                                activeTab === tab.id
                                    ? 'bg-white text-purple-600 border-b-2 border-purple-600'
                                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                            }`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* --- TAB CONTENT --- */}
                <div className="mt-6">
                    
                    {/* --- PROFILE TAB --- */}
                    {activeTab === 'profile' && (
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-purple-50/50 to-white">
                                <div className="flex items-center gap-3">
                                    <User className="h-5 w-5 text-purple-600" />
                                    <h3 className="font-bold text-slate-900">Personal Information</h3>
                                </div>
                            </div>
                            
                            <form onSubmit={handleUpdateProfile} className="p-6 space-y-5">
                                {/* Profile Image */}
                                <div className="flex flex-col sm:flex-row items-center gap-6">
                                    <div className="relative">
                                        <div className="h-24 w-24 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                                            {imagePreview ? (
                                                <img src={imagePreview} alt="Profile" className="h-full w-full object-cover" />
                                            ) : (
                                                <UserCircle className="h-16 w-16 text-purple-400" />
                                            )}
                                        </div>
                                        <label className="absolute bottom-0 right-0 p-1.5 bg-purple-600 rounded-full text-white cursor-pointer hover:bg-purple-700 transition shadow-lg">
                                            <Camera className="h-4 w-4" />
                                            <input 
                                                type="file" 
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="hidden"
                                            />
                                        </label>
                                    </div>
                                    <div className="flex-1 text-center sm:text-left">
                                        <p className="font-bold text-slate-900">{fullname || 'Your Name'}</p>
                                        <p className="text-sm text-slate-500">{email}</p>
                                        <p className="text-xs text-slate-400 mt-1">Click the camera icon to change profile photo</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                            Full Name
                                        </label>
                                        <input
                                            type="text"
                                            value={fullname}
                                            onChange={(e) => setFullname(e.target.value)}
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition"
                                            placeholder="Your full name"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition"
                                            placeholder="your@email.com"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                            Phone Number
                                        </label>
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition"
                                            placeholder="+250 788 000 000"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                            Location
                                        </label>
                                        <input
                                            type="text"
                                            value={location}
                                            onChange={(e) => setLocation(e.target.value)}
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition"
                                            placeholder="e.g., Kigali, Rwanda"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                        Bio
                                    </label>
                                    <textarea
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        rows="3"
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition resize-none"
                                        placeholder="Tell us a little about yourself..."
                                    />
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-3 px-6 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 transition active:scale-[0.98] disabled:opacity-60"
                                    >
                                        {loading ? (
                                            <><Loader2 className="h-5 w-5 animate-spin" /> Saving...</>
                                        ) : (
                                            <><Save className="h-5 w-5" /> Save Changes</>
                                        )}
                                    </button>
                                    {isEditing && (
                                        <button
                                            type="button"
                                            onClick={() => setIsEditing(false)}
                                            className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold transition"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    )}

                    {/* --- SECURITY TAB --- */}
                    {activeTab === 'security' && (
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-red-50/50 to-white">
                                <div className="flex items-center gap-3">
                                    <Shield className="h-5 w-5 text-red-600" />
                                    <h3 className="font-bold text-slate-900">Security Settings</h3>
                                </div>
                            </div>
                            
                            <form onSubmit={handleChangePassword} className="p-6 space-y-5">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                        Current Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showCurrentPassword ? 'text' : 'password'}
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition pr-12"
                                            placeholder="Enter current password"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        >
                                            {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showNewPassword ? 'text' : 'password'}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition pr-12"
                                            placeholder="Enter new password (min 6 characters)"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        >
                                            {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                        Confirm New Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition pr-12"
                                            placeholder="Confirm new password"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        >
                                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="submit"
                                        disabled={passwordLoading}
                                        className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-3 px-6 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 transition active:scale-[0.98] disabled:opacity-60"
                                    >
                                        {passwordLoading ? (
                                            <><Loader2 className="h-5 w-5 animate-spin" /> Updating...</>
                                        ) : (
                                            <><Lock className="h-5 w-5" /> Change Password</>
                                        )}
                                    </button>
                                </div>

                                <div className="p-4 bg-amber-50/80 rounded-xl border border-amber-200">
                                    <div className="flex items-start gap-2">
                                        <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-xs font-bold text-amber-800">Password Requirements:</p>
                                            <ul className="text-xs text-amber-700 mt-1 space-y-0.5">
                                                <li>• Minimum 6 characters</li>
                                                <li>• Mix of uppercase and lowercase letters</li>
                                                <li>• Include at least one number</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* --- NOTIFICATIONS TAB --- */}
                    {activeTab === 'notifications' && (
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50/50 to-white">
                                <div className="flex items-center gap-3">
                                    <Bell className="h-5 w-5 text-blue-600" />
                                    <h3 className="font-bold text-slate-900">Notification Preferences</h3>
                                </div>
                            </div>
                            
                            <div className="p-6 space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                                        <div className="flex items-center gap-3">
                                            <Mail className="h-5 w-5 text-blue-500" />
                                            <div>
                                                <p className="font-bold text-sm text-slate-900">Email Alerts</p>
                                                <p className="text-xs text-slate-400">Receive updates via email</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleNotificationChange('emailAlerts')}
                                            className={`relative w-12 h-6 rounded-full transition ${notifications.emailAlerts ? 'bg-blue-600' : 'bg-slate-300'}`}
                                        >
                                            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition ${notifications.emailAlerts ? 'right-0.5' : 'left-0.5'}`} />
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                                        <div className="flex items-center gap-3">
                                            <Smartphone className="h-5 w-5 text-green-500" />
                                            <div>
                                                <p className="font-bold text-sm text-slate-900">SMS Alerts</p>
                                                <p className="text-xs text-slate-400">Receive SMS notifications</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleNotificationChange('smsAlerts')}
                                            className={`relative w-12 h-6 rounded-full transition ${notifications.smsAlerts ? 'bg-blue-600' : 'bg-slate-300'}`}
                                        >
                                            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition ${notifications.smsAlerts ? 'right-0.5' : 'left-0.5'}`} />
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                                        <div className="flex items-center gap-3">
                                            <Bell className="h-5 w-5 text-purple-500" />
                                            <div>
                                                <p className="font-bold text-sm text-slate-900">Push Notifications</p>
                                                <p className="text-xs text-slate-400">In-app notifications</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleNotificationChange('pushNotifications')}
                                            className={`relative w-12 h-6 rounded-full transition ${notifications.pushNotifications ? 'bg-blue-600' : 'bg-slate-300'}`}
                                        >
                                            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition ${notifications.pushNotifications ? 'right-0.5' : 'left-0.5'}`} />
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                                        <div className="flex items-center gap-3">
                                            <Calendar className="h-5 w-5 text-amber-500" />
                                            <div>
                                                <p className="font-bold text-sm text-slate-900">Collection Updates</p>
                                                <p className="text-xs text-slate-400">Schedule change alerts</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleNotificationChange('collectionUpdates')}
                                            className={`relative w-12 h-6 rounded-full transition ${notifications.collectionUpdates ? 'bg-blue-600' : 'bg-slate-300'}`}
                                        >
                                            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition ${notifications.collectionUpdates ? 'right-0.5' : 'left-0.5'}`} />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                                    <div className="flex items-center gap-3">
                                        <Globe className="h-5 w-5 text-slate-500" />
                                        <div>
                                            <p className="font-bold text-sm text-slate-900">System Announcements</p>
                                            <p className="text-xs text-slate-400">Important platform updates</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleNotificationChange('systemAnnouncements')}
                                        className={`relative w-12 h-6 rounded-full transition ${notifications.systemAnnouncements ? 'bg-blue-600' : 'bg-slate-300'}`}
                                    >
                                        <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition ${notifications.systemAnnouncements ? 'right-0.5' : 'left-0.5'}`} />
                                    </button>
                                </div>

                                <div className="pt-2">
                                    <button
                                        onClick={() => {
                                            setFeedback({ type: 'success', text: 'Notification preferences saved!' });
                                            setTimeout(() => setFeedback({ type: null, text: '' }), 3000);
                                        }}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-xl text-sm font-bold transition"
                                    >
                                        Save Preferences
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- PREFERENCES TAB --- */}
                    {activeTab === 'preferences' && (
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-indigo-50/50 to-white">
                                <div className="flex items-center gap-3">
                                    <Palette className="h-5 w-5 text-indigo-600" />
                                    <h3 className="font-bold text-slate-900">Appearance & Preferences</h3>
                                </div>
                            </div>
                            
                            <div className="p-6 space-y-6">
                                <div>
                                    <h4 className="font-bold text-slate-900 text-sm mb-3">Theme</h4>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        <button
                                            onClick={() => {
                                                setTheme('light');
                                                localStorage.setItem('theme', 'light');
                                                document.documentElement.className = 'light';
                                            }}
                                            className={`p-4 rounded-xl border-2 transition ${
                                                theme === 'light' 
                                                    ? 'border-indigo-600 bg-indigo-50' 
                                                    : 'border-slate-200 hover:border-slate-300'
                                            }`}
                                        >
                                            <div className="flex flex-col items-center gap-2">
                                                <Sun className="h-6 w-6 text-amber-500" />
                                                <span className="text-xs font-bold">Light</span>
                                            </div>
                                        </button>
                                        <button
                                            onClick={() => {
                                                setTheme('dark');
                                                localStorage.setItem('theme', 'dark');
                                                document.documentElement.className = 'dark';
                                            }}
                                            className={`p-4 rounded-xl border-2 transition ${
                                                theme === 'dark' 
                                                    ? 'border-indigo-600 bg-indigo-50' 
                                                    : 'border-slate-200 hover:border-slate-300'
                                            }`}
                                        >
                                            <div className="flex flex-col items-center gap-2">
                                                <Moon className="h-6 w-6 text-slate-700" />
                                                <span className="text-xs font-bold">Dark</span>
                                            </div>
                                        </button>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-200">
                                    <h4 className="font-bold text-slate-900 text-sm mb-3">Danger Zone</h4>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 py-3 px-6 rounded-xl text-sm font-bold transition border border-red-200"
                                    >
                                        <LogOut className="h-5 w-5" />
                                        Logout Account
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                </div>

                {/* --- FOOTER --- */}
                <div className="mt-8 text-center text-xs text-slate-400 border-t border-slate-200 pt-6">
                    <p>Secure account management • Last updated: {new Date().toLocaleDateString()}</p>
                </div>

            </div>
        </div>
    );
};

export default ResidentSetting;