#!/usr/bin/env node

import process from 'node:process'
import mri from 'mri'
import { x } from 'tinyexec'

function printHelp() {
  console.log([
    'Usage: refork <project>',
    '   Create a new project in the current directory',
    '   and copy the contents of the project to the new project',
    '   and remove the project from the current directory',
  ].join('\n'))
}

async function main() {
  const args = mri(process.argv.slice(2))

  if (args.help) {
    printHelp()
    process.exit(0)
  }

  const project = args._[0]

  if (!project) {
    printHelp()
    process.exit(1)
  }

  const command = args._[0]
  if (!command) {
    printHelp()
    process.exit(1)
  }

  await x(command, args._.slice(1))
}

try {
  await main()
}
catch (error) {
  console.error(error)
  process.exit(1)
}
