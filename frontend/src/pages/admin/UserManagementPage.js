import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, User, Phone, Mail, Save, RefreshCw, AlertCircle, 
  CheckCircle, Search, Filter, Users, UserCheck, UserX,
  Shield, Truck, Home, Recycle, MoreVertical, Edit2, Trash2,
  X, Loader2, ChevronDown, ChevronUp
} from 'lucide-react';

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingUserId, setEditingUserId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // State for edit form
  const [editFormData, setEditFormData] = useState({
    fullname: '',
    email: '',
    phone: '',
    role: ''
  });

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    admins: 0,
    residents: 0,
    collectors: 0,
    recyclingStaff: 0
  });

  // --- 1. FETCH USERS ---
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/users');
      const data = await response.json();
      if (!response.ok) throw new Error('Failed to load users.');
      setUsers(data);
      updateStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- 2. UPDATE STATISTICS ---
  const updateStats = (userList) => {
    const admins = userList.filter(u => u.role === 'admin').length;
    const residents = userList.filter(u => u.role === 'resident').length;
    const collectors = userList.filter(u => u.role === 'collector').length;
    const recyclingStaff = userList.filter(u => u.role === 'recycling_staff').length;
    
    setStats({
      total: userList.length,
      admins,
      residents,
      collectors,
      recyclingStaff
    });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // --- 3. START EDIT ---
  const handleEditClick = (user) => {
    setEditingUserId(user.user_id);
    setEditFormData({
      fullname: user.fullname,
      email: user.email,
      phone: user.phone,
      role: user.role
    });
  };

  // --- 4. HANDLE INPUT CHANGE ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({ ...editFormData, [name]: value });
  };

  // --- 5. SAVE UPDATE ---
  const handleSaveUpdate = async (e, userId) => {
    e.preventDefault();
    setSuccess('');
    setError('');

    try {
      const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update user.');

      setSuccess(`User permissions updated successfully!`);
      setEditingUserId(null);
      fetchUsers();
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  // --- 6. DELETE USER ---
  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete user.');
      
      setSuccess(`${userName} has been removed from the system.`);
      fetchUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  // --- 7. CANCEL EDIT ---
  const handleCancelEdit = () => {
    setEditingUserId(null);
  };

  // --- 8. FILTERED USERS ---
  const getFilteredUsers = () => {
    let filtered = users;
    
    // Apply role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }
    
    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(user => 
        user.fullname.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        user.phone.includes(term)
      );
    }
    
    return filtered;
  };

  // --- 9. GET ROLE BADGE COLOR ---
  const getRoleBadgeStyle = (role) => {
    const styles = {
      admin: 'bg-purple-100 text-purple-800 border-purple-200',
      resident: 'bg-blue-100 text-blue-800 border-blue-200',
      collector: 'bg-amber-100 text-amber-800 border-amber-200',
      recycling_staff: 'bg-emerald-100 text-emerald-800 border-emerald-200'
    };
    return styles[role] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // --- 10. GET ROLE ICON ---
  const getRoleIcon = (role) => {
    const icons = {
      admin: <Shield className="h-3.5 w-3.5" />,
      resident: <Home className="h-3.5 w-3.5" />,
      collector: <Truck className="h-3.5 w-3.5" />,
      recycling_staff: <Recycle className="h-3.5 w-3.5" />
    };
    return icons[role] || <User className="h-3.5 w-3.5" />;
  };

  const filteredUsers = getFilteredUsers();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-3 rounded-xl shadow-lg shadow-blue-600/20">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                User Management
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Manage system users, assign roles, and control permissions
              </p>
            </div>
          </div>
          
          <button 
            onClick={fetchUsers}
            disabled={loading}
            className="inline-flex items-center space-x-2 bg-white hover:bg-slate-50 text-slate-700 text-sm font-bold py-2.5 px-4 border border-slate-200 rounded-lg shadow-sm transition duration-150 active:scale-95 disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Loading...' : 'Refresh'}</span>
          </button>
        </div>

        {/* --- STATISTICS CARDS --- */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total</p>
                <p className="text-2xl font-black text-slate-900">{stats.total}</p>
              </div>
              <div className="h-10 w-10 bg-slate-100 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-slate-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Admins</p>
                <p className="text-2xl font-black text-purple-600">{stats.admins}</p>
              </div>
              <div className="h-10 w-10 bg-purple-50 rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Residents</p>
                <p className="text-2xl font-black text-blue-600">{stats.residents}</p>
              </div>
              <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <Home className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Collectors</p>
                <p className="text-2xl font-black text-amber-600">{stats.collectors}</p>
              </div>
              <div className="h-10 w-10 bg-amber-50 rounded-lg flex items-center justify-center">
                <Truck className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recycling Staff</p>
                <p className="text-2xl font-black text-emerald-600">{stats.recyclingStaff}</p>
              </div>
              <div className="h-10 w-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                <Recycle className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </div>
        </div>

        {/* --- ALERTS --- */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm font-semibold text-red-800">{error}</p>
            <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-lg flex items-start space-x-3">
            <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm font-medium text-emerald-800">{success}</p>
            <button onClick={() => setSuccess('')} className="ml-auto text-emerald-400 hover:text-emerald-600">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* --- SEARCH AND FILTERS --- */}
        <div className="mb-6 bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search users by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              />
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center space-x-2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition"
              >
                <Filter className="h-4 w-4" />
                <span>Filters</span>
                {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              
              {(searchTerm || roleFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setRoleFilter('all');
                  }}
                  className="px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
          
          {showFilters && (
            <div className="mt-3 pt-3 border-t border-slate-200">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setRoleFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    roleFilter === 'all' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  All Roles
                </button>
                <button
                  onClick={() => setRoleFilter('admin')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    roleFilter === 'admin' 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-purple-50 text-purple-600 hover:bg-purple-100'
                  }`}
                >
                  <span className="flex items-center gap-1">
                    <Shield className="h-3 w-3" /> Admin
                  </span>
                </button>
                <button
                  onClick={() => setRoleFilter('resident')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    roleFilter === 'resident' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                  }`}
                >
                  <span className="flex items-center gap-1">
                    <Home className="h-3 w-3" /> Resident
                  </span>
                </button>
                <button
                  onClick={() => setRoleFilter('collector')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    roleFilter === 'collector' 
                      ? 'bg-amber-600 text-white' 
                      : 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                  }`}
                >
                  <span className="flex items-center gap-1">
                    <Truck className="h-3 w-3" /> Collector
                  </span>
                </button>
                <button
                  onClick={() => setRoleFilter('recycling_staff')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    roleFilter === 'recycling_staff' 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                  }`}
                >
                  <span className="flex items-center gap-1">
                    <Recycle className="h-3 w-3" /> Recycling Staff
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* --- USER TABLE --- */}
        <div className="bg-white shadow-sm rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-4 py-4 sm:px-6 bg-gradient-to-r from-slate-50 to-white border-b border-slate-200 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-slate-700">
                Registered Users
                <span className="ml-2 text-xs font-normal text-slate-400">
                  ({filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'})
                </span>
              </h3>
            </div>
            <div className="text-xs text-slate-400">
              {loading && <span className="flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Loading...</span>}
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-t-blue-600"></div>
              <p className="mt-3 text-sm text-slate-500">Loading user data...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center h-16 w-16 bg-slate-100 rounded-full mb-4">
                <UserX className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-sm font-bold text-slate-700">No users found</h3>
              <p className="text-sm text-slate-400 mt-1">
                {searchTerm || roleFilter !== 'all' ? 'Try adjusting your filters' : 'No users registered in the system'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead className="bg-slate-50/80 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 sm:px-6 py-3">User</th>
                    <th className="px-4 sm:px-6 py-3 hidden sm:table-cell">Contact</th>
                    <th className="px-4 sm:px-6 py-3">Role</th>
                    <th className="px-4 sm:px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredUsers.map((user) => (
                    <tr key={user.user_id} className="hover:bg-slate-50/60 transition duration-150 group">
                      
                      {/* User Info */}
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <div className="flex items-center space-x-3">
                          <div className={`h-9 w-9 rounded-full flex items-center justify-center font-bold text-sm ${
                            user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                            user.role === 'collector' ? 'bg-amber-100 text-amber-700' :
                            user.role === 'recycling_staff' ? 'bg-emerald-100 text-emerald-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {user.fullname.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            {editingUserId === user.user_id ? (
                              <input 
                                type="text" 
                                name="fullname" 
                                value={editFormData.fullname} 
                                onChange={handleInputChange}
                                className="w-full px-2 py-1 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                placeholder="Full name"
                              />
                            ) : (
                              <div>
                                <p className="font-semibold text-slate-900 truncate">{user.fullname}</p>
                                <div className="flex items-center gap-2 text-xs text-slate-400 sm:hidden">
                                  <Mail className="h-3 w-3" />
                                  <span className="truncate">{user.email}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Contact Info - Hidden on mobile (shown above) */}
                      <td className="px-4 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">
                        <div className="space-y-0.5 text-xs">
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <Mail className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                            {editingUserId === user.user_id ? (
                              <input 
                                type="email" 
                                name="email" 
                                value={editFormData.email} 
                                onChange={handleInputChange}
                                className="w-full px-2 py-0.5 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                placeholder="Email"
                              />
                            ) : (
                              <span className="truncate">{user.email}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <Phone className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                            {editingUserId === user.user_id ? (
                              <input 
                                type="text" 
                                name="phone" 
                                value={editFormData.phone} 
                                onChange={handleInputChange}
                                className="w-full px-2 py-0.5 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                placeholder="Phone"
                              />
                            ) : (
                              <span>{user.phone}</span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        {editingUserId === user.user_id ? (
                          <select
                            name="role"
                            value={editFormData.role}
                            onChange={handleInputChange}
                            className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                          >
                            <option value="admin">Admin</option>
                            <option value="resident">Resident</option>
                            <option value="collector">Collector</option>
                            <option value="recycling_staff">Recycling Staff</option>
                          </select>
                        ) : (
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full border ${getRoleBadgeStyle(user.role)}`}>
                            {getRoleIcon(user.role)}
                            {user.role === 'recycling_staff' ? 'Recycling Staff' : 
                             user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-right">
                        {editingUserId === user.user_id ? (
                          <div className="flex items-center justify-end space-x-2">
                            <button 
                              onClick={(e) => handleSaveUpdate(e, user.user_id)}
                              className="inline-flex items-center space-x-1 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm"
                            >
                              <Save className="h-3.5 w-3.5" />
                              <span className="hidden sm:inline">Save</span>
                            </button>
                            <button 
                              onClick={handleCancelEdit}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold transition"
                            >
                              <X className="h-3.5 w-3.5 sm:hidden" />
                              <span className="hidden sm:inline">Cancel</span>
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end space-x-1.5">
                            <button 
                              onClick={() => handleEditClick(user)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition"
                              title="Edit user"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteUser(user.user_id, user.fullname)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                              title="Delete user"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* --- FOOTER --- */}
        <div className="mt-6 text-center text-xs text-slate-400 border-t border-slate-200 pt-6">
          <p>Secure access control system • All user actions are logged for audit purposes</p>
        </div>

      </div>
    </div>
  );
};

export default UserManagementPage;