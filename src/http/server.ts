import fastify from 'fastify'
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'
import { createGoal } from '../functions/create-goal'
import z from 'zod'

const app = fastify().withTypeProvider<ZodTypeProvider>()

// Add schema validator and serializer
app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

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

app
  .listen({
    port: 3333,
  })
  .then(() => {
    console.log('HTTP RUN')
  })
