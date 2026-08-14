import React, { useState, useEffect } from 'react';
import { X, Loader2, Calendar, AlertCircle } from 'lucide-react';
import api from '../services/api';

const TaskModal = ({ isOpen, onClose, task = null, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '', 
    description: '', 
    status: 'pending', 
    priority: 'medium', 
    due_date: '', 
    assigned_to: ''
  });
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let isMounted = true;

    if (isOpen) {
      // 1. Populate form data
      if (task) {
        setFormData({
          title: task.title || '',
          description: task.description || '',
          status: task.status || 'pending',
          priority: task.priority || 'medium',
          due_date: task.due_date ? task.due_date.split('T')[0] : '',
          assigned_to: task.assigned_to || ''
        });
      } else {
        setFormData({ 
          title: '', 
          description: '', 
          status: 'pending', 
          priority: 'medium', 
          due_date: '', 
          assigned_to: '' 
        });
      }

      // 2. Determine role and fetch users if admin
      api.get('/auth/me')
        .then(res => {
          if (!isMounted) return;
          const userRole = res.data.role;
          setIsAdmin(userRole === 'admin');
          
          if (userRole === 'admin') {
            api.get('/users/')
              .then(usersRes => {
                if (isMounted) setUsers(usersRes.data);
              })
              .catch(err => console.error("Failed to fetch users", err));
          }
        })
        .catch(err => console.error("Failed to fetch current user", err));
    }

    return () => { isMounted = false; };
  }, [task, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const payload = { ...formData };
    if (!payload.due_date) payload.due_date = null;
    
    // Convert assigned_to to integer or null
    if (payload.assigned_to) {
        payload.assigned_to = parseInt(payload.assigned_to, 10);
    } else {
        payload.assigned_to = null;
    }

    try {
      if (task) {
        await api.put(`/tasks/${task.id}`, payload);
      } else {
        await api.post('/tasks/', payload);
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Task save failed", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const inputClasses = "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all";
  const labelClasses = "block text-sm font-semibold text-slate-700 mb-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>

      {/* Modal Dialog */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh] relative z-10 animate-in zoom-in-95 duration-200 overflow-hidden border border-slate-100">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            {task ? 'Edit Task' : 'New Task'}
          </h2>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Body */}
        <div className="overflow-y-auto p-6 custom-scrollbar">
          <form id="task-form" onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className={labelClasses}>Title</label>
              <input 
                required 
                type="text" 
                placeholder="e.g. Redesign landing page"
                className={inputClasses} 
                value={formData.title} 
                onChange={e => setFormData({...formData, title: e.target.value})} 
              />
            </div>
            
            <div>
              <label className={labelClasses}>Description</label>
              <textarea 
                rows={4} 
                placeholder="Add more details about this task..."
                className={`${inputClasses} resize-none`} 
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})} 
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={labelClasses}>Status</label>
                <select 
                  className={`${inputClasses} appearance-none cursor-pointer`} 
                  value={formData.status} 
                  onChange={e => setFormData({...formData, status: e.target.value})}
                  style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.2em 1.2em' }}
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>
              <div>
                <label className={labelClasses}>Priority</label>
                <select 
                  className={`${inputClasses} appearance-none cursor-pointer`} 
                  value={formData.priority} 
                  onChange={e => setFormData({...formData, priority: e.target.value})}
                  style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.2em 1.2em' }}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={labelClasses}>Due Date</label>
                <div className="relative">
                  <input 
                    type="date" 
                    className={`${inputClasses} pl-10 cursor-pointer`} 
                    value={formData.due_date} 
                    onChange={e => setFormData({...formData, due_date: e.target.value})} 
                  />
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
              
              {isAdmin && (
                <div>
                  <label className={labelClasses}>Assign To</label>
                  <select 
                    className={`${inputClasses} appearance-none cursor-pointer`} 
                    value={formData.assigned_to} 
                    onChange={e => setFormData({...formData, assigned_to: e.target.value})}
                    style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.2em 1.2em' }}
                  >
                    <option value="">Unassigned</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>
              )}
            </div>
          </form>
        </div>
        
        {/* Footer */}
        <div className="border-t border-slate-100 p-6 bg-slate-50/50 flex justify-end gap-3 rounded-b-2xl">
          <button 
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            form="task-form" 
            disabled={loading}
            className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-sm shadow-indigo-200 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            {loading ? (
              <><Loader2 className="animate-spin h-4 w-4 mr-2" /> Saving...</>
            ) : (
              'Save Task'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
