import { useState, useEffect } from 'react'
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  logout
} from './services/api'
import Auth from './Auth'
import AITutor from './components/AITutor'
import AIStudyPlanner from './components/AIStudyPlanner'

export default function App() {

  // =========================
  // AUTHENTICATION
  // =========================

  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem('token')
  )
  console.log('TOKEN: ', localStorage.getItem('token'))
  console.log('AUTHENTCATED: ', !!localStorage.getItem('token'))

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user')
    return savedUser ? JSON.parse(savedUser) : null
  })

  // =========================
  // SIDEBAR / NAVIGATION
  // =========================

  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('Dashboard')

  // =========================
  // TASK FILTER
  // =========================

  const [taskFilter, setTaskFilter] = useState('all')

  // =========================
  // ADD TASK MODAL
  // =========================

  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskCourse, setNewTaskCourse] = useState('')
  const [newTaskDueDate, setNewTaskDueDate] = useState('')
  const [newTaskPriority, setNewTaskPriority] = useState('Medium')

  // =========================
  // FOCUS TIMER
  // =========================

  const [timerSeconds, setTimerSeconds] = useState(1500)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [timerMode, setTimerMode] = useState('focus')

  // =========================
  // TASK DATA
  // =========================

  const [tasks, setTasks] = useState([])
  const [isLoadingTasks, setIsLoadingTasks] = useState(false)
  const [taskError, setTaskError] = useState(null)

  // =========================
  // FETCH TASKS
  // =========================

  const fetchTasks = async () => {
    setIsLoadingTasks(true)
    setTaskError(null)

    try {
      const data = await getTasks()

      // Backend response:
      // {
      //   status: "success",
      //   results: number,
      //   data: [...]
      // }

      const mapped = (data.data || []).map((t) => ({
        id: t.id,
        title: t.title,
        course: t.subject || '',
        dueDate: t.due_date
          ? new Date(t.due_date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })
          : 'No due date',
        priority: t.priority || 'Medium',
        completed: t.status === 'completed'
      }))

      setTasks(mapped)

    } catch (err) {
      setTaskError(err.message)
    } finally {
      setIsLoadingTasks(false)
    }
  }

  // Fetch tasks only after authentication
  useEffect(() => {
    if (isAuthenticated) {
      fetchTasks()
    }
  }, [isAuthenticated])

  // =========================
  // TOGGLE TASK
  // =========================

  const toggleTask = async (id) => {

    const currentTask = tasks.find((task) => task.id === id)

    if (!currentTask) return

    const newCompletedStatus = !currentTask.completed

    // Update UI immediately
    setTasks(
      tasks.map((task) =>
        task.id === id
          ? {
            ...task,
            completed: newCompletedStatus
          }
          : task
      )
    )

    try {

      await updateTask(id, {
        status: newCompletedStatus ? 'completed' : 'pending'
      })

    } catch (err) {

      // If backend update fails,
      // reload the original data
      fetchTasks()

    }
  }

  // =========================
  // DELETE TASK
  // =========================

  const handleDeleteTask = async (id) => {

    // Remove immediately from UI
    setTasks(tasks.filter((task) => task.id !== id))

    try {

      await deleteTask(id)

    } catch (err) {

      // Reload if delete fails
      fetchTasks()

    }
  }

  // =========================
  // ADD TASK
  // =========================

  const handleAddTask = async (e) => {

    e.preventDefault()

    if (!newTaskTitle.trim()) return

    try {

      await createTask({
        title: newTaskTitle.trim(),
        subject: newTaskCourse.trim() || null,
        due_date: newTaskDueDate || null,
        priority: newTaskPriority,
        status: 'pending'
      })

      // Clear form
      setNewTaskTitle('')
      setNewTaskCourse('')
      setNewTaskDueDate('')
      setNewTaskPriority('Medium')

      // Close modal
      setIsAddTaskModalOpen(false)

      // Reload tasks
      await fetchTasks()

    } catch (err) {

      alert(`Failed to add task: ${err.message}`)

    }
  }

  // =========================
  // TIMER
  // =========================

  useEffect(() => {

    let interval = null

    if (isTimerRunning && timerSeconds > 0) {

      interval = setInterval(() => {
        setTimerSeconds((seconds) => seconds - 1)
      }, 1000)

    } else if (timerSeconds === 0) {

      setIsTimerRunning(false)

    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }

  }, [isTimerRunning, timerSeconds])

  const formatTime = (seconds) => {

    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60

    return `${String(minutes).padStart(2, '0')}:${String(
      remainingSeconds
    ).padStart(2, '0')}`

  }

  const resetTimer = () => {

    setIsTimerRunning(false)

    if (timerMode === 'focus') {
      setTimerSeconds(1500)
    } else {
      setTimerSeconds(300)
    }

  }

  const changeTimerMode = (mode) => {

    setTimerMode(mode)
    setIsTimerRunning(false)

    if (mode === 'focus') {
      setTimerSeconds(1500)
    } else {
      setTimerSeconds(300)
    }

  }

  // =========================
  // LOGOUT
  // =========================

  const handleLogout = () => {

    logout()

    localStorage.removeItem('user')

    setUser(null)
    setIsAuthenticated(false)
    setTasks([])

  }

  // =========================
  // USER INITIALS
  // =========================

  const getInitials = () => {

    if (!user?.name) {
      return 'ST'
    }

    return user.name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()

  }

  // =========================
  // FILTER TASKS
  // =========================

  const filteredTasks = tasks.filter((task) => {

    if (taskFilter === 'pending') {
      return !task.completed
    }

    if (taskFilter === 'completed') {
      return task.completed
    }

    return true

  })

  const pendingTasks = tasks.filter(
    (task) => !task.completed
  ).length

  const completedTasks = tasks.filter(
    (task) => task.completed
  ).length

  // =========================
  // LOGIN SCREEN
  // =========================

  if (!isAuthenticated) {

    return (
      <Auth
        onLogin={(loggedInUser) => {

          setUser(loggedInUser)
          setIsAuthenticated(true)

        }}
      />
    )

  }

  // =========================
  // MAIN DASHBOARD
  // =========================

  return (

    <div className="min-h-screen bg-slate-950 text-white">

      {/* =========================
          MOBILE OVERLAY
      ========================= */}

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* =========================
          SIDEBAR
      ========================= */}

      <aside
        className={`
          fixed top-0 left-0 z-50
          h-screen w-64
          bg-slate-900
          border-r border-slate-800
          flex flex-col
          transition-transform duration-300

          ${isSidebarOpen
            ? 'translate-x-0'
            : '-translate-x-full lg:translate-x-0'
          }
        `}
      >

        {/* Logo */}

        <div className="p-6 border-b border-slate-800">

          <div className="flex items-center gap-3">

            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
              🎓
            </div>

            <div>

              <h1 className="font-bold text-white">
                AI Student
              </h1>

              <p className="text-xs text-slate-400">
                Productivity
              </p>

            </div>

          </div>

        </div>

        {/* Navigation */}

        <nav className="flex-1 p-4 space-y-2">

          {[
            'Dashboard',
            'Tasks & Planner',
            'AI Study Planner',
            'AI Tutor Assistant',
            'Flashcards & Notes',
            'Focus Timer',
            'Analytics'
          ].map((item) => (

            <button
              key={item}
              onClick={() => {
                setActiveTab(item)
                setIsSidebarOpen(false)
              }}
              className={`
                w-full text-left
                px-4 py-3
                rounded-xl
                text-sm font-medium
                transition-all

                ${activeTab === item
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }
              `}
            >

              {item === 'Dashboard' && '🏠 '}
              {item === 'Tasks & Planner' && '📋 '}
              {item === 'AI Study Planner' && '📅 '}
              {item === 'AI Tutor Assistant' && '🤖 '}
              {item === 'Flashcards & Notes' && '📝 '}
              {item === 'Focus Timer' && '⏱️ '}
              {item === 'Analytics' && '📊 '}

              {item}

            </button>

          ))}

        </nav>

        {/* User Section */}

        <div className="p-4 border-t border-slate-800">

          <div className="flex items-center gap-3">

            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-sm">

              {getInitials()}

            </div>

            <div className="min-w-0">

              <p className="text-sm font-semibold text-white truncate">
                {user?.name || 'Student'}
              </p>

              <p className="text-xs text-slate-500 truncate">
                {user?.email || ''}
              </p>

            </div>

          </div>

          {/* Logout */}

          <button
            onClick={handleLogout}
            className="w-full mt-3 px-3 py-2 text-xs font-semibold text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
          >
            🚪 Logout
          </button>

        </div>

      </aside>

      {/* =========================
          MAIN AREA
      ========================= */}

      <main className="lg:ml-64 min-h-screen">

        {/* =========================
            HEADER
        ========================= */}

        <header className="h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur flex items-center justify-between px-4 sm:px-6">

          <button
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden text-slate-400 hover:text-white text-xl"
          >
            ☰
          </button>

          <div className="hidden lg:block" />

          <div className="flex items-center gap-3">

            <div className="text-right hidden sm:block">

              <p className="text-sm font-semibold text-white">
                {user?.name || 'Student'}
              </p>

              <p className="text-xs text-slate-500">
                Student
              </p>

            </div>

            <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold">
              {getInitials()}
            </div>

          </div>

        </header>

        {/* =========================
            PAGE CONTENT
        ========================= */}

        <div className="p-4 sm:p-6 lg:p-8">

          {/* =========================
              DASHBOARD
          ========================= */}

          {activeTab === 'Dashboard' && (

            <>

              {/* Welcome */}

              <div className="mb-8">

                <h2 className="text-2xl sm:text-3xl font-bold text-white">

                  Welcome back, {user?.name || 'Student'}! 👋

                </h2>

                <p className="text-slate-400 mt-2">

                  Here's what's happening with your studies today.

                </p>

              </div>

              {/* Stats */}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">

                  <p className="text-sm text-slate-400">
                    Total Tasks
                  </p>

                  <p className="text-3xl font-bold mt-2">
                    {tasks.length}
                  </p>

                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">

                  <p className="text-sm text-slate-400">
                    Pending Tasks
                  </p>

                  <p className="text-3xl font-bold mt-2">
                    {pendingTasks}
                  </p>

                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">

                  <p className="text-sm text-slate-400">
                    Completed
                  </p>

                  <p className="text-3xl font-bold mt-2">
                    {completedTasks}
                  </p>

                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">

                  <p className="text-sm text-slate-400">
                    Focus Time
                  </p>

                  <p className="text-3xl font-bold mt-2">
                    0h
                  </p>

                </div>

              </div>

              {/* AI Insight */}

              <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-2xl p-6 mb-8">

                <div className="flex items-start gap-4">

                  <div className="text-3xl">
                    🤖
                  </div>

                  <div>

                    <h3 className="font-bold text-white">
                      AI Study Insight
                    </h3>

                    <p className="text-sm text-slate-300 mt-2">
                      Stay consistent with your tasks and use the focus timer to maintain productive study sessions.
                    </p>

                  </div>

                </div>

              </div>

              {/* Recent Tasks */}

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

                <div className="flex items-center justify-between mb-5">

                  <h3 className="text-lg font-bold">
                    Upcoming Tasks
                  </h3>

                  <button
                    onClick={() => setActiveTab('Tasks & Planner')}
                    className="text-sm text-indigo-400 hover:text-indigo-300"
                  >
                    View all →
                  </button>

                </div>

                {tasks.length === 0 ? (

                  <p className="text-slate-500 text-sm">
                    No tasks yet. Add your first task from Tasks & Planner.
                  </p>

                ) : (

                  <div className="space-y-3">

                    {tasks
                      .filter((task) => !task.completed)
                      .slice(0, 5)
                      .map((task) => (

                        <div
                          key={task.id}
                          className="flex items-center justify-between bg-slate-800/50 rounded-xl p-4"
                        >

                          <div>

                            <p className="font-medium">
                              {task.title}
                            </p>

                            <p className="text-xs text-slate-500 mt-1">
                              {task.course || 'General'} • {task.dueDate}
                            </p>

                          </div>

                          <span className="text-xs text-slate-400">
                            {task.priority}
                          </span>

                        </div>

                      ))}

                  </div>

                )}

              </div>

            </>

          )}

          {/* =========================
              TASKS & PLANNER
          ========================= */}

          {activeTab === 'Tasks & Planner' && (

            <>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">

                <div>

                  <h2 className="text-2xl sm:text-3xl font-bold">
                    Tasks & Planner
                  </h2>

                  <p className="text-slate-400 mt-2">
                    Organize and manage your study tasks.
                  </p>

                </div>

                <button
                  onClick={() => setIsAddTaskModalOpen(true)}
                  className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-semibold transition"
                >
                  + Add Task
                </button>

              </div>

              {/* Error */}

              {taskError && (

                <div className="mb-5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl p-4 text-sm">
                  {taskError}
                </div>

              )}

              {/* Filters */}

              <div className="flex gap-2 mb-5">

                {['all', 'pending', 'completed'].map((filter) => (

                  <button
                    key={filter}
                    onClick={() => setTaskFilter(filter)}
                    className={`
                      px-4 py-2 rounded-xl text-sm font-medium capitalize
                      ${taskFilter === filter
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-900 text-slate-400 hover:text-white'
                      }
                    `}
                  >
                    {filter}
                  </button>

                ))}

              </div>

              {/* Loading */}

              {isLoadingTasks ? (

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
                  Loading tasks...
                </div>

              ) : filteredTasks.length === 0 ? (

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center">

                  <div className="text-4xl mb-3">
                    📋
                  </div>

                  <h3 className="font-bold text-lg">
                    No tasks found
                  </h3>

                  <p className="text-slate-500 text-sm mt-2">
                    Add a task to start organizing your studies.
                  </p>

                </div>

              ) : (

                <div className="space-y-3">

                  {filteredTasks.map((task) => (

                    <div
                      key={task.id}
                      className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex items-center gap-4"
                    >

                      {/* Checkbox */}

                      <button
                        onClick={() => toggleTask(task.id)}
                        className={`
                          w-6 h-6 rounded-lg border flex items-center justify-center shrink-0
                          ${task.completed
                            ? 'bg-indigo-600 border-indigo-600'
                            : 'border-slate-600 hover:border-indigo-500'
                          }
                        `}
                      >

                        {task.completed && '✓'}

                      </button>

                      {/* Task */}

                      <div className="flex-1 min-w-0">

                        <p
                          className={`font-semibold ${task.completed
                              ? 'line-through text-slate-500'
                              : 'text-white'
                            }`}
                        >
                          {task.title}
                        </p>

                        <p className="text-xs text-slate-500 mt-1">
                          {task.course || 'General'} • {task.dueDate}
                        </p>

                      </div>

                      {/* Priority */}

                      <span className="hidden sm:block text-xs px-3 py-1 rounded-full bg-slate-800 text-slate-300">
                        {task.priority}
                      </span>

                      {/* Delete */}

                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="text-slate-500 hover:text-rose-400 transition"
                      >
                        🗑️
                      </button>

                    </div>

                  ))}

                </div>

              )}

            </>

          )}

          {/* =========================
              AI STUDY PLANNER
          ========================= */}

          {activeTab === 'AI Study Planner' && (
            <AIStudyPlanner />
          )}

          {/* =========================
              AI TUTOR
          ========================= */}

          {activeTab === 'AI Tutor Assistant' && (
            <AITutor user={user} />
          )}

          {/* =========================
              FLASHCARDS
          ========================= */}

          {activeTab === 'Flashcards & Notes' && (

            <div>

              <h2 className="text-2xl sm:text-3xl font-bold">
                Flashcards & Notes
              </h2>

              <p className="text-slate-400 mt-2">
                Create and review your study material.
              </p>

              <div className="mt-8 bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">

                <div className="text-5xl mb-4">
                  📝
                </div>

                <h3 className="text-xl font-bold">
                  Coming Soon
                </h3>

                <p className="text-slate-400 mt-2">
                  Flashcards and AI-generated notes will be added here.
                </p>

              </div>

            </div>

          )}

          {/* =========================
              FOCUS TIMER
          ========================= */}

          {activeTab === 'Focus Timer' && (

            <div>

              <h2 className="text-2xl sm:text-3xl font-bold">
                Focus Timer
              </h2>

              <p className="text-slate-400 mt-2 mb-8">
                Use focused study sessions to improve productivity.
              </p>

              <div className="max-w-xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">

                {/* Modes */}

                <div className="flex justify-center gap-2 mb-8">

                  <button
                    onClick={() => changeTimerMode('focus')}
                    className={`
                      px-4 py-2 rounded-xl text-sm
                      ${timerMode === 'focus'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-800 text-slate-400'
                      }
                    `}
                  >
                    Focus
                  </button>

                  <button
                    onClick={() => changeTimerMode('break')}
                    className={`
                      px-4 py-2 rounded-xl text-sm
                      ${timerMode === 'break'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-800 text-slate-400'
                      }
                    `}
                  >
                    Break
                  </button>

                </div>

                {/* Timer */}

                <div className="text-7xl font-bold tracking-wider mb-8">
                  {formatTime(timerSeconds)}
                </div>

                {/* Controls */}

                <div className="flex justify-center gap-3">

                  <button
                    onClick={() => setIsTimerRunning(!isTimerRunning)}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-semibold"
                  >
                    {isTimerRunning ? 'Pause' : 'Start'}
                  </button>

                  <button
                    onClick={resetTimer}
                    className="px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl font-semibold"
                  >
                    Reset
                  </button>

                </div>

              </div>

            </div>

          )}

          {/* =========================
              ANALYTICS
          ========================= */}

          {activeTab === 'Analytics' && (

            <div>

              <h2 className="text-2xl sm:text-3xl font-bold">
                Analytics
              </h2>

              <p className="text-slate-400 mt-2">
                Track your study progress and productivity.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

                  <p className="text-slate-400 text-sm">
                    Total Tasks
                  </p>

                  <p className="text-3xl font-bold mt-2">
                    {tasks.length}
                  </p>

                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

                  <p className="text-slate-400 text-sm">
                    Completed Tasks
                  </p>

                  <p className="text-3xl font-bold mt-2">
                    {completedTasks}
                  </p>

                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

                  <p className="text-slate-400 text-sm">
                    Pending Tasks
                  </p>

                  <p className="text-3xl font-bold mt-2">
                    {pendingTasks}
                  </p>

                </div>

              </div>

            </div>

          )}

        </div>

      </main>

      {/* =========================
          ADD TASK MODAL
      ========================= */}

      {isAddTaskModalOpen && (

        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center px-4">

          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6">

            <div className="flex items-center justify-between mb-6">

              <div>

                <h2 className="text-xl font-bold">
                  Add New Task
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Create a new study task.
                </p>

              </div>

              <button
                onClick={() => setIsAddTaskModalOpen(false)}
                className="text-slate-500 hover:text-white"
              >
                ✕
              </button>

            </div>

            <form
              onSubmit={handleAddTask}
              className="space-y-4"
            >

              {/* Title */}

              <div>

                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Task Title
                </label>

                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) =>
                    setNewTaskTitle(e.target.value)
                  }
                  placeholder="e.g. Complete DBMS assignment"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 outline-none focus:border-indigo-500"
                />

              </div>

              {/* Subject */}

              <div>

                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Subject
                </label>

                <input
                  type="text"
                  value={newTaskCourse}
                  onChange={(e) =>
                    setNewTaskCourse(e.target.value)
                  }
                  placeholder="e.g. DBMS"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 outline-none focus:border-indigo-500"
                />

              </div>

              {/* Due Date */}

              <div>

                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Due Date
                </label>

                <input
                  type="date"
                  value={newTaskDueDate}
                  onChange={(e) =>
                    setNewTaskDueDate(e.target.value)
                  }
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:border-indigo-500"
                />

              </div>

              {/* Priority */}

              <div>

                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Priority
                </label>

                <select
                  value={newTaskPriority}
                  onChange={(e) =>
                    setNewTaskPriority(e.target.value)
                  }
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:border-indigo-500"
                >

                  <option value="Low">
                    Low
                  </option>

                  <option value="Medium">
                    Medium
                  </option>

                  <option value="High">
                    High
                  </option>

                </select>

              </div>

              {/* Buttons */}

              <div className="flex gap-3 pt-2">

                <button
                  type="button"
                  onClick={() => setIsAddTaskModalOpen(false)}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl font-semibold"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-semibold"
                >
                  Add Task
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>

  )
}