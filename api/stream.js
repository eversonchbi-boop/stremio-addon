export default async function handler(req, res) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get("type")
  const id = searchParams.get("id")

  const resCsv = await fetch("https://docs.google.com/spreadsheets/d/1w4Aoszpli2vz7FowLuMYgYwgEpn5GUkhUk9WrQK2E0c/export?format=csv&gid=0")
  const text = await resCsv.text()

  const rows = text.split("\n").slice(1).map(r => r.split(","))

  const items = rows.filter(r => r[0] === id)

  const streams = items.map(r => ({
    title: r[8],
    infoHash: r[7]
  }))

  res.json({ streams })
}
