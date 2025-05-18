const orders = new Map();
const products = [
  {
      id: 1,
      name: "E-Book Langit Tidak Hanya Biru",
      cover: "/covers/langit.png",
      price: 25000
    }
    // {
    //   id: 2,
    //   name: "E-Book Cerita Inspiratif",
    //   cover: "/covers/cerita-inspiratif.jpg",
    //   price: 18000
    // }
];

export default async function handler(req, res) {
  const { cmd } = req.query;

  if (cmd === "products") {
    return res.json(products);
  }

  // create order
  if (req.method === "POST" && cmd === "order") {
    const { id, product } = req.body;

    // Ganti QRCode dengan URL gambar QRIS statis
    const qr = "/qris.png";  // link ke gambar QRIS statis di folder public

    orders.set(id, { id, product, status: "pending" });
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

  // send e-book (dummy update status tanpa email)
  if (req.method === "POST" && cmd === "send") {
    const { id } = req.body;
    const ord = orders.get(id);
    if (!ord) return res.status(404).end();

    // hanya update status tanpa email
    ord.status = "sent";
    orders.set(id, ord);
    return res.json({ ok: true });
  }

  res.status(400).end();
}
