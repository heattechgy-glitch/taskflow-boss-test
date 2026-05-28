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
  const [newTaskDescription, setNewTaskDescription] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [activeColumn, setActiveColumn] = useState(null)
  const [draggedTask, setDraggedTask] = useState(null)
  const [editingTask, setEditingTask] = useState(null)

  useEffect(() => {
    getUser()
    fetchTasks()
  }, [])

  async function getUser() {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
  }

  async function fetchTasks() {
    setLoading(true)
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching tasks:', error)
      setLoading(false)
      return
    }

    if (data) {
      const updatedColumns = columns.map(col => ({
        ...col,
        tasks: data.filter(task => task.status === col.id)
      }))
      setColumns(updatedColumns)
    }
    setLoading(false)
  }

  async function addTask() {
    if (!newTaskTitle.trim() || !activeColumn) return

    const newTask = {
      title: newTaskTitle,
      description: newTaskDescription,
      status: activeColumn,
      user_id: user?.id,
      priority: 'medium',
      created_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('tasks')
      .insert([newTask])
      .select()
      .single()

    if (error) {
      console.error('Error adding task:', error)
      return
    }

    if (data) {
      setColumns(columns.map(col => {
        if (col.id === activeColumn) {
          return { ...col, tasks: [...col.tasks, data] }
        }
        return col
      }))
    }

    setNewTaskTitle('')
    setNewTaskDescription('')
    setShowAddModal(false)
    setActiveColumn(null)
  }

  async function updateTask(taskId, updates) {
    const { error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId)

    if (error) {
      console.error('Error updating task:', error)
      return
    }

    fetchTasks()
    setEditingTask(null)
  }

  async function deleteTask(taskId, columnId) {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId)

    if (error) {
      console.error('Error deleting task:', error)
      return
    }

    setColumns(columns.map(col => {
      if (col.id === columnId) {
        return { ...col, tasks: col.tasks.filter(t => t.id !== taskId) }
      }
      return col
    }))
  }

  async function moveTask(taskId, fromColumn, toColumn) {
    if (fromColumn === toColumn) return

    const { error } = await supabase
      .from('tasks')
      .update({ status: toColumn })
      .eq('id', taskId)

    if (error) {
      console.error('Error moving task:', error)
      return
    }

    const task = columns.find(c => c.id === fromColumn)?.tasks.find(t => t.id === taskId)
    if (task) {
      setColumns(columns.map(col => {
        if (col.id === fromColumn) {
          return { ...col, tasks: col.tasks.filter(t => t.id !== taskId) }
        }
        if (col.id === toColumn) {
          return { ...col, tasks: [...col.tasks, { ...task, status: toColumn }] }
        }
        return col
      }))
    }
  }

  function handleDragStart(e, task, columnId) {
    setDraggedTask({ task, fromColumn: columnId })
    e.dataTransfer.effectAllowed = 'move'
  }

  function handleDragOver(e) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  function handleDrop(e, toColumnId) {
    e.preventDefault()
    if (draggedTask) {
      moveTask(draggedTask.task.id, draggedTask.fromColumn, toColumnId)
      setDraggedTask(null)
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  function getPriorityColor(priority) {
    switch (priority) {
      case 'high': return 'bg-red-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  function getColumnColor(columnId) {
    switch (columnId) {
      case 'todo': return 'border-slate-500'
      case 'in-progress': return 'border-blue-500'
      case 'review': return 'border-yellow-500'
      case 'done': return 'border-green-500'
      default: return 'border-slate-500'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3b82f6]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-4 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <svg className="w-8 h-8 text-[#3b82f6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <h1 className="text-xl font-bold">TaskFlow</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Board */}
      <main className="p-4 max-w-7xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Kanban Board</h2>
          <p className="text-slate-400">Drag and drop tasks between columns to update their status</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {columns.map(column => (
            <div
              key={column.id}
              className={`bg-slate-800 rounded-xl p-4 border-t-4 ${getColumnColor(column.id)}`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">{column.title}</h3>
                <span className="bg-slate-700 text-sm px-2 py-1 rounded-full">
                  {column.tasks.length}
                </span>
              </div>

              <div className="space-y-3 min-h-[200px]">
                {column.tasks.map(task => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task, column.id)}
                    className="bg-slate-700 rounded-lg p-4 cursor-move hover:bg-slate-600 transition-colors group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-medium text-sm">{task.title}</h4>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setEditingTask(task)}
                          className="p-1 hover:bg-slate-500 rounded"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => deleteTask(task.id, column.id)}
                          className="p-1 hover:bg-red-500 rounded"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16