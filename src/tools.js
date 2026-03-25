import { z } from 'zod'

void z

/**
 * Custom tools for the agent. Add your own tools here to extend the agent's
 * capabilities. Each tool needs a description, an input schema (using zod),
 * and a handler function.
 *
 * These tools are merged with the built-in tools from @chatbotkit/agent
 * (read, write, edit, exec) so you can focus on domain-specific functionality.
 */
export const customTools = {
  // Add your own tools here. Each tool needs a description, a zod input
  // schema, and an async handler function. Example:
  //
  // fetchUrl: {
  //   description: 'Fetch the contents of a URL',
  //   input: z.object({
  //     url: z.string().url().describe('The URL to fetch'),
  //   }),
  //   handler: async (input) => {
  //     const response = await fetch(input.url)
  //     const text = await response.text()
  //     return { success: true, content: text.slice(0, 5000) }
  //   },
  // },
}
