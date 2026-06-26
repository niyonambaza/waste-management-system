import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/authcontext';
import API from '../../services/api';
import { 
    Users, 
    UserPlus, 
    Edit2, 
    Trash2, 
    RefreshCw, 
    AlertCircle, 
    CheckCircle2,
    Loader2,
    X,
    Search,
    Filter,
    ChevronDown,
    ChevronUp,
    Building2,
    Phone,
    Mail,
    User,
    Shield,
    Calendar,
    MoreVertical,
    Eye,
    UserCheck
} from 'lucide-react';

const Staff = () => {
    const { user } = useContext(AuthContext);
    
    // State
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    
    // Form States
    const [isEditing, setIsEditing] = useState(false);
    const [currentStaffId, setCurrentStaffId] = useState(null);
    const [formData, setFormData] = useState({
        user_id: '',
        center_id: '',
        employee_number: ''
    });
    
    // Users and Centers for dropdowns
    const [users, setUsers] = useState([]);
    const [centers, setCenters] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [loadingCenters, setLoadingCenters] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Stats
    const [stats, setStats] = useState({
        total: 0,
        activeStaff: 0,
        centers: 0
    });

    // Load staff data
    useEffect(() => {
        fetchStaff();
        fetchUsers();
        fetchCenters();
    }, []);

    const fetchStaff = async () => {
        setLoading(true);
        setError('');
        try {
            // Get staff with user and center details
            const [staffRes, staffCountRes] = await Promise.all([
                API.get('/recycling-staff'),
                API.get('/recycling-staff/count')
            ]);
            
            // Fetch user details for each staff member
            const staffWithDetails = await Promise.all(
                staffRes.data.map(async (staffMember) => {
                    try {
                        const userRes = await API.get(`/users/${staffMember.user_id}`);
                        const centerRes = await API.get(`/recycling-centers/${staffMember.center_id}`);
                        return {
                            ...staffMember,
                            user: userRes.data,
                            center: centerRes.data
                        };
                    } catch (err) {
                        return {
                            ...staffMember,
                            user: { fullname: 'Unknown', email: 'Unknown' },
                            center: { center_name: 'Unknown' }
                        };
                    }
                })
            );
            
            setStaff(staffWithDetails);
            updateStats(staffWithDetails);
        } catch (err) {
            console.error('Error fetching staff:', err);
            setError('Failed to load staff data. Please refresh.');
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        setLoadingUsers(true);
        try {
            const res = await API.get('/users');
            // Filter users with role 'staff' or 'recycling_staff'
            const staffUsers = res.data.filter(u => 
                u.role === 'staff' || u.role === 'recycling_staff'
            );
            setUsers(staffUsers);
        } catch (err) {
            console.error('Error fetching users:', err);
        } finally {
            setLoadingUsers(false);
        }
    };

    const fetchCenters = async () => {
        setLoadingCenters(true);
        try {
            const res = await API.get('/recycling-centers');
            setCenters(res.data);
            setStats(prev => ({ ...prev, centers: res.data.length }));
        } catch (err) {
            console.error('Error fetching centers:', err);
        } finally {
            setLoadingCenters(false);
        }
    };

    const updateStats = (staffData) => {
        const total = staffData.length;
        const activeStaff = staffData.filter(s => s.status !== 'inactive').length;
        setStats({ total, activeStaff, centers: stats.centers });
    };

    // Handle form input change
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            user_id: '',
            center_id: '',
            employee_number: ''
        });
        setIsEditing(false);
        setCurrentStaffId(null);
    };

    // Handle Create Staff
    const handleCreateStaff = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');
        setSuccess('');

        if (!formData.user_id || !formData.center_id || !formData.employee_number) {
            setError('Please fill in all required fields.');
            setIsSubmitting(false);
            return;
        }

        try {
            await API.post('/recycling-staff', {
                user_id: parseInt(formData.user_id),
                center_id: parseInt(formData.center_id),
                employee_number: formData.employee_number
            });
            
            setSuccess('Staff member added successfully!');
            resetForm();
            fetchStaff();
            
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error('Error creating staff:', err);
            setError(err.response?.data?.error || 'Failed to add staff member.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle Update Staff
    const handleUpdateStaff = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');
        setSuccess('');

        if (!formData.center_id || !formData.employee_number) {
            setError('Please fill in all required fields.');
            setIsSubmitting(false);
            return;
        }

        try {
            await API.put(`/recycling-staff/${currentStaffId}`, {
                center_id: parseInt(formData.center_id),
                employee_number: formData.employee_number
            });
            
            setSuccess('Staff member updated successfully!');
            resetForm();
            fetchStaff();
            
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error('Error updating staff:', err);
            setError(err.response?.data?.error || 'Failed to update staff member.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle Delete Staff
    const handleDeleteStaff = async (id, name) => {
        if (!window.confirm(`Are you sure you want to remove ${name} from staff?`)) {
            return;
        }

        try {
            await API.delete(`/recycling-staff/${id}`);
            setSuccess('Staff member removed successfully!');
            fetchStaff();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error('Error deleting staff:', err);
            setError(err.response?.data?.error || 'Failed to remove staff member.');
        }
    };

    // Handle Edit Click
    const handleEditClick = (staffMember) => {
        setIsEditing(true);
        setCurrentStaffId(staffMember.staff_id);
        setFormData({
            user_id: staffMember.user_id,
            center_id: staffMember.center_id,
            employee_number: staffMember.employee_number
        });
    };

    // Filter staff based on search
    const filteredStaff = staff.filter(item => {
        const search = searchTerm.toLowerCase();
        return (
            item.user?.fullname?.toLowerCase().includes(search) ||
            item.user?.email?.toLowerCase().includes(search) ||
            item.employee_number?.toLowerCase().includes(search) ||
            item.center?.center_name?.toLowerCase().includes(search)
        );
    });

    // Get user name by ID
    const getUserName = (id) => {
        const found = users.find(u => u.user_id === parseInt(id));
        return found ? found.fullname : 'Select user';
    };

    // Get center name by ID
    const getCenterName = (id) => {
        const found = centers.find(c => c.center_id === parseInt(id));
        return found ? found.center_name : 'Select center';
    };

    // Get role badge
    const getRoleBadge = (role) => {
        const styles = {
            'staff': 'bg-blue-100 text-blue-700',
            'recycling_staff': 'bg-emerald-100 text-emerald-700'
        };
        return styles[role] || 'bg-gray-100 text-gray-700';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 py-6 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-6">
                
                {/* --- HEADER --- */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
                    <div className="flex items-center space-x-4">
                        <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 p-3 rounded-xl shadow-lg shadow-emerald-600/20">
                            <Users className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                                Recycling Staff Management
                            </h1>
                            <p className="text-sm text-slate-500 mt-0.5">
                                Manage staff members and their assignments
                            </p>
                        </div>
                    </div>
                    
                    <button 
                        onClick={fetchStaff}
                        disabled={loading}
                        className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 text-sm font-bold py-2.5 px-4 border border-slate-200 rounded-lg shadow-sm transition active:scale-95 disabled:opacity-60"
                    >
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        <span className="hidden sm:inline">Refresh</span>
                    </button>
                </div>

                {/* --- STATISTICS CARDS --- */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Staff</p>
                                <p className="text-2xl font-black text-slate-900 mt-1">{stats.total}</p>
                            </div>
                            <div className="h-11 w-11 bg-emerald-50 rounded-xl flex items-center justify-center">
                                <Users className="h-5 w-5 text-emerald-600" />
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Staff</p>
                                <p className="text-2xl font-black text-blue-600 mt-1">{stats.activeStaff}</p>
                            </div>
                            <div className="h-11 w-11 bg-blue-50 rounded-xl flex items-center justify-center">
                                <UserCheck className="h-5 w-5 text-blue-600" />
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recycling Centers</p>
                                <p className="text-2xl font-black text-purple-600 mt-1">{stats.centers}</p>
                            </div>
                            <div className="h-11 w-11 bg-purple-50 rounded-xl flex items-center justify-center">
                                <Building2 className="h-5 w-5 text-purple-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- ALERTS --- */}
                {error && (
                    <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-start space-x-3">
                        <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-700 flex-1">{error}</p>
                        <button onClick={() => setError('')} className="text-red-400 hover:text-red-600">
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                )}
                
                {success && (
                    <div className="p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-lg flex items-start space-x-3">
                        <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm font-medium text-emerald-800 flex-1">{success}</p>
                        <button onClick={() => setSuccess('')} className="text-emerald-400 hover:text-emerald-600">
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                )}

                {/* --- SEARCH AND FILTERS --- */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1 relative">
                            <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Search staff by name, email, or employee number..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                            />
                        </div>
                        
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition"
                        >
                            <Filter className="h-4 w-4" />
                            <span className="hidden sm:inline">Filters</span>
                            {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>
                    </div>
                    
                    {showFilters && (
                        <div className="mt-3 pt-3 border-t border-slate-200">
                            <div className="flex flex-wrap gap-2">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider self-center">Filter by:</span>
                                <select className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500">
                                    <option value="all">All Centers</option>
                                    {centers.map(center => (
                                        <option key={center.center_id} value={center.center_id}>
                                            {center.center_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}
                </div>

                {/* --- MAIN CONTENT GRID --- */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* --- FORM --- */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden sticky top-20">
                            <div className="p-5 border-b border-slate-200 bg-gradient-to-r from-emerald-50/50 to-white">
                                <div className="flex items-center gap-2.5">
                                    <UserPlus className="h-5 w-5 text-emerald-600" />
                                    <h3 className="font-bold text-slate-900">
                                        {isEditing ? 'Edit Staff Member' : 'Add Staff Member'}
                                    </h3>
                                </div>
                            </div>
                            
                            <form onSubmit={isEditing ? handleUpdateStaff : handleCreateStaff} className="p-5 space-y-4">
                                {!isEditing && (
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                            User <span className="text-red-400">*</span>
                                        </label>
                                        <select
                                            name="user_id"
                                            value={formData.user_id}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                                            required={!isEditing}
                                        >
                                            <option value="">Select a user...</option>
                                            {users.map(u => (
                                                <option key={u.user_id} value={u.user_id}>
                                                    {u.fullname} ({u.email}) - {u.role}
                                                </option>
                                            ))}
                                        </select>
                                        {loadingUsers && (
                                            <p className="text-xs text-slate-400 mt-1">Loading users...</p>
                                        )}
                                    </div>
                                )}

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                        Recycling Center <span className="text-red-400">*</span>
                                    </label>
                                    <select
                                        name="center_id"
                                        value={formData.center_id}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                                        required
                                    >
                                        <option value="">Select a center...</option>
                                        {centers.map(c => (
                                            <option key={c.center_id} value={c.center_id}>
                                                {c.center_name} - {c.location}
                                            </option>
                                        ))}
                                    </select>
                                    {loadingCenters && (
                                        <p className="text-xs text-slate-400 mt-1">Loading centers...</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                        Employee Number <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="employee_number"
                                        value={formData.employee_number}
                                        onChange={handleInputChange}
                                        placeholder="e.g., STF-2024-001"
                                        className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                                        required
                                    />
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white py-2.5 px-4 rounded-lg text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition active:scale-[0.98] disabled:opacity-60"
                                    >
                                        {isSubmitting ? (
                                            <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</>
                                        ) : isEditing ? (
                                            <><Edit2 className="h-4 w-4" /> Update Staff</>
                                        ) : (
                                            <><UserPlus className="h-4 w-4" /> Add Staff</>
                                        )}
                                    </button>
                                    
                                    {isEditing && (
                                        <button
                                            type="button"
                                            onClick={resetForm}
                                            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-bold transition"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* --- STAFF LIST --- */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-5 border-b border-slate-200 bg-gradient-to-r from-emerald-50/50 to-white">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <Users className="h-5 w-5 text-emerald-600" />
                                        <h3 className="font-bold text-slate-900">
                                            Staff Members
                                            <span className="ml-2 text-sm font-normal text-slate-400">
                                                ({filteredStaff.length})
                                            </span>
                                        </h3>
                                    </div>
                                </div>
                            </div>

                            {loading ? (
                                <div className="p-12 text-center">
                                    <Loader2 className="h-8 w-8 text-emerald-600 animate-spin mx-auto mb-3" />
                                    <p className="text-sm text-slate-500">Loading staff data...</p>
                                </div>
                            ) : filteredStaff.length === 0 ? (
                                <div className="p-12 text-center">
                                    <div className="inline-flex items-center justify-center h-16 w-16 bg-slate-100 rounded-full mb-4">
                                        <Users className="h-8 w-8 text-slate-400" />
                                    </div>
                                    <h3 className="text-sm font-bold text-slate-700">No staff members found</h3>
                                    <p className="text-sm text-slate-400 mt-1">
                                        {searchTerm ? 'Try adjusting your search' : 'Add your first staff member using the form'}
                                    </p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100">
                                    {filteredStaff.map((item) => (
                                        <div key={item.staff_id} className="p-5 hover:bg-slate-50/60 transition">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                <div className="flex items-center gap-4 min-w-0">
                                                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                                                        {item.user?.fullname?.charAt(0)?.toUpperCase() || 'S'}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <p className="font-bold text-slate-900 truncate">
                                                                {item.user?.fullname || 'Unknown'}
                                                            </p>
                                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getRoleBadge(item.user?.role)}`}>
                                                                {item.user?.role || 'Staff'}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5 flex-wrap">
                                                            <span className="flex items-center gap-1">
                                                                <Mail className="h-3 w-3" />
                                                                {item.user?.email || 'No email'}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <Building2 className="h-3 w-3" />
                                                                {item.center?.center_name || 'No center'}
                                                            </span>
                                                            <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded">
                                                                <Shield className="h-3 w-3" />
                                                                ID: {item.employee_number}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                    <button
                                                        onClick={() => handleEditClick(item)}
                                                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                        title="Edit staff"
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteStaff(item.staff_id, item.user?.fullname)}
                                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                                        title="Remove staff"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* --- FOOTER --- */}
                <div className="text-center text-xs text-slate-400 border-t border-slate-200 pt-6">
                    <p>Staff management system • All staff members are assigned to recycling centers</p>
                </div>
            </div>
        </div>
    );
};

export default Staff;