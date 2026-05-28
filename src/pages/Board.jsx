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
  const [selectedColumn, setSelectedColumn] = useState('todo')
  const [draggedTask, setDraggedTask] = useState(null)
  const [editingTask, setEditingTask] = useState(null)

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
            description: newTaskDescription,
            status: selectedColumn,
            user_id: user.id
          }
        ])
        .select()

      if (error) throw error

      if (data) {
        const updatedColumns = columns.map(col => {
          if (col.id === selectedColumn) {
            return { ...col, tasks: [...col.tasks, data[0]] }
          }
          return col
        })
        setColumns(updatedColumns)
      }

      setNewTaskTitle('')
      setNewTaskDescription('')
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

      fetchTasks()
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

      const updatedColumns = columns.map(col => ({
        ...col,
        tasks: col.tasks.filter(task => task.id !== taskId)
      }))
      setColumns(updatedColumns)
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }

  async function updateTask(taskId, updates) {
    try {
      const { error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId)

      if (error) throw error

      fetchTasks()
      setEditingTask(null)
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  function handleDragStart(e, task, columnId) {
    setDraggedTask({ task, sourceColumn: columnId })
    e.dataTransfer.effectAllowed = 'move'
  }

  function handleDragOver(e) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  function handleDrop(e, targetColumnId) {
    e.preventDefault()
    if (draggedTask && draggedTask.sourceColumn !== targetColumnId) {
      updateTaskStatus(draggedTask.task.id, targetColumnId)
    }
    setDraggedTask(null)
  }

  function openAddModal(columnId) {
    setSelectedColumn(columnId)
    setShowAddModal(true)
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
      <header className="bg-slate-800 border-b border-slate-700 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#3b82f6] rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <h1 className="text-xl font-bold">TaskFlow</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400 hidden sm:block">{user?.email}</span>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 text-sm bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="p-4 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Kanban Board</h2>
          <button
            onClick={() => openAddModal('todo')}
            className="px-4 py-2 bg-[#3b82f6] hover:bg-blue-600 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden sm:inline">Add Task</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {columns.map(column => (
            <div
              key={column.id}
              className="bg-slate-800 rounded-xl p-4 min-h-[500px]"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-300">{column.title}</h3>
                <span className="bg-slate-700 text-slate-400 text-xs px-2 py-1 rounded-full">
                  {column.tasks.length}
                </span>
              </div>

              <div className="space-y-3">
                {column.tasks.map(task => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task, column.id)}
                    className="bg-slate-700 rounded-lg p-4 cursor-grab active:cursor-grabbing hover:bg-slate-600 transition-colors group"
                  >
                    {editingTask?.id === task.id ? (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={editingTask.title}
                          onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                          className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-[#3b82f6]"
                        />
                        <textarea
                          value={editingTask.description || ''}
                          onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                          className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-[#3b82f6] resize-none"
                          rows={2}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateTask(task.id, { title: editingTask.title, description: editingTask.description })}
                            className="px-3 py-1 bg-[#3b82f6] hover:bg-blue-600 rounded text-sm"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingTask(null)}
                            className="px-3 py-1 bg-slate-600 hover:bg-slate-500 rounded text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start justify-between">
                          <h4 className="font-medium text-white">{task.title}</h4>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => setEditingTask({ ...task })}
                              className="p-1 hover:bg-slate-500 rounded"
                            >
                              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap