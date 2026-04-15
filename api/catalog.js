import { getData } from "./_csv.js";

export default async function handler(req, res) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const id = searchParams.get("id");

  const rows = await getData();

  const items = rows.map(r => ({
    id: r[0],
    type: r[1],
    title: r[2],
    category: r[6]
  }));

  const filtered = items.filter(i => i.type === type && i.category === id);

  const unique = {};
  filtered.forEach(i => unique[i.id] = i);

  const metas = Object.values(unique).map(i => ({
    id: i.id,
    type: i.type,
    name: i.title
  }));

  res.json({ metas });
}
