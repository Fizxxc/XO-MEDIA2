// public/js/store.js
import { v4 as uuid } from "https://jspm.dev/uuid";

const list      = document.getElementById("list");
const checkout  = document.getElementById("checkout");
const qrImg     = document.getElementById("qr");
const paidBtn   = document.getElementById("paid");

// ─── 1. tampilkan produk ──────────────────────────────────────────
fetch("/api/XO?cmd=products")
  .then(r => r.json())
  .then(render);

function render(products) {
  products.forEach(p => {
    const card = document.createElement("article");
    card.className =
      "bg-white rounded-2xl p-4 shadow flex flex-col hover:shadow-lg transition";
    card.innerHTML = `
      <img src="${p.cover}" alt="${p.title}"
           class="rounded mb-3 aspect-[3/4] object-cover w-full">
      <h3 class="font-semibold">${p.title}</h3>
      <p class="text-sm mt-auto">Rp ${p.price.toLocaleString()}</p>
      <button class="mt-3 py-2 bg-indigo-600 text-white rounded-xl w-full">
        Beli
      </button>`;
    card.querySelector("button").onclick = () => openForm(p);
    list.appendChild(card);
  });
}

// ─── 2. form data pembeli ─────────────────────────────────────────
function openForm(product) {
  const html = `
    <div class="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md">
      <h2 class="text-xl font-semibold mb-4">Data Pembeli</h2>
      <label class="block mb-2 text-sm">Nama
        <input id="c-name" class="mt-1 w-full border p-2 rounded"/>
      </label>
      <label class="block mb-2 text-sm">Email
        <input id="c-email" type="email"
               class="mt-1 w-full border p-2 rounded"/>
      </label>
      <label class="block mb-4 text-sm">No WhatsApp
        <input id="c-wa" class="mt-1 w-full border p-2 rounded"/>
      </label>
      <button id="c-next"
              class="w-full py-2 rounded-xl bg-indigo-600 text-white">
        Lanjut ke Pembayaran
      </button>
    </div>`;
  checkout.innerHTML = html;
  checkout.classList.remove("hidden");

  document.getElementById("c-next").onclick = () => {
    const buyer = {
      name : document.getElementById("c-name").value.trim(),
      email: document.getElementById("c-email").value.trim(),
      wa   : document.getElementById("c-wa").value.trim()
    };
    if (!buyer.name || !buyer.email || !buyer.wa) {
      return alert("Semua field wajib diisi");
    }
    makeOrder(product, buyer);
  };
}

// ─── 3. buat order & tampilkan QR ──────────────────────────────────
async function makeOrder(product, buyer) {
  const id  = uuid();
  const res = await fetch("/api/XO?cmd=order", {
    method : "POST",
    headers: { "Content-Type": "application/json" },
    body   : JSON.stringify({ id, product, buyer })
  });
  const { qr } = await res.json();

  checkout.innerHTML = `
    <div class="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md">
      <h2 class="text-xl font-semibold mb-2">Bayar dengan DANA / QRIS</h2>
      <img src="${qr}" class="w-64 h-64 mx-auto border">
      <p class="text-center mt-2">
        Scan kode di atas lalu klik “Saya sudah bayar”
      </p>
      <button id="paid"
              class="w-full mt-4 py-2 rounded-xl bg-indigo-600 text-white">
        Saya sudah bayar
      </button>
    </div>`;
  document.getElementById("paid").onclick = () => checkStatus(id);
}

async function checkStatus(id) {
  const { status } = await fetch(`/api/XO?cmd=status&id=${id}`).then(r => r.json());
  alert(
    status === "pending"
      ? "Pembayaran belum terverifikasi."
      : "Pembayaran terverifikasi! E-book segera dikirim."
  );
}

window.addEventListener("keydown", e => {
  if (e.key === "Escape") checkout.classList.add("hidden");
});
