async function load() {
  const orders = await fetch("/api/XO?cmd=orders").then(r => r.json());
  const tbody  = document.getElementById("orders");
  tbody.innerHTML = "";

  orders.forEach(o => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="p-3">${o.id}</td>
      <td>${o.email || "-"}</td>
      <td>${o.status}</td>
      <td>
        <button class="px-3 py-1 bg-green-600 text-white rounded"
                ${o.status !== "paid" ? "disabled" : ""}>
          Kirim E-book
        </button>
      </td>`;
    tr.querySelector("button")?.addEventListener("click", () => send(o.id));
    tbody.appendChild(tr);
  });
}

async function send(id) {
  await fetch("/api/XO", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cmd: "send", id })
  });
  load();
}

load();
setInterval(load, 5000);
