let cache = null
let lastFetch = 0

const SHEET = "https://docs.google.com/spreadsheets/d/1w4Aoszpli2vz7FowLuMYgYwgEpn5GUkhUk9WrQK2E0c/export?format=csv&gid=0"

function parseCSV(text) {
  const lines = text.trim().split("\n")

  return lines.slice(1).map(line => {
    const result = []
    let current = ""
    let insideQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]

      if (char === '"') {
        insideQuotes = !insideQuotes
      } else if (char === ',' && !insideQuotes) {
        result.push(current)
        current = ""
      } else {
        current += char
      }
    }

    result.push(current)
    return result
  })
}

export async function getData() {
  const now = Date.now()

  if (cache && now - lastFetch < 5 * 60 * 1000) {
    return cache
  }

  const res = await fetch(SHEET)
  const text = await res.text()

  const rows = parseCSV(text)

  cache = rows
  lastFetch = now

  return rows
}
