import nodemailer from "nodemailer";
import QRCode     from "qrcode";

const orders   = new Map();
const products = [
  {
    sku   : "ebook1",
    title : "Growth Hacking 101",
    price : 50000,
    cover : "https://picsum.photos/200/300?random=1"
  }
];

export default async function handler(req, res) {
  const { cmd } = req.query;

  if (cmd === "products")
    return res.json(products);

  // create order
  if (req.method === "POST" && cmd === "order") {
    const { id, product } = req.body;
    // TODO: integrate real DANA/QRIS API
    const qr = await QRCode.toDataURL(`PAY XO#${id}#${product.sku}`);
    orders.set(id, { id, product, status: "pending" });
    return res.json({ qr });
  }

  // order status
  if (cmd === "status")
    return res.json(orders.get(req.query.id) || {});

  // list orders
  if (cmd === "orders")
    return res.json([...orders.values()]);

  // send e-book
  if (req.method === "POST" && cmd === "send") {
    const { id } = req.body;
    const ord   = orders.get(id);
    if (!ord) return res.status(404).end();

    // email setup
    const transport = nodemailer.createTransport({
      host  : process.env.SMTP_HOST,
      port  : 465,
      secure: true,
      auth  : {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    await transport.sendMail({
      from   : "XO Media <noreply@xomedia.com>",
      to     : process.env.ADMIN_MAIL,
      subject: "E-book Delivery",
      text   : `Here is your e-book: ${ord.product.title}`
      // attach file or link as needed
    });

    ord.status = "sent";
    orders.set(id, ord);
    return res.json({ ok: true });
  }

  res.status(400).end();
}
