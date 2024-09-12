import { and, count, eq, gte, lte, sql } from 'drizzle-orm'
import { db } from '../db'
import { goalCompletions, goals } from '../db/schema'
import dayjs from 'dayjs'

export async function getWeekSummary() {
  const firstDayOfWeek = dayjs().startOf('week').toDate()
  const lastDayOfWeek = dayjs().endOf('week').toDate()

  const goalsCreateUpToWeek = db.$with('goals_created_up_to_week').as(
    db
      .select({
        id: goals.id,
        title: goals.title,
        desiredWeekFrequency: goals.desiredWeekFrequency,
        createdAt: goals.createdAt,
      })
      .from(goals)
      .where(lte(goals.createdAt, lastDayOfWeek))
  )

  const goalsCompletedInWeek = db.$with('goal_completion_counts').as(
    db
      .select({
        id: goalCompletions.id,
        title: goals.title,
        completedAt: goalCompletions.createdAt,
        completedAtDate: sql`
          DATE(${goalCompletions.createdAt})
        `.as('completedAtDate'),
        //createdAt: goalCompletions.createdAt,
      })
      .from(goalCompletions)
      .innerJoin(goals, eq(goals.id, goalCompletions.goalId))
      .where(
        and(
          gte(goalCompletions.createdAt, firstDayOfWeek),
          lte(goalCompletions.createdAt, lastDayOfWeek)
        )
      )
  )

  type goalsPeerDay = Record<string, {
    id : string,
    title : string,
    completedAt : string
  }[]>

  const goalsCompleteByWeekDay = db.$with('goals_completed_by_week_day').as(
    db
      .select({
        completedAtdate: goalsCompletedInWeek.completedAtDate,
        completions: sql`
            JSON_AGG(
              JSON_BUILD_OBJECT(
                'id', ${goalsCompletedInWeek.id},
                'title', ${goalsCompletedInWeek.title},
                'completedAt', ${goalsCompletedInWeek.completedAt}
              )
            )
          `.as('completions'),
      })
      .from(goalsCompletedInWeek)
      .groupBy(goalsCompletedInWeek.completedAtDate)
  )

  const result = await db
    .with(goalsCreateUpToWeek, goalsCompletedInWeek, goalsCompleteByWeekDay)
    .select({
      completed: sql`(SELECT COUNT(*) FROM ${goalsCompletedInWeek})`.mapWith(
        Number
      ),
      total:
        sql`(SELECT SUM(${goalsCreateUpToWeek.desiredWeekFrequency}) FROM ${goalsCreateUpToWeek})`.mapWith(
          Number
        ),
      goalsPeerDay: sql <goalsPeerDay>`
          JSON_OBJECT_AGG(
          ${goalsCompleteByWeekDay.completedAtdate},
          ${goalsCompleteByWeekDay.completions}
          )
        `,
    })
    .from(goalsCompleteByWeekDay)

  return {
    summary : result[0]
  }
}
