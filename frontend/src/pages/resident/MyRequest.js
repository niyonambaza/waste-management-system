import React, { useEffect, useState, useContext } from 'react';
import { getWasteRequests } from '../../services/requestService';
import { AuthContext } from '../../context/authcontext';
import API from '../../services/api';
import { 
    ClipboardList, 
    Search, 
    Filter, 
    Trash2, 
    MapPin, 
    Clock, 
    CheckCircle2, 
    ChevronsRight, 
    RefreshCw, 
    Inbox, 
    FileText,
    Grid,
    List,
    ChevronDown,
    X,
    AlertCircle,
    Package,
    User,
    Calendar,
    ArrowUpRight,
    TrendingUp,
    BarChart3
} from 'lucide-react';

// Rwanda Location Data - Simplified but Complete
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

// Helper function to parse location string
const parseLocation = (locationString) => {
    if (!locationString) return { province: '', district: '', sector: '', cell: '' };
    
    // Try to parse if format is "Province - District - Sector - Cell"
    const parts = locationString.split(' - ').map(s => s.trim());
    
    if (parts.length === 4) {
        return {
            province: parts[0],
            district: parts[1],
            sector: parts[2],
            cell: parts[3]
        };
    } else if (parts.length === 3) {
        return {
            province: parts[0],
            district: parts[1],
            sector: parts[2],
            cell: ''
        };
    } else if (parts.length === 2) {
        return {
            province: parts[0],
            district: parts[1],
            sector: '',
            cell: ''
        };
    } else {
        return {
            province: '',
            district: '',
            sector: '',
            cell: ''
        };
    }
};

