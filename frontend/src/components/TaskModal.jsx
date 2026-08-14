import React, { useState, useEffect } from 'react';
import { X, Loader2, Calendar } from 'lucide-react';
import api from '../services/api';

const TaskModal = ({ isOpen, onClose, task = null, onSuccess }) => {
  const [formData, setFormData] = useState({ title: '', description: '', status: 'pending', priority: 'medium', due_date: '', assigned_to: '' });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (isOpen) {
      if (task) {
        setFormData({
          title: task.title || '', description: task.description || '', status: task.status || 'pending', priority: task.priority || 'medium', due_date: task.due_date ? task.due_date.split('T')[0] : '', assigned_to: task.assigned_to || ''
        });
      } else {
        setFormData({ title: '', description: '', status: 'pending', priority: 'medium', due_date: '', assigned_to: '' });
      }

      api.get('/auth/me').then(res => {
        if (!isMounted) return;
        setIsAdmin(res.data.role === 'admin');
        if (res.data.role === 'admin') api.get('/users/').then(uRes => isMounted && setUsers(uRes.data)).catch(()=>{});
      }).catch(()=>{});
    }
    return () => { isMounted = false; };
  }, [task, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const payload = { ...formData };
    if (!payload.due_date) payload.due_date = null;
    if (payload.assigned_to) payload.assigned_to = parseInt(payload.assigned_to, 10);
    else payload.assigned_to = null;

    try {
      if (task) await api.put(`/tasks/${task.id}`, payload);
      else await api.post('/tasks/', payload);
      onSuccess();
      onClose();
    } catch (error) {} finally { setLoading(false); }
  };

  if (!isOpen) return null;

  const inputClasses = "w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all";
  const labelClasses = "block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
      <div className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh] relative z-10 animate-in zoom-in-95 duration-200 border border-slate-100 dark:border-slate-800">
        
        <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{task ? 'Edit Task' : 'New Task'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-full"><X className="h-5 w-5" /></button>
        </div>
        
        <div className="overflow-y-auto p-6">
          <form id="task-form" onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className={labelClasses}>Title</label>
              <input required type="text" className={inputClasses} value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
            </div>
            <div>
              <label className={labelClasses}>Description</label>
              <textarea rows={4} className={`${inputClasses} resize-none`} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={labelClasses}>Status</label>
                <select className={inputClasses} value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>
              <div>
                <label className={labelClasses}>Priority</label>
                <select className={inputClasses} value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})}>
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
                <input type="date" className={inputClasses} value={formData.due_date} onChange={e => setFormData({...formData, due_date: e.target.value})} />
              </div>
              {isAdmin && (
                <div>
                  <label className={labelClasses}>Assign To</label>
                  <select className={inputClasses} value={formData.assigned_to} onChange={e => setFormData({...formData, assigned_to: e.target.value})}>
                    <option value="">Unassigned</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>
              )}
            </div>
          </form>
        </div>
        
        <div className="border-t border-slate-100 dark:border-slate-800 p-6 bg-slate-50/50 dark:bg-slate-800/30 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-700 rounded-xl">Cancel</button>
          <button type="submit" form="task-form" disabled={loading} className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl disabled:opacity-70">
            {loading ? <Loader2 className="animate-spin h-4 w-4" /> : 'Save Task'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
