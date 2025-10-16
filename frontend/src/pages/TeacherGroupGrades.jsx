import { useMemo } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, TrendingUp, Award, ClipboardList, Users2 } from 'lucide-react'

import { MOCK_DASHBOARD } from '../data/teacherMock'

function TeacherGroupGrades() {
  const { courseId, groupId } = useParams()
  const navigate = useNavigate()

  const { course, group } = useMemo(() => {
    const courseMatch = MOCK_DASHBOARD.courses.find((item) => item.id === courseId) || MOCK_DASHBOARD.courses[0]
    const groupMatch = courseMatch.groups.find((item) => item.id === groupId) || courseMatch.groups[0]
    return { course: courseMatch, group: groupMatch }
  }, [courseId, groupId])

  const gradebook = group.gradebook || []
  const roster = group.roster || []
  const supportNotes = group.pendingSupport || []

  const excellenceCount = gradebook.filter((entry) => entry.score >= 90).length
  const supportCount = supportNotes.filter((item) => item.tag === 'Desempeño' || item.tag === 'Entrega').length

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
              <h1 className="text-xl font-bold text-[#2F4A6A]">Calificaciones · {group.label}</h1>
              <p className="text-xs text-gray-500">{group.schedule}</p>
            </div>
          </div>
          <Link
            to={`/dashboard/profesor/grupos/${course.id}/${group.id}/asistencia`}
            className="text-sm font-semibold text-[#5B8FC3] hover:underline"
          >
            Cambiar a asistencia →
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <GradeHighlight
            icon={<TrendingUp className="w-5 h-5 text-emerald-500" />}
            label="Promedio del grupo"
            value={group.avgGrade ? group.avgGrade.toFixed(1) : '—'}
            hint="Última evaluación quincenal"
          />
          <GradeHighlight
            icon={<Award className="w-5 h-5 text-[#5B8FC3]" />}
            label="Excelencia académica"
            value={`${excellenceCount} alumnos`}
            hint="≥ 9.0 en la rúbrica principal"
          />
          <GradeHighlight
            icon={<ClipboardList className="w-5 h-5 text-[#4A7FB0]" />}
            label="Entregas recientes"
            value={`${gradebook.length} rúbricas`}
            hint="Evaluaciones calificadas esta semana"
          />
          <GradeHighlight
            icon={<Users2 className="w-5 h-5 text-amber-500" />}
            label="Requiere seguimiento"
            value={supportCount}
            hint="Refuerzo o acompañamiento individual"
          />
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <header className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Rúbrica: {gradebook[0]?.rubric || 'Proyecto integrador'}</h2>
                <p className="text-sm text-gray-500">
                  Revisa los resultados y registra retroalimentación personalizada.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button className="px-4 py-2 rounded-full border border-[#5B8FC3] text-[#5B8FC3] text-sm font-semibold hover:bg-[#5B8FC3] hover:text-white transition-colors">
                  Exportar
                </button>
                <button className="px-4 py-2 rounded-full border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-100 transition-colors">
                  Duplicar rúbrica
                </button>
              </div>
            </header>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-xs uppercase tracking-wider text-gray-500 text-left">
                    <th className="px-6 py-3 font-semibold">Alumno</th>
                    <th className="px-4 py-3 font-semibold">Calificación</th>
                    <th className="px-6 py-3 font-semibold">Retroalimentación</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {gradebook.map((entry) => (
                    <tr key={entry.name} className="hover:bg-slate-50/60">
                      <td className="px-6 py-3">
                        <p className="font-semibold text-gray-900">{entry.name}</p>
                        <p className="text-xs text-gray-500">
                          {roster.find((student) => student.name === entry.name)?.email || 'correo@calmatech.com'}
                        </p>
                      </td>
                      <td className="px-4 py-3 font-semibold text-[#2F4A6A]">{entry.score}</td>
                      <td className="px-6 py-3 text-sm text-gray-600">{entry.feedback}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Siguientes pasos sugeridos</h3>
              <ul className="mt-3 space-y-2 text-sm text-gray-600 list-disc list-inside">
                <li>Programar retroalimentación grupal sobre los criterios de éxito.</li>
                <li>Compartir ejemplos de entregas destacadas (con permiso de estudiantes).</li>
                <li>Coordinar tutorías rápidas para quienes van abajo de 7.5.</li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Alertas académicas</h3>
              <div className="mt-3 space-y-3">
                {supportNotes
                  .filter((item) => item.tag === 'Desempeño' || item.tag === 'Entrega')
                  .map((item) => (
                    <div key={item.name} className="p-4 bg-rose-50 border border-rose-200 rounded-xl">
                      <p className="text-sm font-semibold text-rose-900">{item.name}</p>
                      <p className="text-xs text-rose-700 mt-1">{item.note}</p>
                      <button className="text-xs font-semibold text-rose-600 hover:underline mt-2">
                        Agendar tutoría →
                      </button>
                    </div>
                  ))}
                {!supportCount && (
                  <p className="text-sm text-gray-500">
                    No hay estudiantes con alertas de desempeño en este periodo.
                  </p>
                )}
              </div>
            </div>

            <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/60">
              <p className="text-xs uppercase text-gray-500 font-semibold">Recordatorio</p>
              <p className="text-sm text-gray-600 mt-2">
                Las calificaciones finales se consolidarán el <strong>viernes 22 a las 18:00</strong>.
                Asegúrate de aprobar o rechazar las solicitudes de revisión antes de esa fecha.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

function GradeHighlight({ icon, label, value, hint }) {
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

export default TeacherGroupGrades

