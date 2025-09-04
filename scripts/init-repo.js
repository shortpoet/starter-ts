#!/usr/bin/env node

import path from 'node:path'
import process from 'node:process'
import { x } from 'tinyexec'

async function initRepo(destination, projectName, organization = 'shortpoet', isPublic = false) {
  if (!destination) {
    console.error('Error: Destination path is required')
    process.exit(1)
  }

  if (!projectName) {
    console.error('Error: Project name is required')
    process.exit(1)
  }

  const destPath = path.resolve(destination)
  const visibility = isPublic ? 'public' : 'private'

  console.log(`Initializing Git repository in ${destPath}...`)

  try {
    // Check if GitHub CLI is authenticated
    console.log('  Checking GitHub CLI authentication...')
    const authResult = await x('gh', ['auth', 'status'], { throwOnError: false })

    if (authResult.exitCode !== 0) {
      const output = authResult.stderr || authResult.stdout || ''
      console.error('\n❌ GitHub CLI is not authenticated.')
      console.error('Output:', output.trim())
      console.error('Please run: gh auth login')
      console.error('Or set the GH_TOKEN environment variable with a GitHub API token')
      process.exit(1)
    }

    // Change to destination directory
    process.chdir(destPath)

    // Initialize git
    console.log('  Initializing git...')
    await x('git', ['init'])

    // Add all files
    console.log('  Adding files...')
    await x('git', ['add', '.'])

    // Create initial commit
    console.log('  Creating initial commit...')
    await x('git', ['commit', '-m', 'Initial commit from starter-ts'])

    // Create GitHub repository
    console.log(`  Creating GitHub repository (${visibility})...`)
    const createResult = await x('gh', [
      'repo',
      'create',
      `${organization}/${projectName}`,
      `--${visibility}`,
      '--source=.',
      '--remote=origin',
      '--push',
    ], { throwOnError: false })

    if (createResult.exitCode === 0) {
      console.log(`✅ Repository created and pushed to https://github.com/${organization}/${projectName}`)
    }
    else {
      const errorMsg = createResult.stderr || createResult.stdout || ''
      if (errorMsg.includes('already exists')) {
        console.log(`  Repository already exists, setting up remote...`)

        // Set up remote and push
        const addRemoteResult = await x('git', ['remote', 'add', 'origin', `git@github.com:${organization}/${projectName}.git`], { throwOnError: false })
        if (addRemoteResult.exitCode !== 0) {
          // Remote might already exist, update it
          await x('git', ['remote', 'set-url', 'origin', `git@github.com:${organization}/${projectName}.git`])
        }

        console.log(`  Pushing to existing repository...`)
        await x('git', ['push', '-u', 'origin', 'main', '--force'])
        console.log(`✅ Code pushed to existing repository: https://github.com/${organization}/${projectName}`)
      }
      else {
        // Re-throw with proper error handling
        throw new Error(`Failed to create repository: ${errorMsg}`)
      }
    }
  }
  catch (error) {
    // More specific error handling
    const errorMessage = error.stderr || error.stdout || error.message || 'Unknown error'

    if (errorMessage.includes('already exists')) {
      console.error(`\n❌ Error: Repository ${organization}/${projectName} already exists on GitHub`)
    }
    else if (errorMessage.includes('gh: command not found')) {
      console.error('\n❌ Error: GitHub CLI (gh) is not installed.')
      console.error('Please install it first: https://cli.github.com/')
    }
    else if (errorMessage.includes('HTTP 404') || errorMessage.includes('Not Found')) {
      console.error(`\n❌ Error: Organization '${organization}' not found or you don't have access`)
      console.error('Please check the organization name and your permissions')
    }
    else if (errorMessage.includes('HTTP 401') || errorMessage.includes('Unauthorized')) {
      console.error('\n❌ Error: Authentication failed')
      console.error('Please run: gh auth login')
    }
    else if (errorMessage.includes('HTTP 403') || errorMessage.includes('Forbidden')) {
      console.error(`\n❌ Error: Permission denied to create repository in ${organization}`)
      console.error('Please check your permissions for this organization')
    }
    else {
      console.error('\n❌ Error creating repository:')
      console.error(errorMessage)
      if (!errorMessage.includes('gh auth')) {
        console.error('\nTip: Make sure you are authenticated with: gh auth status')
      }
    }
    process.exit(1)
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const destination = process.argv[2]
  const projectName = process.argv[3]
  const organization = process.argv[4]
  const isPublic = process.argv.includes('--public')

  initRepo(destination, projectName, organization, isPublic).catch((error) => {
    console.error('Error:', error.message)
    process.exit(1)
  })
}

export { initRepo }
