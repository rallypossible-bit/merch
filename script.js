const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzXaZkQj_YAim1844cC2fPz3IGJt_LKCburN-k8Ct1eOZ5c9R0g8td3x_496Yqq_iP7/exec";

const PRICE_PER_SHIRT = 500;
const SHIPPING_PRICE = 89;

const form = document.getElementById("orderForm");
const prevzeti = document.getElementById("prevzeti");
const zasilkovna = document.getElementById("zasilkovna");
const items = document.getElementById("items");
const itemTemplate = document.getElementById("itemTemplate");
const addItemBtn = document.getElementById("addItem");
const total = document.getElementById("total");
const totalPieces = document.getElementById("totalPieces");
const message = document.getElementById("message");
const submitBtn = document.getElementById("submitBtn");
const polozkyInput = document.getElementById("polozky");
const pocetCelkemInput = document.getElementById("pocetCelkem");
const celkemInput = document.getElementById("celkem");

function addItem(defaults = {}) {
  const row = itemTemplate.content.firstElementChild.cloneNode(true);
  row.querySelector(".typ").value = defaults.typ || "Pánské";
  row.querySelector(".velikost").value = defaults.velikost || "M";
  row.querySelector(".pocet").value = defaults.pocet || 1;
  row.querySelector(".remove").addEventListener("click", () => {
    if (items.children.length > 1) {
      row.remove();
      updatePrice();
    }
  });
  row.addEventListener("input", updatePrice);
  row.addEventListener("change", updatePrice);
  items.appendChild(row);
  updatePrice();
}

function getOrderItems() {
  return [...items.querySelectorAll(".item-row")].map(row => ({
    typ: row.querySelector(".typ").value,
    velikost: row.querySelector(".velikost").value,
    pocet: Math.max(1, Number(row.querySelector(".pocet").value || 1))
  }));
}

function formatItems(orderItems) {
  return orderItems.map(item => `${item.typ} ${item.velikost}: ${item.pocet} ks`).join("; ");
}

function updatePrice() {
  const orderItems = getOrderItems();
  const pieces = orderItems.reduce((sum, item) => sum + item.pocet, 0);
  const shipping = prevzeti.value === "Zásilkovna" ? SHIPPING_PRICE : 0;
  const finalPrice = pieces * PRICE_PER_SHIRT + shipping;

  totalPieces.textContent = `${pieces} ks`;
  total.textContent = `${finalPrice} Kč`;
  zasilkovna.required = prevzeti.value === "Zásilkovna";

  polozkyInput.value = formatItems(orderItems);
  pocetCelkemInput.value = pieces;
  celkemInput.value = `${finalPrice} Kč`;
}

addItemBtn.addEventListener("click", () => addItem());
form.addEventListener("input", updatePrice);
form.addEventListener("change", updatePrice);
addItem({ typ: "Pánské", velikost: "M", pocet: 1 });

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  updatePrice();
  message.textContent = "";
  message.className = "message";

  if (GOOGLE_SCRIPT_URL.includes("PASTE_GOOGLE_APPS_SCRIPT_URL_HERE")) {
    message.textContent = "Nejdřív vlož URL z Google Apps Script do souboru script.js.";
    message.classList.add("err");
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "Odesílám...";

  const data = new FormData(form);
  data.append("odeslano", new Date().toLocaleString("cs-CZ"));

  try {
    await fetch(GOOGLE_SCRIPT_URL, { method: "POST", body: data, mode: "no-cors" });
    form.reset();
    items.innerHTML = "";
    addItem({ typ: "Pánské", velikost: "M", pocet: 1 });
    updatePrice();
    message.textContent = "Objednávka byla odeslána. Děkujeme!";
    message.classList.add("ok");
  } catch (err) {
    message.textContent = "Objednávku se nepodařilo odeslat. Zkuste to prosím znovu.";
    message.classList.add("err");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Odeslat objednávku";
  }
});
