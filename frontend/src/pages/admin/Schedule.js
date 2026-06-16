import React, { useState, useEffect } from 'react';
import API from '../../services/api';

const Schedule = () => {
    const [schedules, setSchedules] = useState([]);

    useEffect(() => {
        API.get('/collection-schedules').then(res => setSchedules(res.data));
    }, []);

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Master Collection Schedule</h2>
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full text-sm text-left">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-4">Schedule ID</th>
                            <th className="p-4">Request ID</th>
                            <th className="p-4">Collector ID</th>
                            <th className="p-4">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {schedules.map(s => (
                            <tr key={s.schedule_id}>
                                <td className="p-4">#{s.schedule_id}</td>
                                <td className="p-4">Req #{s.request_id}</td>
                                <td className="p-4">Coll #{s.collector_id}</td>
                                <td className="p-4"><span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs">{s.status}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Schedule;