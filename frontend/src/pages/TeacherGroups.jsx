import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Users2, CalendarDays, ClipboardList, ArrowLeft, TrendingDown, Sparkles } from 'lucide-react'

import { MOCK_DASHBOARD } from '../data/teacherMock'

function TeacherGroups() {
  const navigate = useNavigate()
  const courses = useMemo(() => MOCK_DASHBOARD.courses, [])
  const [selectedCourseId, setSelectedCourseId] = useState(courses[0].id)

  const selectedCourse = useMemo(
    () => courses.find((course) => course.id === selectedCourseId) || courses[0],
    [courses, selectedCourseId]
  )

  const aggregatedCourses = useMemo(
    () =>
      courses.map((course) => {
        const totalStudents = course.groups.reduce((acc, group) => acc + group.students, 0)
        const attendanceAvg =
          Math.round(
            course.groups.reduce((acc, group) => acc + (group.attendance || 0), 0) /
              Math.max(course.groups.length, 1)
          ) || 0
        const warningStudents = course.groups.flatMap((group) => {
          const lowAttendance =
            (group.roster || []).filter((student) => parseAttendance(student.attendance) < 85).map((student) => ({
              name: student.name,
              reason: 'Asistencia baja',
              label: group.label
            }))
          const activityAlerts = (group.pendingSupport || [])
            .filter((item) => item.tag === 'Desempeño' || item.tag === 'Entrega')
            .map((item) => ({
              name: item.name,
              reason: item.note,
              label: group.label
            }))
          return [...lowAttendance, ...activityAlerts]
        })

        return {
          id: course.id,
          icon: course.icon,
          title: course.title,
          gradeLevel: course.gradeLevel,
          groups: course.groups.length,
          students: totalStudents,
          attendanceAvg,
          warningStudents
        }
      }),
    [courses]
  )

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-full border border-slate-200 hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-slate-600" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-[#2F4A6A]">Gestión de clases</h1>
              <p className="text-sm text-gray-500">Explora tus materias, grupos y focos de apoyo académico</p>
            </div>
          </div>
          <Link to="/dashboard/profesor" className="text-sm font-semibold text-[#5B8FC3] hover:underline">
            Volver al panel docente →
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {aggregatedCourses.map((course) => {
            const isActive = course.id === selectedCourseId
            return (
              <article
                key={course.id}
                className={`rounded-2xl border shadow-sm cursor-pointer transition-all ${
                  isActive ? 'border-[#5B8FC3] bg-[#E8F1FB]' : 'border-slate-100 bg-white hover:border-[#5B8FC3]/50'
                }`}
                onClick={() => setSelectedCourseId(course.id)}
              >
                <div className="p-5 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">{course.icon}</div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">{course.title}</h2>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">{course.gradeLevel}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <SmallMetric icon="👥" label="Grupos" value={course.groups} />
                    <SmallMetric icon="🎓" label="Estudiantes" value={course.students} />
                    <SmallMetric icon="📈" label="Asistencia" value={`${course.attendanceAvg}%`} />
                  </div>

                  <div className="border border-[#5B8FC3]/20 rounded-xl bg-white/80 p-3">
                    <p className="text-xs font-semibold text-[#5B8FC3] uppercase tracking-wide">
                      {course.warningStudents.length ? 'Focos de apoyo' : 'Sin alertas críticas'}
                    </p>
                    <ul className="mt-2 space-y-1 text-xs text-gray-600">
                      {course.warningStudents.slice(0, 3).map((alert, index) => (
                        <li key={`${alert.name}-${index}`} className="flex items-center gap-2">
                          <TrendingDown className="w-3 h-3 text-amber-500" />
                          <span>
                            {alert.name} · {alert.reason} ({alert.label})
                          </span>
                        </li>
                      ))}
                      {course.warningStudents.length > 3 && (
                        <li className="text-xs font-semibold text-[#5B8FC3]">
                          +{course.warningStudents.length - 3} estudiantes por revisar
                        </li>
                      )}
                      {!course.warningStudents.length && (
                        <li className="flex items-center gap-2 text-emerald-600">
                          <Sparkles className="w-3 h-3" />
                          <span>Buen ritmo general en los grupos</span>
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </article>
            )
          })}
        </section>

        <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
          <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-xs uppercase text-gray-500 tracking-widest">{selectedCourse.gradeLevel}</p>
              <h2 className="text-2xl font-bold text-gray-900">{selectedCourse.title}</h2>
              <p className="text-sm text-gray-500">
                Selecciona un grupo para tomar asistencia, registrar calificaciones o revisar apoyos personalizados.
              </p>
            </div>
            <Link
              to={`/dashboard/profesor/grupos/${selectedCourse.id}/${selectedCourse.groups[0].id}/asistencia`}
              className="px-4 py-2 rounded-full border border-[#5B8FC3] text-[#5B8FC3] font-semibold text-sm hover:bg-[#5B8FC3] hover:text-white transition-colors"
            >
              Ir al primer grupo →
            </Link>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {selectedCourse.groups.map((group) => {
              const lowAttendanceStudents = (group.roster || []).filter(
                (student) => parseAttendance(student.attendance) < 85
              )
              const lowActivityStudents = (group.pendingSupport || []).filter(
                (item) => item.tag === 'Desempeño' || item.tag === 'Entrega'
              )

              return (
                <article
                  key={group.id}
                  className="border border-slate-100 rounded-2xl p-5 shadow-sm bg-slate-50/40 flex flex-col gap-4"
                >
                  <header className="flex items-start justify-between gap-3">
                    <div>
                      <span className="inline-flex items-center gap-2 text-xs uppercase tracking-wide text-[#5B8FC3] font-semibold">
                        {selectedCourse.icon} {group.label}
                      </span>
                      <h3 className="text-lg font-semibold text-gray-900 mt-1">Grupo {group.label}</h3>
                      <p className="text-xs text-gray-500">{group.schedule}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <SmallMetric icon="👥" label="Estudiantes" value={group.students} />
                      <SmallMetric icon="📈" label="Prom." value={group.avgGrade ? group.avgGrade.toFixed(1) : '—'} />
                      <SmallMetric icon="🗓️" label="Asist." value={`${group.attendance}%`} />
                      <SmallMetric icon="✅" label="Entregas" value={group.submissions ? `${group.submissions}%` : 'N/A'} />
                    </div>
                  </header>

                  <div className="space-y-3">
                    <p className="text-xs uppercase text-gray-500 font-semibold">Focos personalizados</p>
                    <div className="space-y-2 text-sm">
                      {lowAttendanceStudents.slice(0, 2).map((student) => (
                        <ReferenceBadge
                          key={`attendance-${student.name}`}
                          tone="attendance"
                          name={student.name}
                          detail={`Asistencia al ${student.attendance}.`}
                        />
                      ))}
                      {lowActivityStudents.slice(0, 2).map((item) => (
                        <ReferenceBadge
                          key={`support-${item.name}`}
                          tone="performance"
                          name={item.name}
                          detail={item.note}
                        />
                      ))}
                      {!lowAttendanceStudents.length && !lowActivityStudents.length && (
                        <p className="text-xs text-gray-500">Por ahora todos los estudiantes mantienen un ritmo saludable.</p>
                      )}
                    </div>
                  </div>

                  <footer className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm mt-2">
                    <Link
                      to={`/dashboard/profesor/grupos/${selectedCourse.id}/${group.id}/asistencia`}
                      className="px-4 py-2 rounded-full border border-[#5B8FC3] text-[#5B8FC3] font-semibold text-center hover:bg-[#5B8FC3] hover:text-white transition-colors"
                    >
                      Tomar asistencia
                    </Link>
                    <Link
                      to={`/dashboard/profesor/grupos/${selectedCourse.id}/${group.id}/calificaciones`}
                      className="px-4 py-2 rounded-full border border-[#4A7FB0] text-[#4A7FB0] font-semibold text-center hover:bg-[#4A7FB0] hover:text-white transition-colors"
                    >
                      Registrar calificaciones
                    </Link>
                    <button className="px-4 py-2 rounded-full border border-slate-200 text-slate-600 font-semibold hover:bg-slate-100 transition-colors">
                      Plan de apoyo
                    </button>
                  </footer>
                </article>
              )
            })}
          </div>
        </section>
      </main>
    </div>
  )
}

function SmallMetric({ icon, label, value }) {
  return (
    <div className="px-3 py-2 rounded-xl bg-white border border-slate-200 flex flex-col gap-1">
      <div className="flex items-center gap-1 text-xs text-gray-500 uppercase tracking-wide">
        <span>{icon}</span>
        <span>{label}</span>
      </div>
      <span className="text-sm font-semibold text-[#2F4A6A]">{value}</span>
    </div>
  )
}

function ReferenceBadge({ name, detail, tone }) {
  const palette =
    tone === 'attendance'
      ? { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800', chip: 'bg-amber-100 text-amber-700' }
      : { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-800', chip: 'bg-rose-100 text-rose-700' }

  return (
    <div className={`p-3 rounded-xl border ${palette.border} ${palette.bg}`}>
      <p className={`text-sm font-semibold ${palette.text}`}>{name}</p>
      <p className={`text-xs ${palette.text} mt-1`}>{detail}</p>
      <span className={`inline-flex text-[10px] font-semibold px-2 py-1 rounded-full mt-2 ${palette.chip}`}>
        Requiere seguimiento
      </span>
    </div>
  )
}

function parseAttendance(value) {
  if (!value) return 100
  const numeric = parseInt(String(value).replace('%', '').trim(), 10)
  return Number.isFinite(numeric) ? numeric : 100
}

export default TeacherGroups
