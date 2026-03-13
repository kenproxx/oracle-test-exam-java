import type { CourseDefinition } from '~~/types/course'

export const COURSE_CATALOG: CourseDefinition[] = [
  {
    id: 'oca-ocp-11',
    code: 'OCA/OCP 11',
    title: {
      vi: 'Luyen thi OCA/OCP Java 11',
      en: 'OCA/OCP Java 11 Prep'
    },
    shortDescription: {
      vi: 'Nen tang Java core, OOP, collections va stream API.',
      en: 'Core Java foundations, OOP, collections, and stream API.'
    },
    examMinutes: 90,
    passThreshold: 68,
    topics: [
      {
        id: 'assessment-test',
        title: { vi: 'Danh gia dau vao', en: 'Assessment Test' },
        lessons: [
          { vi: 'Java basics', en: 'Java basics' },
          { vi: 'Control flow', en: 'Control flow' }
        ]
      },
      {
        id: 'oop',
        title: { vi: 'Lap trinh huong doi tuong', en: 'Object-Oriented Programming' },
        lessons: [
          { vi: 'Inheritance', en: 'Inheritance' },
          { vi: 'Polymorphism', en: 'Polymorphism' }
        ]
      }
    ]
  },
  {
    id: 'ocp-17',
    code: 'OCP 17',
    title: {
      vi: 'Luyen thi OCP Java 17',
      en: 'OCP Java 17 Prep'
    },
    shortDescription: {
      vi: 'Nang cao stream, concurrency, modules va records.',
      en: 'Advanced streams, concurrency, modules, and records.'
    },
    examMinutes: 120,
    passThreshold: 70,
    topics: [
      {
        id: 'language-enhancements',
        title: { vi: 'Tinh nang ngon ngu', en: 'Language Enhancements' },
        lessons: [
          { vi: 'Records', en: 'Records' },
          { vi: 'Sealed classes', en: 'Sealed classes' }
        ]
      },
      {
        id: 'concurrency',
        title: { vi: 'Da luong', en: 'Concurrency' },
        lessons: [
          { vi: 'ExecutorService', en: 'ExecutorService' },
          { vi: 'Parallel streams', en: 'Parallel streams' }
        ]
      }
    ]
  },
  {
    id: 'ocp-21',
    code: 'OCP 21',
    title: {
      vi: 'Luyen thi OCP Java 21',
      en: 'OCP Java 21 Prep'
    },
    shortDescription: {
      vi: 'Modern Java 21: virtual threads, pattern matching, sequenced collections.',
      en: 'Modern Java 21: virtual threads, pattern matching, sequenced collections.'
    },
    examMinutes: 120,
    passThreshold: 72,
    topics: [
      {
        id: 'virtual-threads',
        title: { vi: 'Virtual threads', en: 'Virtual Threads' },
        lessons: [
          { vi: 'Thread model', en: 'Thread model' },
          { vi: 'Structured concurrency', en: 'Structured concurrency' }
        ]
      },
      {
        id: 'pattern-matching',
        title: { vi: 'Pattern matching', en: 'Pattern Matching' },
        lessons: [
          { vi: 'Switch patterns', en: 'Switch patterns' },
          { vi: 'Record patterns', en: 'Record patterns' }
        ]
      }
    ]
  },
  {
    id: 'ocm',
    code: 'OCM',
    title: {
      vi: 'Luyen thi Oracle Certified Master',
      en: 'Oracle Certified Master Prep'
    },
    shortDescription: {
      vi: 'Kich ban thuc chien thiet ke he thong Java cap cao.',
      en: 'Advanced real-world Java architecture scenarios.'
    },
    examMinutes: 150,
    passThreshold: 75,
    topics: [
      {
        id: 'architecture',
        title: { vi: 'Kien truc he thong', en: 'System Architecture' },
        lessons: [
          { vi: 'Domain boundaries', en: 'Domain boundaries' },
          { vi: 'Scalability patterns', en: 'Scalability patterns' }
        ]
      },
      {
        id: 'performance',
        title: { vi: 'Hieu nang va toi uu', en: 'Performance and Optimization' },
        lessons: [
          { vi: 'JVM tuning', en: 'JVM tuning' },
          { vi: 'Profiling', en: 'Profiling' }
        ]
      }
    ]
  }
]

export const COURSE_IDS = COURSE_CATALOG.map((course) => course.id)

export function getCourseById(courseId: string) {
  return COURSE_CATALOG.find((course) => course.id === courseId)
}
