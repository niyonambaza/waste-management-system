import React, { useState, useEffect } from 'react';
import API from '../../services/api';

const Materials = () => {
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // Form states mapped directly to your Express backend fields
    const [formData, setFormData] = useState({
        center_id: '',
        request_id: '',
        material_type: '',
        quantity: '',
        date_received: ''
    });

    // 1. Fetch materials (GET)
    const fetchMaterials = () => {
        API.get('/recycled-materials')
            .then(res => setMaterials(res.data))
            .catch(err => console.error(err));
    };

    useEffect(() => {
        fetchMaterials();
    }, []);

    // Handle input tracking
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // 2. Submit new entry (POST)
    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        setLoading(true);

        API.post('/recycled-materials', formData)
            .then((res) => {
                setSuccessMsg('✅ Material batch logged successfully!');
                // Reset form fields
                setFormData({
                    center_id: '',
                    request_id: '',
                    material_type: '',
                    quantity: '',
                    date_received: ''
                });
                fetchMaterials(); // Refresh table items immediately
            })
            .catch((err) => {
                setError(err.response?.data?.error || 'Failed to submit data. Please try again.');
            })
            .finally(() => {
                setLoading(false);
            });
    };

    return (
        <div className="p-6 space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-800">Recycled Materials Management</h2>
                <p className="text-sm text-gray-500">Log new waste batches and monitor current facility collection.</p>
            </div>

            {/* Notification system alerts */}
            {error && <div className="p-3 bg-red-50 border-l-4 border-red-500 text-sm text-red-700 rounded font-medium">{error}</div>}
            {successMsg && <div className="p-3 bg-green-50 border-l-4 border-green-500 text-sm text-green-700 rounded font-medium">{successMsg}</div>}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* --- ADD NEW MATERIAL FORM (POST PANEL) --- */}
                <div className="bg-white p-5 rounded-lg shadow border border-gray-100 h-fit">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Log New Batch</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 uppercase">Center ID</label>
                            <input
                                type="number"
                                name="center_id"
                                required
                                value={formData.center_id}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-green-500 focus:border-green-500 focus:outline-none"
                                placeholder="e.g. 1"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-600 uppercase">Request ID</label>
                            <input
                                type="number"
                                name="request_id"
                                required
                                value={formData.request_id}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-green-500 focus:border-green-500 focus:outline-none"
                                placeholder="e.g. 104"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-600 uppercase">Ubwoko (Material Type)</label>
                            <select
                                name="material_type"
                                required
                                value={formData.material_type}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md text-sm focus:ring-green-500 focus:border-green-500 focus:outline-none"
                            >
                                <option value="">-- Hitamo Ubwoko --</option>
                                <option value="Plastic">Plastic</option>
                                <option value="Paper">Paper</option>
                                <option value="Glass">Glass</option>
                                <option value="Metal">Metal</option>
                                <option value="Organic">Organic</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-600 uppercase">Ingano (Quantity in Kg)</label>
                            <input
                                type="number"
                                step="0.01"
                                name="quantity"
                                required
                                value={formData.quantity}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-green-500 focus:border-green-500 focus:outline-none"
                                placeholder="e.g. 45.50"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-600 uppercase">Itariki (Date Received)</label>
                            <input
                                type="date"
                                name="date_received"
                                required
                                value={formData.date_received}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-green-500 focus:border-green-500 focus:outline-none"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-2 px-4 font-bold text-white text-sm rounded transition duration-150 ${
                                loading ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                            }`}
                        >
                            {loading ? 'Saving...' : 'Save Entry'}
                        </button>
                    </form>
                </div>

                {/* --- DISPLAY TABLE PANEL (GET PANEL) --- */}
                <div className="lg:col-span-2 bg-white rounded-lg shadow overflow-hidden border border-gray-100">
                    <table className="min-w-full text-sm text-left">
                        <thead className="bg-gray-100 border-b border-gray-200 text-gray-700">
                            <tr>
                                <th className="p-4">Material ID</th>
                                <th className="p-4">Center ID</th>
                                <th className="p-4">Ubwoko</th>
                                <th className="p-4">Ingano (Qty)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {materials.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="p-4 text-center text-gray-500">No batch entries found in database.</td>
                                </tr>
                            ) : (
                                materials.map(m => (
                                    <tr key={m.material_id} className="hover:bg-gray-50 transition">
                                        <td className="p-4 font-medium text-gray-700">#{m.material_id}</td>
                                        <td className="p-4 text-gray-600">Center {m.center_id}</td>
                                        <td className="p-4 font-semibold text-green-600">{m.material_type}</td>
                                        <td className="p-4 text-gray-900 font-bold">{m.quantity} Kg</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

            </div>
        </div>
    );
};

export default Materials;