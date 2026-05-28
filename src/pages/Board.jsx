import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Board() {
  const [columns, setColumns] = useState([
    { id: 'todo', title: 'To Do', tasks: [] },
    { id: 'in-progress', title: 'In Progress', tasks: [] },
    { id: 'review', title: 'Review', tasks: [] },
    { id: 'done', title: 'Done', tasks: [] }
  ])
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskColumn, setNewTaskColumn] = useState('todo')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [draggedTask, setDraggedTask] = useState(null)
  const [dragOverColumn, setDragOverColumn] = useState(null)

  useEffect(() => {
    checkUser()
    fetchTasks()
  }, [])

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
    if (!user) {
      window.location.href = '/login'
    }
  }

  async function fetchTasks() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: true })

      if (error) throw error

      if (data) {
        const updatedColumns = columns.map(col => ({
          ...col,
          tasks: data.filter(task => task.status === col.id)
        }))
        setColumns(updatedColumns)
      }
    } catch (error) {
      console.error('Error fetching tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  async function addTask() {
    if (!newTaskTitle.trim()) return

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([
          {
            title: newTaskTitle,
            status: newTaskColumn,
            user_id: user?.id,
            priority: 'medium'
          }
        ])
        .select()

      if (error) throw error

      if (data) {
        setColumns(prev => prev.map(col => {
          if (col.id === newTaskColumn) {
            return { ...col, tasks: [...col.tasks, data[0]] }
          }
          return col
        }))
      }

      setNewTaskTitle('')
      setShowAddModal(false)
    } catch (error) {
      console.error('Error adding task:', error)
    }
  }

  async function updateTaskStatus(taskId, newStatus) {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId)

      if (error) throw error

      setColumns(prev => {
        let movedTask = null
        const updated = prev.map(col => {
          const taskIndex = col.tasks.findIndex(t => t.id === taskId)
          if (taskIndex !== -1) {
            movedTask = { ...col.tasks[taskIndex], status: newStatus }
            return { ...col, tasks: col.tasks.filter(t => t.id !== taskId) }
          }
          return col
        })

        if (movedTask) {
          return updated.map(col => {
            if (col.id === newStatus) {
              return { ...col, tasks: [...col.tasks, movedTask] }
            }
            return col
          })
        }
        return updated
      })
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  async function deleteTask(taskId) {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)

      if (error) throw error

      setColumns(prev => prev.map(col => ({
        ...col,
        tasks: col.tasks.filter(t => t.id !== taskId)
      })))
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }

  async function updateTaskTitle(taskId, newTitle) {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ title: newTitle })
        .eq('id', taskId)

      if (error) throw error

      setColumns(prev => prev.map(col => ({
        ...col,
        tasks: col.tasks.map(t => 
          t.id === taskId ? { ...t, title: newTitle } : t
        )
      })))
      setEditingTask(null)
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  function handleDragStart(e, task, columnId) {
    setDraggedTask({ task, sourceColumn: columnId })
    e.dataTransfer.effectAllowed = 'move'
  }

  function handleDragOver(e, columnId) {
    e.preventDefault()
    setDragOverColumn(columnId)
  }

  function handleDragLeave() {
    setDragOverColumn(null)
  }

  function handleDrop(e, targetColumnId) {
    e.preventDefault()
    setDragOverColumn(null)
    
    if (draggedTask && draggedTask.sourceColumn !== targetColumnId) {
      updateTaskStatus(draggedTask.task.id, targetColumnId)
    }
    setDraggedTask(null)
  }

  function getPriorityColor(priority) {
    switch (priority) {
      case 'high': return 'border-l-red-500'
      case 'medium': return 'border-l-yellow-500'
      case 'low': return 'border-l-green-500'
      default: return 'border-l-slate-500'
    }
  }

  function getColumnHeaderColor(columnId) {
    switch (columnId) {
      case 'todo': return 'bg-slate-600'
      case 'in-progress': return 'bg-blue-600'
      case 'review': return 'bg-purple-600'
      case 'done': return 'bg-green-600'
      default: return 'bg-slate-600'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#3b82f6] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white text-lg">Loading your tasks...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800 border-b border-slate-700 px-4 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#3b82f6] rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white">TaskFlow</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-[#3b82f6] hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Task
            </button>
            
            <div className="flex items-center gap-3">
              <span className="text-slate-400 text-sm hidden sm:block">{user?.email}</span>
              <button
                onClick={handleLogout}
                className="text-slate-400 hover:text-white transition-colors p-2"
                title="Logout"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="p-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {columns.map(column => (
            <div
              key={column.id}
              className={`bg-slate-800 rounded-xl overflow-hidden transition-all ${
                dragOverColumn === column.id ? 'ring-2 ring-[#3b82f6]' : ''
              }`}
              onDragOver={(e) => handleDragOver(e, column.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              <div className={`${getColumnHeaderColor(column.id)} px-4 py-3 flex items-center justify-between`}>
                <h2 className="text-white font-semibold">{column.title}</h2>
                <span className="bg-white/20 text-white text-sm px-2 py-0.5 rounded-full">
                  {column.tasks.length}
                </span>
              </div>
              
              <div className="p-3 min-h-[200px] max-h-[calc(100vh-280px)] overflow-y-auto space-y-3">
                {column.tasks.map(task => (
                  <div
                    key={task.