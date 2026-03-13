export type LocalizedText = {
  vi: string
  en: string
}

export type CourseTopic = {
  id: string
  title: LocalizedText
  lessons: LocalizedText[]
}

export type CourseDefinition = {
  id: string
  code: string
  title: LocalizedText
  shortDescription: LocalizedText
  examMinutes: number
  passThreshold: number
  topics: CourseTopic[]
}
