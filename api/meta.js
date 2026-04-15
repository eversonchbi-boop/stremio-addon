export default async function handler(req, res) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get("type")
  const id = searchParams.get("id")

  const resCsv = await fetch("https://docs.google.com/spreadsheets/d/1w4Aoszpli2vz7FowLuMYgYwgEpn5GUkhUk9WrQK2E0c/export?format=csv&gid=0")
  const text = await resCsv.text()

  const rows = text.split("\n").slice(1).map(r => r.split(","))

  const items = rows.filter(r => r[0] === id)

  if (!items.length) return res.json({})

  if (type === "series") {
    const videos = items.map(r => ({
      id: `${r[0]}:${r[4]}:${r[5]}`,
      title: `S${r[4]}E${r[5]}`,
      season: Number(r[4]),
      episode: Number(r[5])
    }))

    return res.json({
      meta: {
        id,
        type,
        name: items[0][2],
        videos
      }
    })
  }

  res.json({
    meta: {
      id,
      type,
      name: items[0][2]
    }
  })
}
