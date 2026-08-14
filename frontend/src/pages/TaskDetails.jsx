import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Edit, MessageSquare, Send, Calendar, User as UserIcon, Clock, AlignLeft, AlertCircle } from 'lucide-react';
import { format, formatDistanceToNow, isPast, differenceInHours } from 'date-fns';
import api from '../services/api';
import { StatusBadge, PriorityBadge } from '../components/ui/Badges';
import { Button } from '../components/ui/Button';
import TaskModal from '../components/TaskModal';

const TaskDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [task, setTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const [currentUser, setCurrentUser] = useState(null);
  const [usersMap, setUsersMap] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchTaskData = async () => {
    try {
      // 1. Fetch Task and Comments
      const [taskRes, commentsRes, meRes] = await Promise.all([
        api.get(`/tasks/${id}`),
        api.get(`/tasks/${id}/comments`),
        api.get('/auth/me')
      ]);
      
      setTask(taskRes.data);
      setComments(commentsRes.data);
      setCurrentUser(meRes.data);

      // 2. Fetch user dictionary so everyone can see commenter names
      try {
        const usersRes = await api.get('/users/');
        const map = {};
        usersRes.data.forEach(u => {
          map[u.id] = u.name;
        });
        setUsersMap(map);
      } catch (err) {
        console.error("Failed to fetch users map", err);
      }
    } catch (error) {
      console.error("Failed to fetch task details", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaskData();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to permanently delete this task?')) {
      await api.delete(`/tasks/${id}`);
      navigate('/tasks');
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      await api.post(`/tasks/${id}/comments`, { comment: newComment });
      setNewComment('');
      fetchTaskData();
    } catch (error) {
      console.error("Failed to post comment", error);
    }
  };

  // Helper to determine display name
  const getDisplayName = (userId) => {
    if (!userId) return 'Unassigned';
    if (userId === currentUser?.id) return currentUser.name + ' (You)';
    return usersMap[userId] || `User ${userId}`;
  };

  // Helper for dynamic time remaining UI
  const renderTimeRemaining = (dueDate, status) => {
    if (!dueDate) return <span className="text-slate-400 font-medium">No due date</span>;
    if (status === 'completed') return <span className="text-slate-400 font-medium">Completed</span>;

    const date = new Date(dueDate);
    const past = isPast(date);
    const distance = formatDistanceToNow(date);

    if (past) {
      return (
        <span className="inline-flex items-center text-rose-600 font-semibold bg-rose-50 px-2 py-1 rounded-md text-xs border border-rose-100">
          <AlertCircle className="w-3.5 h-3.5 mr-1.5" />
          Overdue by {distance}
        </span>
      );
    } else {
      const hours = differenceInHours(date, new Date());
      const isUrgent = hours < 48;
      return (
        <span className={`inline-flex items-center font-semibold px-2 py-1 rounded-md text-xs border ${
          isUrgent ? 'text-orange-600 bg-orange-50 border-orange-100' : 'text-emerald-600 bg-emerald-50 border-emerald-100'
        }`}>
          <Clock className="w-3.5 h-3.5 mr-1.5" />
          Due in {distance}
        </span>
      );
    }
  };

  if (loading) {
    return <div className="p-8 text-slate-500 animate-pulse">Loading task details...</div>;
  }

  if (!task) {
    return <div className="p-8 text-rose-500 font-medium">Task not found or you do not have permission to view it.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500 pb-12">
      {/* Top Navigation */}
      <button 
        onClick={() => navigate('/tasks')} 
        className="flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors mb-2 group"
      >
        <ArrowLeft className="h-4 w-4 mr-1.5 group-hover:-translate-x-1 transition-transform" /> 
        Back to Tasks
      </button>

      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">{task.title}</h1>
          <div className="flex flex-wrap gap-3 items-center text-sm text-slate-500 font-medium">
            <span className="flex items-center"><Calendar className="w-4 h-4 mr-1.5"/> {format(new Date(task.created_at), 'MMM dd, yyyy')}</span>
            <span className="text-slate-300">•</span>
            <StatusBadge status={task.status} />
            <PriorityBadge priority={task.priority} />
          </div>
        </div>
        <div className="flex gap-3 shrink-0">
          <Button variant="secondary" onClick={() => setIsEditModalOpen(true)} className="shadow-sm">
            <Edit className="h-4 w-4 mr-2 text-slate-500" /> Edit Task
          </Button>
          <Button variant="danger" onClick={handleDelete} className="shadow-sm bg-rose-500 hover:bg-rose-600">
            <Trash2 className="h-4 w-4 mr-2" /> Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
        
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Description Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center">
              <AlignLeft className="h-4 w-4 mr-2 text-slate-400" /> Description
            </h3>
            <div className="text-slate-700 whitespace-pre-wrap leading-relaxed text-[15px]">
              {task.description || <span className="italic text-slate-400">No description provided.</span>}
            </div>
          </div>

          {/* Comments Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center">
                <MessageSquare className="h-4 w-4 mr-2 text-slate-400" /> Activity & Comments
              </h3>
            </div>
            
            <div className="p-6 space-y-6 max-h-[400px] overflow-y-auto bg-slate-50/30">
              {comments.length === 0 ? (
                <div className="text-center py-8 text-sm text-slate-500 italic">No comments yet. Start the conversation below.</div>
              ) : (
                comments.map(c => {
                  const isMe = c.user_id === currentUser?.id;
                  const commenterName = getDisplayName(c.user_id);
                  const initials = commenterName.charAt(0).toUpperCase();

                  return (
                    <div key={c.id} className={`flex gap-4 ${isMe ? 'flex-row-reverse' : ''}`}>
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 shadow-sm ${isMe ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                        {initials}
                      </div>
                      <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[80%]`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-slate-700">{isMe ? 'You' : commenterName}</span>
                          <span className="text-[10px] text-slate-400">{format(new Date(c.created_at), 'MMM dd, HH:mm')}</span>
                        </div>
                        <div className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm ${isMe ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'}`}>
                          {c.comment}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-white">
              <form onSubmit={handlePostComment} className="flex gap-3">
                <input
                  type="text"
                  placeholder="Type your comment..."
                  className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <Button type="submit" className="rounded-xl px-5 shadow-sm active:scale-95 transition-transform" disabled={!newComment.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        </div>

        {/* Sidebar Info Column */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 sticky top-24">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-6">Details</h3>
            
            <div className="space-y-5">
              
              {/* Assigned To */}
              <div>
                <dt className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 flex items-center">
                  <UserIcon className="w-3.5 h-3.5 mr-1.5" /> Assigned To
                </dt>
                <dd className="flex items-center mt-1">
                  <div className="h-6 w-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[10px] flex items-center justify-center mr-2">
                    {getDisplayName(task.assigned_to).charAt(0).toUpperCase()}
                  </div>
                  <span className="font-semibold text-slate-900 text-sm">
                    {getDisplayName(task.assigned_to)}
                  </span>
                </dd>
              </div>

              {/* Time Remaining / Due In */}
              <div className="pt-4 border-t border-slate-100">
                <dt className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 flex items-center">
                  <Clock className="w-3.5 h-3.5 mr-1.5" /> Time Remaining
                </dt>
                <dd className="mt-1.5">
                  {renderTimeRemaining(task.due_date, task.status)}
                </dd>
              </div>

              {/* Due Date */}
              <div className="pt-4 border-t border-slate-100">
                <dt className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 flex items-center">
                  <Calendar className="w-3.5 h-3.5 mr-1.5" /> Due Date
                </dt>
                <dd className="font-semibold text-slate-900 text-sm mt-1">
                  {task.due_date ? format(new Date(task.due_date), 'MMMM dd, yyyy') : <span className="text-slate-400 font-medium">None</span>}
                </dd>
              </div>

              {/* Last Updated */}
              <div className="pt-4 border-t border-slate-100">
                <dt className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Last Updated</dt>
                <dd className="font-medium text-slate-600 text-sm mt-1">
                  {format(new Date(task.updated_at), 'MMM dd, yyyy • HH:mm')}
                </dd>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <TaskModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        task={task} 
        onSuccess={fetchTaskData} 
      />
    </div>
  );
};

export default TaskDetails;
