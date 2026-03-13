export type OptionMap = Record<string, string>

export type QuestionItem = {
  topic: string
  question_number: number
  question: string
  options: OptionMap
  correct_answers: string[]
  explanation: string
  multi: boolean
}

export type QuestionSet = {
  questions: QuestionItem[]
}
