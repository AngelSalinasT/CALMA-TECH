export const DEFAULT_TEACHER = {
  name: 'Ana López',
  email: 'ana.lopez@calmatech.com',
  role: 'profesor',
  picture: null
}

export const MOCK_DASHBOARD = {
  stats: [
    {
      id: 'courses',
      label: 'Cursos activos',
      value: 5,
      hint: 'Incluye dos grupos de Matemáticas III',
      iconType: 'book'
    },
    {
      id: 'students',
      label: 'Estudiantes',
      value: 148,
      hint: 'Repartidos en 3° y 4° semestre',
      iconType: 'users'
    },
    {
      id: 'attendance',
      label: 'Asistencia promedio',
      value: '93%',
      hint: '↑ 2% vs. semana pasada',
      iconType: 'calendar'
    },
    {
      id: 'submissions',
      label: 'Entregas puntuales',
      value: '88%',
      hint: 'En la última quincena',
      iconType: 'clipboard'
    }
  ],
  attendanceByGroup: [
    { label: 'Matemáticas III · 3A', value: 95 },
    { label: 'Matemáticas III · 3B', value: 91 },
    { label: 'Pensamiento Lógico · 4A', value: 89 },
    { label: 'Pensamiento Lógico · 4B', value: 86 },
    { label: 'Tutoría Socioemocional', value: 92 }
  ],
  submissionsByGroup: [
    { label: 'Proyecto Integrador', onTime: 92, late: 6 },
    { label: 'Portafolio Digital', onTime: 84, late: 11 },
    { label: 'Quiz diagnóstico', onTime: 96, late: 2 },
    { label: 'Ensayo reflexión', onTime: 78, late: 15 }
  ],
  gradeByGroup: [
    { label: 'Matemáticas III · 3A', value: 8.6, delta: '+0.3' },
    { label: 'Matemáticas III · 3B', value: 8.2, delta: '+0.1' },
    { label: 'Pensamiento Lógico · 4A', value: 8.8, delta: '+0.5' },
    { label: 'Pensamiento Lógico · 4B', value: 8.1, delta: '-0.2' }
  ],
  courses: [
    {
      id: 'math3',
      title: 'Matemáticas III',
      gradeLevel: '3° de secundaria',
      icon: '📐',
      groups: [
        {
          id: 'math3A',
          label: 'Grupo 3A',
          schedule: 'Lun · Mié · Vie · 08:00 - 09:30',
          students: 33,
          attendance: 95,
          avgGrade: 8.6,
          submissions: 90,
          wellbeing: 'Estable',
          insights: [
            '3 estudiantes con asistencia menor a 80%.',
            'El promedio del último examen subió 0.4 pts.'
          ],
          attendanceTrend: [
            { label: 'Sem 1', value: 92 },
            { label: 'Sem 2', value: 93 },
            { label: 'Sem 3', value: 95 },
            { label: 'Sem 4', value: 94 }
          ],
          upcoming: [
            { title: 'Evaluación Formativa', due: 'Lunes 11 · 08:00', type: 'evaluación' },
            { title: 'Proyecto “Geometría en la vida real”', due: 'Viernes 15 · 23:59', type: 'proyecto' }
          ],
          topStudents: [
            { name: 'María Hernández', score: 9.6, submissions: '100%' },
            { name: 'Raúl Martínez', score: 9.2, submissions: '96%' },
            { name: 'Dana Ruiz', score: 9.1, submissions: '93%' }
          ],
          pendingSupport: [
            { name: 'Iván Gutiérrez', note: 'Faltó 2 clases seguidas', tag: 'Asistencia' },
            { name: 'Sofía Cabrera', note: 'Entrega tardía recurrente', tag: 'Entrega' }
          ],
          roster: [
            { id: 'S-301', name: 'María Hernández', email: 'maria.hernandez@calmatech.com', attendance: '98%', average: 9.6 },
            { id: 'S-302', name: 'Raúl Martínez', email: 'raul.martinez@calmatech.com', attendance: '94%', average: 9.2 },
            { id: 'S-303', name: 'Dana Ruiz', email: 'dana.ruiz@calmatech.com', attendance: '96%', average: 9.1 },
            { id: 'S-304', name: 'Iván Gutiérrez', email: 'ivan.gutierrez@calmatech.com', attendance: '72%', average: 7.1 },
            { id: 'S-305', name: 'Sofía Cabrera', email: 'sofia.cabrera@calmatech.com', attendance: '88%', average: 7.4 }
          ],
          attendanceMatrix: [
            { date: 'Lun 4', status: ['✓', '✓', '✓', '✕', '✓'] },
            { date: 'Mié 6', status: ['✓', '✓', '✓', '✕', '✓'] },
            { date: 'Vie 8', status: ['Ret', '✓', '✓', '✓', 'Ret'] }
          ],
          gradebook: [
            { name: 'María Hernández', rubric: 'Proyecto Geometría', score: 95, feedback: 'Excelente aplicación de conceptos.' },
            { name: 'Raúl Martínez', rubric: 'Proyecto Geometría', score: 92, feedback: 'Buen trabajo en equipo.' },
            { name: 'Dana Ruiz', rubric: 'Proyecto Geometría', score: 90, feedback: 'Argumentó con claridad.' },
            { name: 'Iván Gutiérrez', rubric: 'Proyecto Geometría', score: 68, feedback: 'Revisar fundamentos básicos.' },
            { name: 'Sofía Cabrera', rubric: 'Proyecto Geometría', score: 72, feedback: 'Entregar a tiempo la sección faltante.' }
          ]
        },
        {
          id: 'math3B',
          label: 'Grupo 3B',
          schedule: 'Mar · Jue · Vie · 09:40 - 11:10',
          students: 31,
          attendance: 91,
          avgGrade: 8.2,
          submissions: 84,
          wellbeing: 'Necesita revisar',
          insights: [
            'El 18% requiere reforzamiento en ecuaciones.',
            'Dos estudiantes con reportes de estrés académico.'
          ],
          attendanceTrend: [
            { label: 'Sem 1', value: 88 },
            { label: 'Sem 2', value: 90 },
            { label: 'Sem 3', value: 92 },
            { label: 'Sem 4', value: 91 }
          ],
          upcoming: [
            { title: 'Actividad de repaso', due: 'Martes 12 · 09:40', type: 'actividad' },
            { title: 'Entrega bitácora de estudio', due: 'Jueves 14 · 23:59', type: 'bitácora' }
          ],
          topStudents: [
            { name: 'Aline Torres', score: 9.4, submissions: '98%' },
            { name: 'Luis Ángel Pérez', score: 9.0, submissions: '94%' },
            { name: 'Ariadna Cano', score: 8.9, submissions: '92%' }
          ],
          pendingSupport: [
            { name: 'Diego Sánchez', note: 'Promedio 6.8 en últimos quizzes', tag: 'Desempeño' },
            { name: 'Alexa Jiménez', note: 'Reporte de ansiedad por cargas', tag: 'Bienestar' }
          ],
          roster: [
            { id: 'S-321', name: 'Aline Torres', email: 'aline.torres@calmatech.com', attendance: '96%', average: 9.4 },
            { id: 'S-322', name: 'Luis Ángel Pérez', email: 'luis.perez@calmatech.com', attendance: '91%', average: 9.0 },
            { id: 'S-323', name: 'Ariadna Cano', email: 'ariadna.cano@calmatech.com', attendance: '93%', average: 8.9 },
            { id: 'S-324', name: 'Diego Sánchez', email: 'diego.sanchez@calmatech.com', attendance: '76%', average: 6.8 },
            { id: 'S-325', name: 'Alexa Jiménez', email: 'alexa.jimenez@calmatech.com', attendance: '82%', average: 7.1 }
          ],
          attendanceMatrix: [
            { date: 'Mar 5', status: ['✓', '✓', '✓', '✕', '✓'] },
            { date: 'Jue 7', status: ['✓', 'Ret', '✓', '✓', '✓'] },
            { date: 'Vie 8', status: ['✓', '✓', 'Ret', '✓', '✕'] }
          ],
          gradebook: [
            { name: 'Aline Torres', rubric: 'Resolución ecuaciones', score: 94, feedback: 'Excelente dominio.' },
            { name: 'Luis Ángel Pérez', rubric: 'Resolución ecuaciones', score: 91, feedback: 'Buen progreso.' },
            { name: 'Ariadna Cano', rubric: 'Resolución ecuaciones', score: 90, feedback: 'Argumentación clara.' },
            { name: 'Diego Sánchez', rubric: 'Resolución ecuaciones', score: 68, feedback: 'Requiere apoyo adicional.' },
            { name: 'Alexa Jiménez', rubric: 'Resolución ecuaciones', score: 74, feedback: 'Organizar plan de estudio.' }
          ]
        }
      ]
    },
    {
      id: 'logic4',
      title: 'Pensamiento Lógico y Programación',
      gradeLevel: '4° de secundaria',
      icon: '💡',
      groups: [
        {
          id: 'logic4A',
          label: 'Grupo 4A',
          schedule: 'Lun · Mié · Vie · 11:30 - 13:00',
          students: 29,
          attendance: 89,
          avgGrade: 8.8,
          submissions: 86,
          wellbeing: 'En seguimiento',
          insights: [
            'Equipo Beta lidera el proyecto de apps educativas.',
            'Planificar acompañamiento a 2 alumnos con ausencias consecutivas.'
          ],
          attendanceTrend: [
            { label: 'Sem 1', value: 87 },
            { label: 'Sem 2', value: 88 },
            { label: 'Sem 3', value: 90 },
            { label: 'Sem 4', value: 89 }
          ],
          upcoming: [
            { title: 'Demo de prototipos', due: 'Miércoles 13 · 12:30', type: 'presentación' },
            { title: 'Encuesta de bienestar', due: 'Viernes 15 · 18:00', type: 'bienestar' }
          ],
          topStudents: [
            { name: 'Gael Fernández', score: 9.7, submissions: '100%' },
            { name: 'Fernanda Mora', score: 9.3, submissions: '97%' },
            { name: 'Itzel Vega', score: 9.1, submissions: '95%' }
          ],
          pendingSupport: [
            { name: 'Renata Ochoa', note: 'Atraso en proyecto final', tag: 'Entrega' },
            { name: 'Mario Quiroz', note: 'Necesita reforzar estructuras condicionales', tag: 'Contenido' }
          ],
          roster: [
            { id: 'S-401', name: 'Gael Fernández', email: 'gael.fernandez@calmatech.com', attendance: '95%', average: 9.7 },
            { id: 'S-402', name: 'Fernanda Mora', email: 'fernanda.mora@calmatech.com', attendance: '92%', average: 9.3 },
            { id: 'S-403', name: 'Itzel Vega', email: 'itzel.vega@calmatech.com', attendance: '90%', average: 9.1 }
          ],
          attendanceMatrix: [
            { date: 'Lun 4', status: ['✓', '✓', 'Ret'] },
            { date: 'Mié 6', status: ['✓', '✓', '✓'] },
            { date: 'Vie 8', status: ['✓', 'Ret', '✓'] }
          ],
          gradebook: [
            { name: 'Gael Fernández', rubric: 'Prototipo app', score: 96, feedback: 'Innovación destacada.' },
            { name: 'Fernanda Mora', rubric: 'Prototipo app', score: 94, feedback: 'Interfaz clara.' },
            { name: 'Itzel Vega', rubric: 'Prototipo app', score: 92, feedback: 'Excelente trabajo colaborativo.' }
          ]
        },
        {
          id: 'logic4B',
          label: 'Grupo 4B',
          schedule: 'Mar · Jue · Vie · 07:00 - 08:30',
          students: 27,
          attendance: 86,
          avgGrade: 8.1,
          submissions: 80,
          wellbeing: 'Atención prioritaria',
          insights: [
            'Los lunes han presentado mayor inasistencia.',
            'Organizar tutoría grupal para repasar algoritmos.'
          ],
          attendanceTrend: [
            { label: 'Sem 1', value: 83 },
            { label: 'Sem 2', value: 85 },
            { label: 'Sem 3', value: 86 },
            { label: 'Sem 4', value: 87 }
          ],
          upcoming: [
            { title: 'Reunión con tutores', due: 'Jueves 14 · 07:00', type: 'reunión' },
            { title: 'Entrega cuaderno de evidencias', due: 'Viernes 15 · 12:00', type: 'evidencia' }
          ],
          topStudents: [
            { name: 'Monserrat Leal', score: 9.2, submissions: '95%' },
            { name: 'Jared Cortés', score: 8.8, submissions: '92%' },
            { name: 'Said Aburto', score: 8.6, submissions: '90%' }
          ],
          pendingSupport: [
            { name: 'Valeria Rojas', note: 'Faltó 3 clases este mes', tag: 'Asistencia' },
            { name: 'Kevin Salas', note: 'Necesita acompañamiento emocional', tag: 'Bienestar' }
          ],
          roster: [
            { id: 'S-421', name: 'Monserrat Leal', email: 'monserrat.leal@calmatech.com', attendance: '90%', average: 9.2 },
            { id: 'S-422', name: 'Jared Cortés', email: 'jared.cortes@calmatech.com', attendance: '86%', average: 8.8 },
            { id: 'S-423', name: 'Said Aburto', email: 'said.aburto@calmatech.com', attendance: '84%', average: 8.6 }
          ],
          attendanceMatrix: [
            { date: 'Mar 5', status: ['Ret', '✓', '✓'] },
            { date: 'Jue 7', status: ['✓', '✕', '✓'] },
            { date: 'Vie 8', status: ['✓', 'Ret', '✕'] }
          ],
          gradebook: [
            { name: 'Monserrat Leal', rubric: 'Plan algorítmico', score: 90, feedback: 'Estructura clara.' },
            { name: 'Jared Cortés', rubric: 'Plan algorítmico', score: 86, feedback: 'Revisar casos límite.' },
            { name: 'Said Aburto', rubric: 'Plan algorítmico', score: 84, feedback: 'Buen trabajo, reforzar comentarios.' }
          ]
        }
      ]
    },
    {
      id: 'tutoring',
      title: 'Tutoría Socioemocional',
      gradeLevel: 'Grupos integrados',
      icon: '🧠',
      groups: [
        {
          id: 'tutA',
          label: 'Círculo de Bienestar Vespertino',
          schedule: 'Jueves · 13:30 - 14:30',
          students: 22,
          attendance: 92,
          avgGrade: null,
          submissions: null,
          wellbeing: 'Alta participación',
          insights: [
            'Se detectaron 2 casos que requieren derivación con psicopedagoga.',
            'El 68% reporta sentirse con mejor manejo del estrés.'
          ],
          attendanceTrend: [
            { label: 'Sem 1', value: 90 },
            { label: 'Sem 2', value: 94 },
            { label: 'Sem 3', value: 92 },
            { label: 'Sem 4', value: 93 }
          ],
          upcoming: [
            { title: 'Sesión de respiración consciente', due: 'Jueves 14 · 13:30', type: 'bienestar' },
            { title: 'Seguimiento individual', due: 'Viernes 15 · 16:00', type: 'seguimiento' }
          ],
          topStudents: [],
          pendingSupport: [
            { name: 'Grupo', note: 'Planear dinámica de gratitud para cerrar trimestre', tag: 'Actividad' }
          ],
          roster: [
            { id: 'S-501', name: 'Camila Soto', email: 'camila.soto@calmatech.com', attendance: '94%', average: null },
            { id: 'S-502', name: 'Erick Vázquez', email: 'erick.vazquez@calmatech.com', attendance: '88%', average: null },
            { id: 'S-503', name: 'Julia Ortega', email: 'julia.ortega@calmatech.com', attendance: '92%', average: null }
          ],
          attendanceMatrix: [
            { date: 'Jue 31', status: ['✓', '✓', '✓'] },
            { date: 'Jue 7', status: ['Ret', '✓', '✓'] }
          ],
          gradebook: []
        }
      ]
    }
  ]
}
