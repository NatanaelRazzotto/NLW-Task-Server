import { z } from 'zod'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { createGoal } from '../../functions/create-goal'

export const createGoalRoute: FastifyPluginAsyncZod = async (app, _opts) => {
  app.post(
    '/goals',
    {
      schema: {
        body: z.object({
          title: z.string(),
          desiredWeekFrequency: z.number().int().min(1).max(7),
        }),
      },
    },
    async request => {
      //   const createGoalSchema = z.object({
      //     title: z.string(),
      //     desiredWeekFrequency: z.number().int().min(1).max(7),
      //   })

      //  const body = createGoalSchema.parse(request.body)

      const { title, desiredWeekFrequency } = request.body

      await createGoal({
        title,
        desiredWeekFrequency,
      })
    }
  )
}
