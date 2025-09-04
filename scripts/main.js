#!/usr/bin/env node

import process from 'node:process'
import mri from 'mri'
import { initRepo } from './init-repo.js'
import { copyProject } from './refork.js'
import { replaceSymbols } from './replace-symbols.js'

function printHelp() {
  console.log(`
Usage: node scripts/main.js <command> [options]

Commands:
  copy <destination>                      Copy project files to destination
  replace <destination> <project-name>    Replace symbols in destination
  init <destination> <project-name> <organization> Initialize Git repo and push to GitHub (default organization: shortpoet)
  all <destination> <project-name>        Run all steps (copy, replace, init)

Options:
  --public                                Create public GitHub repository (default: private)
  --force                                 Overwrite existing destination directory
  --help                                  Show this help message

Examples:
  node scripts/main.js copy ../my-new-project
  node scripts/main.js replace ../my-new-project my-awesome-lib
  node scripts/main.js init ../my-new-project my-awesome-lib shortpoet-dots --public
  node scripts/main.js all ../my-new-project my-awesome-lib
`.trim())
}

async function main() {
  const args = mri(process.argv.slice(2))

  if (args.help || args._.length === 0) {
    printHelp()
    process.exit(0)
  }

  const command = args._[0]
  const destination = args._[1]
  const projectName = args._[2]
  const organization = args._[3]
  const isPublic = args.public || false
  const force = args.force || false

  try {
    switch (command) {
      case 'copy':
        if (!destination) {
          console.error('Error: Destination path is required')
          printHelp()
          process.exit(1)
        }
        await copyProject(destination, force)
        break

      case 'replace':
        if (!destination || !projectName) {
          console.error('Error: Destination and project name are required')
          printHelp()
          process.exit(1)
        }
        await replaceSymbols(destination, projectName, organization)
        break

      case 'init':
        if (!destination || !projectName) {
          console.error('Error: Destination and project name are required')
          printHelp()
          process.exit(1)
        }
        await initRepo(destination, projectName, organization, isPublic)
        break

      case 'all':
        if (!destination || !projectName) {
          console.error('Error: Destination and project name are required')
          printHelp()
          process.exit(1)
        }
        console.log('🚀 Running full refork process...\n')
        await copyProject(destination, force)
        console.log('')
        await replaceSymbols(destination, projectName, organization)
        console.log('')
        await initRepo(destination, projectName, organization, isPublic)
        console.log('\n🎉 Refork complete!')
        break

      default:
        console.error(`Error: Unknown command "${command}"`)
        printHelp()
        process.exit(1)
    }
  }
  catch (error) {
    console.error('Error:', error.message)
    process.exit(1)
  }
}

main()
