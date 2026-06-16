import React, { useState, useEffect } from 'react';
import API from '../../services/api';

const Collectors = () => {
    const [collectors, setCollectors] = useState([]);
    const [userId, setUserId] = useState('');
    const [empNumber, setEmpNumber] = useState('');

    useEffect(() => { loadCollectors(); }, []);

    const loadCollectors = () => {
        API.get('/collectors').then(res => setCollectors(res.data)).catch(err => console.error(err));
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await API.post('/collectors', { user_id: userId, employee_number: empNumber });
            setUserId(''); setEmpNumber('');
            loadCollectors();
        } catch (err) { alert("Kwandika umukoresha byanze."); }
    };

    return (
        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow h-fit">
                <h3 className="font-bold text-lg mb-4 text-gray-700">Ongeramo Umukolekitari</h3>
                <form onSubmit={handleCreate} className="space-y-4">
                    <div>
                        <label className="block text-sm">User ID</label>
                        <input type="number" value={userId} onChange={e=>setUserId(e.target.value)} className="w-full p-2 border rounded" required />
                    </div>
                    <div>
                        <label className="block text-sm">Employee Number</label>
                        <input type="text" value={empNumber} onChange={e=>setEmpNumber(e.target.value)} className="w-full p-2 border rounded" required />
                    </div>
                    <button type="submit" className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700 font-bold">Bika</button>
                </form>
            </div>
            <div className="lg:col-span-2 bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full text-left text-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-4">Collector ID</th>
                            <th className="p-4">User ID</th>
                            <th className="p-4">Employee Number</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {collectors.map(c => (
                            <tr key={c.collector_id}>
                                <td className="p-4 font-bold">#{c.collector_id}</td>
                                <td className="p-4">User {c.user_id}</td>
                                <td className="p-4">{c.employee_number}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Collectors;