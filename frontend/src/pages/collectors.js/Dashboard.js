import React, { useEffect, useState } from 'react';
import API from '../../services/api';

const CollectorDashboard = () => {
    const [schedules, setSchedules] = useState([]);

    useEffect(() => {
        // Guhamagara /api/collection-schedules ya backend
        API.get('/collection-schedules')
            .then(res => setSchedules(res.data))
            .catch(err => console.error(err));
    }, []);

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Gahunda zo Gutwara Imyanda (Collector Dashboard)</h2>
            <div className="overflow-x-auto bg-white shadow rounded-lg">
                <table className="min-w-full table-auto">
                    <thead className="bg-gray-100 text-left text-sm text-gray-600 font-medium">
                        <tr>
                            <th className="p-4">ID ya Request</th>
                            <th className="p-4">Itariki</th>
                            <th className="p-4">Isaha</th>
                            <th className="p-4">Imiterere (Status)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 text-sm text-gray-700">
                        {schedules.map(sch => (
                            <tr key={sch.schedule_id}>
                                <td className="p-4">#{sch.request_id}</td>
                                <td className="p-4">{new Date(sch.collection_date).toLocaleDateString()}</td>
                                <td className="p-4">{sch.collection_time}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${sch.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                        {sch.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CollectorDashboard;