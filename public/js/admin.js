const tbody = document.getElementById("orders");

async function load() {
  const orders = await fetch("/api/XO?cmd=orders").then(r => r.json());
  tbody.innerHTML = "";
  orders.forEach(o => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="p-3">${o.id}</td>
      <td>${o.product.title}</td>
      <td>${o.status}</td>
      <td>
        <button class="px-3 py-1 bg-green-600 text-white rounded"
          ${o.status !== "pending" ? "disabled" : ""}>
          Tandai Terkirim
        </button>
      </td>`;
    tr.querySelector("button").onclick = () => markSent(o.id);
    tbody.appendChild(tr);
  });
}

async function markSent(id) {
  await fetch("/api/XO?cmd=send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id })
  });
  load();
}

load();
setInterval(load, 5000); // refresh tiap 5 detik
