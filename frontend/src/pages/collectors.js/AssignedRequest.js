import React, { useEffect, useState } from 'react';
import API from '../../services/api';

const AssignedRequest = () => {
    const [assigned, setAssigned] = useState([]);

    useEffect(() => {
        API.get('/waste-requests').then(res => {
            // Reba ubusabe bwemejwe budafite uwabutwaye
            setAssigned(res.data.filter(r => r.status === 'approved'));
        });
    }, []);

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Ubusabe Nshinzwe Gutwara</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {assigned.map(req => (
                    <div key={req.request_id} className="p-4 bg-white rounded shadow border-l-4 border-yellow-500">
                        <h4 className="font-bold text-gray-800">{req.waste_type}</h4>
                        <p className="text-sm text-gray-600 mt-1">{req.description}</p>
                        <p className="text-xs text-gray-400 mt-2">📍 Location: {req.location}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AssignedRequest;