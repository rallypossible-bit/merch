const SHEET_NAME = "Objednávky";

function doPost(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow([
      "Datum",
      "Jméno a příjmení",
      "E-mail",
      "Telefon",
      "Položky objednávky",
      "Počet kusů celkem",
      "Převzetí",
      "Zásilkovna",
      "Celkem",
      "Platba přijata",
      "Předáno / odesláno"
    ]);
  }

  const p = e.parameter;

  sheet.appendRow([
    new Date(),
    p.jmeno || "",
    p.email || "",
    p.telefon || "",
    p.polozky || "",
    p.pocetCelkem || "",
    p.prevzeti || "",
    p.zasilkovna || "",
    p.celkem || "",
    "NE",
    "NE"
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ result: "success" }))
    .setMimeType(ContentService.MimeType.JSON);
}
