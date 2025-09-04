#!/usr/bin/env node

import { promises as fs } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { glob } from 'tinyglobby'

async function replaceSymbols(destination, projectName, organization = 'shortpoet') {
  if (!destination) {
    console.error('Error: Destination path is required')
    process.exit(1)
  }

  if (!projectName) {
    console.error('Error: Project name is required')
    process.exit(1)
  }

  const destPath = path.resolve(destination)

  console.log(`Replacing symbols in ${destPath}...`)
  console.log(`  Project name: ${projectName}`)

  // Find all files to update
  const patterns = ['**/*.md', '**/package.json', '**/*.json']
  const files = await glob(patterns, {
    cwd: destPath,
    ignore: ['node_modules/**', 'dist/**', 'pnpm-lock.yaml'],
    dot: true,
    onlyFiles: true,
  })

  const replacements = [
    // Project name
    { from: /pkg-placeholder/g, to: projectName },

    // Author info
    { from: /Anthony Fu/g, to: 'Carlos Soriano' },
    { from: /anthonyfu117@hotmail\.com/g, to: 'soriano.carlitos@gmail.com' },

    // Replace antfu with organization in all URLs and references
    { from: /antfu/g, to: organization },

    // GitHub sponsors (always use shortpoet for sponsors)
    { from: /github\.com\/sponsors\/antfu/g, to: 'github.com/sponsors/shortpoet' },
  ]

  let filesUpdated = 0

  for (const file of files) {
    const filePath = path.join(destPath, file)
    let content = await fs.readFile(filePath, 'utf-8')
    let modified = false

    // Special handling for README.md - remove sponsors section
    if (file.endsWith('README.md')) {
      // Remove the sponsors section
      const sponsorsStart = content.indexOf('## Sponsors')
      const licenseStart = content.indexOf('## License')

      if (sponsorsStart !== -1 && licenseStart !== -1) {
        const beforeSponsors = content.substring(0, sponsorsStart)
        const afterSponsors = content.substring(licenseStart)
        content = beforeSponsors + afterSponsors
        modified = true
      }
    }

    for (const { from, to } of replacements) {
      const newContent = content.replace(from, to)
      if (newContent !== content) {
        content = newContent
        modified = true
      }
    }

    if (modified) {
      await fs.writeFile(filePath, content)
      filesUpdated++
      console.log(`  Updated: ${file}`)
    }
  }

  console.log(` Updated ${filesUpdated} files with new symbols`)
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const destination = process.argv[2]
  const projectName = process.argv[3]
  const organization = process.argv[4]
  replaceSymbols(destination, projectName, organization).catch((error) => {
    console.error('Error:', error.message)
    process.exit(1)
  })
}

export { replaceSymbols }
