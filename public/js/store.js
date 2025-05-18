const listEl = document.getElementById("list");
const checkoutModal = document.getElementById("checkout");
const buyerForm = document.getElementById("buyerForm");
const paymentSection = document.getElementById("paymentSection");
const qrImg = document.getElementById("qr");
const paidBtn = document.getElementById("paid");

let selectedProduct = null;
let currentOrderId = null;

// Ambil dan tampilkan produk
async function loadProducts() {
  const res = await fetch("/api/XO?cmd=products");
  const products = await res.json();

  listEl.innerHTML = products
    .map(
      (p) => `
    <div class="bg-white rounded-lg shadow p-4 flex flex-col items-center">
      <img src="${p.cover}" alt="${p.name}" class="w-32 h-32 object-cover mb-4" />
      <h3 class="font-semibold mb-2">${p.name}</h3>
      <p class="mb-4">Rp ${p.price.toLocaleString()}</p>
      <button data-id="${p.id}" class="buy-btn bg-indigo-600 text-white px-4 py-2 rounded">
        Beli
      </button>
    </div>
  `
    )
    .join("");

  // Pasang event beli
  document.querySelectorAll(".buy-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.id);
      selectedProduct = products.find((p) => p.id === id);
      if (!selectedProduct) return alert("Produk tidak ditemukan");
      openCheckout();
    });
  });
}

// Buka modal checkout dan reset form
function openCheckout() {
  buyerForm.reset();
  paymentSection.classList.add("hidden");
  buyerForm.classList.remove("hidden");
  checkoutModal.classList.remove("hidden");
}

// Tutup modal checkout
function closeCheckout() {
  checkoutModal.classList.add("hidden");
  qrImg.src = "";
  selectedProduct = null;
  currentOrderId = null;
}

// Submit form buyer, buat order dan tampilkan QR
buyerForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const buyer = {
    name: buyerForm.name.value.trim(),
    email: buyerForm.email.value.trim(),
    wa: buyerForm.wa.value.trim(),
  };

  if (!buyer.name || !buyer.email || !buyer.wa) {
    alert("Isi semua data pembeli dengan benar.");
    return;
  }

  if (!selectedProduct) {
    alert("Produk tidak dipilih.");
    return;
  }

  // Buat ID order unik
  currentOrderId = crypto.randomUUID();

  // Kirim order ke API
  const res = await fetch("/api/XO?cmd=order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: currentOrderId,
      product: selectedProduct,
      buyer,
    }),
  });

  if (!res.ok) {
    alert("Gagal membuat order.");
    return;
  }

  const data = await res.json();

  // Tampilkan QR dan tombol bayar
  qrImg.src = data.qr || "/qris.png";
  buyerForm.classList.add("hidden");
  paymentSection.classList.remove("hidden");
});

// Tombol "Saya sudah bayar"
paidBtn.addEventListener("click", async () => {
  if (!currentOrderId) return alert("Order belum dibuat.");

  // Update status order ke "sent"
  const res = await fetch("/api/XO?cmd=send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: currentOrderId }),
  });

  if (res.ok) {
    alert("Terima kasih, pesanan Anda telah diproses!");
    closeCheckout();
  } else {
    alert("Gagal memproses pesanan.");
  }
});

// Load produk saat halaman siap
loadProducts();
