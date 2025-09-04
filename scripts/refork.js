#!/usr/bin/env node

import { promises as fs } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { glob } from 'tinyglobby'

async function copyProject(destination, force = false) {
  if (!destination) {
    console.error('Error: Destination path is required')
    process.exit(1)
  }

  const destPath = path.resolve(destination)
  const srcPath = process.cwd()

  // Check if destination already exists
  try {
    await fs.access(destPath)
    if (!force) {
      console.error(`Error: Destination ${destPath} already exists`)
      console.error('Use --force to overwrite')
      process.exit(1)
    }
    console.log(`  Removing existing directory: ${destPath}`)
    await fs.rm(destPath, { recursive: true, force: true })
  }
  catch {
    // Directory doesn't exist, which is what we want
  }

  console.log(`Copying project from ${srcPath} to ${destPath}...`)

  // Find all files to copy (excluding unwanted files)
  const files = await glob('**/*', {
    cwd: srcPath,
    ignore: [
      '.git/**',
      'CLAUDE.md',
      'scripts/**',
      'node_modules/**',
      'pnpm-lock.yaml',
      'dist/**',
      '.DS_Store',
      '*.log',
    ],
    dot: true,
    onlyFiles: true,
  })

  // Create destination directory
  await fs.mkdir(destPath, { recursive: true })

  // Copy each file
  for (const file of files) {
    const srcFile = path.join(srcPath, file)
    const destFile = path.join(destPath, file)
    const destDir = path.dirname(destFile)

    // Ensure directory exists
    await fs.mkdir(destDir, { recursive: true })

    // Copy file
    await fs.copyFile(srcFile, destFile)
  }

  console.log(` Copied ${files.length} files to ${destPath}`)
  return destPath
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const destination = process.argv[2]
  const force = process.argv.includes('--force')
  copyProject(destination, force).catch((error) => {
    console.error('Error:', error.message)
    process.exit(1)
  })
}

export { copyProject }
