import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';

export default function AddressForm({ initialAddress, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    pincode: '',
    locality: '',
    address: '',
    city: '',
    state: 'Odisha',
    landmark: '',
    alternatePhone: '',
    addressType: 'home',
    isDefault: false
  });

  const [loading, setLoading] = useState(false);
  const [pinStatus, setPinStatus] = useState({ type: '', message: '' });

  // Populate data when editing
  useEffect(() => {
    if (initialAddress) {
      setFormData({
        name: initialAddress.name || '',
        phone: initialAddress.phone || '',
        pincode: initialAddress.pincode || '',
        locality: initialAddress.locality || '',
        address: initialAddress.address || '',
        city: initialAddress.city || '',
        state: initialAddress.state || 'Odisha',
        landmark: initialAddress.landmark || '',
        alternatePhone: initialAddress.alternatePhone || '',
        addressType: initialAddress.addressType || 'home',
        isDefault: initialAddress.isDefault || false
      });
    }
  }, [initialAddress]);

  // Auto post office lookup on 6-digit pincode entry
  useEffect(() => {
    if (formData.pincode && /^\d{6}$/.test(formData.pincode)) {
      lookupPincode(formData.pincode);
    } else {
      setPinStatus({ type: '', message: '' });
    }
  }, [formData.pincode]);

  const lookupPincode = async (pin) => {
    setPinStatus({ type: 'loading', message: 'Checking pincode...' });
    try {
      const { data } = await api.post('/check-pincode', { pincode: pin });
      if (data.success) {
        setPinStatus({
          type: 'success',
          message: data.deliveryAvailable 
            ? `Delivery available in ${data.area || data.district}` 
            : `Currently not delivering in this area`
        });
        setFormData(prev => ({
          ...prev,
          city: data.district || prev.city,
          state: data.state || prev.state
        }));
      } else {
        setPinStatus({
          type: 'error',
          message: data.message || `Delivery not available in ${data.location}`
        });
        if (data.district) {
          setFormData(prev => ({
            ...prev,
            city: data.district,
            state: data.state || 'Odisha'
          }));
        }
      }
    } catch (err) {
      setPinStatus({
        type: 'error',
        message: err.response?.data?.message || 'Failed to verify pincode'
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    let finalValue = type === 'checkbox' ? checked : value;

    if (name === 'pincode' || name === 'phone' || name === 'alternatePhone') {
      finalValue = value.replace(/[^0-9]/g, '');
    }

    setFormData(prev => ({
      ...prev,
      [name]: finalValue
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validations
    if (!formData.name.trim()) return toast.error('Please enter name');
    if (!/^\d{10}$/.test(formData.phone)) return toast.error('Please enter a valid 10-digit mobile number');
    if (!/^\d{6}$/.test(formData.pincode)) return toast.error('Please enter a valid 6-digit pincode');
    if (!formData.locality.trim()) return toast.error('Please enter locality');
    if (!formData.address.trim()) return toast.error('Please enter Area and Street address');
    if (!formData.city.trim()) return toast.error('Please enter City/District/Town');
    if (!formData.state.trim()) return toast.error('Please select state');
    if (formData.alternatePhone && !/^\d{10}$/.test(formData.alternatePhone)) {
      return toast.error('Please enter a valid 10-digit alternate mobile number');
    }

    setLoading(true);
    const toastId = toast.loading('Saving address...');
    try {
      let savedAddress;
      if (initialAddress) {
        // Edit Address
        const { data } = await api.put(`/addresses/${initialAddress._id}`, formData);
        savedAddress = data;
        toast.success('Address updated successfully!', { id: toastId });
      } else {
        // Add Address
        const { data } = await api.post('/addresses', formData);
        savedAddress = data;
        toast.success('Address saved successfully!', { id: toastId });
      }
      onSubmit(savedAddress);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save address', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const indianStates = [
    'Odisha', 'Andhra Pradesh', 'Karnataka', 'Maharashtra', 
    'Delhi', 'Tamil Nadu', 'West Bengal', 'Bihar', 'Jharkhand', 
    'Chhattisgarh', 'Madhya Pradesh', 'Gujarat', 'Rajasthan', 
    'Uttar Pradesh', 'Haryana', 'Punjab', 'Kerala', 'Telangana'
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-left bg-cream/35 border border-black/5 p-6 rounded-3xl">
      <h3 className="font-extrabold text-sm text-gold uppercase tracking-wider">
        {initialAddress ? 'Edit Address' : 'Add New Address'}
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Name */}
        <div>
          <label className="text-xs font-bold text-gray-500 block mb-1">Name *</label>
          <input
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Name"
            className="w-full border border-black/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold transition-colors bg-white font-medium"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="text-xs font-bold text-gray-500 block mb-1">10-digit mobile number *</label>
          <input
            type="text"
            name="phone"
            required
            maxLength={10}
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="10-digit mobile number"
            className="w-full border border-black/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold transition-colors bg-white font-medium"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Pincode */}
        <div>
          <label className="text-xs font-bold text-gray-500 block mb-1">Pincode *</label>
          <input
            type="text"
            name="pincode"
            required
            maxLength={6}
            value={formData.pincode}
            onChange={handleInputChange}
            placeholder="Pincode"
            className="w-full border border-black/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold transition-colors bg-white font-medium"
          />
          {pinStatus.message && (
            <span className={`text-[10px] font-bold block mt-1.5 ${
              pinStatus.type === 'error' ? 'text-red-500' : pinStatus.type === 'success' ? 'text-green-600' : 'text-gray-400'
            }`}>
              {pinStatus.message}
            </span>
          )}
        </div>

        {/* Locality */}
        <div>
          <label className="text-xs font-bold text-gray-500 block mb-1">Locality *</label>
          <input
            type="text"
            name="locality"
            required
            value={formData.locality}
            onChange={handleInputChange}
            placeholder="Locality"
            className="w-full border border-black/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold transition-colors bg-white font-medium"
          />
        </div>
      </div>

      {/* Address Line (Area and Street) */}
      <div>
        <label className="text-xs font-bold text-gray-500 block mb-1">Address (Area and Street) *</label>
        <textarea
          name="address"
          required
          rows={2}
          value={formData.address}
          onChange={handleInputChange}
          placeholder="Address (Area and Street)"
          className="w-full border border-black/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold transition-colors resize-none bg-white font-medium"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* City */}
        <div>
          <label className="text-xs font-bold text-gray-500 block mb-1">City/District/Town *</label>
          <input
            type="text"
            name="city"
            required
            value={formData.city}
            onChange={handleInputChange}
            placeholder="City/District/Town"
            className="w-full border border-black/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold transition-colors bg-white font-medium"
          />
        </div>

        {/* State */}
        <div>
          <label className="text-xs font-bold text-gray-500 block mb-1">State *</label>
          <select
            name="state"
            required
            value={formData.state}
            onChange={handleInputChange}
            className="w-full border border-black/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold transition-colors bg-white font-medium"
          >
            {indianStates.map(st => <option key={st} value={st}>{st}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Landmark */}
        <div>
          <label className="text-xs font-bold text-gray-500 block mb-1">Landmark (Optional)</label>
          <input
            type="text"
            name="landmark"
            value={formData.landmark}
            onChange={handleInputChange}
            placeholder="Landmark (Optional)"
            className="w-full border border-black/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold transition-colors bg-white font-medium"
          />
        </div>

        {/* Alternate Phone */}
        <div>
          <label className="text-xs font-bold text-gray-500 block mb-1">Alternate Phone (Optional)</label>
          <input
            type="text"
            name="alternatePhone"
            maxLength={10}
            value={formData.alternatePhone}
            onChange={handleInputChange}
            placeholder="Alternate Phone (Optional)"
            className="w-full border border-black/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold transition-colors bg-white font-medium"
          />
        </div>
      </div>

      {/* Address Type Selection */}
      <div>
        <label className="text-xs font-bold text-gray-500 block mb-2">Address Type</label>
        <div className="flex gap-4">
          {[
            { id: 'home', label: '🏡 Home', desc: 'All-day delivery' },
            { id: 'work', label: '💼 Work', desc: '10 AM - 5 PM delivery' }
          ].map(opt => (
            <label
              key={opt.id}
              className={`flex-1 border-2 p-3 rounded-2xl cursor-pointer select-none transition-all flex flex-col ${
                formData.addressType === opt.id 
                  ? 'border-gold bg-gold/5' 
                  : 'border-black/5 bg-white hover:border-gold/30'
              }`}
            >
              <input
                type="radio"
                name="addressType"
                value={opt.id}
                checked={formData.addressType === opt.id}
                onChange={handleInputChange}
                className="hidden"
              />
              <span className="font-bold text-xs text-black">{opt.label}</span>
              <span className="text-[10px] text-gray-400 mt-0.5">{opt.desc}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Is Default Checkbox */}
      <div className="flex items-center pl-1">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            name="isDefault"
            checked={formData.isDefault}
            onChange={handleInputChange}
            className="w-4.5 h-4.5 rounded text-gold border-black/10 focus:ring-gold"
          />
          <span className="text-xs font-semibold text-black">Make this my default shipping address</span>
        </label>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 border border-black/10 rounded-xl py-3 text-xs font-bold text-gray-500 hover:border-gold hover:text-gold transition-all uppercase tracking-wider bg-white"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 btn-gold py-3 rounded-xl font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-1.5"
        >
          {loading ? 'Saving...' : 'Save Address'}
        </button>
      </div>
    </form>
  );
}
