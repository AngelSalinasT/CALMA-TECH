import { useMemo } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, CalendarDays, Users2, ClipboardList, AlertTriangle } from 'lucide-react'

import { MOCK_DASHBOARD } from '../data/teacherMock'

function TeacherGroupAttendance() {
  const { courseId, groupId } = useParams()
  const navigate = useNavigate()

  const { course, group } = useMemo(() => {
    const courseMatch = MOCK_DASHBOARD.courses.find((item) => item.id === courseId) || MOCK_DASHBOARD.courses[0]
    const groupMatch = courseMatch.groups.find((item) => item.id === groupId) || courseMatch.groups[0]
    return { course: courseMatch, group: groupMatch }
  }, [courseId, groupId])

  const attendanceMatrix = group.attendanceMatrix || []
  const roster = group.roster || []
  const supportNotes = (group.pendingSupport || [])

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-full border border-slate-200 hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-slate-600" />
            </button>
            <div>
              <p className="text-xs uppercase text-gray-500 tracking-widest">{course.title}</p>
              <h1 className="text-xl font-bold text-[#2F4A6A]">
                Lista de asistencia · {group.label}
              </h1>
              <p className="text-xs text-gray-500">{group.schedule}</p>
            </div>
          </div>
          <Link
            to={`/dashboard/profesor/grupos/${course.id}/${group.id}/calificaciones`}
            className="text-sm font-semibold text-[#5B8FC3] hover:underline"
          >
            Cambiar a calificaciones →
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <HighlightCard
            icon={<Users2 className="w-5 h-5 text-[#5B8FC3]" />}
            label="Asistencia del mes"
            value={`${group.attendance}%`}
            hint="Promedio general de sesiones registradas"
          />
          <HighlightCard
            icon={<CalendarDays className="w-5 h-5 text-[#4A7FB0]" />}
            label="Sesiones registradas"
            value={attendanceMatrix.length * 3}
            hint="Incluye clases ordinarias y reforzamientos"
          />
          <HighlightCard
            icon={<AlertTriangle className="w-5 h-5 text-amber-500" />}
            label="Alertas por ausencia"
            value={group.pendingSupport.filter((item) => item.tag === 'Asistencia').length || '0'}
            hint="Estudiantes con más de 2 faltas consecutivas"
          />
        </section>

        <section className="bg-white rounded-2xl border border-slate-100 shadow-sm">
          <header className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Sesiones recientes</h2>
              <p className="text-sm text-gray-500">
                Marca las asistencias de la sesión actual y guarda cambios cuando termines.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-4 py-2 rounded-full border border-[#5B8FC3] text-[#5B8FC3] text-sm font-semibold hover:bg-[#5B8FC3] hover:text-white transition-colors">
                Guardar asistencia
              </button>
              <button className="px-4 py-2 rounded-full border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-100 transition-colors">
                Exportar CSV
              </button>
            </div>
          </header>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-left text-xs uppercase tracking-wider text-gray-500">
                  <th className="px-6 py-3 font-semibold">Alumno</th>
                  {attendanceMatrix.map((session) => (
                    <th key={session.date} className="px-4 py-3 font-semibold text-center">
                      {session.date}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {roster.map((student, index) => (
                  <tr key={student.id} className="hover:bg-slate-50/60">
                    <td className="px-6 py-3">
                      <p className="font-semibold text-gray-900">{student.name}</p>
                      <p className="text-xs text-gray-500">{student.email}</p>
                    </td>
                    {attendanceMatrix.map((session) => {
                      const status = session.status[index] ?? '—'
                      const { label, badgeClass } = resolveStatus(status)
                      return (
                        <td key={`${student.id}-${session.date}`} className="px-4 py-3 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badgeClass}`}>
                            {label}
                          </span>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Notas rápidas para seguimiento</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {supportNotes
              .filter((item) => item.tag === 'Asistencia' || item.tag === 'Bienestar')
              .map((item) => (
                <div key={item.name} className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-sm font-semibold text-amber-900">{item.name}</p>
                  <p className="text-xs text-amber-700 mt-1">{item.note}</p>
                </div>
              ))}
            {!supportNotes.length && (
              <p className="text-sm text-gray-500">
                No hay incidencias registradas en este grupo por ahora.
              </p>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}

function HighlightCard({ icon, label, value, hint }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 border border-slate-100 flex flex-col gap-2">
      <div className="flex items-center gap-2 text-xs text-gray-500 uppercase tracking-wide">
        {icon}
        <span>{label}</span>
      </div>
      <span className="text-2xl font-bold text-[#2F4A6A]">{value}</span>
      <p className="text-xs text-gray-500 leading-relaxed">{hint}</p>
    </div>
  )
}

function resolveStatus(status) {
  switch (status) {
    case '✓':
      return { label: 'Presente', badgeClass: 'bg-emerald-100 text-emerald-700' }
    case 'Ret':
      return { label: 'Retardo', badgeClass: 'bg-amber-100 text-amber-700' }
    case '✕':
      return { label: 'Ausencia', badgeClass: 'bg-rose-100 text-rose-700' }
    default:
      return { label: status, badgeClass: 'bg-slate-100 text-slate-600' }
  }
}

export default TeacherGroupAttendance

