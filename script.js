const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzXaZkQj_YAim1844cC2fPz3IGJt_LKCburN-k8Ct1eOZ5c9R0g8td3x_496Yqq_iP7/exec";

const form = document.getElementById("orderForm");
const prevzeti = document.getElementById("prevzeti");
const zasilkovna = document.getElementById("zasilkovna");
const total = document.getElementById("total");
const message = document.getElementById("message");
const submitBtn = document.getElementById("submitBtn");

const PRICE_PER_SHIRT = 500;
const SHIPPING_PRICE = 89;

function getItemRows() {
  return Array.from(document.querySelectorAll(".shirt-item, .item-row, .shirt-row, [data-shirt-item]"));
}

function getValue(row, selectors) {
  for (const selector of selectors) {
    const element = row.querySelector(selector);
    if (element && element.value !== undefined) return element.value;
  }
  return "";
}

function getOrderItems() {
  const rows = getItemRows();

  // Kdyby ve formulari nebyly opakovatelne radky, vezme se klasicka jedna velikost.
  if (!rows.length) {
    const typ = form.querySelector('[name="typ"], [name="druh"], [name="pohlavi"]')?.value || "";
    const velikost = form.querySelector('[name="velikost"]')?.value || "";
    const pocet = Number(form.querySelector('[name="pocet"]')?.value || 1);

    return [{
      typ,
      velikost,
      pocet: Math.max(1, pocet)
    }];
  }

  return rows.map(row => {
    const typ = getValue(row, [
      '[name="typ"]',
      '[name="typ[]"]',
      '[name="druh"]',
      '[name="druh[]"]',
      '[name="pohlavi"]',
      '[name="pohlavi[]"]'
    ]);

    const velikost = getValue(row, [
      '[name="velikost"]',
      '[name="velikost[]"]',
      '[name="size"]',
      '[name="size[]"]'
    ]);

    const pocetRaw = getValue(row, [
      '[name="pocet"]',
      '[name="pocet[]"]',
      '[name="quantity"]',
      '[name="quantity[]"]'
    ]);

    return {
      typ,
      velikost,
      pocet: Math.max(1, Number(pocetRaw || 1))
    };
  }).filter(item => item.velikost || item.typ || item.pocet);
}

function formatItems(items) {
  return items
    .map(item => {
      const typ = item.typ || "Tričko";
      const velikost = item.velikost || "neuvedeno";
      return `${typ} ${velikost} (${item.pocet} ks)`;
    })
    .join(", ");
}

function countItems(items) {
  return items.reduce((sum, item) => sum + item.pocet, 0);
}

function calculateTotal() {
  const items = getOrderItems();
  const pocetCelkem = countItems(items);
  const doprava = prevzeti && prevzeti.value === "Zásilkovna" ? SHIPPING_PRICE : 0;
  return (pocetCelkem * PRICE_PER_SHIRT) + doprava;
}

function updatePrice() {
  const cena = calculateTotal();
  if (total) total.textContent = `${cena} Kč`;

  if (zasilkovna && prevzeti) {
    zasilkovna.required = prevzeti.value === "Zásilkovna";
  }
}

function setMessage(text, type) {
  if (!message) return;
  message.textContent = text;
  message.className = `message ${type || ""}`;
}

document.addEventListener("input", updatePrice);
document.addEventListener("change", updatePrice);
updatePrice();

if (form) {
  form.addEventListener("submit", async event => {
    event.preventDefault();

    if (GOOGLE_SCRIPT_URL.includes("PASTE_GOOGLE_APPS_SCRIPT_URL_HERE")) {
      setMessage("Nejdřív vlož URL z Google Apps Script do souboru script.js.", "err");
      return;
    }

    const items = getOrderItems();
    const pocetCelkem = countItems(items);
    const cenaCelkem = calculateTotal();

    const data = new FormData();

    data.append("jmeno", form.querySelector('[name="jmeno"]')?.value || "");
    data.append("email", form.querySelector('[name="email"]')?.value || "");
    data.append("telefon", form.querySelector('[name="telefon"]')?.value || "");
    data.append("polozky", formatItems(items));
    data.append("pocetCelkem", String(pocetCelkem));
    data.append("prevzeti", form.querySelector('[name="prevzeti"]')?.value || "");
    data.append("zasilkovna", form.querySelector('[name="zasilkovna"]')?.value || "");
    data.append("celkem", `${cenaCelkem} Kč`);
    data.append("odeslano", new Date().toLocaleString("cs-CZ"));

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Odesílám...";
    }

    setMessage("", "");

    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        body: data,
        mode: "no-cors"
      });

      form.reset();
      updatePrice();
      setMessage("Objednávka byla odeslána. Děkujeme!", "ok");
    } catch (error) {
      setMessage("Objednávku se nepodařilo odeslat. Zkuste to prosím znovu.", "err");
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Odeslat objednávku";
      }
    }
  });
}
