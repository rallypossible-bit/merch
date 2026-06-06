const SPREADSHEET_ID = "1Mae5YbvrDcD-gk9VfU0YiziWZxqbHHJa6yAefEWUkcA";
const SHEET_NAME = "Objednávky";

function doGet(e) {
  return ContentService
    .createTextOutput("OK - Apps Script funguje")
    .setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName(SHEET_NAME);

    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
    }

    if (sheet.getLastRow() === 0) {
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

    const p = e && e.parameter ? e.parameter : {};

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

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: "error", message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