const MyRequest = () => {
    const { user } = useContext(AuthContext);
    const [myRequests, setMyRequests] = useState([]);
    const [filteredRequests, setFilteredRequests] = useState([]);
    
    // Core functional feature states
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [viewMode, setViewMode] = useState('grid');
    const [showFilters, setShowFilters] = useState(false);

    // Location filter states
    const [selectedProvince, setSelectedProvince] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [selectedSector, setSelectedSector] = useState('');
    const [selectedCell, setSelectedCell] = useState('');

    // Stats
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        approved: 0,
        completed: 0
    });

    useEffect(() => {
        if (user?.id) {
            loadUserRequests();
        }
    }, [user?.id]);

    // Live filtering pipeline execution handler - FIXED
    useEffect(() => {
        let updateList = myRequests.filter(req => {
            // Search filter
            const matchesSearch = 
                req.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                req.waste_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                req.location?.toLowerCase().includes(searchTerm.toLowerCase());
            
            // Status filter
            const matchesStatus = statusFilter === 'all' || 
                req.status?.toLowerCase() === statusFilter.toLowerCase();
            
            // Location filter - FIXED: Parse location properly
            let matchesLocation = true;
            
            if (selectedProvince || selectedDistrict || selectedSector || selectedCell) {
                const locationInfo = parseLocation(req.location || '');
                
                // Check each level
                if (selectedProvince && locationInfo.province !== selectedProvince) {
                    matchesLocation = false;
                }
                if (selectedDistrict && locationInfo.district !== selectedDistrict) {
                    matchesLocation = false;
                }
                if (selectedSector && locationInfo.sector !== selectedSector) {
                    matchesLocation = false;
                }
                if (selectedCell && locationInfo.cell !== selectedCell) {
                    matchesLocation = false;
                }
            }
            
            return matchesSearch && matchesStatus && matchesLocation;
        });

        setFilteredRequests(updateList);
    }, [searchTerm, statusFilter, myRequests, selectedProvince, selectedDistrict, selectedSector, selectedCell]);

    const loadUserRequests = async () => {
        setLoading(true);
        setError(false);
        try {
            const res = await getWasteRequests();
            const personalLogs = res.data.filter(req => req.resident_id === user.id);
            setMyRequests(personalLogs);
            setFilteredRequests(personalLogs);
            
            // Update stats
            const pending = personalLogs.filter(r => r.status === 'pending').length;
            const approved = personalLogs.filter(r => r.status === 'approved').length;
            const completed = personalLogs.filter(r => r.status === 'completed').length;
            setStats({
                total: personalLogs.length,
                pending,
                approved,
                completed
            });
        } catch (err) {
            console.error("Could not fetch personal request index:", err);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelRequest = async (id) => {
        if (window.confirm("Are you sure you want to cancel and delete this pending collection request?")) {
            try {
                await API.delete(`/waste-requests/${id}`);
                const updated = myRequests.filter(req => req.request_id !== id);
                setMyRequests(updated);
                // Update stats
                const pending = updated.filter(r => r.status === 'pending').length;
                const approved = updated.filter(r => r.status === 'approved').length;
                const completed = updated.filter(r => r.status === 'completed').length;
                setStats({
                    total: updated.length,
                    pending,
                    approved,
                    completed
                });
            } catch (err) {
                console.error("Cancellation request rejected by core:", err);
                alert("Unable to drop order request. Please reload and try again.");
            }
        }
    };

    const getBadgeStyle = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'approved': return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'pending': default: return 'bg-amber-50 text-amber-700 border-amber-200';
        }
    };

    const getStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed': return <CheckCircle2 className="h-3 w-3" />;
            case 'approved': return <ChevronsRight className="h-3 w-3" />;
            case 'pending': default: return <Clock className="h-3 w-3" />;
        }
    };

    const getWasteTypeColor = (type) => {
        const colors = {
            'organic': 'bg-emerald-100 text-emerald-700',
            'plastic': 'bg-blue-100 text-blue-700',
            'electronic': 'bg-purple-100 text-purple-700',
            'paper': 'bg-amber-100 text-amber-700',
            'metal': 'bg-slate-100 text-slate-700',
            'hazardous': 'bg-red-100 text-red-700'
        };
        return colors[type?.toLowerCase()] || 'bg-gray-100 text-gray-700';
    };

    const clearLocationFilters = () => {
        setSelectedProvince('');
        setSelectedDistrict('');
        setSelectedSector('');
        setSelectedCell('');
    };

    // Get available options
    const provinces = Object.keys(RWANDA_LOCATIONS);
    const districts = selectedProvince ? RWANDA_LOCATIONS[selectedProvince]?.districts || [] : [];
    const sectors = selectedDistrict ? RWANDA_LOCATIONS[selectedProvince]?.sectors?.[selectedDistrict] || [] : [];
    const cells = selectedSector ? RWANDA_LOCATIONS[selectedProvince]?.cells?.[selectedSector] || [] : [];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 py-6 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-6">
                
                {/* --- HEADER --- */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
                    <div className="flex items-center space-x-4">
                        <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-3 rounded-xl shadow-lg shadow-blue-600/20">
                            <ClipboardList className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                                My Collection History
                            </h2>
                            <p className="text-sm text-slate-500 mt-0.5">
                                Track manifests, review landmarks, or retract open tickets
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={loadUserRequests}
                            disabled={loading}
                            className="inline-flex items-center justify-center space-x-2 bg-white hover:bg-slate-50 text-slate-700 text-sm font-bold py-2.5 px-4 border border-slate-200 rounded-lg shadow-sm transition active:scale-95 disabled:opacity-60"
                        >
                            <RefreshCw className={`h-4 w-4 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
                            <span className="hidden sm:inline">Refresh</span>
                        </button>
                    </div>
                </div>

                {/* --- STATISTICS CARDS --- */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total</p>
                                <p className="text-2xl font-black text-slate-900">{stats.total}</p>
                            </div>
                            <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center">
                                <ClipboardList className="h-5 w-5 text-blue-600" />
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending</p>
                                <p className="text-2xl font-black text-amber-600">{stats.pending}</p>
                            </div>
                            <div className="h-10 w-10 bg-amber-50 rounded-lg flex items-center justify-center">
                                <Clock className="h-5 w-5 text-amber-600" />
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Approved</p>
                                <p className="text-2xl font-black text-blue-600">{stats.approved}</p>
                            </div>
                            <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center">
                                <ChevronsRight className="h-5 w-5 text-blue-600" />
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Completed</p>
                                <p className="text-2xl font-black text-emerald-600">{stats.completed}</p>
                            </div>
                            <div className="h-10 w-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- ERROR ALERT --- */}
                {error && (
                    <div className="flex items-center space-x-3 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                        <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                        <p className="text-sm text-red-700 font-medium flex-1">
                            Failed to load your requests. Please refresh the page.
                        </p>
                        <button onClick={() => setError(false)} className="text-red-400 hover:text-red-600">
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                )}

                {/* --- FILTERS HUB --- */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1 relative">
                            <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                            <input 
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search by description, waste type, location..."
                                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                            />
                        </div>
                        
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="inline-flex items-center space-x-2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition"
                            >
                                <Filter className="h-4 w-4" />
                                <span className="hidden sm:inline">Filters</span>
                                {showFilters ? <ChevronDown className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </button>
                            
                            <div className="flex border border-slate-200 rounded-lg overflow-hidden">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 transition ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-slate-400 hover:text-slate-600'}`}
                                >
                                    <Grid className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 transition ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-slate-400 hover:text-slate-600'}`}
                                >
                                    <List className="h-4 w-4" />
                                </button>
                            </div>
                            
                            {(searchTerm || statusFilter !== 'all' || selectedProvince) && (
                                <button
                                    onClick={() => {
                                        setSearchTerm('');
                                        setStatusFilter('all');
                                        clearLocationFilters();
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
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                                        Status
                                    </label>
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    >
                                        <option value="all">All Statuses</option>
                                        <option value="pending">Pending</option>
                                        <option value="approved">Approved</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                                        Province
                                    </label>
                                    <select
                                        value={selectedProvince}
                                        onChange={(e) => {
                                            setSelectedProvince(e.target.value);
                                            setSelectedDistrict('');
                                            setSelectedSector('');
                                            setSelectedCell('');
                                        }}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    >
                                        <option value="">All Provinces</option>
                                        {provinces.map(p => (
                                            <option key={p} value={p}>{p}</option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                                        District
                                    </label>
                                    <select
                                        value={selectedDistrict}
                                        onChange={(e) => {
                                            setSelectedDistrict(e.target.value);
                                            setSelectedSector('');
                                            setSelectedCell('');
                                        }}
                                        disabled={!selectedProvince}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <option value="">All Districts</option>
                                        {districts.map(d => (
                                            <option key={d} value={d}>{d}</option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                                        Sector
                                    </label>
                                    <select
                                        value={selectedSector}
                                        onChange={(e) => {
                                            setSelectedSector(e.target.value);
                                            setSelectedCell('');
                                        }}
                                        disabled={!selectedDistrict}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <option value="">All Sectors</option>
                                        {sectors.map(s => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                                        Cell
                                    </label>
                                    <select
                                        value={selectedCell}
                                        onChange={(e) => setSelectedCell(e.target.value)}
                                        disabled={!selectedSector}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <option value="">All Cells</option>
                                        {cells.map(c => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            
                            {/* Active location filters display */}
                            {(selectedProvince || selectedDistrict || selectedSector || selectedCell) && (
                                <div className="mt-3 flex flex-wrap gap-2">
                                    <span className="text-xs text-slate-500 font-medium">Active location:</span>
                                    {selectedProvince && (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">
                                            {selectedProvince}
                                            <button onClick={() => setSelectedProvince('')} className="hover:text-blue-900">
                                                <X className="h-3 w-3" />
                                            </button>
                                        </span>
                                    )}
                                    {selectedDistrict && (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">
                                            {selectedDistrict}
                                            <button onClick={() => setSelectedDistrict('')} className="hover:text-blue-900">
                                                <X className="h-3 w-3" />
                                            </button>
                                        </span>
                                    )}
                                    {selectedSector && (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">
                                            {selectedSector}
                                            <button onClick={() => setSelectedSector('')} className="hover:text-blue-900">
                                                <X className="h-3 w-3" />
                                            </button>
                                        </span>
                                    )}
                                    {selectedCell && (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">
                                            {selectedCell}
                                            <button onClick={() => setSelectedCell('')} className="hover:text-blue-900">
                                                <X className="h-3 w-3" />
                                            </button>
                                        </span>
                                    )}
                                    <button
                                        onClick={clearLocationFilters}
                                        className="text-xs text-red-500 hover:text-red-700 font-medium"
                                    >
                                        Clear all
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* --- REQUESTS DISPLAY --- */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[1, 2, 3, 4].map(item => (
                            <div key={item} className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 animate-pulse">
                                <div className="flex justify-between">
                                    <div className="h-4 w-20 bg-slate-100 rounded" />
                                    <div className="h-5 w-16 bg-slate-50 rounded-full" />
                                </div>
                                <div className="h-4 w-full bg-slate-100 rounded" />
                                <div className="h-3 w-28 bg-slate-50 rounded" />
                            </div>
                        ))}
                    </div>
                ) : filteredRequests.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center p-16 bg-white rounded-xl border border-slate-200 border-dashed">
                        <div className="h-16 w-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 mb-4">
                            <Inbox className="h-8 w-8" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-700">No Requests Found</h3>
                        <p className="text-sm text-slate-400 mt-1 max-w-sm">
                            {myRequests.length === 0 
                                ? "You haven't logged any disposal manifest orders into EcoTrack yet." 
                                : "No items match your current filters."}
                        </p>
                        {(searchTerm || statusFilter !== 'all' || selectedProvince) && (
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setStatusFilter('all');
                                    clearLocationFilters();
                                }}
                                className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-700"
                            >
                                Clear all filters
                            </button>
                        )}
                    </div>
                ) : viewMode === 'grid' ? (
                    /* --- GRID VIEW --- */
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {filteredRequests.map(req => (
                            <div 
                                key={req.request_id} 
                                className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden group"
                            >
                                <div className="p-5">
                                    <div className="flex justify-between items-start gap-3 mb-3">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full ${getWasteTypeColor(req.waste_type)}`}>
                                            <Package className="h-3 w-3" />
                                            {req.waste_type}
                                        </span>
                                        
                                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border capitalize ${getBadgeStyle(req.status)}`}>
                                            {getStatusIcon(req.status)}
                                            {req.status}
                                        </span>
                                    </div>

                                    <p className="text-sm text-slate-600 leading-relaxed line-clamp-2 min-h-[40px]">
                                        {req.description}
                                    </p>
                                    
                                    <div className="mt-4 pt-3 border-t border-slate-100">
                                        <div className="flex items-center text-xs text-slate-500 gap-2">
                                            <MapPin className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                                            <span className="truncate" title={req.location}>
                                                {req.location || 'Location not specified'}
                                            </span>
                                        </div>
                                        
                                        {req.created_at && (
                                            <div className="flex items-center text-[10px] text-slate-400 mt-1.5 gap-1.5">
                                                <Calendar className="h-3 w-3" />
                                                {new Date(req.created_at).toLocaleDateString()}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="px-5 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
                                    <span className="text-[10px] text-slate-400">
                                        Request #{req.request_id}
                                    </span>
                                    {req.status === 'pending' && (
                                        <button 
                                            onClick={() => handleCancelRequest(req.request_id)}
                                            className="inline-flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* --- LIST VIEW --- */
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50/80">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Request</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Waste Type</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">Location</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                        <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredRequests.map(req => (
                                        <tr key={req.request_id} className="hover:bg-slate-50/60 transition">
                                            <td className="px-4 py-3">
                                                <div>
                                                    <p className="text-sm font-medium text-slate-900 truncate max-w-[200px]">
                                                        {req.description}
                                                    </p>
                                                    <p className="text-xs text-slate-400 sm:hidden">
                                                        {req.waste_type}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 hidden sm:table-cell">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full ${getWasteTypeColor(req.waste_type)}`}>
                                                    {req.waste_type}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 hidden md:table-cell">
                                                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                                    <MapPin className="h-3 w-3 text-slate-400 flex-shrink-0" />
                                                    <span className="truncate max-w-[150px]">{req.location}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border capitalize ${getBadgeStyle(req.status)}`}>
                                                    {getStatusIcon(req.status)}
                                                    {req.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                {req.status === 'pending' && (
                                                    <button 
                                                        onClick={() => handleCancelRequest(req.request_id)}
                                                        className="inline-flex items-center gap-1 text-xs font-bold text-red-500 hover:text-red-700 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                        <span className="hidden sm:inline">Cancel</span>
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyRequest;