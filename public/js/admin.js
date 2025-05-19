const tbody = document.getElementById("orders");

// ambil & render order tiap 5 detik
async function loadOrders() {
  const res = await fetch("/api/XO?cmd=orders");
  if (!res.ok) return console.error("Gagal fetch orders");
  const data = await res.json();

  tbody.innerHTML = ""; // reset
  data.forEach((o) => {
    const buyerInfo = o.buyer
      ? `<div>${o.buyer.name}<br>
         <small>${o.buyer.email}<br>${o.buyer.wa}</small></div>`
      : "-";

    const tr = document.createElement("tr");
    tr.className = "border-b last:border-none";

    tr.innerHTML = `
      <td class="p-3 whitespace-nowrap">${o.id}</td>
      <td class="p-3">${buyerInfo}</td>
      <td class="p-3">${o.product?.name ?? "-"}</td>
      <td class="p-3">${o.status}</td>
      <td class="p-3">
        <button
          class="send-btn px-3 py-1 rounded text-white
                 ${o.status === "sent" ? "bg-gray-400 cursor-not-allowed" : "bg-green-600"}"
          data-id="${o.id}"
          ${o.status === "sent" ? "disabled" : ""}>
          Tandai Terkirim
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // pasang handler tombol
  tbody.querySelectorAll(".send-btn:not([disabled])").forEach((btn) => {
    btn.addEventListener("click", () => markSent(btn.dataset.id));
  });
}

async function markSent(id) {
  const ok = await fetch("/api/XO?cmd=send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  }).then((r) => r.ok);

  if (ok) loadOrders();
  else alert("Gagal mengubah status.");
}

loadOrders();
setInterval(loadOrders, 5000);
