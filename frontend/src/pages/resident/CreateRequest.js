import React, { useState, useEffect, useContext } from 'react';
import API from '../../services/api';
import { getUsers } from '../../services/userService';
import { AuthContext } from '../../context/authcontext';
import { 
    ClipboardPlus, Trash2, MapPin, AlignLeft, AlertCircle, 
    CheckCircle2, Loader2, User, ImagePlus, ChevronDown,
    Package, Recycle, Calendar, Clock, X, Eye  // <-- X, Eye, ChevronDown byongewe hano
} from 'lucide-react';

// Rwanda Location Data
const RWANDA_LOCATIONS = {
    'Kigali': {
        districts: ['Gasabo', 'Kicukiro', 'Nyarugenge'],
        sectors: {
            'Gasabo': ['Remera', 'Kacyiru', 'Kimironko', 'Gisozi', 'Kinyinya', 'Ndera', 'Rusororo', 'Jali', 'Gatsata', 'Gikomero'],
            'Kicukiro': ['Kanombe', 'Kicukiro', 'Gikondo', 'Niboye', 'Kagarama', 'Masaka', 'Gahanga', 'Kanyinya'],
            'Nyarugenge': ['Nyarugenge', 'Muhima', 'Nyamirambo', 'Kiyovu', 'Gitega', 'Kimisagara', 'Rwezamenyo', 'Kabeza', 'Biryogo']
        },
        cells: {
            'Remera': ['Remera', 'Rugando', 'Kacyiru', 'Kimihurura'],
            'Kacyiru': ['Kacyiru', 'Kibagabaga', 'Gishushu', 'Makuza'],
            'Kimironko': ['Kimironko', 'Kibagabaga', 'Nyarutarama'],
            'Gisozi': ['Gisozi', 'Nyabugogo', 'Kagugu'],
            'Kinyinya': ['Kinyinya', 'Gishushu', 'Makuza'],
            'Ndera': ['Ndera', 'Kibagabaga', 'Rugando'],
            'Rusororo': ['Rusororo', 'Kacyiru', 'Kimihurura'],
            'Jali': ['Jali', 'Gishushu', 'Nyarutarama'],
            'Gatsata': ['Gatsata', 'Nyabugogo', 'Kagugu'],
            'Gikomero': ['Gikomero', 'Kibagabaga', 'Rugando'],
            'Kanombe': ['Kanombe', 'Kigali International', 'Masaka'],
            'Kicukiro': ['Kicukiro', 'Gikondo', 'Niboye'],
            'Gikondo': ['Gikondo', 'Kicukiro', 'Masaka'],
            'Niboye': ['Niboye', 'Kicukiro', 'Gikondo'],
            'Kagarama': ['Kagarama', 'Kanombe', 'Masaka'],
            'Masaka': ['Masaka', 'Kanombe', 'Kagarama'],
            'Gahanga': ['Gahanga', 'Kicukiro', 'Niboye'],
            'Kanyinya': ['Kanyinya', 'Kicukiro', 'Gikondo'],
            'Muhima': ['Muhima', 'Nyamirambo', 'Kiyovu'],
            'Nyamirambo': ['Nyamirambo', 'Muhima', 'Gitega'],
            'Kiyovu': ['Kiyovu', 'Nyarugenge', 'Gitega'],
            'Gitega': ['Gitega', 'Nyarugenge', 'Kimisagara'],
            'Kimisagara': ['Kimisagara', 'Gitega', 'Rwezamenyo'],
            'Rwezamenyo': ['Rwezamenyo', 'Kimisagara', 'Kabeza'],
            'Kabeza': ['Kabeza', 'Rwezamenyo', 'Biryogo'],
            'Biryogo': ['Biryogo', 'Kabeza', 'Nyarugenge']
        }
    },
    'Northern Province': {
        districts: ['Burera', 'Gakenke', 'Gicumbi', 'Musanze', 'Rulindo'],
        sectors: {
            'Burera': ['Cyanika', 'Gahunga', 'Gatebe', 'Kagogo', 'Kinoni', 'Kinyababa', 'Rugarama', 'Rusagara', 'Rutare'],
            'Gakenke': ['Buganza', 'Cyabingo', 'Gakenke', 'Janja', 'Kamubuga', 'Karambo', 'Kivuruga', 'Ruhondo', 'Rushashi'],
            'Gicumbi': ['Bukure', 'Kageyo', 'Miyove', 'Mukarange', 'Munyaga', 'Mushaki', 'Nyarurama', 'Rubaya', 'Rwimi'],
            'Musanze': ['Busogo', 'Gataraga', 'Kimanzi', 'Kinigi', 'Muhoza', 'Muko', 'Musanze', 'Nkotsi', 'Nyange', 'Remera'],
            'Rulindo': ['Kisaro', 'Mbogo', 'Murambi', 'Ngoma', 'Ntarabana', 'Rutare', 'Rwerere', 'Shyorongi']
        },
        cells: {
            'Cyanika': ['Cyanika', 'Gahunga', 'Gatebe'],
            'Gahunga': ['Gahunga', 'Cyanika', 'Kagogo'],
            'Gatebe': ['Gatebe', 'Cyanika', 'Kinoni'],
            'Kagogo': ['Kagogo', 'Gahunga', 'Kinoni'],
            'Kinoni': ['Kinoni', 'Kagogo', 'Kinyababa'],
            'Kinyababa': ['Kinyababa', 'Kinoni', 'Rugarama'],
            'Rugarama': ['Rugarama', 'Kinyababa', 'Rusagara'],
            'Rusagara': ['Rusagara', 'Rugarama', 'Rutare'],
            'Rutare': ['Rutare', 'Rusagara', 'Rugarama'],
            'Buganza': ['Buganza', 'Cyabingo', 'Gakenke'],
            'Cyabingo': ['Cyabingo', 'Buganza', 'Janja'],
            'Gakenke': ['Gakenke', 'Cyabingo', 'Kamubuga'],
            'Janja': ['Janja', 'Gakenke', 'Karambo'],
            'Kamubuga': ['Kamubuga', 'Janja', 'Kivuruga'],
            'Karambo': ['Karambo', 'Kamubuga', 'Ruhondo'],
            'Kivuruga': ['Kivuruga', 'Karambo', 'Rushashi'],
            'Ruhondo': ['Ruhondo', 'Kivuruga', 'Rushashi'],
            'Rushashi': ['Rushashi', 'Ruhondo', 'Kivuruga'],
            'Bukure': ['Bukure', 'Kageyo', 'Miyove'],
            'Kageyo': ['Kageyo', 'Bukure', 'Mukarange'],
            'Miyove': ['Miyove', 'Kageyo', 'Munyaga'],
            'Mukarange': ['Mukarange', 'Miyove', 'Mushaki'],
            'Munyaga': ['Munyaga', 'Mukarange', 'Nyarurama'],
            'Mushaki': ['Mushaki', 'Munyaga', 'Rubaya'],
            'Nyarurama': ['Nyarurama', 'Mushaki', 'Rwimi'],
            'Rubaya': ['Rubaya', 'Nyarurama', 'Rwimi'],
            'Rwimi': ['Rwimi', 'Rubaya', 'Nyarurama'],
            'Busogo': ['Busogo', 'Gataraga', 'Kimanzi'],
            'Gataraga': ['Gataraga', 'Busogo', 'Kinigi'],
            'Kimanzi': ['Kimanzi', 'Busogo', 'Muhoza'],
            'Kinigi': ['Kinigi', 'Gataraga', 'Muko'],
            'Muhoza': ['Muhoza', 'Kimanzi', 'Musanze'],
            'Muko': ['Muko', 'Kinigi', 'Nkotsi'],
            'Musanze': ['Musanze', 'Muhoza', 'Nyange'],
            'Nkotsi': ['Nkotsi', 'Muko', 'Remera'],
            'Nyange': ['Nyange', 'Musanze', 'Remera'],
            'Remera': ['Remera', 'Nyange', 'Nkotsi'],
            'Kisaro': ['Kisaro', 'Mbogo', 'Murambi'],
            'Mbogo': ['Mbogo', 'Kisaro', 'Ngoma'],
            'Murambi': ['Murambi', 'Mbogo', 'Ntarabana'],
            'Ngoma': ['Ngoma', 'Murambi', 'Rutare'],
            'Ntarabana': ['Ntarabana', 'Ngoma', 'Rwerere'],
            'Rutare': ['Rutare', 'Ntarabana', 'Shyorongi'],
            'Rwerere': ['Rwerere', 'Rutare', 'Shyorongi'],
            'Shyorongi': ['Shyorongi', 'Rwerere', 'Rutare']
        }
    },
    'Southern Province': {
        districts: ['Gisagara', 'Huye', 'Kamonyi', 'Muhanga', 'Nyamagabe', 'Nyanza', 'Nyaruguru', 'Ruhango'],
        sectors: {
            'Gisagara': ['Gikonko', 'Gishubi', 'Kansi', 'Kibilizi', 'Kigembe', 'Mamba', 'Muganza', 'Mugombwa', 'Mukingo', 'Sake'],
            'Huye': ['Gishamvu', 'Huye', 'Karama', 'Kigoma', 'Kinazi', 'Maraba', 'Mbazi', 'Mukura', 'Ngoma', 'Ruhashya'],
            'Kamonyi': ['Gacurabwenge', 'Karama', 'Kayenzi', 'Kayumbu', 'Mugina', 'Musambira', 'Ngamba', 'Nyamiyaga', 'Rugarika', 'Rukoma'],
            'Muhanga': ['Cyeza', 'Kabacuzi', 'Kibangu', 'Kiyumba', 'Muhanga', 'Mushishiro', 'Nyabinoni', 'Nyarugenge', 'Rutovu'],
            'Nyamagabe': ['Buruhukiro', 'Cyanika', 'Gasaka', 'Gatare', 'Kaduha', 'Kamegeri', 'Kibirizi', 'Kibumbwe', 'Kitabi', 'Mbazi'],
            'Nyanza': ['Busasamana', 'Busoro', 'Cyabakamyi', 'Kibirizi', 'Kigoma', 'Mukingo', 'Muyira', 'Ntyazo', 'Nyagisozi', 'Rwabicuma'],
            'Nyaruguru': ['Kibeho', 'Mata', 'Muganza', 'Munini', 'Ngera', 'Nyagisozi', 'Ruheru', 'Ruhuha'],
            'Ruhango': ['Buhanda', 'Gikongoro', 'Kinazi', 'Mbuye', 'Mwendo', 'Ntongwe', 'Ruhango']
        },
        cells: {
            'Gikonko': ['Gikonko', 'Gishubi', 'Kansi'],
            'Gishubi': ['Gishubi', 'Gikonko', 'Kibilizi'],
            'Kansi': ['Kansi', 'Gikonko', 'Kigembe'],
            'Kibilizi': ['Kibilizi', 'Gishubi', 'Mamba'],
            'Kigembe': ['Kigembe', 'Kansi', 'Muganza'],
            'Mamba': ['Mamba', 'Kibilizi', 'Mugombwa'],
            'Muganza': ['Muganza', 'Kigembe', 'Mukingo'],
            'Mugombwa': ['Mugombwa', 'Mamba', 'Sake'],
            'Mukingo': ['Mukingo', 'Muganza', 'Sake'],
            'Sake': ['Sake', 'Mugombwa', 'Mukingo'],
            'Gishamvu': ['Gishamvu', 'Huye', 'Karama'],
            'Huye': ['Huye', 'Gishamvu', 'Kigoma'],
            'Karama': ['Karama', 'Huye', 'Kinazi'],
            'Kigoma': ['Kigoma', 'Karama', 'Maraba'],
            'Kinazi': ['Kinazi', 'Kigoma', 'Mbazi'],
            'Maraba': ['Maraba', 'Kinazi', 'Mukura'],
            'Mbazi': ['Mbazi', 'Maraba', 'Ngoma'],
            'Mukura': ['Mukura', 'Mbazi', 'Ruhashya'],
            'Ngoma': ['Ngoma', 'Mukura', 'Ruhashya'],
            'Ruhashya': ['Ruhashya', 'Ngoma', 'Mukura']
        }
    },
    'Eastern Province': {
        districts: ['Bugesera', 'Gatsibo', 'Kayonza', 'Kirehe', 'Ngoma', 'Nyagatare', 'Rwamagana'],
        sectors: {
            'Bugesera': ['Gashora', 'Juru', 'Kamabuye', 'Ntarama', 'Mayange', 'Mareba', 'Nyamata', 'Rilima', 'Ruhuha'],
            'Gatsibo': ['Gasange', 'Gatsibo', 'Gitoki', 'Kabarore', 'Kageyo', 'Kiramuruzi', 'Kiziguro', 'Muhura', 'Murambi', 'Ngarama'],
            'Kayonza': ['Cabara', 'Gahini', 'Karema', 'Kayonza', 'Mukarange', 'Murama', 'Murundi', 'Mwiri', 'Ndego', 'Nyamirama'],
            'Kirehe': ['Gahara', 'Gatore', 'Kigarama', 'Kigina', 'Kirehe', 'Mahama', 'Mpanga', 'Musaza', 'Nasho', 'Nyabubare'],
            'Ngoma': ['Gashanda', 'Jarama', 'Karembo', 'Kazo', 'Mugesera', 'Murama', 'Mutenderi', 'Remera', 'Rukira', 'Sake'],
            'Nyagatare': ['Gatunda', 'Kiyombe', 'Matimba', 'Mimuri', 'Mukama', 'Musheri', 'Nyagatare', 'Rukomo', 'Rwempasha', 'Rwimi'],
            'Rwamagana': ['Fumbwe', 'Gahengeri', 'Gishari', 'Karenge', 'Kigabiro', 'Muhazi', 'Munyaga', 'Munyang', 'Nyakariro', 'Nyaruhene']
        },
        cells: {
            'Gashora': ['Gashora', 'Juru', 'Kamabuye'],
            'Juru': ['Juru', 'Gashora', 'Ntarama'],
            'Kamabuye': ['Kamabuye', 'Gashora', 'Mayange'],
            'Ntarama': ['Ntarama', 'Juru', 'Mareba'],
            'Mayange': ['Mayange', 'Kamabuye', 'Nyamata'],
            'Mareba': ['Mareba', 'Ntarama', 'Rilima'],
            'Nyamata': ['Nyamata', 'Mayange', 'Ruhuha'],
            'Rilima': ['Rilima', 'Mareba', 'Ruhuha'],
            'Ruhuha': ['Ruhuha', 'Nyamata', 'Rilima'],
            'Gasange': ['Gasange', 'Gatsibo', 'Gitoki'],
            'Gatsibo': ['Gatsibo', 'Gasange', 'Kabarore'],
            'Gitoki': ['Gitoki', 'Gatsibo', 'Kageyo'],
            'Kabarore': ['Kabarore', 'Gitoki', 'Kiramuruzi'],
            'Kageyo': ['Kageyo', 'Kabarore', 'Kiziguro'],
            'Kiramuruzi': ['Kiramuruzi', 'Kageyo', 'Muhura'],
            'Kiziguro': ['Kiziguro', 'Kiramuruzi', 'Murambi'],
            'Muhura': ['Muhura', 'Kiziguro', 'Ngarama'],
            'Murambi': ['Murambi', 'Muhura', 'Ngarama'],
            'Ngarama': ['Ngarama', 'Murambi', 'Muhura']
        }
    },
    'Western Province': {
        districts: ['Karongi', 'Ngororero', 'Nyabihu', 'Nyamasheke', 'Rubavu', 'Rusizi', 'Rutsiro'],
        sectors: {
            'Karongi': ['Bwishyura', 'Gishyita', 'Gitesi', 'Mubuga', 'Murambi', 'Murundi', 'Mutuntu', 'Rubengera', 'Rugabano', 'Rutsiro'],
            'Ngororero': ['Birenga', 'Gatwaro', 'Kabaya', 'Kageyo', 'Kavumu', 'Matyazo', 'Muhororo', 'Ndaro', 'Ngororero', 'Nyange'],
            'Nyabihu': ['Bigogwe', 'Jenda', 'Jomba', 'Kabatwa', 'Karago', 'Kintobo', 'Mukamira', 'Muringa', 'Rambura', 'Rugera'],
            'Nyamasheke': ['Bushekeri', 'Bushenge', 'Cyato', 'Gihombo', 'Kagano', 'Kanjongo', 'Karambi', 'Karengera', 'Kirimbi', 'Macuba'],
            'Rubavu': ['Bugeshi', 'Busasamana', 'Cyanzarwe', 'Gisenyi', 'Kanama', 'Kanzenze', 'Mudende', 'Nyakiliba', 'Nyamyumba', 'Rubavu'],
            'Rusizi': ['Bugarama', 'Butare', 'Bweyeye', 'Gashonga', 'Giheke', 'Gihundwe', 'Gitambi', 'Kamembe', 'Muganza', 'Mururu'],
            'Rutsiro': ['Boneza', 'Gihango', 'Kigeyo', 'Kivumu', 'Manihira', 'Mukura', 'Murunda', 'Musasa', 'Rutsiro', 'Shangi']
        },
        cells: {
            'Bwishyura': ['Bwishyura', 'Gishyita', 'Gitesi'],
            'Gishyita': ['Gishyita', 'Bwishyura', 'Mubuga'],
            'Gitesi': ['Gitesi', 'Bwishyura', 'Murambi'],
            'Mubuga': ['Mubuga', 'Gishyita', 'Murundi'],
            'Murambi': ['Murambi', 'Gitesi', 'Mutuntu'],
            'Murundi': ['Murundi', 'Mubuga', 'Rubengera'],
            'Mutuntu': ['Mutuntu', 'Murambi', 'Rugabano'],
            'Rubengera': ['Rubengera', 'Murundi', 'Rutsiro'],
            'Rugabano': ['Rugabano', 'Mutuntu', 'Rutsiro'],
            'Rutsiro': ['Rutsiro', 'Rubengera', 'Rugabano']
        }
    }
};

