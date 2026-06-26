import React, { useState, useEffect } from 'react';
import { Layers, PlusCircle, Save, Trash2, Edit2, RefreshCw, AlertCircle, CheckCircle, MapPin, Hash } from 'lucide-react';

const StaffMaterialPage = () => {
  // --- STATE MANAGEMENT ---
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form State for creating new record
  const [formData, setFormData] = useState({
    center_id: '',
    request_id: '',
    material_type: '',
    quantity: ''
  });

  // State for tracking inline editing
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    center_id: '',
    request_id: '',
    material_type: '',
    quantity: ''
  });

  // --- 1. FETCH ALL RECYCLED MATERIALS (GET) ---
  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/recycled-materials');
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch materials.');
      setMaterials(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  // --- 2. LOG NEW MATERIAL (POST) ---
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await fetch('http://localhost:5000/api/recycled-materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to log material.');

      setSuccess('Material logged successfully!');
      setFormData({ center_id: '', request_id: '', material_type: '', quantity: '' });
      fetchMaterials(); // Refresh table
    } catch (err) {
      setError(err.message);
    }
  };

  // --- 3. START EDIT MODE (PUT PREPARATION) ---
  const handleEditClick = (item) => {
    setEditingId(item.material_id);
    setEditFormData({
      center_id: item.center_id,
      request_id: item.request_id || '',
      material_type: item.material_type,
      quantity: item.quantity
    });
  };

  const handleEditInputChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  // --- 4. SUBMIT UPDATED DATA (PUT) ---
  const handleUpdateSubmit = async (e, id) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`http://localhost:5000/api/recycled-materials/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update material.');

      setSuccess('Material log updated successfully!');
      setEditingId(null);
      fetchMaterials(); // Refresh table
    } catch (err) {
      setError(err.message);
    }
  };

  // --- 5. DELETE LOG (DELETE) ---
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this log?')) return;
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`http://localhost:5000/api/recycled-materials/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete the record.');

      setSuccess('Record deleted successfully.');
      fetchMaterials();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-3 border-b border-gray-200 pb-4">
        <div className="bg-blue-600 p-2.5 rounded-lg text-white">
          <Layers className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Recycled Materials Inventory</h1>
          <p className="text-sm text-gray-500">Log, update, and manage materials arriving at recycling hubs.</p>
        </div>
      </div>

      {/* Alert Messages */}
      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded flex items-center space-x-2 text-red-700 text-sm">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
          <p className="font-medium">{error}</p>
        </div>
      )}
      {success && (
        <div className="p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded flex items-center space-x-2 text-emerald-800 text-sm">
          <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />
          <p className="font-medium">{success}</p>
        </div>
      )}

      {/* Grid: Form (Left/Top) & Table (Right/Bottom) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Creation Form Form */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-fit">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <PlusCircle className="h-5 w-5 text-blue-600" /> Log Received Material
          </h3>
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Center ID</label>
              <input type="number" name="center_id" value={formData.center_id} onChange={handleInputChange} className="mt-1 w-full px-3 py-2 border rounded-lg text-sm focus:ring-blue-500" placeholder="e.g. 1" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Request ID <span className="text-gray-400 font-normal">(Optional)</span></label>
              <input type="number" name="request_id" value={formData.request_id} onChange={handleInputChange} className="mt-1 w-full px-3 py-2 border rounded-lg text-sm focus:ring-blue-500" placeholder="e.g. 12" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Material Type</label>
              <select name="material_type" value={formData.material_type} onChange={handleInputChange} className="mt-1 w-full px-3 py-2 border rounded-lg text-sm bg-white focus:ring-blue-500" required>
                <option value="">-- Select Type --</option>
                <option value="Plastic">Plastic</option>
                <option value="Paper/Cardboard">Paper / Cardboard</option>
                <option value="Glass">Glass</option>
                <option value="Metal">Metal</option>
                <option value="Organic Waste">Organic Waste</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Quantity (Kgs / Tons)</label>
              <input type="number" step="0.01" name="quantity" value={formData.quantity} onChange={handleInputChange} className="mt-1 w-full px-3 py-2 border rounded-lg text-sm focus:ring-blue-500" placeholder="e.g. 45.50" required />
            </div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-semibold transition shadow-sm">
              Log Entry
            </button>
          </form>
        </div>

        {/* Inventory Lists Table */}
        <div className="lg:grid-cols-1 lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-4 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-bold text-gray-900">Inventory Ledger</h3>
            <button onClick={fetchMaterials} className="text-gray-500 hover:text-blue-600 transition">
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>

          {loading ? (
            <div className="p-12 text-center text-gray-500">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-xs">Loading ledger entries...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
                <thead className="bg-gray-100 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Center</th>
                    <th className="px-4 py-3">Req ID</th>
                    <th className="px-4 py-3">Material Type</th>
                    <th className="px-4 py-3">Quantity</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {materials.map((item) => (
                    <tr key={item.material_id} className="hover:bg-gray-50/60 text-gray-700">
                      
                      {/* Center ID / Name Column */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        {editingId === item.material_id ? (
                          <input type="number" name="center_id" value={editFormData.center_id} onChange={handleEditInputChange} className="w-20 px-2 py-1 border rounded text-xs" />
                        ) : (
                          <div className="flex items-center space-x-1.5 font-medium text-gray-900">
                            <MapPin className="h-3.5 w-3.5 text-gray-400" />
                            <span>{item.center_name || `ID: ${item.center_id}`}</span>
                          </div>
                        )}
                      </td>

                      {/* Request ID Column */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        {editingId === item.material_id ? (
                          <input type="number" name="request_id" value={editFormData.request_id} onChange={handleEditInputChange} className="w-20 px-2 py-1 border rounded text-xs" placeholder="Null" />
                        ) : (
                          <span className="text-xs font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">
                            {item.request_id ? `#${item.request_id}` : 'Direct'}
                          </span>
                        )}
                      </td>

                      {/* Material Type Column */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        {editingId === item.material_id ? (
                          <select name="material_type" value={editFormData.material_type} onChange={handleEditInputChange} className="px-2 py-1 border rounded text-xs bg-white">
                            <option value="Plastic">Plastic</option>
                            <option value="Paper/Cardboard">Paper/Cardboard</option>
                            <option value="Glass">Glass</option>
                            <option value="Metal">Metal</option>
                            <option value="Organic Waste">Organic Waste</option>
                          </select>
                        ) : (
                          <span className="font-semibold">{item.material_type}</span>
                        )}
                      </td>

                      {/* Quantity Column */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        {editingId === item.material_id ? (
                          <input type="number" step="0.01" name="quantity" value={editFormData.quantity} onChange={handleEditInputChange} className="w-24 px-2 py-1 border rounded text-xs" />
                        ) : (
                          <span className="text-blue-600 font-bold">{item.quantity} units</span>
                        )}
                      </td>

                      {/* Actions Column */}
                      <td className="px-4 py-3 whitespace-nowrap text-right text-xs font-medium">
                        {editingId === item.material_id ? (
                          <div className="flex items-center justify-end space-x-2">
                            <button onClick={(e) => handleUpdateSubmit(e, item.material_id)} className="bg-emerald-600 text-white px-2 py-1 rounded flex items-center gap-1 hover:bg-emerald-700">
                              <Save className="h-3 w-3" /> Save
                            </button>
                            <button onClick={() => setEditingId(null)} className="bg-gray-100 border text-gray-700 px-2 py-1 rounded hover:bg-gray-200">
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end space-x-3">
                            <button onClick={() => handleEditClick(item)} className="text-blue-600 hover:text-blue-900 flex items-center gap-0.5">
                              <Edit2 className="h-3.5 w-3.5" /> Edit
                            </button>
                            <button onClick={() => handleDelete(item.material_id)} className="text-red-600 hover:text-red-900 flex items-center gap-0.5">
                              <Trash2 className="h-3.5 w-3.5" /> Delete
                            </button>
                          </div>
                        )}
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
              {materials.length === 0 && (
                <div className="p-8 text-center text-sm text-gray-400">No logs discovered in the system ledger.</div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default StaffMaterialPage;