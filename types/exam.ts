export type ExamMode = 'practice' | 'mock'

export type ExamQuestionState = {
  questionIndex: number
  questionNumber: number
  selectedAnswers: string[]
}

export type MockExamSubmission = {
  courseId: string
  answers: ExamQuestionState[]
  durationSeconds: number
  totalQuestions: number
}

export type ExamResult = {
  sessionId: string
  courseId: string
  score: number
  total: number
  percentage: number
  passed: boolean
  threshold: number
  submittedAt: string
  durationSeconds: number
  detailUnlocked: boolean
  details: Array<{
    questionNumber: number
    selectedAnswers: string[]
    correctAnswers: string[]
    isCorrect: boolean
    explanation: string
    question: string
  }>
}
