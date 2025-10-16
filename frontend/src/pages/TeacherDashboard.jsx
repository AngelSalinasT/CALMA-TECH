import { useEffect, useMemo, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  BarChart3,
  CalendarDays,
  ClipboardList,
  GraduationCap,
  Users2,
  TrendingUp,
  AlertTriangle,
  LineChart,
  Award
} from 'lucide-react'

import { DEFAULT_TEACHER, MOCK_DASHBOARD } from '../data/teacherMock'

const STAT_ICON_RENDERERS = {
  book: () => (
    <svg
      className="w-6 h-6 text-[#5B8FC3]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5z" />
    </svg>
  ),
  users: () => <Users2 className="w-6 h-6 text-[#5B8FC3]" />,
  calendar: () => <CalendarDays className="w-6 h-6 text-[#4A7FB0]" />,
  clipboard: () => <ClipboardList className="w-6 h-6 text-[#347FB5]" />
}

const ACTION_LINKS = [
  { to: '/dashboard/profesor/grupos', label: 'Gestionar grupos', icon: '👥' },
  { to: '/dashboard/profesor/grupos/:courseId/:groupId/asistencia', label: 'Tomar asistencia', icon: '🗓️' },
  { to: '/dashboard/profesor/grupos/:courseId/:groupId/calificaciones', label: 'Registrar calificaciones', icon: '📝' }
]

function TeacherDashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedCourseId, setSelectedCourseId] = useState(MOCK_DASHBOARD.courses[0].id)
  const [selectedGroupId, setSelectedGroupId] = useState(MOCK_DASHBOARD.courses[0].groups[0].id)
  const [groupTab, setGroupTab] = useState('overview')

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        parsed.role = 'profesor'
        setUser({ ...DEFAULT_TEACHER, ...parsed })
      } catch {
        setUser(DEFAULT_TEACHER)
      }
    } else {
      setUser(DEFAULT_TEACHER)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    const course = MOCK_DASHBOARD.courses.find((item) => item.id === selectedCourseId)
    if (course && !course.groups.some((group) => group.id === selectedGroupId)) {
      setSelectedGroupId(course.groups[0].id)
      setGroupTab('overview')
    }
  }, [selectedCourseId, selectedGroupId])

  const selectedCourse = useMemo(
    () => MOCK_DASHBOARD.courses.find((item) => item.id === selectedCourseId),
    [selectedCourseId]
  )

  const selectedGroup = useMemo(
    () => selectedCourse?.groups.find((group) => group.id === selectedGroupId),
    [selectedCourse, selectedGroupId]
  )

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
    navigate('/')
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <img src="/logo.jpeg" alt="CALMA TECH" className="h-16 mb-4 animate-pulse" />
        <div className="flex gap-2">
          <div className="w-3 h-3 bg-[#5B8FC3] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-3 h-3 bg-[#5B8FC3] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-3 h-3 bg-[#5B8FC3] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src="/logo.jpeg" alt="CALMA TECH" className="w-12 h-12 rounded-full object-cover shadow-sm" />
            <div>
              <h1 className="text-xl font-bold text-[#2F4A6A]">Panel docente · CALMA TECH</h1>
              <p className="text-sm text-gray-500">Monitorea el aprendizaje y bienestar de tus grupos</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-semibold text-gray-900">{user.name}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
            {user.picture && (
              <img src={user.picture} alt={user.name} className="w-10 h-10 rounded-full border border-[#5B8FC3]/40" />
            )}
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-full border border-[#5B8FC3] text-[#5B8FC3] font-semibold hover:bg-[#5B8FC3] hover:text-white transition-colors"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {MOCK_DASHBOARD.stats.map((stat) => (
            <div key={stat.id} className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">{stat.label}</p>
                {STAT_ICON_RENDERERS[stat.iconType]?.() ?? <BarChart3 className="w-6 h-6 text-[#5B8FC3]" />}
              </div>
              <p className="text-3xl font-bold text-[#2F4A6A]">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.hint}</p>
            </div>
          ))}
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#5B8FC3]" />
                Asistencia por grupo
              </h2>
              <span className="text-xs font-semibold text-[#5B8FC3] bg-[#E8F1FB] px-3 py-1 rounded-full">Actualizado hoy 07:45</span>
            </div>
            <div className="space-y-4">
              {MOCK_DASHBOARD.attendanceByGroup.map((row) => (
                <div key={row.label}>
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                    <span className="font-medium">{row.label}</span>
                    <span className="font-semibold text-gray-900">{row.value}%</span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#5B8FC3] via-[#4A7FB0] to-[#347FB5]"
                      style={{ width: `${row.value}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <LineChart className="w-5 h-5 text-[#5B8FC3]" />
                Entregas recientes
              </h2>
              <Link to="/dashboard/profesor/grupos/math3/math3A/calificaciones" className="text-xs font-semibold text-[#5B8FC3] hover:underline">
                Ver detalle →
              </Link>
            </div>

            <div className="space-y-4">
              {MOCK_DASHBOARD.submissionsByGroup.map((row) => {
                const total = row.onTime + row.late
                const onTimePercent = Math.round((row.onTime / total) * 100)
                const latePercent = 100 - onTimePercent
                return (
                  <div key={row.label} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-600">{row.label}</span>
                      <span className="text-xs text-gray-500">{total} envíos</span>
                    </div>
                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
                      <div className="bg-[#5B8FC3]" style={{ width: `${onTimePercent}%` }}></div>
                      <div className="bg-amber-400" style={{ width: `${latePercent}%` }}></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{onTimePercent}% a tiempo</span>
                      <span>{latePercent}% retraso</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-[#5B8FC3]" />
              Promedio general por grupo
            </h2>
            <button className="text-sm font-semibold text-[#5B8FC3] hover:underline">Ver historial →</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {MOCK_DASHBOARD.gradeByGroup.map((item) => (
              <div key={item.label} className="border border-slate-100 rounded-xl p-4 bg-slate-50/50">
                <p className="text-sm font-semibold text-gray-700">{item.label}</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-[#2F4A6A]">{item.value.toFixed(1)}</span>
                  <span className={`text-sm font-semibold ${item.delta.startsWith('+') ? 'text-emerald-600' : 'text-amber-500'}`}>
                    {item.delta}
                  </span>
                </div>
                <p className="mt-2 text-xs text-gray-500">Seguimiento mensual de evaluaciones sumativas</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Mis clases</h2>
              <span className="text-xs text-gray-500 uppercase">Demo desktop</span>
            </div>
            {MOCK_DASHBOARD.courses.map((course) => {
              const isSelected = course.id === selectedCourseId
              return (
                <div
                  key={course.id}
                  className={`rounded-2xl border shadow-sm transition-all cursor-pointer ${
                    isSelected ? 'border-[#5B8FC3] bg-[#E8F1FB]' : 'border-slate-100 bg-white hover:border-[#5B8FC3]/40'
                  }`}
                  onClick={() => setSelectedCourseId(course.id)}
                >
                  <div className="p-5 flex items-start gap-4">
                    <div className="text-3xl">{course.icon}</div>
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-gray-900">{course.title}</h3>
                      <p className="text-sm text-gray-500">{course.gradeLevel}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {course.groups.map((group) => {
                          const groupSelected = group.id === selectedGroupId && isSelected
                          return (
                            <button
                              key={group.id}
                              onClick={(event) => {
                                event.stopPropagation()
                                setSelectedCourseId(course.id)
                                setSelectedGroupId(group.id)
                                setGroupTab('overview')
                              }}
                              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border ${
                                groupSelected
                                  ? 'bg-[#5B8FC3] text-white border-[#5B8FC3]'
                                  : 'bg-white text-[#5B8FC3] border-[#5B8FC3]/40 hover:bg-[#E8F1FB]'
                              }`}
                            >
                              {group.label}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="col-span-12 lg:col-span-8 bg-white rounded-2xl shadow-sm border border-slate-100">
            {selectedGroup ? (
              <div className="p-6 space-y-6">
                <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase text-gray-500 tracking-widest">{selectedCourse?.title}</p>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedGroup.label}</h2>
                    <p className="text-sm text-gray-500">{selectedGroup.schedule}</p>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto">
                    <MiniStat icon={<Users2 className="w-4 h-4 text-[#5B8FC3]" />} label="Estudiantes" value={selectedGroup.students} />
                    <MiniStat icon={<CalendarDays className="w-4 h-4 text-[#4A7FB0]" />} label="Asistencia" value={`${selectedGroup.attendance}%`} />
                    <MiniStat icon={<SmallClipboardIcon />} label="Entregas" value={selectedGroup.submissions ? `${selectedGroup.submissions}%` : 'N/A'} />
                    <MiniStat icon={<TrendingUp className="w-4 h-4 text-emerald-500" />} label="Promedio" value={selectedGroup.avgGrade ? selectedGroup.avgGrade.toFixed(1) : '—'} />
                  </div>
                </header>

                <div className="flex flex-wrap gap-3">
                  {['overview', 'attendance', 'grades'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setGroupTab(tab)}
                      className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors border ${
                        groupTab === tab ? 'bg-[#5B8FC3] text-white border-[#5B8FC3]' : 'text-[#5B8FC3] border-[#5B8FC3]/50 bg-white hover:bg-[#E8F1FB]'
                      }`}
                    >
                      {tab === 'overview' && 'Resumen'}
                      {tab === 'attendance' && 'Asistencia'}
                      {tab === 'grades' && 'Calificaciones'}
                    </button>
                  ))}
                </div>

                <ActionPills courseId={selectedCourse?.id} groupId={selectedGroup.id} />

                {groupTab === 'overview' && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Prioridades del grupo</h3>
                      <div className="space-y-3">
                        {selectedGroup.insights.map((insight, index) => (
                          <div key={index} className="p-4 rounded-xl bg-[#E8F1FB] text-[#2F4A6A] text-sm font-medium">
                            {insight}
                          </div>
                        ))}
                      </div>
                      <div className="mt-4">
                        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Próximas entregas</h4>
                        <div className="space-y-3">
                          {selectedGroup.upcoming.map((item, index) => (
                            <div key={index} className="p-4 rounded-xl border border-slate-100 flex items-start justify-between">
                              <div>
                                <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                                <p className="text-xs text-gray-500 mt-1">{item.due}</p>
                              </div>
                              <span className="text-xs font-semibold text-[#5B8FC3] bg-[#E8F1FB] px-3 py-1 rounded-full capitalize">{item.type}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                          <Award className="w-4 h-4 text-[#5B8FC3]" />
                          Reconocimientos
                        </h3>
                        <div className="space-y-3">
                          {selectedGroup.topStudents.map((student) => (
                            <div key={student.name} className="p-4 bg-white border border-[#5B8FC3]/20 rounded-xl flex items-center justify-between">
                              <div>
                                <p className="text-sm font-semibold text-gray-900">{student.name}</p>
                                <p className="text-xs text-gray-500">Promedio: {student.score}</p>
                              </div>
                              <span className="text-xs font-semibold text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full">Entregas {student.submissions}</span>
                            </div>
                          ))}
                          {!selectedGroup.topStudents.length && <p className="text-sm text-gray-500">Usa este espacio para destacar avances o esfuerzos del grupo.</p>}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-500" />
                          Seguimiento personalizado
                        </h3>
                        <div className="space-y-3">
                          {selectedGroup.pendingSupport.map((item) => (
                            <div key={item.name} className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between">
                              <div>
                                <p className="text-sm font-semibold text-amber-900">{item.name}</p>
                                <p className="text-xs text-amber-700 mt-1">{item.note}</p>
                              </div>
                              <span className="text-xs font-semibold text-amber-900 bg-amber-200 px-3 py-1 rounded-full">{item.tag}</span>
                            </div>
                          ))}
                          {!selectedGroup.pendingSupport.length && <p className="text-sm text-gray-500">¡Excelente! No tienes alertas pendientes para este grupo.</p>}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {groupTab === 'attendance' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Asistencia semanal</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {selectedGroup.attendanceTrend.map((item) => (
                          <div key={item.label} className="p-4 border border-slate-100 rounded-xl bg-slate-50/50">
                            <p className="text-xs text-gray-500 uppercase">{item.label}</p>
                            <p className="text-xl font-semibold text-[#2F4A6A] mt-1">{item.value}%</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="border border-slate-100 rounded-xl p-5 bg-white">
                      <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Puntos de atención</h4>
                      <ul className="space-y-2 text-sm text-gray-600 list-disc list-inside">
                        {selectedGroup.insights.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {groupTab === 'grades' && (
                  <div className="space-y-6">
                    <div className="border border-slate-100 rounded-xl p-5 bg-white">
                      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Promedio global</h3>
                      <div className="flex items-baseline gap-4">
                        <p className="text-4xl font-bold text-[#2F4A6A]">{selectedGroup.avgGrade ? selectedGroup.avgGrade.toFixed(1) : '—'}</p>
                        <span className="text-sm text-emerald-600 flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" />
                          Tendencia positiva
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">Basado en entregas de la última evaluación quincenal.</p>
                    </div>
                    <div className="border border-slate-100 rounded-xl p-5 bg-white">
                      <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Próximas calificaciones por registrar</h4>
                      <div className="space-y-3">
                        {selectedGroup.upcoming.map((item, index) => (
                          <div key={index} className="p-4 bg-[#E8F1FB] rounded-xl flex items-center justify-between">
                            <div>
                              <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                              <p className="text-xs text-gray-500 mt-1">{item.due}</p>
                            </div>
                            <button className="text-xs font-semibold text-[#5B8FC3] hover:underline">Programar rúbrica →</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-10 text-center text-gray-500">Selecciona un grupo para revisar su información detallada.</div>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}

function ActionPills({ courseId, groupId }) {
  return (
    <div className="flex flex-wrap gap-3">
      {ACTION_LINKS.map((link) => (
        <Link
          key={link.to}
          to={link.to.includes(':') ? link.to.replace(':courseId', courseId).replace(':groupId', groupId) : link.to}
          className="px-4 py-2 rounded-full bg-[#E8F1FB] text-[#2F4A6A] text-sm font-semibold hover:bg-[#d9e9fb] transition-colors"
        >
          <span className="mr-2">{link.icon}</span>
          {link.label}
        </Link>
      ))}
    </div>
  )
}

function MiniStat({ icon, label, value }) {
  return (
    <div className="px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col gap-1">
      <div className="flex items-center gap-2 text-xs text-gray-500 uppercase tracking-wide">
        {icon}
        <span>{label}</span>
      </div>
      <span className="text-lg font-semibold text-[#2F4A6A]">{value}</span>
    </div>
  )
}

function SmallClipboardIcon() {
  return (
    <svg
      className="w-4 h-4 text-[#4A7FB0]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 4h1a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1" />
      <rect x="9" y="2" width="6" height="4" rx="1" />
      <path d="M9 12h6" />
      <path d="M9 16h3" />
    </svg>
  )
}

export default TeacherDashboard

