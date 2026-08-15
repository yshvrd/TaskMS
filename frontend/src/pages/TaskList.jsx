import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Search, Plus, Filter, Calendar, User, LayoutList, ChevronLeft, ChevronRight, ArrowUpDown, Kanban, List as ListIcon } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import api from '../services/api';
import { StatusBadge, PriorityBadge } from '../components/ui/Badges';
import { Button } from '../components/ui/Button';
import TaskModal from '../components/TaskModal';

const TableSkeleton = ({ columns }) => (
  <div className="animate-pulse space-y-0 py-2">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex items-center px-6 py-4 border-b border-slate-100 dark:border-slate-800/50">
        <div className="flex gap-4 items-center w-1/3">
          <div className="w-9 h-9 bg-slate-200 dark:bg-slate-800 rounded-full shrink-0"></div>
          <div className="space-y-2 w-full">
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
          </div>
        </div>
        <div className="flex-1 px-6"><div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-full w-24"></div></div>
        <div className="flex-1 px-6"><div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-full w-20"></div></div>
        {columns > 4 && <div className="flex-1 px-6"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24"></div></div>}
      </div>
    ))}
  </div>
);

const TaskList = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initLoading, setInitLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // React 18 StrictMode fix for Drag and Drop
  const [isBrowser, setIsBrowser] = useState(false);
  
  const [currentUser, setCurrentUser] = useState(null);
  const [usersMap, setUsersMap] = useState({});
  
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'board'
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [limit] = useState(10); 
  
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [assignee, setAssignee] = useState('');
  
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    setIsBrowser(true);
    const initializeData = async () => {
      try {
        const userRes = await api.get('/auth/me');
        setCurrentUser(userRes.data);
        if (userRes.data.role === 'admin' || userRes.data.role === 'superadmin') {
          try {
            const usersListRes = await api.get('/users/');
            const map = {};
            usersListRes.data.forEach(u => { map[u.id] = u.name; });
            setUsersMap(map);
          } catch (err) {}
        }
      } catch (error) {} finally { setInitLoading(false); }
    };
    initializeData();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      // OVERRIDE: Fetch 100 items if in board view to bypass normal pagination
      const currentLimit = viewMode === 'board' ? 100 : limit;
      
      const params = new URLSearchParams({ 
        page, 
        limit: currentLimit, 
        sort_by: sortBy, 
        sort_order: sortOrder 
      });
      
      if (search) params.append('search', search);
      if (status) params.append('status', status);
      if (priority) params.append('priority', priority);
      if (assignee) params.append('assignee', assignee);

      const response = await api.get(`/tasks/?${params.toString()}`);
      setTasks(response.data.items);
      setTotalPages(response.data.pages);
      setTotalItems(response.data.total);
    } catch (error) {} finally { setLoading(false); }
  };

  useEffect(() => {
    if (initLoading) return;
    const delayDebounceFn = setTimeout(() => { fetchTasks(); }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [search, status, priority, assignee, sortBy, sortOrder, page, initLoading, viewMode]);

  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value);
    setPage(1);
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
    setPage(1);
  };

  // --- KANBAN LOGIC ---
  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    
    // Dropped outside a valid column
    if (!destination) return;
    
    // Dropped in the same place
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStatus = destination.droppableId;
    const taskId = parseInt(draggableId);
    const taskToUpdate = tasks.find(t => t.id === taskId);

    // Optimistic UI Update: Snap the card instantly before server responds
    const updatedTasks = tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t);
    setTasks(updatedTasks);

    // Backend API Call
    try {
      await api.put(`/tasks/${taskId}`, {
        title: taskToUpdate.title,
        description: taskToUpdate.description || '',
        status: newStatus,
        priority: taskToUpdate.priority,
        due_date: taskToUpdate.due_date ? taskToUpdate.due_date.split('T')[0] : null,
        assigned_to: taskToUpdate.assigned_to
      });
    } catch (error) {
      // If the backend fails, revert the change and alert the user
      fetchTasks();
      alert("Failed to update task status.");
    }
  };

  const kanbanColumns = [
    { id: 'pending', title: 'Pending' },
    { id: 'in_progress', title: 'In Progress' },
    { id: 'blocked', title: 'Blocked' },
    { id: 'completed', title: 'Completed' }
  ];

  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'superadmin';
  const tableColumns = isAdmin ? 5 : 4;

  if (initLoading) return <div className="p-8 text-slate-500 dark:text-slate-400 animate-pulse">Loading workspace...</div>;

  const selectStyle = "bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-sm focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-300 dark:focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-500/20 cursor-pointer text-slate-700 dark:text-slate-300 font-medium transition-all outline-none appearance-none pr-8";
  const selectBgImage = { backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 flex flex-col h-[calc(100vh-8rem)]">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Task Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Create, assign, and track your team's progress.</p>
        </div>
        <div className="flex items-center gap-3">
          
          {/* VIEW TOGGLE */}
          <div className="flex bg-slate-200/60 dark:bg-slate-800/80 p-1 rounded-xl shadow-inner border border-slate-200 dark:border-slate-700">
            <button 
            onClick={() => {
              if (viewMode !== 'list') {
                setTasks([]); // Clear board tasks to prevent layout shift
                setLoading(true);
                setViewMode('list');
                setPage(1); // Reset back to page 1
              }
            }} 
            className={`px-3 py-1.5 rounded-lg flex items-center text-sm font-medium transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200 dark:border-slate-600' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            <ListIcon className="w-4 h-4 mr-1.5" /> List
          </button>
          
          <button 
            onClick={() => {
              if (viewMode !== 'board') {
                setTasks([]); // Clear the 10 list tasks to prevent visual pop-in
                setLoading(true);
                setViewMode('board');
              }
            }} 
            className={`px-3 py-1.5 rounded-lg flex items-center text-sm font-medium transition-all ${viewMode === 'board' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200 dark:border-slate-600' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            <Kanban className="w-4 h-4 mr-1.5" /> Board
          </button>
          </div>

          <Button onClick={() => setIsModalOpen(true)} className="shadow-sm shadow-indigo-200 dark:shadow-none hover:shadow-md transition-all active:scale-95 shrink-0">
            <Plus className="h-4 w-4 mr-2" /> Create Task
          </Button>
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col xl:flex-row gap-3 transition-colors shrink-0">
        <div className="relative flex-1 min-w-[250px] flex items-center">
          <Search className="absolute left-4 h-4 w-4 text-slate-400 dark:text-slate-500" />
          <input type="text" placeholder="Search tasks..." className="w-full pl-11 pr-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-300 dark:focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-500/20 transition-all outline-none" value={search} onChange={handleFilterChange(setSearch)} />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {viewMode === 'list' && (
            <div className="flex items-center">
              <Filter className="h-4 w-4 text-slate-400 dark:text-slate-500 mr-2 shrink-0 hidden sm:block" />
              <select className={selectStyle} style={selectBgImage} value={status} onChange={handleFilterChange(setStatus)}>
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>
          )}
          <select className={selectStyle} style={selectBgImage} value={priority} onChange={handleFilterChange(setPriority)}>
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
          {isAdmin && (
            <select className={selectStyle} style={selectBgImage} value={assignee} onChange={handleFilterChange(setAssignee)}>
              <option value="">All Assignees</option>
              <option value="me">Assigned to Me</option>
              {Object.entries(usersMap).map(([id, name]) => (<option key={id} value={id}>{name}</option>))}
            </select>
          )}
        </div>
      </div>

      {/* Dynamic Content Area (List or Kanban) */}
      <div className="flex-1 overflow-hidden min-h-0">
        
        {/* === LIST VIEW === */}
        {viewMode === 'list' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col transition-colors h-full">
            <div className="overflow-auto flex-1 custom-scrollbar">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                <thead className="bg-slate-50/80 dark:bg-slate-800/50 sticky top-0 z-10 backdrop-blur-md">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Task Info</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Priority</th>
                    {isAdmin && <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Assigned To</th>}
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Due Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 bg-white dark:bg-slate-900">
                  {loading ? (
                    <tr><td colSpan={tableColumns}><TableSkeleton columns={tableColumns} /></td></tr>
                  ) : tasks.length === 0 ? (
                    <tr>
                      <td colSpan={tableColumns} className="text-center py-20">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800/50 mb-4 border border-slate-100 dark:border-slate-800"><LayoutList className="h-8 w-8 text-slate-400 dark:text-slate-500" /></div>
                        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-200">No tasks found</h3>
                      </td>
                    </tr>
                  ) : (
                    tasks.map((task) => {
                      const assigneeName = isAdmin ? (usersMap[task.assigned_to] || 'Unassigned') : (currentUser?.name || 'Me');
                      return (
                        <tr key={task.id} onClick={() => navigate(`/tasks/${task.id}`)} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 cursor-pointer transition-colors group">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-slate-900 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate max-w-[200px] sm:max-w-[300px]">{task.title}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Created {format(new Date(task.created_at), 'MMM dd')}</div>
                          </td>
                          <td className="px-6 py-4"><StatusBadge status={task.status} /></td>
                          <td className="px-6 py-4"><PriorityBadge priority={task.priority} /></td>
                          {isAdmin && <td className="px-6 py-4 text-sm font-medium text-slate-700 dark:text-slate-300 truncate max-w-[120px]">{assigneeName}</td>}
                          <td className="px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-400">{task.due_date ? format(new Date(task.due_date), 'MMM dd, yyyy') : '-'}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination Footer */}
            {!loading && tasks.length > 0 && (
              <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex justify-between items-center shrink-0">
                <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">Total: <span className="font-semibold text-slate-900 dark:text-slate-200">{totalItems}</span></div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 hover:bg-slate-50 disabled:opacity-50 transition-colors"><ChevronLeft className="h-4 w-4" /></button>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Page {page} of {totalPages}</span>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 hover:bg-slate-50 disabled:opacity-50 transition-colors"><ChevronRight className="h-4 w-4" /></button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* === BOARD VIEW (KANBAN) === */}
        {viewMode === 'board' && isBrowser && (
          <div className="h-full w-full overflow-hidden"> {/* Remove overflow-x-auto here */}
            <DragDropContext onDragEnd={handleDragEnd}>
              <div className="flex gap-4 h-full"> {/* Changed gap-6 to gap-4 for tighter fit */}
                {kanbanColumns.map(column => {
                  const columnTasks = tasks.filter(t => t.status === column.id);
                  
                  return (
                    <div key={column.id} className="flex-1 flex flex-col min-w-0 bg-slate-100/50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                      {/* Column Header */}
                      <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white/50 dark:bg-slate-900/80 backdrop-blur-sm">
                        <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{column.title}</h3>
                        <span className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] px-2 py-0.5 rounded-full font-bold">
                          {columnTasks.length}
                        </span>
                      </div>
                      
                      <Droppable droppableId={column.id}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className={`flex-1 p-2 overflow-y-auto custom-scrollbar space-y-2 transition-colors ${snapshot.isDraggingOver ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''}`}
                          >
                            {columnTasks.map((task, index) => (
                              <Draggable key={task.id.toString()} draggableId={task.id.toString()} index={index}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    onClick={() => navigate(`/tasks/${task.id}`)}
                                    className={`bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 transition-all cursor-pointer group ${snapshot.isDragging ? 'shadow-xl ring-2 ring-indigo-500/50 rotate-2 z-50' : 'shadow-sm hover:border-indigo-300 dark:hover:border-indigo-600'}`}
                                  >
                                    <div className="flex justify-between items-start mb-2">
                                      <PriorityBadge priority={task.priority} />
                                    </div>
                                    <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-200 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                                      {task.title}
                                    </h4>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </div>
                  );
                })}
              </div>
            </DragDropContext>
          </div>
        )}

      </div>
      
      <TaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchTasks} />
    </div>
  );
};

export default TaskList;
