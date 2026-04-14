#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

// Read property order from stylelintrc
const stylelintrcPath = path.join(__dirname, '..', '.stylelintrc')
let configStr = fs.readFileSync(stylelintrcPath, 'utf8')
configStr = configStr.replace(/,(\s*[}\]])/g, '$1')
const config = JSON.parse(configStr)
const propertyOrder = config.rules['order/properties-order']

// Create order map for sorting
const orderMap = {}
propertyOrder.forEach((prop, index) => {
  orderMap[prop] = index
})

function getPropertyName (line) {
  const trimmed = line.trim()
  // Check for block braces (but NOT Sass interpolation #{})
  const hasBlockBrace = (trimmed.includes('{') && !trimmed.includes('#{')) ||
                        (trimmed.includes('}') && !trimmed.includes('#{'))
  // Skip non-property lines
  if (!trimmed ||
      trimmed.startsWith('//') ||
      trimmed.startsWith('/*') ||
      trimmed.startsWith('&') ||
      trimmed.startsWith('.') ||
      trimmed.startsWith('@') ||
      trimmed.startsWith('+') ||
      trimmed.startsWith('%') ||
      trimmed.startsWith('$') ||
      hasBlockBrace) {
    return null
  }

  // Extract property name (before the colon)
  const colonIndex = trimmed.indexOf(':')
  if (colonIndex === -1) { return null }

  return trimmed.substring(0, colonIndex).trim()
}

function getIndent (line) {
  const match = line.match(/^(\s*)/)
  return match ? match[1] : ''
}

function sortProperties (content) {
  const lines = content.split('\n')
  const result = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]
    const indent = getIndent(line)
    const propName = getPropertyName(line)

    // If this is a property, collect all consecutive properties at same indent
    if (propName && orderMap.hasOwnProperty(propName)) {
      const propsToSort = []

      while (i < lines.length) {
        const currentLine = lines[i]
        const currentIndent = getIndent(currentLine)
        const currentProp = getPropertyName(currentLine)

        // Stop if indent changes or not a sortable property
        if (currentIndent !== indent || !currentProp || !orderMap.hasOwnProperty(currentProp)) {
          break
        }

        propsToSort.push({
          line: currentLine,
          prop: currentProp,
          order: orderMap[currentProp]
        })
        i++
      }

      // Sort and add
      propsToSort.sort((a, b) => a.order - b.order)
      propsToSort.forEach(p => result.push(p.line))
    } else {
      result.push(line)
      i++
    }
  }

  return result.join('\n')
}

// Get files using find command
const pattern = process.argv[2] || 'components'
const cwd = path.join(__dirname, '..')

let files
try {
  files = execSync(`find ${pattern} -name "*.sass" -type f`, { cwd, encoding: 'utf8' })
    .trim()
    .split('\n')
    .filter(f => f)
} catch (e) {
  console.error('No files found')
  process.exit(1)
}

console.log(`Fixing ${files.length} files...`)

files.forEach((file) => {
  const fullPath = path.join(cwd, file)
  const content = fs.readFileSync(fullPath, 'utf8')
  const sorted = sortProperties(content)

  if (content !== sorted) {
    fs.writeFileSync(fullPath, sorted)
    console.log(`Fixed: ${file}`)
  }
})

console.log('Done!')
