const orders = new Map();
const products = [
  {
    id: 1,
    name: "Es Teh",
    cover: "/covers/langit.png",
    price: 5000,
  },
  {
    id: 2,
    name: "Mie (Rebus/Goreng)",
    cover: "/covers/cerita-inspiratif.jpg",
    price: 8000,
  },
  {
    id: 3,
    name: "Martel",
    cover: "/covers/langit.png",
    price: 5000,
    price: 2000,
    price: 3000,
    price: 6000,
  },
];

export default async function handler(req, res) {
  const { cmd } = req.query;

  if (cmd === "products") {
    return res.json(products);
  }

  // create order (POST /?cmd=order)
  if (req.method === "POST" && cmd === "order") {
    const { id, product, buyer } = req.body;

    // Validasi buyer minimal ada name, email, wa
    if (
      !buyer ||
      !buyer.name?.trim() ||
      !buyer.email?.trim() ||
      !buyer.wa?.trim()
    ) {
      return res.status(400).json({ error: "Buyer info required" });
    }

    // QR statis
    const qr = "/qris.png";

    orders.set(id, { id, product, buyer, status: "pending" });
    return res.json({ qr });
  }

  // order status
  if (cmd === "status") {
    return res.json(orders.get(req.query.id) || {});
  }

  // list orders
  if (cmd === "orders") {
    return res.json([...orders.values()]);
  }

  // send e-book (update status)
  if (req.method === "POST" && cmd === "send") {
    const { id } = req.body;
    const ord = orders.get(id);
    if (!ord) return res.status(404).end();

    ord.status = "sent";
    orders.set(id, ord);
    return res.json({ ok: true });
  }

  res.status(400).json({ error: "Invalid cmd" });
}
