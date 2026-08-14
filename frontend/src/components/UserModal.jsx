import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import api from '../services/api';

const UserModal = ({ isOpen, onClose, user = null, onSuccess, currentUser }) => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'member' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setError('');
      if (user) {
        setFormData({ name: user.name, email: user.email, password: '', role: user.role });
      } else {
        setFormData({ name: '', email: '', password: '', role: 'member' });
      }
    }
  }, [user, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const payload = { ...formData };
    
    // If editing a user and the password field is blank, don't send it to the backend
    if (user && !payload.password) {
      delete payload.password;
    }

    try {
      if (user) {
        await api.put(`/users/${user.id}`, payload);
      } else {
        await api.post('/users/', payload);
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const isSuperAdmin = currentUser?.role === 'superadmin';
  
  // Shared styles for dark mode compatibility
  const inputClasses = "w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all";
  const labelClasses = "block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
      <div className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md relative z-10 animate-in zoom-in-95 duration-200 border border-slate-100 dark:border-slate-800">
        
        <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{user ? 'Edit User' : 'Add New User'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-full transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6">
          <form id="user-form" onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 text-sm font-medium rounded-xl border border-rose-200 dark:border-rose-500/20">
                {error}
              </div>
            )}
            
            <div>
              <label className={labelClasses}>Full Name</label>
              <input required type="text" className={inputClasses} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Jane Doe" />
            </div>
            
            <div>
              <label className={labelClasses}>Email Address</label>
              <input required type="email" className={inputClasses} value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="jane@example.com" />
            </div>
            
            <div>
              <label className={labelClasses}>
                {user ? 'New Password (leave blank to keep current)' : 'Password'}
              </label>
              <input required={!user} type="password" minLength={6} className={inputClasses} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="••••••••" />
            </div>

            <div>
              <label className={labelClasses}>Role</label>
              <select className={inputClasses} value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                <option value="member">Member</option>
                <option value="admin">Admin</option>
                {/* Only a superadmin can create/assign another superadmin */}
                {isSuperAdmin && <option value="superadmin">Superadmin</option>}
              </select>
            </div>
          </form>
        </div>
        
        <div className="border-t border-slate-100 dark:border-slate-800 p-6 bg-slate-50/50 dark:bg-slate-800/30 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-700 rounded-xl transition-colors">Cancel</button>
          <button type="submit" form="user-form" disabled={loading} className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl disabled:opacity-70 transition-all">
            {loading ? <Loader2 className="animate-spin h-4 w-4" /> : 'Save User'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserModal;
