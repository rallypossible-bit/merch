const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyctuXMn6tPoHNViXWLupDEIe4tiic8Ee3x9oIOl11kbFP2tXY32RPV2VOyigLLaEYW/exec";

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
  return Array.from(items.querySelectorAll(".item-row")).map(row => {
    return {
      typ: row.querySelector(".typ").value,
      velikost: row.querySelector(".velikost").value,
      pocet: Math.max(1, Number(row.querySelector(".pocet").value || 1))
    };
  });
}

function formatItems(orderItems) {
  return orderItems
    .map(item => `${item.typ} ${item.velikost} (${item.pocet} ks)`)
    .join("; ");
}

function updatePrice() {
  const orderItems = getOrderItems();
  const pieces = orderItems.reduce((sum, item) => sum + item.pocet, 0);
  const shipping = prevzeti.value === "Zásilkovna" ? SHIPPING_PRICE : 0;
  const finalPrice = pieces * PRICE_PER_SHIRT + shipping;

  totalPieces.textContent = `${pieces} ks`;
  total.textContent = `${finalPrice} Kč`;

  zasilkovna.required = prevzeti.value === "Zásilkovna";
}

function showMessage(text, type) {
  message.textContent = text;
  message.className = `message ${type || ""}`;
}

addItemBtn.addEventListener("click", () => addItem());
form.addEventListener("input", updatePrice);
form.addEventListener("change", updatePrice);

addItem({ typ: "Pánské", velikost: "M", pocet: 1 });

form.addEventListener("submit", async event => {
  event.preventDefault();

  if (GOOGLE_SCRIPT_URL.includes("PASTE_GOOGLE_APPS_SCRIPT_URL_HERE")) {
    showMessage("Nejdřív vlož do script.js URL z Google Apps Script, která končí na /exec.", "err");
    return;
  }

  const orderItems = getOrderItems();
  const pieces = orderItems.reduce((sum, item) => sum + item.pocet, 0);
  const shipping = prevzeti.value === "Zásilkovna" ? SHIPPING_PRICE : 0;
  const finalPrice = pieces * PRICE_PER_SHIRT + shipping;

  const data = new URLSearchParams();
  data.append("jmeno", form.jmeno.value.trim());
  data.append("email", form.email.value.trim());
  data.append("telefon", form.telefon.value.trim());
  data.append("polozky", formatItems(orderItems));
  data.append("pocetCelkem", String(pieces));
  data.append("prevzeti", prevzeti.value);
  data.append("zasilkovna", zasilkovna.value.trim());
  data.append("celkem", `${finalPrice} Kč`);
  data.append("odeslano", new Date().toLocaleString("cs-CZ"));

  submitBtn.disabled = true;
  submitBtn.textContent = "Odesílám...";
  showMessage("", "");

  try {
    await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      body: data,
      mode: "no-cors",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
      }
    });

    form.reset();
    items.innerHTML = "";
    addItem({ typ: "Pánské", velikost: "M", pocet: 1 });
    updatePrice();
    showMessage("Objednávka byla odeslána. Děkujeme!", "ok");
  } catch (err) {
    showMessage("Objednávku se nepodařilo odeslat. Zkuste to prosím znovu.", "err");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Odeslat objednávku";
  }
});
