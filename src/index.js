#!/usr/bin/env node

/* eslint-disable no-console */
import 'dotenv/config'

import { customTools } from './tools.js'

import { tools as builtinTools, execute, loadAgent } from '@chatbotkit/agent'
import { ChatBotKit } from '@chatbotkit/sdk'

import { Command } from 'commander'

function getClient() {
  const secret = process.env.CHATBOTKIT_API_SECRET

  if (!secret) {
    console.error(
      'Error: CHATBOTKIT_API_SECRET is not set. Copy .env.example to .env and add your token.'
    )

    process.exit(1)
  }

  return new ChatBotKit({ secret })
}

const program = new Command()
  .name('agent')
  .description('Run a bespoke AI agent from the command line')
  .argument('<prompt>', 'The task or prompt for the agent to execute')
  .option('-a, --agent <path>', 'Path to an agent markdown file')
  .option('-m, --model <model>', 'Model to use', 'gpt-4o')
  .option('-b, --bot <id>', 'Use a ChatBotKit bot by ID')
  .option(
    '-i, --max-iterations <n>',
    'Maximum number of iterations',
    (v) => parseInt(v, 10),
    100
  )
  .option('--no-builtin-tools', 'Disable built-in file and exec tools')
  .option('-d, --debug', 'Print raw stream events to stderr')
  .action(async (prompt, options) => {
    const client = getClient()

    const agentDef = options.agent ? await loadAgent(options.agent) : null

    // Merge built-in tools (read, write, edit, exec) with custom tools
    const defaultBuiltins = Object.fromEntries(
      Object.entries(builtinTools).filter(([, tool]) => tool.default)
    )

    const tools = {
      ...(options.builtinTools ? defaultBuiltins : {}),
      ...customTools,
    }

    const botId = options.bot || agentDef?.botId
    const model = options.model || agentDef?.model

    const isInteractive = process.stdout.isTTY

    let exitResult = null

    for await (const { type, data } of execute({
      client,

      ...(botId ? { botId } : { model }),

      ...(agentDef?.backstory ? { backstory: agentDef.backstory } : {}),

      messages: [{ type: 'user', text: prompt }],

      tools,

      maxIterations: options.maxIterations,
    })) {
      if (options.debug) {
        process.stderr.write(`[debug] ${JSON.stringify({ type, data })}\n`)
      }

      if (type === 'iteration') {
        if (isInteractive) {
          console.log(`\n--- Iteration ${data.iteration} ---`)
        }
      } else if (type === 'toolCallStart') {
        if (isInteractive) {
          console.log(`  [tool] ${data.name} ...`)
        }
      } else if (type === 'toolCallEnd') {
        if (isInteractive) {
          console.log(`  [tool] ${data.name} done`)
        } else {
          console.log(JSON.stringify({ tool: data.name, result: data.result }))
        }
      } else if (type === 'toolCallError') {
        console.error(`  [tool] ${data.name} error: ${data.error}`)
      } else if (type === 'token') {
        if (isInteractive) {
          process.stdout.write(data.token)
        }
      } else if (type === 'exit') {
        exitResult = data
      } else if (type === 'message') {
        if (data.type === 'bot' && !isInteractive) {
          console.log(JSON.stringify({ message: data.text }))
        }
      }
    }

    if (isInteractive) {
      console.log('')
    }

    if (exitResult) {
      if (isInteractive && exitResult.message) {
        console.log(`\nDone (exit ${exitResult.code}): ${exitResult.message}`)
      }

      process.exit(exitResult.code)
    } else {
      console.error('Agent ended without calling exit')
      process.exit(1)
    }
  })

program.parse()
