import type { ExpenseCategory } from "@/types";

const RULES: { pattern: RegExp; category: ExpenseCategory }[] = [
  // Miete & Wohnen
  { pattern: /miete|warmmiete|kaltmiete|nebenkosten|hausverwaltung|wohnungsgenossenschaft|immobilien|hausverwalter|genossenschaft|wohngeld/i, category: "miete" },

  // Essen & Lebensmittel
  { pattern: /rewe|aldi|lidl|penny|edeka|netto|kaufland|globus|real|spar|tegut|dm drogerie|rossmann|müller|bio company|whole foods|migros|coop|carrefour|tesco|waitrose|mcdonald|burger king|subway|kfc|domino|pizza hut|lieferando|wolt|uber eat|deliveroo|just eat|gorillas|getir|bäcker|backery|konditorei|döner|kebab|sushi|restaurant|bistro|kantine|mensa|food|küche|lebensmittel|supermarkt|markt/i, category: "essen" },

  // Transport & Mobilität
  { pattern: /deutsche bahn|db regio|db fernverkehr|db bahn|s-bahn|u-bahn|mvv|bvg|hvv|vrr|rmv|vvs|vbk|rheinbahn|wiener linien|sbb|ns dutch|tfl london|uber|lyft|bolt|flixbus|meinfernbus|blablacar|ryanair|easyjet|lufthansa|eurowings|wizz|transavia|condor|tap air|iberia|klm|air france|british airways|swiss air|tankstelle|shell|aral|bp |total |esso|jet |agip|parking|parken|parkhaus|stadtwerke.*strom|stadtwerke.*gas|e\.on|vattenfall|enbw|rheinenergie/i, category: "transport" },

  // Freizeit & Entertainment
  { pattern: /netflix|spotify|disney\+|amazon prime|apple tv|hbo|dazn|youtube premium|twitch|steam|playstation|xbox|nintendo|epic games|kino|cinema|theater|oper|konzert|festival|eventim|ticketmaster|zalando|h&m|zara|primark|uniqlo|asos|about you|otto |amazon|ebay|mediamarkt|saturn|ikea|hornbach|obi |bauhaus|sport|fitness|gym|fitnessstudio|mcfit|clever fit|urban sport|kletterhalle|schwimmbad/i, category: "freizeit" },

  // Gesundheit
  { pattern: /apotheke|pharmacy|arzt|praxis|dr\.|krankenhaus|hospital|klinik|ambulanz|physiotherapie|zahnarzt|dental|optiker|fielmann|brillen|aok|tk |barmer|dak |hkk |kkh |bkk |medi|versicherung|allianz|huk |ergo |generali|hdI |axa|debeka/i, category: "gesundheit" },
];

export function categorize(description: string): { category: ExpenseCategory; auto: boolean } {
  const text = description.trim();
  for (const rule of RULES) {
    if (rule.pattern.test(text)) {
      return { category: rule.category, auto: true };
    }
  }
  return { category: "sonstiges", auto: false };
}

export function parseGermanAmount(raw: string): number {
  // "1.234,56" → 1234.56   or   "-23,40" → -23.40
  return parseFloat(raw.replace(/\./g, "").replace(",", ".")) || 0;
}

export function parseCSV(content: string): { date: string; description: string; amount: number }[] {
  const lines = content.split(/\r?\n/).filter((l) => l.trim());
  const results: { date: string; description: string; amount: number }[] = [];

  // Detect separator
  const sep = content.includes(";") ? ";" : ",";

  // Find header row
  let headerIdx = -1;
  let headers: string[] = [];
  for (let i = 0; i < Math.min(10, lines.length); i++) {
    const cols = lines[i].split(sep).map((c) => c.replace(/^"|"$/g, "").toLowerCase().trim());
    if (cols.some((c) => c.includes("datum") || c.includes("buchung") || c.includes("date"))) {
      headerIdx = i;
      headers = cols;
      break;
    }
  }
  if (headerIdx === -1) return [];

  // Find relevant column indices
  const dateIdx = headers.findIndex((h) => h.includes("buchungstag") || h.includes("buchung") || h.includes("datum") || h === "date");
  const descIdx = headers.findIndex((h) => h.includes("auftraggeber") || h.includes("empfänger") || h.includes("empfaenger") || h.includes("verwendungszweck") || h.includes("buchungstext") || h.includes("description") || h.includes("beguenstigter") || h.includes("begünstigter"));
  const amtIdx = headers.findIndex((h) => h.includes("betrag") || h.includes("amount") || h.includes("umsatz"));

  if (dateIdx === -1 || amtIdx === -1) return [];

  for (let i = headerIdx + 1; i < lines.length; i++) {
    const cols = lines[i].split(sep).map((c) => c.replace(/^"|"$/g, "").trim());
    if (cols.length <= amtIdx) continue;

    const rawDate = cols[dateIdx] ?? "";
    const rawDesc = cols[descIdx !== -1 ? descIdx : 0] ?? "Unbekannt";
    const rawAmt = cols[amtIdx] ?? "0";

    // Parse date: DD.MM.YYYY or YYYY-MM-DD
    let date = "";
    if (/\d{2}\.\d{2}\.\d{4}/.test(rawDate)) {
      const [d, m, y] = rawDate.split(".");
      date = `${y}-${m}-${d}`;
    } else if (/\d{4}-\d{2}-\d{2}/.test(rawDate)) {
      date = rawDate.slice(0, 10);
    } else {
      continue;
    }

    const amount = parseGermanAmount(rawAmt);
    if (amount === 0) continue;

    results.push({ date, description: rawDesc, amount });
  }

  return results;
}
