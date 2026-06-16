import React, { useState, useEffect } from 'react';
import API from '../../services/api';

const Staff = () => {
    const [staff, setStaff] = useState([]);

    useEffect(() => {
        API.get('/recycling-staff').then(res => setStaff(res.data));
    }, []);

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Recycling Staff Directory</h2>
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full text-sm text-left">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-4">Staff ID</th>
                            <th className="p-4">Center ID</th>
                            <th className="p-4">Employee Number</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {staff.map(s => (
                            <tr key={s.staff_id}>
                                <td className="p-4">#{s.staff_id}</td>
                                <td className="p-4">Center {s.center_id}</td>
                                <td className="p-4 font-mono">{s.employee_number}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Staff;