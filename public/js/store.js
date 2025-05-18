import { v4 as uuid } from "https://jspm.dev/uuid";

const list     = document.getElementById("list");
const checkout = document.getElementById("checkout");
const qrImg    = document.getElementById("qr");
const paidBtn  = document.getElementById("paid");

// 1. tampilkan produk
fetch("/api/XO?cmd=products")
  .then(r => r.json())
  .then(show);

function show(products) {
  products.forEach(p => {
    const card = document.createElement("article");
    card.className =
      "bg-white rounded-2xl p-4 shadow flex flex-col hover:shadow-lg transition";
    card.innerHTML = `
      <img src="${p.cover}" alt="${p.title}" class="rounded mb-3 aspect-[3/4] object-cover w-full">
      <h3 class="font-semibold">${p.title}</h3>
      <p class="text-sm mt-auto">Rp ${p.price.toLocaleString()}</p>
      <button class="mt-3 py-2 bg-indigo-600 text-white rounded-xl w-full">Beli</button>`;
    card.querySelector("button").onclick = () => buy(p);
    list.appendChild(card);
  });
}

// 2. buat order
async function buy(product) {
  const id = uuid();
  const res = await fetch("/api/XO?cmd=order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, product })
  });
  const { qr } = await res.json();
  qrImg.src = qr;
  checkout.classList.remove("hidden");
  paidBtn.onclick = () => checkStatus(id);
}

// 3. cek status order
async function checkStatus(id) {
  const { status } = await fetch(`/api/XO?cmd=status&id=${id}`).then(r => r.json());
  alert(
    status === "pending"
      ? "Pembayaran belum terverifikasi, coba lagi sebentar lagi."
      : "Pembayaran terverifikasi! E-book segera dikirim."
  );
}

// esc = tutup modal
window.addEventListener("keydown", e => {
  if (e.key === "Escape") checkout.classList.add("hidden");
});
