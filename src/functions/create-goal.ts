import { db } from '../db'
import { goals } from '../db/schema'

interface CreateGoalRequest {
  title: string
  desiredWeekFrequency: number
}

export async function createGoal({
  title,
  desiredWeekFrequency,
}: CreateGoalRequest) {
  const result = await db
    .insert(goals)
    .values({
      title,
      desiredWeekFrequency,
    })
    .returning()

  const goal = result[0]

  return {
    goal,
  }
}
