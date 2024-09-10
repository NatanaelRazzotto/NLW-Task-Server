import { date } from 'drizzle-orm/mysql-core'
import { client, db } from '.'
import { goalCompletions, goals } from './schema'

async function seed() {
  await db.delete(goalCompletions)
  await db.delete(goals)

  const result = await db
    .insert(goals)
    .values([
      { title: 'acordar', desiredWeekFrequency: 5 },
      { title: 'estudar', desiredWeekFrequency: 3 },
    ])
    .returning()

  await db
    .insert(goalCompletions)
    .values([{ goalId: result[0].id, createdAt: new Date() }])
}

seed().finally(() => {
  client.end()
})
