import React, { useState, useEffect, useContext } from 'react';
import API from '../../services/api';
import { getUsers } from '../../services/userService';
import { AuthContext } from '../../context/authcontext';
import { ClipboardPlus, Trash2, MapPin, AlignLeft, AlertCircle, CheckCircle2, Loader2, User, ImagePlus } from 'lucide-react';

const CreateRequest = () => {
    const { user } = useContext(AuthContext); 
    
    // Form management states
    const [residentId, setResidentId] = useState('');
    const [wasteType, setWasteType] = useState('organic'); 
    const [desc, setDesc] = useState('');
    const [loc, setLoc] = useState('');
    const [status, setStatus] = useState('pending'); 
    const [imageFile, setImageFile] = useState(null); // Gufata file y'ifoto yashizwemo

    // Directory data states
    const [residents, setResidents] = useState([]);
    const [fetchingResidents, setFetchingResidents] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [statusFeedback, setStatusFeedback] = useState({ type: null, text: '' });

    // Load active system residents
    useEffect(() => {
        const loadResidentsDirectory = async () => {
            try {
                const res = await getUsers();
                const filteredResidents = res.data.filter(u => u.role === 'resident');
                setResidents(filteredResidents.length > 0 ? filteredResidents : res.data);
            } catch (err) {
                console.error("Failed to load matching resident directory indexes:", err);
            } finally {
                setFetchingResidents(false);
            }
        };
        loadResidentsDirectory();
    }, []);

    const handleAdminDispatch = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setStatusFeedback({ type: null, text: '' });

        if (!residentId) {
            setStatusFeedback({ type: 'error', text: 'Please assign this order ticket to a valid resident account.' });
            setIsSubmitting(false);
            return;
        }

        try {
            // Niba ugiye gukoresha ubu buryo busanzwe: Gushira izina ry'ifoto muri database
            // (Niba ukeneye multer yo kuyisavinga muri server nyirizina, byanyura muri FormData)
            const imageName = imageFile ? imageFile.name : '';

            // Kohereza amakuru akosorwemo inyuti n'imibare
            await API.post('/waste-requests', {
                resident_id: parseInt(residentId, 10), 
                waste_type: wasteType.toLowerCase(),
                description: desc,
                image: imageName, // Aha rero izina ry'ifoto rirahita ryandikwa muri database `image` column
                location: loc,
                status: status.toLowerCase()
            });
            
            setStatusFeedback({
                type: 'success',
                text: 'Disposal ticket successfully created and logged into system registers!'
            });
            
            // Guhanagura form
            setDesc(''); 
            setLoc('');
            setResidentId('');
            setWasteType('organic');
            setStatus('pending');
            setImageFile(null); // Hanagura ifoto
        } catch (err) {
            console.error("Administrative order injection failed:", err);
            const serverErrorMessage = err.response?.data?.sqlMessage || err.response?.data?.error || 'System processing failure.';
            setStatusFeedback({ type: 'error', text: `Submission Failed: ${serverErrorMessage}` });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-xl mx-auto">
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden transition duration-200 hover:shadow-md">
                
                {/* --- ADMINISTRATIVE HEADER CONTEXT --- */}
                <div className="p-5 sm:p-6 border-b border-slate-100 bg-slate-50/50 flex items-center space-x-3">
                    <div className="h-10 w-10 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-center shadow-inner">
                        <ClipboardPlus className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-slate-900 tracking-tight">Admin Order Dispatch</h2>
                        <p className="text-xs text-slate-500 mt-0.5">Manually inject or log a collection manifest order on behalf of a system resident.</p>
                    </div>
                </div>

                <div className="p-5 sm:p-6 space-y-5">
                    
                    {statusFeedback.type === 'success' && (
                        <div className="flex items-start space-x-3 bg-blue-50/50 border border-blue-200 p-4 rounded-lg">
                            <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-blue-800 font-semibold">{statusFeedback.text}</p>
                        </div>
                    )}

                    {statusFeedback.type === 'error' && (
                        <div className="flex items-start space-x-3 bg-red-50/50 border border-red-200 p-4 rounded-lg">
                            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-800 font-semibold">{statusFeedback.text}</p>
                        </div>
                    )}

                    <form onSubmit={handleAdminDispatch} className="space-y-4">
                        
                        {/* 1. RESIDENT ASSIGNMENT DROPDOWN FIELD */}
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                <User className="h-3.5 w-3.5 text-slate-400" />
                                Target Account Assignment
                            </label>
                            <select 
                                value={residentId}
                                onChange={(e) => setResidentId(e.target.value)}
                                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                                disabled={fetchingResidents}
                                required
                            >
                                <option value="">{fetchingResidents ? 'Loading resident registry...' : '-- Select Target Account User --'}</option>
                                {residents.map(r => (
                                    <option key={r.user_id} value={r.user_id}>
                                        {r.fullname} ({r.email})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* 2. DISPOSAL SYSTEM MANIFEST TYPE */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                    <Trash2 className="h-3.5 w-3.5 text-slate-400" />
                                    Waste Category
                                </label>
                                <select 
                                    value={wasteType} 
                                    onChange={(e) => setWasteType(e.target.value)} 
                                    className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                                >
                                    <option value="organic">Organic Waste</option>
                                    <option value="plastic">Plastic & Polymers</option>
                                    <option value="electronic">Electronic (E-Waste)</option>
                                    <option value="paper">Paper & Cardboard</option>
                                    <option value="metal">Glass & Metal Elements</option>
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                    <AlertCircle className="h-3.5 w-3.5 text-slate-400" />
                                    Initial Ticket Lifecycle
                                </label>
                                <select 
                                    value={status} 
                                    onChange={(e) => setStatus(e.target.value)} 
                                    className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                                >
                                    <option value="pending" className="text-amber-600 font-medium">Pending Review</option>
                                    <option value="assigned" className="text-purple-600 font-medium">Assigned</option>
                                    <option value="in_progress" className="text-blue-600 font-medium">In Progress</option>
                                    <option value="completed" className="text-green-600 font-medium">Completed</option>
                                    <option value="cancelled" className="text-red-600 font-medium">Cancelled</option>
                                </select>
                            </div>
                        </div>

                        {/* 3. NEW: UPLOAD IMAGE FIELD (HANO NI HO HABAGA) */}
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                <ImagePlus className="h-3.5 w-3.5 text-slate-400" />
                                Waste Visual Reference (Optional)
                            </label>
                            <div className="flex items-center justify-center w-full">
                                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-slate-200 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition duration-150">
                                    <div className="flex flex-col items-center justify-center pt-3 pb-3">
                                        <ImagePlus className="w-6 h-6 text-slate-400 mb-1" />
                                        <p className="text-xs text-slate-500 font-medium">
                                            {imageFile ? (
                                                <span className="text-blue-600 font-bold">Selected: {imageFile.name}</span>
                                            ) : (
                                                <span>Click to select attachment image</span>
                                            )}
                                        </p>
                                    </div>
                                    <input 
                                        type="file" 
                                        accept="image/*"
                                        onChange={(e) => setImageFile(e.target.files[0])}
                                        className="hidden" 
                                    />
                                </label>
                            </div>
                        </div>

                        {/* 4. DISPOSAL NOTES */}
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                <AlignLeft className="h-3.5 w-3.5 text-slate-400" />
                                Manifest Specifications
                            </label>
                            <textarea 
                                value={desc} 
                                onChange={(e) => setDesc(e.target.value)} 
                                rows="3"
                                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition resize-none"
                                placeholder="Log precise instructions, volume approximations..."
                                required
                            />
                        </div>

                        {/* 5. LOGISTICS LOCATION */}
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                                Logistics Pickup Location
                            </label>
                            <input 
                                type="text" 
                                value={loc} 
                                onChange={(e) => setLoc(e.target.value)} 
                                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition" 
                                placeholder="e.g., Kigali, Huye District" 
                                required 
                            />
                        </div>

                        {/* ACTION TRIGGER */}
                        <button 
                            type="submit" 
                            disabled={isSubmitting || fetchingResidents}
                            className="w-full mt-2 inline-flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-lg text-sm font-bold shadow-sm transition duration-150 active:scale-[0.99] disabled:opacity-60"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span>Processing Core Manifest...</span>
                                </>
                            ) : (
                                <span>Inject Logged Order Request</span>
                            )}
                        </button>
                    </form>

                </div>
            </div>
        </div>
    );
};

export default CreateRequest;