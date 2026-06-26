import React from 'react'; 
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/authcontext';

// --- FIXED COMPONENT FILE PATHS BASED ON YOUR STRUCTURE ---
import ProtectRouter from './components.js/ProtectRouter'; 
import Navbar from './components.js/Navbar';               
import Sidebar from './components.js/Sidebar';             

// Auth Pages
import Login from './pages/auth/Login';
import CreateAccount from './pages/auth/CreateAccount';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import UserManagementPage from './pages/admin/UserManagementPage';
import Vehicles from './pages/admin/Vehicles';
import Request from './pages/admin/Request'; 
import Centers from './pages/admin/Centers';
import Collectors from './pages/admin/Collectors';
import Materials from './pages/admin/Materials';
import Notification from './pages/admin/Notification';
import Report from './pages/admin/Report';
import Residents from './pages/admin/Residents';
import Schedule from './pages/admin/Schedule';
import Staff from './pages/admin/Staff';

// Resident Pages
import ResidentDashboard from './pages/resident/Dashboard';
import CreateRequest from './pages/resident/CreateRequest';
import MyRequest from './pages/resident/MyRequest';
import ResidentNotification from './pages/resident/Notification';
import ResidentSetting from './pages/resident/Setting';

// Collector Pages - FIXED: Use collectors.js (with .js)
import CollectorDashboard from './pages/collectors.js/Dashboard';
import AssignedRequest from './pages/collectors.js/AssignedRequest';
import CollectorNotification from './pages/collectors.js/Notification';
import CollectorSchedule from './pages/collectors.js/Schedule';

// Staff Pages
import StaffDashboard from './pages/staff/Dashboard';
import StaffMaterial from './pages/staff/Material';
import StaffNotification from './pages/staff/Notification';

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900 font-sans">
                    {/* Global Top Navbar */}
                    <Navbar />
                    
                    <div className="flex flex-1">
                        {/* Dynamic Role Sidebar */}
                        <Sidebar />
                        
                        {/* Main Page Viewports */}
                        <main className="flex-1 p-4 sm:p-6 lg:p-8">
                            <Routes>
                                {/* Public Access Points */}
                                <Route path="/auth/login" element={<Login />} />
                                <Route path="/auth/register" element={<CreateAccount />} />

                                {/* --- ADMIN MANAGEMENT ROUTES --- */}
                                <Route path="/admin/dashboard" element={
                                    <ProtectRouter allowedRoles={['admin']}><AdminDashboard /></ProtectRouter>
                                } />
                                <Route path="/admin/users" element={
                                    <ProtectRouter allowedRoles={['admin']}><UserManagementPage /></ProtectRouter>
                                } />
                                <Route path="/admin/vehicles" element={
                                    <ProtectRouter allowedRoles={['admin']}><Vehicles /></ProtectRouter>
                                } />
                                <Route path="/admin/requests" element={
                                    <ProtectRouter allowedRoles={['admin']}><Request /></ProtectRouter> 
                                } />
                                <Route path="/admin/centers" element={
                                    <ProtectRouter allowedRoles={['admin']}><Centers /></ProtectRouter>
                                } />
                                <Route path="/admin/collectors" element={
                                    <ProtectRouter allowedRoles={['admin']}><Collectors /></ProtectRouter>
                                } />
                                <Route path="/admin/materials" element={
                                    <ProtectRouter allowedRoles={['admin']}><Materials /></ProtectRouter>
                                } />
                                <Route path="/admin/notifications" element={
                                    <ProtectRouter allowedRoles={['admin']}><Notification /></ProtectRouter>
                                } />
                                <Route path="/admin/reports" element={
                                    <ProtectRouter allowedRoles={['admin']}><Report /></ProtectRouter>
                                } />
                                <Route path="/admin/residents" element={
                                    <ProtectRouter allowedRoles={['admin']}><Residents /></ProtectRouter>
                                } />
                                <Route path="/admin/schedule" element={
                                    <ProtectRouter allowedRoles={['admin']}><Schedule /></ProtectRouter>
                                } />
                                <Route path="/admin/staff" element={
                                    <ProtectRouter allowedRoles={['admin', 'staff', 'recycling_staff']}>
                                        <Staff />
                                    </ProtectRouter>
                                } />

                                {/* --- RESIDENT PANEL ROUTES --- */}
                                <Route path="/resident/dashboard" element={
                                    <ProtectRouter allowedRoles={['resident']}><ResidentDashboard /></ProtectRouter>
                                } />
                                <Route path="/resident/create-request" element={
                                    <ProtectRouter allowedRoles={['resident']}><CreateRequest /></ProtectRouter>
                                } />
                                <Route path="/resident/my-request" element={
                                    <ProtectRouter allowedRoles={['resident']}><MyRequest /></ProtectRouter>
                                } />
                                <Route path="/resident/notifications" element={
                                    <ProtectRouter allowedRoles={['resident']}><ResidentNotification /></ProtectRouter>
                                } />
                                <Route path="/resident/setting" element={
                                    <ProtectRouter allowedRoles={['resident']}><ResidentSetting /></ProtectRouter>
                                } />

                                {/* --- COLLECTOR PANEL ROUTES --- */}
                                <Route path="/collectors/dashboard" element={
                                    <ProtectRouter allowedRoles={['collector']}><CollectorDashboard /></ProtectRouter>
                                } />
                                <Route path="/collectors/assigned" element={
                                    <ProtectRouter allowedRoles={['collector']}><AssignedRequest /></ProtectRouter>
                                } />
                                <Route path="/collectors/notifications" element={
                                    <ProtectRouter allowedRoles={['collector']}><CollectorNotification /></ProtectRouter>
                                } />
                                <Route path="/collectors/schedules" element={
                                    <ProtectRouter allowedRoles={['collector']}><CollectorSchedule /></ProtectRouter>
                                } />

                                {/* --- RECYCLING STAFF ROUTES --- */}
                                <Route path="/staff/dashboard" element={
                                    <ProtectRouter allowedRoles={['staff', 'recycling_staff']}><StaffDashboard /></ProtectRouter>
                                } />
                                <Route path="/staff/material" element={
                                    <ProtectRouter allowedRoles={['staff', 'recycling_staff']}><StaffMaterial /></ProtectRouter>
                                } />
                                <Route path="/staff/notifications" element={
                                    <ProtectRouter allowedRoles={['staff', 'recycling_staff']}><StaffNotification /></ProtectRouter>
                                } />

                                {/* Fallback route redirection */}
                                <Route path="*" element={<Navigate to="/auth/login" replace />} />
                            </Routes>
                        </main>
                    </div>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;