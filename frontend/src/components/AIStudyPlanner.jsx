import { useState } from 'react'
import { generateStudyPlan } from '../services/api'

export default function AIStudyPlanner() {
  // Form state
  const [subjects, setSubjects] = useState(['DSA', 'DBMS', 'Operating Systems'])
  const [subjectInput, setSubjectInput] = useState('')
  const [examDate, setExamDate] = useState(() => {
    // Default to 14 days from now
    const d = new Date()
    d.setDate(d.getDate() + 14)
    return d.toISOString().split('T')[0]
  })
  const [studyHours, setStudyHours] = useState(4)
  const [weakSubjects, setWeakSubjects] = useState(['DBMS'])
  const [preferredTime, setPreferredTime] = useState('Evening')
  const [instructions, setInstructions] = useState('')

  // UI state
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [plan, setPlan] = useState(null)

  // Quick subject suggestions
  const quickSubjectSuggestions = ['DSA', 'DBMS', 'Operating Systems', 'Computer Networks', 'React', 'Linear Algebra']

  // Handle adding a subject
  const handleAddSubject = (subjectToAdd) => {
    const s = (subjectToAdd || subjectInput).trim()
    if (!s) return
    if (!subjects.includes(s)) {
      setSubjects([...subjects, s])
    }
    setSubjectInput('')
  }

  // Handle removing a subject
  const handleRemoveSubject = (sToRemove) => {
    setSubjects(subjects.filter((s) => s !== sToRemove))
    setWeakSubjects(weakSubjects.filter((s) => s !== sToRemove))
  }

  // Toggle weak subject status
  const handleToggleWeakSubject = (s) => {
    if (weakSubjects.includes(s)) {
      setWeakSubjects(weakSubjects.filter((item) => item !== s))
    } else {
      setWeakSubjects([...weakSubjects, s])
    }
  }

  // Handle study plan generation
  const handleGenerate = async (e) => {
    if (e) e.preventDefault()
    setError('')

    if (subjects.length === 0) {
      setError('Please add at least one subject to study.')
      return
    }

    if (!examDate) {
      setError('Please select your target exam date.')
      return
    }

    setIsLoading(true)

    try {
      const response = await generateStudyPlan({
        subjects,
        examDate,
        studyHoursPerDay: Number(studyHours),
        weakSubjects,
        preferredStudyTime: preferredTime.toLowerCase(),
        additionalInstructions: instructions.trim() || undefined,
      })

      if (response && response.plan) {
        setPlan(response.plan)
        // Scroll smoothly to results
        setTimeout(() => {
          document.getElementById('study-plan-results')?.scrollIntoView({ behavior: 'smooth' })
        }, 100)
      } else {
        throw new Error('Received an incomplete response from AI. Please try again.')
      }
    } catch (err) {
      setError(err.message || 'Failed to generate study plan. Please verify your inputs and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Page Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-3">
          <span>✨ AI Study Planner</span>
          <span>•</span>
          <span>OpenRouter Powered</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
          <span>📅</span>
          <span>AI Study Schedule & Planner</span>
        </h1>
        <p className="text-slate-400 mt-2 text-sm sm:text-base max-w-3xl">
          Enter your subjects, exam deadlines, and daily routine. Our AI builds a personalized study schedule tailored to your weak areas and preferred study hours.
        </p>
      </div>

      {/* Input Configuration Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-7 shadow-xl space-y-6">
        <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <span>⚙️</span>
          <span>Study Plan Parameters</span>
        </h2>

        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-sm flex items-start justify-between gap-3 animate-in fade-in">
            <div className="flex items-start gap-2">
              <span className="text-base">⚠️</span>
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError('')}
              className="text-rose-400 hover:text-rose-200 text-xs font-bold px-1"
            >
              ✕
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Subjects & Weak Areas */}
          <div className="space-y-5">
            {/* Subjects Input */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                1. Subjects to Prepare *
              </label>
              <div className="flex gap-2 mb-2.5">
                <input
                  type="text"
                  value={subjectInput}
                  onChange={(e) => setSubjectInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddSubject()
                    }
                  }}
                  placeholder="e.g. Data Structures, React, Python..."
                  className="flex-1 bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => handleAddSubject()}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition"
                >
                  + Add
                </button>
              </div>

              {/* Subject Badges */}
              <div className="flex flex-wrap gap-2 min-h-[38px] p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                {subjects.length === 0 ? (
                  <span className="text-xs text-slate-500 italic py-1">No subjects added yet. Add one above!</span>
                ) : (
                  subjects.map((s) => (
                    <span
                      key={s}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 text-xs font-medium"
                    >
                      <span>📚 {s}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSubject(s)}
                        className="text-indigo-400 hover:text-rose-400 font-bold ml-1 transition"
                        title="Remove"
                      >
                        ✕
                      </button>
                    </span>
                  ))
                )}
              </div>

              {/* Quick suggestions */}
              <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-slate-500 text-[11px]">Quick add:</span>
                {quickSubjectSuggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => handleAddSubject(suggestion)}
                    disabled={subjects.includes(suggestion)}
                    className="px-2 py-0.5 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-[11px] disabled:opacity-30 disabled:pointer-events-none transition"
                  >
                    +{suggestion}
                  </button>
                ))}
              </div>
            </div>

            {/* Weak Subjects Selector */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  4. Weak Subjects (Optional)
                </label>
                <span className="text-[11px] text-indigo-400">Gets higher priority & revision time</span>
              </div>
              <p className="text-xs text-slate-400 mb-2">
                Click a subject to toggle it as a weak area needing extra focus:
              </p>
              <div className="flex flex-wrap gap-2 min-h-[38px] p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                {subjects.length === 0 ? (
                  <span className="text-xs text-slate-500 italic py-1">Add subjects first to mark weak areas.</span>
                ) : (
                  subjects.map((s) => {
                    const isWeak = weakSubjects.includes(s)
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => handleToggleWeakSubject(s)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
                          isWeak
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-sm'
                            : 'bg-slate-800/70 text-slate-400 border-slate-700 hover:text-slate-200'
                        }`}
                      >
                        <span>{isWeak ? '🔥' : '○'}</span>
                        <span>{s}</span>
                        {isWeak && <span className="text-[10px] bg-rose-500/30 px-1 rounded">Weak</span>}
                      </button>
                    )
                  })
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Time, Hours, Exam Date & Instructions */}
          <div className="space-y-5">
            {/* Exam Date & Daily Hours */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  2. Exam Date *
                </label>
                <input
                  type="date"
                  required
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  3. Study Hours / Day *
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    max="14"
                    value={studyHours}
                    onChange={(e) => setStudyHours(Math.max(1, Math.min(14, Number(e.target.value))))}
                    className="w-24 bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                  <span className="text-xs text-slate-400">hours/day</span>
                </div>
              </div>
            </div>

            {/* Preferred Study Time */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                5. Preferred Study Time
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'Morning', icon: '🌅', desc: '6 AM - 12 PM' },
                  { id: 'Afternoon', icon: '☀️', desc: '12 PM - 5 PM' },
                  { id: 'Evening', icon: '🌙', desc: '5 PM - 11 PM' },
                  { id: 'Flexible', icon: '⚡', desc: 'All Day' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setPreferredTime(item.id)}
                    className={`p-2.5 rounded-xl text-left border transition flex flex-col justify-between ${
                      preferredTime === item.id
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 font-semibold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs">
                      <span>{item.icon}</span>
                      <span>{item.id}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Additional Instructions */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                6. Additional Routine / Constraints (Optional)
              </label>
              <textarea
                rows={2}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="e.g. I have college classes from 9 AM to 4 PM, allocate more time on weekends..."
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Submit Action */}
        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            Powered by OpenRouter AI. Plans take 3-8 seconds to calculate.
          </p>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={isLoading || subjects.length === 0 || !examDate}
            className="w-full sm:w-auto px-7 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/25 transition flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>Generating Personalized Plan...</span>
              </>
            ) : (
              <>
                <span>🚀 Generate Study Plan</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Generated Study Plan Display */}
      {plan && (
        <div id="study-plan-results" className="space-y-6 animate-in fade-in duration-300">
          {/* Plan Summary Banner */}
          <div className="bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 shadow-xl space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                🎯 Strategic Study Roadmap
              </span>
              <span className="text-xs text-slate-400">
                Target Exam: <strong className="text-slate-200">{examDate}</strong> ({studyHours}h/day)
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Personalized Plan Overview
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              {plan.summary || 'A customized, goal-oriented daily schedule designed to maximize mastery and retention.'}
            </p>
          </div>

          {/* Daily Schedule Timeline */}
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>📅</span>
                <span>Daily Schedules ({plan.daily_plan?.length || 0} Days)</span>
              </h3>
              <span className="text-xs text-slate-400">
                {plan.daily_plan?.reduce((acc, day) => acc + (day.sessions?.length || 0), 0)} total study sessions
              </span>
            </div>

            {(!plan.daily_plan || plan.daily_plan.length === 0) ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 text-sm">
                No daily sessions found in the generated plan. Please try generating again.
              </div>
            ) : (
              plan.daily_plan.map((dayItem, dayIdx) => (
                <div
                  key={dayIdx}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-md space-y-4"
                >
                  {/* Day Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center font-bold text-indigo-300 text-xs">
                        D{dayIdx + 1}
                      </span>
                      <div>
                        <h4 className="text-base font-bold text-white uppercase tracking-wide">
                          {dayItem.day || `Day ${dayIdx + 1}`}
                          {dayItem.date && <span className="text-slate-400 font-normal ml-2 lowercase sm:capitalize">({dayItem.date})</span>}
                        </h4>
                      </div>
                    </div>

                    <span className="text-xs text-slate-400">
                      {dayItem.sessions?.length || 0} Sessions •{' '}
                      {dayItem.sessions?.reduce((acc, s) => acc + (s.duration_minutes || 60), 0)} mins total
                    </span>
                  </div>

                  {/* Sessions Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
                    {dayItem.sessions?.map((session, sIdx) => {
                      const isWeak = weakSubjects.some(
                        (w) => session.subject && session.subject.toLowerCase().includes(w.toLowerCase())
                      )

                      return (
                        <div
                          key={sIdx}
                          className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 transition ${
                            isWeak
                              ? 'bg-rose-950/20 border-rose-500/30 hover:border-rose-500/50'
                              : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          {/* Top: Time badge & Subject */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md font-semibold">
                                ⏱️ {session.start_time || 'TBD'} - {session.end_time || 'TBD'}
                              </span>
                              <span className="text-slate-500 text-[11px]">
                                {session.duration_minutes ? `${session.duration_minutes}m` : '60m'}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 pt-1">
                              <span className="font-bold text-slate-100 text-sm">
                                📚 {session.subject}
                              </span>
                              {isWeak && (
                                <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.2 rounded border border-rose-500/20">
                                  Focus
                                </span>
                              )}
                            </div>

                            <p className="text-xs font-semibold text-indigo-300">
                              {session.topic}
                            </p>
                          </div>

                          {/* Goal */}
                          <div className="pt-2 border-t border-slate-800/80 text-xs text-slate-300">
                            <span className="text-slate-500 font-semibold block text-[10px] uppercase tracking-wider mb-0.5">
                              Session Goal:
                            </span>
                            <p className="leading-relaxed">
                              {session.goal || 'Complete practice and active recall questions.'}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}