const CreateRequest = () => {
    const { user } = useContext(AuthContext); 
    
    // Form management states
    const [residentId, setResidentId] = useState('');
    const [wasteType, setWasteType] = useState('organic'); 
    const [desc, setDesc] = useState('');
    const [status, setStatus] = useState('pending'); 
    const [imageFile, setImageFile] = useState(null);

    // Location states
    const [province, setProvince] = useState('');
    const [district, setDistrict] = useState('');
    const [sector, setSector] = useState('');
    const [cell, setCell] = useState('');
    const [locationDisplay, setLocationDisplay] = useState('');

    // Directory data states
    const [residents, setResidents] = useState([]);
    const [fetchingResidents, setFetchingResidents] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [statusFeedback, setStatusFeedback] = useState({ type: null, text: '' });

    // Get available options
    const provinces = Object.keys(RWANDA_LOCATIONS);
    const districts = province ? RWANDA_LOCATIONS[province]?.districts || [] : [];
    const sectors = district ? RWANDA_LOCATIONS[province]?.sectors?.[district] || [] : [];
    const cells = sector ? RWANDA_LOCATIONS[province]?.cells?.[sector] || [] : [];

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

    // Update location display when selections change
    useEffect(() => {
        const parts = [province, district, sector, cell].filter(Boolean);
        setLocationDisplay(parts.join(' - '));
    }, [province, district, sector, cell]);

    const handleAdminDispatch = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setStatusFeedback({ type: null, text: '' });

        if (!residentId) {
            setStatusFeedback({ type: 'error', text: 'Please assign this order ticket to a valid resident account.' });
            setIsSubmitting(false);
            return;
        }

        if (!locationDisplay) {
            setStatusFeedback({ type: 'error', text: 'Please select a complete location (Province, District, Sector, and Cell).' });
            setIsSubmitting(false);
            return;
        }

        try {
            const imageName = imageFile ? imageFile.name : '';

            await API.post('/waste-requests', {
                resident_id: parseInt(residentId, 10), 
                waste_type: wasteType.toLowerCase(),
                description: desc,
                image: imageName,
                location: locationDisplay,
                status: status.toLowerCase()
            });
            
            setStatusFeedback({
                type: 'success',
                text: '✅ Disposal ticket successfully created and logged into system registers!'
            });
            
            // Clear form
            setDesc(''); 
            setResidentId('');
            setWasteType('organic');
            setStatus('pending');
            setImageFile(null);
            setProvince('');
            setDistrict('');
            setSector('');
            setCell('');
            setLocationDisplay('');
            
            // Auto dismiss success after 5 seconds
            setTimeout(() => {
                setStatusFeedback({ type: null, text: '' });
            }, 5000);
            
        } catch (err) {
            console.error("Administrative order injection failed:", err);
            const serverErrorMessage = err.response?.data?.sqlMessage || err.response?.data?.error || 'System processing failure.';
            setStatusFeedback({ type: 'error', text: `❌ Submission Failed: ${serverErrorMessage}` });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 py-6 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden transition duration-200 hover:shadow-xl">
                    
                    {/* --- HEADER --- */}
                    <div className="p-6 sm:p-8 border-b border-slate-200 bg-gradient-to-r from-blue-50/80 to-white">
                        <div className="flex items-center space-x-4">
                            <div className="h-12 w-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                                <ClipboardPlus className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                                    Admin Order Dispatch
                                </h2>
                                <p className="text-sm text-slate-500 mt-0.5">
                                    Manually log a collection manifest order on behalf of a system resident
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 sm:p-8 space-y-6">
                        
                        {/* --- FEEDBACK MESSAGES --- */}
                        {statusFeedback.text && (
                            <div className={`p-4 rounded-xl border flex items-start space-x-3 ${
                                statusFeedback.type === 'success' 
                                    ? 'bg-emerald-50/80 border-emerald-200' 
                                    : 'bg-red-50/80 border-red-200'
                            }`}>
                                {statusFeedback.type === 'success' ? (
                                    <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                                ) : (
                                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                                )}
                                <p className={`text-sm font-semibold ${
                                    statusFeedback.type === 'success' ? 'text-emerald-800' : 'text-red-800'
                                }`}>
                                    {statusFeedback.text}
                                </p>
                                <button 
                                    onClick={() => setStatusFeedback({ type: null, text: '' })}
                                    className="ml-auto text-slate-400 hover:text-slate-600"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        )}

                        <form onSubmit={handleAdminDispatch} className="space-y-5">
                            
                            {/* 1. RESIDENT ASSIGNMENT */}
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                                    <User className="h-4 w-4 text-slate-400" />
                                    Resident Assignment <span className="text-red-400">*</span>
                                </label>
                                <div className="relative">
                                    <select 
                                        value={residentId}
                                        onChange={(e) => setResidentId(e.target.value)}
                                        className="w-full pl-4 pr-10 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition appearance-none"
                                        disabled={fetchingResidents}
                                        required
                                    >
                                        <option value="">
                                            {fetchingResidents ? 'Loading residents...' : 'Select a resident...'}
                                        </option>
                                        {residents.map(r => (
                                            <option key={r.user_id} value={r.user_id} className="py-2">
                                                {r.fullname} — {r.email}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                        <ChevronDown className="h-4 w-4 text-slate-400" />
                                    </div>
                                </div>
                            </div>

                            {/* 2. WASTE TYPE & STATUS */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                                        <Trash2 className="h-4 w-4 text-slate-400" />
                                        Waste Category <span className="text-red-400">*</span>
                                    </label>
                                    <div className="relative">
                                        <select 
                                            value={wasteType} 
                                            onChange={(e) => setWasteType(e.target.value)} 
                                            className="w-full pl-4 pr-10 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition appearance-none"
                                        >
                                            <option value="organic">🟢 Organic Waste</option>
                                            <option value="plastic">🔵 Plastic & Polymers</option>
                                            <option value="electronic">🟣 Electronic (E-Waste)</option>
                                            <option value="paper">🟡 Paper & Cardboard</option>
                                            <option value="metal">⚪ Metal & Glass</option>
                                            <option value="hazardous">🔴 Hazardous Waste</option>
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                            <ChevronDown className="h-4 w-4 text-slate-400" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-slate-400" />
                                        Request Status
                                    </label>
                                    <div className="relative">
                                        <select 
                                            value={status} 
                                            onChange={(e) => setStatus(e.target.value)} 
                                            className="w-full pl-4 pr-10 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition appearance-none"
                                        >
                                            <option value="pending" className="text-amber-600">🟡 Pending Review</option>
                                            <option value="assigned" className="text-purple-600">🟣 Assigned</option>
                                            <option value="in_progress" className="text-blue-600">🔵 In Progress</option>
                                            <option value="completed" className="text-emerald-600">🟢 Completed</option>
                                            <option value="cancelled" className="text-red-600">🔴 Cancelled</option>
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                            <ChevronDown className="h-4 w-4 text-slate-400" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 3. LOCATION SELECTION */}
                            <div className="space-y-3">
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-slate-400" />
                                    Pickup Location <span className="text-red-400">*</span>
                                </label>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {/* Province */}
                                    <div className="relative">
                                        <select
                                            value={province}
                                            onChange={(e) => {
                                                setProvince(e.target.value);
                                                setDistrict('');
                                                setSector('');
                                                setCell('');
                                            }}
                                            className="w-full pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition appearance-none"
                                        >
                                            <option value="">Select Province</option>
                                            {provinces.map(p => (
                                                <option key={p} value={p}>{p}</option>
                                            ))}
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                            <ChevronDown className="h-4 w-4 text-slate-400" />
                                        </div>
                                    </div>

                                    {/* District */}
                                    <div className="relative">
                                        <select
                                            value={district}
                                            onChange={(e) => {
                                                setDistrict(e.target.value);
                                                setSector('');
                                                setCell('');
                                            }}
                                            disabled={!province}
                                            className="w-full pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <option value="">Select District</option>
                                            {districts.map(d => (
                                                <option key={d} value={d}>{d}</option>
                                            ))}
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                            <ChevronDown className="h-4 w-4 text-slate-400" />
                                        </div>
                                    </div>

                                    {/* Sector */}
                                    <div className="relative">
                                        <select
                                            value={sector}
                                            onChange={(e) => {
                                                setSector(e.target.value);
                                                setCell('');
                                            }}
                                            disabled={!district}
                                            className="w-full pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <option value="">Select Sector</option>
                                            {sectors.map(s => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                            <ChevronDown className="h-4 w-4 text-slate-400" />
                                        </div>
                                    </div>

                                    {/* Cell */}
                                    <div className="relative">
                                        <select
                                            value={cell}
                                            onChange={(e) => setCell(e.target.value)}
                                            disabled={!sector}
                                            className="w-full pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <option value="">Select Cell</option>
                                            {cells.map(c => (
                                                <option key={c} value={c}>{c}</option>
                                            ))}
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                            <ChevronDown className="h-4 w-4 text-slate-400" />
                                        </div>
                                    </div>
                                </div>

                                {/* Location Preview */}
                                {locationDisplay && (
                                    <div className="p-3 bg-blue-50/50 border border-blue-200 rounded-xl">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-blue-500" />
                                            <span className="text-sm font-medium text-slate-700">
                                                {locationDisplay}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* 4. IMAGE UPLOAD */}
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                                    <ImagePlus className="h-4 w-4 text-slate-400" />
                                    Waste Visual Reference (Optional)
                                </label>
                                <div className="flex items-center justify-center w-full">
                                    <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-slate-200 border-dashed rounded-xl cursor-pointer bg-slate-50/50 hover:bg-slate-100 transition duration-150 group">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="p-2 bg-blue-50 rounded-full mb-1 group-hover:bg-blue-100 transition">
                                                <ImagePlus className="w-5 h-5 text-blue-500" />
                                            </div>
                                            <p className="text-xs text-slate-500 font-medium">
                                                {imageFile ? (
                                                    <span className="text-emerald-600 font-bold">✓ {imageFile.name}</span>
                                                ) : (
                                                    <span>Click to upload image (PNG, JPG, GIF up to 5MB)</span>
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
                                {imageFile && (
                                    <button
                                        type="button"
                                        onClick={() => setImageFile(null)}
                                        className="text-xs text-red-500 hover:text-red-700 font-medium mt-1"
                                    >
                                        Remove image
                                    </button>
                                )}
                            </div>

                            {/* 5. DESCRIPTION */}
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                                    <AlignLeft className="h-4 w-4 text-slate-400" />
                                    Manifest Specifications <span className="text-red-400">*</span>
                                </label>
                                <textarea 
                                    value={desc} 
                                    onChange={(e) => setDesc(e.target.value)} 
                                    rows="3"
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition resize-none"
                                    placeholder="Describe the waste type, quantity, special instructions..."
                                    required
                                />
                                <p className="text-[10px] text-slate-400">
                                    {desc.length} characters
                                </p>
                            </div>

                            {/* 6. SUBMIT BUTTON */}
                            <button 
                                type="submit" 
                                disabled={isSubmitting || fetchingResidents}
                                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3.5 px-6 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition duration-150 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        <span>Processing...</span>
                                    </>
                                ) : (
                                    <>
                                        <ClipboardPlus className="h-5 w-5" />
                                        <span>Create Request</span>
                                    </>
                                )}
                            </button>

                           
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateRequest;