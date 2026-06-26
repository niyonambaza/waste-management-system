import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/authcontext';
import API from '../../services/api';
import {
    BarChart3,
    Calendar,
    Download,
    FileText,
    TrendingUp,
    Users,
    Trash2,
    CheckCircle2,
    Clock,
    MapPin,
    Package,
    RefreshCw,
    AlertCircle,
    ChevronDown,
    ChevronRight,
    Printer,
    Filter,
    X,
    Loader2,
    PieChart,
    Activity,
    Award,
    Zap
} from 'lucide-react';

const Report = () => {
    const { user } = useContext(AuthContext);
    
    // State
    const [reportType, setReportType] = useState('daily');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [reportData, setReportData] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedWeek, setSelectedWeek] = useState(() => {
        const now = new Date();
        const start = new Date(now);
        start.setDate(start.getDate() - start.getDay());
        return start.toISOString().split('T')[0];
    });
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [dateRange, setDateRange] = useState({
        start: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });
    const [showFilters, setShowFilters] = useState(false);

    // Load report data
    useEffect(() => {
        fetchReport();
    }, [reportType, selectedDate, selectedWeek, selectedMonth, selectedYear, dateRange]);

    const fetchReport = async () => {
        setLoading(true);
        setError('');
        
        try {
            let endpoint = '';
            let params = {};
            
            switch (reportType) {
                case 'daily':
                    endpoint = '/reports/daily';
                    params = { date: selectedDate };
                    break;
                case 'weekly':
                    endpoint = '/reports/weekly';
                    params = { week_start: selectedWeek };
                    break;
                case 'monthly':
                    endpoint = '/reports/monthly';
                    const [year, month] = selectedMonth.split('-');
                    params = { year, month };
                    break;
                case 'yearly':
                    endpoint = '/reports/yearly';
                    params = { year: selectedYear };
                    break;
                default:
                    endpoint = '/reports/dashboard';
            }
            
            const response = await API.get(endpoint, { params });
            setReportData(response.data);
        } catch (err) {
            console.error('Error fetching report:', err);
            setError(err.response?.data?.error || 'Failed to load report data');
        } finally {
            setLoading(false);
        }
    };

    const handleExportPDF = () => {
        // Implement PDF export
        alert('PDF export functionality coming soon!');
    };

    const handleExportExcel = () => {
        // Implement Excel export
        alert('Excel export functionality coming soon!');
    };

    const handlePrint = () => {
        window.print();
    };

    const getReportTitle = () => {
        switch (reportType) {
            case 'daily': return 'Daily Report';
            case 'weekly': return 'Weekly Report';
            case 'monthly': return 'Monthly Report';
            case 'yearly': return 'Yearly Report';
            default: return 'Dashboard Report';
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            'completed': 'bg-emerald-100 text-emerald-700',
            'approved': 'bg-blue-100 text-blue-700',
            'pending': 'bg-amber-100 text-amber-700',
            'cancelled': 'bg-red-100 text-red-700'
        };
        return colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-700';
    };

    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-RW', {
            style: 'currency',
            currency: 'RWF',
            minimumFractionDigits: 0
        }).format(value || 0);
    };

    // Loading skeleton
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 py-6 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="animate-pulse space-y-6">
                        <div className="h-10 w-48 bg-slate-200 rounded-lg"></div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="h-32 bg-slate-200 rounded-2xl"></div>
                            ))}
                        </div>
                        <div className="h-96 bg-slate-200 rounded-2xl"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 py-6 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-6">
                
                {/* --- HEADER --- */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
                    <div className="flex items-center space-x-4">
                        <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 p-3 rounded-xl shadow-lg shadow-indigo-600/20">
                            <BarChart3 className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                                Reports & Analytics
                            </h1>
                            <p className="text-sm text-slate-500 mt-0.5">
                                Monitor system performance and waste management metrics
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2 flex-wrap">
                        <button
                            onClick={fetchReport}
                            className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 text-sm font-bold py-2.5 px-4 border border-slate-200 rounded-lg shadow-sm transition"
                        >
                            <RefreshCw className="h-4 w-4" />
                            <span className="hidden sm:inline">Refresh</span>
                        </button>
                        
                        <button
                            onClick={handlePrint}
                            className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 text-sm font-bold py-2.5 px-4 border border-slate-200 rounded-lg shadow-sm transition"
                        >
                            <Printer className="h-4 w-4" />
                            <span className="hidden sm:inline">Print</span>
                        </button>
                        
                        <div className="relative inline-block">
                            <button className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold py-2.5 px-4 rounded-lg shadow-lg shadow-indigo-600/20 transition">
                                <Download className="h-4 w-4" />
                                <span>Export</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* --- ERROR --- */}
                {error && (
                    <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-start space-x-3">
                        <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-700 flex-1">{error}</p>
                        <button onClick={() => setError('')} className="text-red-400 hover:text-red-600">
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                )}

                {/* --- REPORT TYPE SELECTOR --- */}
                <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-4">
                    {[
                        { id: 'daily', label: 'Daily', icon: <Calendar className="h-4 w-4" /> },
                        { id: 'weekly', label: 'Weekly', icon: <Calendar className="h-4 w-4" /> },
                        { id: 'monthly', label: 'Monthly', icon: <Calendar className="h-4 w-4" /> },
                        { id: 'yearly', label: 'Yearly', icon: <Calendar className="h-4 w-4" /> }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setReportType(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition ${
                                reportType === tab.id
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                            }`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* --- DATE SELECTORS --- */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        {reportType === 'daily' && (
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <label className="text-sm font-bold text-slate-600 whitespace-nowrap">Select Date:</label>
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                />
                            </div>
                        )}
                        
                        {reportType === 'weekly' && (
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <label className="text-sm font-bold text-slate-600 whitespace-nowrap">Week Starting:</label>
                                <input
                                    type="date"
                                    value={selectedWeek}
                                    onChange={(e) => setSelectedWeek(e.target.value)}
                                    className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                />
                            </div>
                        )}
                        
                        {reportType === 'monthly' && (
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <label className="text-sm font-bold text-slate-600 whitespace-nowrap">Month:</label>
                                <input
                                    type="month"
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(e.target.value)}
                                    className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                />
                            </div>
                        )}
                        
                        {reportType === 'yearly' && (
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <label className="text-sm font-bold text-slate-600 whitespace-nowrap">Year:</label>
                                <select
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                    className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                >
                                    {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                        
                        <button
                            onClick={fetchReport}
                            className="ml-auto bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg text-sm font-bold transition"
                        >
                            Generate Report
                        </button>
                    </div>
                </div>

                {/* --- REPORT CONTENT --- */}
                {reportData && (
                    <div className="space-y-6 print:space-y-4">
                        
                        {/* Report Title */}
                        <div className="text-center print:block hidden">
                            <h2 className="text-2xl font-bold text-slate-900">{getReportTitle()}</h2>
                            <p className="text-sm text-slate-500">Generated: {new Date(reportData.generated_at).toLocaleString()}</p>
                        </div>

                        {/* --- STATISTICS CARDS --- */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Requests</p>
                                        <p className="text-2xl font-black text-slate-900 mt-1">
                                            {reportData.summary?.total_requests || 0}
                                        </p>
                                    </div>
                                    <div className="h-11 w-11 bg-blue-50 rounded-xl flex items-center justify-center">
                                        <FileText className="h-5 w-5 text-blue-600" />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending</p>
                                        <p className="text-2xl font-black text-amber-600 mt-1">
                                            {reportData.summary?.pending || 0}
                                        </p>
                                    </div>
                                    <div className="h-11 w-11 bg-amber-50 rounded-xl flex items-center justify-center">
                                        <Clock className="h-5 w-5 text-amber-600" />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Approved</p>
                                        <p className="text-2xl font-black text-blue-600 mt-1">
                                            {reportData.summary?.approved || 0}
                                        </p>
                                    </div>
                                    <div className="h-11 w-11 bg-blue-50 rounded-xl flex items-center justify-center">
                                        <CheckCircle2 className="h-5 w-5 text-blue-600" />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Completed</p>
                                        <p className="text-2xl font-black text-emerald-600 mt-1">
                                            {reportData.summary?.completed || 0}
                                        </p>
                                    </div>
                                    <div className="h-11 w-11 bg-emerald-50 rounded-xl flex items-center justify-center">
                                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* --- WASTE TYPE BREAKDOWN --- */}
                        {reportData.waste_types && reportData.waste_types.length > 0 && (
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="p-5 border-b border-slate-200 bg-gradient-to-r from-indigo-50/50 to-white">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <Package className="h-5 w-5 text-indigo-600" />
                                            <h3 className="font-bold text-slate-900">Waste Type Distribution</h3>
                                        </div>
                                        <span className="text-xs text-slate-400">Total: {reportData.waste_types.reduce((sum, item) => sum + item.count, 0)}</span>
                                    </div>
                                </div>
                                <div className="p-5">
                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                                        {reportData.waste_types.map((item, index) => (
                                            <div key={index} className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
                                                <div className="text-2xl font-black text-indigo-600">{item.count}</div>
                                                <div className="text-xs font-medium text-slate-600 capitalize mt-1">{item.waste_type}</div>
                                                <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
                                                    <div 
                                                        className="bg-indigo-600 rounded-full h-1.5"
                                                        style={{ 
                                                            width: `${(item.count / reportData.waste_types.reduce((sum, i) => sum + i.count, 0)) * 100}%` 
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* --- TOP LOCATIONS --- */}
                        {reportData.top_locations && reportData.top_locations.length > 0 && (
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="p-5 border-b border-slate-200 bg-gradient-to-r from-indigo-50/50 to-white">
                                    <div className="flex items-center gap-2.5">
                                        <MapPin className="h-5 w-5 text-indigo-600" />
                                        <h3 className="font-bold text-slate-900">Top Locations</h3>
                                    </div>
                                </div>
                                <div className="p-5">
                                    <div className="space-y-3">
                                        {reportData.top_locations.map((item, index) => (
                                            <div key={index} className="flex items-center gap-4">
                                                <span className="text-sm font-bold text-slate-400 w-6">{index + 1}.</span>
                                                <span className="text-sm font-medium text-slate-700 flex-1">{item.location}</span>
                                                <span className="text-sm font-bold text-indigo-600">{item.count}</span>
                                                <div className="w-32 bg-slate-200 rounded-full h-2">
                                                    <div 
                                                        className="bg-indigo-600 rounded-full h-2"
                                                        style={{ 
                                                            width: `${(item.count / reportData.top_locations[0].count) * 100}%` 
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* --- COLLECTOR PERFORMANCE --- */}
                        {reportData.collector_performance && reportData.collector_performance.length > 0 && (
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="p-5 border-b border-slate-200 bg-gradient-to-r from-indigo-50/50 to-white">
                                    <div className="flex items-center gap-2.5">
                                        <Users className="h-5 w-5 text-indigo-600" />
                                        <h3 className="font-bold text-slate-900">Collector Performance</h3>
                                    </div>
                                </div>
                                <div className="p-5">
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-slate-200">
                                            <thead className="bg-slate-50/80">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Collector</th>
                                                    <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Collections</th>
                                                    <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Active Days</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {reportData.collector_performance.map((item, index) => (
                                                    <tr key={index} className="hover:bg-slate-50/60 transition">
                                                        <td className="px-4 py-3 text-sm font-medium text-slate-700">{item.fullname}</td>
                                                        <td className="px-4 py-3 text-center text-sm font-bold text-indigo-600">{item.total_collections}</td>
                                                        <td className="px-4 py-3 text-center text-sm text-slate-600">{item.active_days}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* --- DAILY/MONTHLY BREAKDOWN --- */}
                        {(reportData.daily_breakdown || reportData.monthly_breakdown || reportData.weekly_breakdown) && (
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="p-5 border-b border-slate-200 bg-gradient-to-r from-indigo-50/50 to-white">
                                    <div className="flex items-center gap-2.5">
                                        <Activity className="h-5 w-5 text-indigo-600" />
                                        <h3 className="font-bold text-slate-900">Activity Breakdown</h3>
                                    </div>
                                </div>
                                <div className="p-5">
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-slate-200">
                                            <thead className="bg-slate-50/80">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Period</th>
                                                    <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Total</th>
                                                    <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Completed</th>
                                                    <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Completion Rate</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {(reportData.daily_breakdown || reportData.monthly_breakdown || reportData.weekly_breakdown || []).map((item, index) => {
                                                    const rate = item.total > 0 ? Math.round((item.completed / item.total) * 100) : 0;
                                                    return (
                                                        <tr key={index} className="hover:bg-slate-50/60 transition">
                                                            <td className="px-4 py-3 text-sm font-medium text-slate-700">
                                                                {item.date || `Week ${item.week_number}` || `Month ${item.month}`}
                                                            </td>
                                                            <td className="px-4 py-3 text-center text-sm font-bold text-slate-700">{item.total}</td>
                                                            <td className="px-4 py-3 text-center text-sm font-bold text-emerald-600">{item.completed}</td>
                                                            <td className="px-4 py-3 text-center">
                                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                                                                    rate >= 80 ? 'bg-emerald-100 text-emerald-700' :
                                                                    rate >= 50 ? 'bg-amber-100 text-amber-700' :
                                                                    'bg-red-100 text-red-700'
                                                                }`}>
                                                                    {rate}%
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* --- COMPLETION RATE CHART --- */}
                        {reportData.completion_rate && reportData.completion_rate.length > 0 && (
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="p-5 border-b border-slate-200 bg-gradient-to-r from-indigo-50/50 to-white">
                                    <div className="flex items-center gap-2.5">
                                        <TrendingUp className="h-5 w-5 text-indigo-600" />
                                        <h3 className="font-bold text-slate-900">Monthly Completion Rate</h3>
                                    </div>
                                </div>
                                <div className="p-5">
                                    <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-12 gap-2">
                                        {reportData.completion_rate.map((item, index) => {
                                            const rate = item.completion_rate || 0;
                                            return (
                                                <div key={index} className="text-center">
                                                    <div className="relative h-32 flex items-end justify-center">
                                                        <div 
                                                            className={`w-full rounded-t-lg transition-all duration-500 ${
                                                                rate >= 80 ? 'bg-emerald-500' :
                                                                rate >= 50 ? 'bg-amber-500' :
                                                                'bg-red-500'
                                                            }`}
                                                            style={{ height: `${Math.max(10, rate)}%` }}
                                                        />
                                                    </div>
                                                    <div className="mt-2">
                                                        <p className="text-xs font-bold text-slate-600">
                                                            {new Date(0, item.month - 1).toLocaleString('default', { month: 'short' })}
                                                        </p>
                                                        <p className="text-[10px] font-bold text-slate-400">{rate}%</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* --- CENTER PERFORMANCE --- */}
                        {reportData.center_performance && reportData.center_performance.length > 0 && (
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="p-5 border-b border-slate-200 bg-gradient-to-r from-indigo-50/50 to-white">
                                    <div className="flex items-center gap-2.5">
                                        <Award className="h-5 w-5 text-indigo-600" />
                                        <h3 className="font-bold text-slate-900">Center Performance</h3>
                                    </div>
                                </div>
                                <div className="p-5">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {reportData.center_performance.map((item, index) => (
                                            <div key={index} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                                <p className="text-sm font-bold text-slate-700">{item.center_name}</p>
                                                <div className="flex items-center gap-4 mt-2">
                                                    <div>
                                                        <p className="text-xs text-slate-400">Materials</p>
                                                        <p className="text-lg font-black text-indigo-600">{item.materials_processed || 0}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-slate-400">Quantity</p>
                                                        <p className="text-lg font-black text-emerald-600">{item.total_quantity || 0}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* --- USER GROWTH --- */}
                        {reportData.user_growth && reportData.user_growth.length > 0 && (
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="p-5 border-b border-slate-200 bg-gradient-to-r from-indigo-50/50 to-white">
                                    <div className="flex items-center gap-2.5">
                                        <Users className="h-5 w-5 text-indigo-600" />
                                        <h3 className="font-bold text-slate-900">User Growth</h3>
                                    </div>
                                </div>
                                <div className="p-5">
                                    <div className="flex items-end space-x-2 h-40">
                                        {reportData.user_growth.map((item, index) => (
                                            <div key={index} className="flex-1 flex flex-col items-center">
                                                <div 
                                                    className="w-full bg-indigo-500 rounded-t-lg transition-all duration-500"
                                                    style={{ 
                                                        height: `${Math.max(10, (item.new_users / Math.max(...reportData.user_growth.map(i => i.new_users))) * 100)}%` 
                                                    }}
                                                />
                                                <span className="text-[10px] font-bold text-slate-600 mt-1">
                                                    {new Date(0, item.month - 1).toLocaleString('default', { month: 'short' })}
                                                </span>
                                                <span className="text-[10px] font-bold text-indigo-600">{item.new_users}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* --- GENERATED TIMESTAMP --- */}
                        <div className="text-center text-xs text-slate-400 border-t border-slate-200 pt-4">
                            Report generated: {reportData.generated_at ? new Date(reportData.generated_at).toLocaleString() : new Date().toLocaleString()}
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
};

export default Report;