import React, { useEffect, useState } from 'react';
import { getUsers, deleteUser } from '../../services/userService';
import { Users as UsersIcon, Trash2, Edit3, Check, X, RefreshCw, AlertCircle, Phone, Mail, Shield } from 'lucide-react';
import API from '../../services/api'; // Assuming generic API put exists for updates

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    
    // Track which user record is currently undergoing edit changes
    const [editingId, setEditingId] = useState(null);
    const [editFormData, setEditFormData] = useState({
        fullname: '',
        email: '',
        phone: '',
        role: ''
    });

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        setLoading(true);
        setError(false);
        try {
            const res = await getUsers();
            setUsers(res.data);
        } catch (err) { 
            console.error("Failed to load user accounts database registry:", err);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    // Trigger row inline edit inputs state populating existing values
    const startEdit = (user) => {
        setEditingId(user.user_id);
        setEditFormData({
            fullname: user.fullname,
            email: user.email,
            phone: user.phone,
            role: user.role
        });
    };

    const cancelEdit = () => {
        setEditingId(null);
    };

    const handleEditChange = (e) => {
        setEditFormData({
            ...editFormData,
            [e.target.name]: e.target.value
        });
    };

    // Process updated payload back into your service infrastructure
    const handleUpdate = async (id) => {
        try {
            await API.put(`/users/${id}`, editFormData);
            setEditingId(null);
            loadUsers(); // Refresh layout with updated details
        } catch (err) {
            console.error(err);
            alert("System failed to update user profile modifications.");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to permanently delete this account from EcoTrack?")) {
            try {
                await deleteUser(id);
                loadUsers(); 
            } catch (err) { 
                alert("Operation failed. Unable to erase targeted user records."); 
            }
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
            
            {/* --- CORE CONTROL PANEL SECTION HEADER --- */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        User Accounts Management
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                        Audit authority access, update credentials profiles, and manage system roles assignments.
                    </p>
                </div>
                
                <button 
                    onClick={loadUsers}
                    disabled={loading}
                    className="inline-flex items-center justify-center space-x-2 bg-white hover:bg-slate-50 text-slate-700 text-sm font-bold py-2 px-4 border border-slate-200 rounded-lg shadow-sm transition duration-150 active:scale-95"
                >
                    <RefreshCw className={`h-4 w-4 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
                    <span>Sync Directory</span>
                </button>
            </div>

            {error && (
                <div className="flex items-center space-x-3 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                    <p className="text-sm text-red-700 font-medium">
                        System error occurred fetching account indexes. Please try reloading.
                    </p>
                </div>
            )}

            {/* --- ENTERPRISE RELATIONAL ACCOUNTS TABLE DATA --- */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-100">
                        <thead className="bg-slate-50 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                            <tr>
                                <th className="p-4 pl-6">Full Name</th>
                                <th className="p-4">Contact Methods</th>
                                <th className="p-4">System Role Access</th>
                                <th className="p-4 pr-6 text-right">Actions Workflow</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm text-slate-700 bg-white">
                            {loading ? (
                                /* Skeletons Loader Loop */
                                [1, 2, 3].map(row => (
                                    <tr key={row} className="animate-pulse">
                                        <td className="p-4 pl-6"><div className="h-4 w-32 bg-slate-100 rounded" /></td>
                                        <td className="p-4"><div className="h-4 w-48 bg-slate-100 rounded" /></td>
                                        <td className="p-4"><div className="h-5 w-16 bg-slate-100 rounded" /></td>
                                        <td className="p-4 pr-6 text-right"><div className="h-6 w-24 bg-slate-100 rounded ml-auto" /></td>
                                    </tr>
                                ))
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="p-12 text-center text-slate-400">
                                        <div className="h-10 w-10 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <UsersIcon className="h-5 w-5 text-slate-400" />
                                        </div>
                                        <span className="font-bold text-slate-700 block text-sm">No Active User Accounts</span>
                                        <p className="text-xs mt-1">There are no logged registrations inside this framework layer.</p>
                                    </td>
                                </tr>
                            ) : (
                                users.map(u => {
                                    const isEditing = editingId === u.user_id;
                                    return (
                                        <tr key={u.user_id} className={`hover:bg-slate-50/50 transition ${isEditing ? 'bg-blue-50/20' : ''}`}>
                                            
                                            {/* Full Name Column Block */}
                                            <td className="p-4 pl-6 font-semibold text-slate-900">
                                                {isEditing ? (
                                                    <input 
                                                        type="text" 
                                                        name="fullname"
                                                        value={editFormData.fullname}
                                                        onChange={handleEditChange}
                                                        className="w-full px-2.5 py-1.5 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                                    />
                                                ) : (
                                                    u.fullname
                                                )}
                                            </td>

                                            {/* Contact Details Grid Cell */}
                                            <td className="p-4 space-y-1">
                                                {isEditing ? (
                                                    <div className="space-y-2 max-w-xs">
                                                        <input 
                                                            type="email" 
                                                            name="email"
                                                            value={editFormData.email}
                                                            onChange={handleEditChange}
                                                            className="w-full px-2.5 py-1 text-xs border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                                            placeholder="Email"
                                                        />
                                                        <input 
                                                            type="text" 
                                                            name="phone"
                                                            value={editFormData.phone}
                                                            onChange={handleEditChange}
                                                            className="w-full px-2.5 py-1 text-xs border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                                            placeholder="Phone"
                                                        />
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="flex items-center text-slate-500 text-xs">
                                                            <Mail className="h-3.5 w-3.5 mr-1.5 text-slate-400" /> {u.email}
                                                        </div>
                                                        <div className="flex items-center text-slate-400 text-xs mt-0.5">
                                                            <Phone className="h-3.5 w-3.5 mr-1.5 text-slate-300" /> {u.phone || 'No phone registered'}
                                                        </div>
                                                    </>
                                                )}
                                            </td>

                                            {/* Access Role Badges Segment */}
                                            <td className="p-4">
                                                {isEditing ? (
                                                    <select 
                                                        name="role"
                                                        value={editFormData.role}
                                                        onChange={handleEditChange}
                                                        className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold"
                                                    >
                                                        <option value="resident">Resident</option>
                                                        <option value="staff">Staff</option>
                                                        <option value="collector">Collector</option>
                                                        <option value="admin">Admin</option>
                                                    </select>
                                                ) : (
                                                    <span className={`inline-flex items-center space-x-1 font-bold text-xs px-2.5 py-0.5 rounded-full border ${
                                                        u.role === 'admin' 
                                                        ? 'bg-blue-50 text-blue-700 border-blue-200' 
                                                        : 'bg-slate-50 text-slate-600 border-slate-200'
                                                    }`}>
                                                        <Shield className="h-3 w-3 opacity-70 mr-0.5" />
                                                        <span className="capitalize">{u.role}</span>
                                                    </span>
                                                )}
                                            </td>

                                            {/* Action Execution Buttons Block */}
                                            <td className="p-4 pr-6 text-right whitespace-nowrap">
                                                {isEditing ? (
                                                    <div className="flex items-center justify-end space-x-2">
                                                        <button 
                                                            onClick={() => handleUpdate(u.user_id)} 
                                                            className="inline-flex items-center justify-center p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded transition shadow-sm"
                                                            title="Save Updates"
                                                        >
                                                            <Check className="h-4 w-4" />
                                                        </button>
                                                        <button 
                                                            onClick={cancelEdit} 
                                                            className="inline-flex items-center justify-center p-1.5 bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 rounded transition shadow-sm"
                                                            title="Discard Changes"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-end space-x-2">
                                                        <button 
                                                            onClick={() => startEdit(u)} 
                                                            className="inline-flex items-center space-x-1 px-2.5 py-1.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg text-xs font-bold shadow-sm transition"
                                                        >
                                                            <Edit3 className="h-3.5 w-3.5 text-slate-400" />
                                                            <span>Update</span>
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDelete(u.user_id)} 
                                                            className="inline-flex items-center space-x-1 px-2.5 py-1.5 bg-red-50 border border-red-100 text-red-600 hover:bg-red-100 rounded-lg text-xs font-bold transition"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                            <span>Delete</span>
                                                        </button>
                                                    </div>
                                                )}
                                            </td>

                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Users;