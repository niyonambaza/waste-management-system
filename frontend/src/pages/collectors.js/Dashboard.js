import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../context/authcontext';
import { Truck, ClipboardList, Calendar, CheckCircle2, AlertCircle, MapPin } from 'lucide-react';

const CollectorDashboard = () => {
    const { user } = useContext(AuthContext);
    const [stats, setStats] = useState({ assigned: 0, completed: 0, pending: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Hano ushobora kuhamagara API yawe ikuzanira imibare y'uyu mu collector
        // Urugero rwo gutangira (Mock Data):
        setTimeout(() => {
            setStats({ assigned: 12, completed: 8, pending: 4 });
            setLoading(false);
        }, 500);
    }, []);

    return (
        <div className="space-y-6">
            {/* --- TOP WELCOME BANNER --- */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                        Welcome Back, {user?.name || 'Collector'}!
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Here is your route summary, assigned waste collection requests, and schedule directives.
                    </p>
                </div>
                <span className="flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-200">
                    <span className="h-2 w-2 bg-green-600 rounded-full animate-pulse"></span>
                    On Duty (Active)
                </span>
            </div>

            {/* --- STATS COUNTER GRID --- */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Assigned Cards */}
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-4">
                    <div className="bg-blue-50 p-3 rounded-lg text-blue-600">
                        <ClipboardList className="h-6 w-6" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-gray-900">{stats.assigned}</div>
                        <div className="text-xs text-gray-500 font-medium">Assigned Tasks</div>
                    </div>
                </div>

                {/* Pending Tasks */}
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-4">
                    <div className="bg-amber-50 p-3 rounded-lg text-amber-600">
                        <AlertCircle className="h-6 w-6" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-gray-900">{stats.pending}</div>
                        <div className="text-xs text-gray-500 font-medium">Pending Pickups</div>
                    </div>
                </div>

                {/* Completed Tasks */}
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-4">
                    <div className="bg-green-50 p-3 rounded-lg text-green-600">
                        <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-gray-900">{stats.completed}</div>
                        <div className="text-xs text-gray-500 font-medium">Completed Routes</div>
                    </div>
                </div>
            </div>

            {/* --- RECENT ACTIVE MISSIONS / ROUTES --- */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                        <Truck className="h-4 w-4 text-blue-600" />
                        Today's Active Dispatch Route
                    </h3>
                </div>
                
                <div className="p-6 text-center py-12 text-gray-500">
                    <MapPin className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-700">No active tracking route triggered yet.</p>
                    <p className="text-xs text-gray-400 mt-1">Please check "Assigned Requests" in the sidebar to start a pickup operation.</p>
                </div>
            </div>
        </div>
    );
};

export default CollectorDashboard;