import React, { useState, useEffect } from 'react';
import API from '../../services/api';

const Residents = () => {
    const [residents, setResidents] = useState([]);

    useEffect(() => {
        API.get('/residents').then(res => setResidents(res.data)).catch(err => console.error(err));
    }, []);

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Urufatiro rw'Abaturage (Residents Directory)</h2>
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full text-sm text-left">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-4">Resident ID</th>
                            <th className="p-4">User ID</th>
                            <th className="p-4">Address (Aho batuye)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {residents.map(r => (
                            <tr key={r.resident_id}>
                                <td className="p-4 font-bold">#{r.resident_id}</td>
                                <td className="p-4">User {r.user_id}</td>
                                <td className="p-4">📍 {r.address}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Residents;