import { NextResponse } from "next/server";

// ── Static rotating tips (30 tips, one per day) ───────────────────────────
const TIPS = [
  { title: "Auslandskonto eröffnen", text: "Eröffne ein kostenloses Konto bei einer deutschen Direktbank (z. B. DKB oder ING) – beide bieten kostenlose Girokonten mit kostenloser VISA-Karte für das Ausland.", source: { name: "Stiftung Warentest", url: "https://www.test.de/Girokonto-im-Ausland-nutzen-4715701-0/" } },
  { title: "N26 Gebühren vermeiden", text: "Bei N26 sind mehr als 3 Barabhebungen pro Monat im Ausland kostenpflichtig. Plane deine Abhebungen, um unnötige Gebühren zu vermeiden.", source: { name: "Verbraucherzentrale", url: "https://www.verbraucherzentrale.de/wissen/geld-versicherungen/sparen-und-anlegen/girokonto-im-ausland-was-kostet-das-4872" } },
  { title: "Auslandskrankenversicherung", text: "Die gesetzliche Krankenversicherung gilt nur eingeschränkt im EU-Ausland und gar nicht außerhalb der EU. Eine Auslandsreisekrankenversicherung kostet ab ca. 10 € pro Monat.", source: { name: "Verbraucherzentrale", url: "https://www.verbraucherzentrale.de/wissen/reise-freizeit/reiseplanung-und-buchung/auslandskrankenversicherung-was-leistet-sie-wirklich-12441" } },
  { title: "BAföG im Ausland", text: "BAföG kann auch für ein Auslandsstudium beantragt werden – sogar für ein ganzes Jahr. Wichtig: Den Antrag frühzeitig stellen, da die Bearbeitungszeit mehrere Monate dauern kann.", source: { name: "DAAD", url: "https://www.daad.de/de/studieren-und-forschen-in-deutschland/stipendien-finden/bafög/" } },
  { title: "Doppelbesteuerungsabkommen", text: "Deutschland hat mit über 90 Ländern Doppelbesteuerungsabkommen. Das bedeutet: Einkünfte müssen oft nur in einem Land versteuert werden. Prüfe, welches Abkommen für dein Zielland gilt.", source: { name: "Bundesfinanzministerium", url: "https://www.bundesfinanzministerium.de/Web/DE/Themen/Steuern/Internationales_Steuerrecht/Staatenbezogene_Informationen/staatenbezogene_informationen.html" } },
  { title: "Kreditkarte ohne Fremdwährungsgebühr", text: "Viele Kreditkarten erheben 1,5–2 % Fremdwährungsgebühr. Karten von DKB, Revolut oder Wise berechnen keine Gebühren auf Auslandszahlungen.", source: { name: "Stiftung Warentest", url: "https://www.test.de/Kreditkarten-im-Vergleich-1842994-0/" } },
  { title: "Wohnsitz abmelden vor Ausreise", text: "Wer Deutschland länger als 6 Monate verlässt, sollte den Wohnsitz abmelden. Das spart Rundfunkbeitrag und kann steuerliche Vorteile bringen.", source: { name: "Bundesfinanzministerium", url: "https://www.bundesfinanzministerium.de" } },
  { title: "Euro-Schutzschirm SEPA", text: "SEPA-Überweisungen innerhalb der EU sind kostenlos und müssen spätestens am nächsten Banktag ankommen – nutze das für Mietzahlungen im EU-Ausland.", source: { name: "Deutsche Bundesbank", url: "https://www.bundesbank.de/de/aufgaben/unbarer-zahlungsverkehr/sepa" } },
  { title: "Stipendien für Auslandsaufenthalte", text: "DAAD vergibt jährlich tausende Stipendien für Studienaufenthalte im Ausland. Viele davon sind nicht öffentlich bekannt – lohnt sich, alle Datenbanken zu durchsuchen.", source: { name: "DAAD Stipendiendatenbank", url: "https://www.daad.de/de/studieren-und-forschen-in-deutschland/stipendien-finden/stipendiendatenbank/" } },
  { title: "Währungsrisiko bei Miete", text: "Wenn du Miete in einer Fremdwährung zahlst, unterliegt dein monatlicher Aufwand Währungsschwankungen. Halte immer einen Puffer von 10 % auf deinem Konto.", source: { name: "Bundesbank", url: "https://www.bundesbank.de/de/service/schule-und-bildung/erklaerungen/wechselkurse-800862" } },
  { title: "Rentenversicherung bei Auslandsarbeit", text: "Wer im EU-Ausland arbeitet, zahlt Rentenversicherungsbeiträge ins dortige System. Diese können später mit deutschen Zeiten zusammengerechnet werden.", source: { name: "Deutsche Rentenversicherung", url: "https://www.deutsche-rentenversicherung.de/DRV/DE/Rente/Ausland/ausland_node.html" } },
  { title: "Steuererklärung als Expat", text: "Auch bei Wohnsitz im Ausland können deutsche Steuerpflichten bestehen, wenn du Einkünfte aus Deutschland beziehst. Eine Beratung beim Steuerberater lohnt sich.", source: { name: "Bundesfinanzministerium", url: "https://www.bundesfinanzministerium.de/Web/DE/Themen/Steuern/Internationales_Steuerrecht/internationales_steuerrecht.html" } },
  { title: "Notgroschen im Ausland", text: "Lege mindestens 3 Monatsausgaben als Notreserve zurück – am besten auf einem separaten Tagesgeldkonto. Im Ausland können unerwartete Kosten schnell entstehen.", source: { name: "Verbraucherzentrale", url: "https://www.verbraucherzentrale.de/wissen/geld-versicherungen/sparen-und-anlegen/notgroschen-warum-und-wie-viel-sparen-11090" } },
  { title: "Internationale Banküberweisungen", text: "Nutze Wise (früher TransferWise) für internationale Überweisungen – die Gebühren sind deutlich günstiger als bei klassischen Banken.", source: { name: "Stiftung Warentest", url: "https://www.test.de/Geldtransfer-ins-Ausland-Die-besten-Anbieter-im-Vergleich-5047783-0/" } },
  { title: "Kontopfändungsschutz", text: "In Deutschland kann ein Pfändungsschutzkonto (P-Konto) eingerichtet werden, das einen Grundbetrag vor Pfändungen schützt – auch bei Schulden im Ausland.", source: { name: "Verbraucherzentrale", url: "https://www.verbraucherzentrale.de/wissen/geld-versicherungen/schufa-und-schulden/pfaendungsschutzkonto-das-p-konto-11633" } },
  { title: "Krankenversicherung Erasmus", text: "Während eines Erasmus-Aufenthalts bist du weiterhin in deiner deutschen Krankenversicherung versichert. Beantrage vor der Abreise die Europäische Krankenversicherungskarte (EHIC).", source: { name: "DAAD", url: "https://www.daad.de/de/im-ausland-studieren/erasmus/" } },
  { title: "Steuer-Identifikationsnummer", text: "Die Steuer-ID (11-stellig) bleibt lebenslang gültig und wird auch bei längerem Auslandsaufenthalt benötigt. Bewahre sie sicher auf.", source: { name: "Bundeszentralamt für Steuern", url: "https://www.bzst.de/DE/Privatpersonen/SteuerlicheIdentifikationsnummer/steuerlicheidentifikationsnummer_node.html" } },
  { title: "Haftpflichtversicherung im Ausland", text: "Eine deutsche Privathaftpflichtversicherung gilt oft auch im EU-Ausland. Prüfe die Bedingungen deines Vertrags – manchmal ist weltweiter Schutz eingeschlossen.", source: { name: "Stiftung Warentest", url: "https://www.test.de/Haftpflichtversicherung-im-Test-1830737-0/" } },
  { title: "Günstig telefonieren im EU-Ausland", text: "Seit 2017 gilt in der EU das \"Roam like at Home\"-Prinzip: Du telefonierst und surfst zu inländischen Konditionen – ohne Aufpreis.", source: { name: "Europäische Kommission", url: "https://europa.eu/youreurope/citizens/consumers/internet-telecoms/mobile-roaming-costs/index_de.htm" } },
  { title: "Steuererklärung: Auslandskosten absetzen", text: "Umzugskosten für einen beruflich bedingten Auslandsumzug können als Werbungskosten abgesetzt werden. Bewahre alle Belege auf.", source: { name: "Bundesfinanzministerium", url: "https://www.bundesfinanzministerium.de/Web/DE/Themen/Steuern/steuern.html" } },
  { title: "Budgetplanung mit 50/30/20-Regel", text: "Teile dein Nettogehalt auf: 50 % für Fixkosten, 30 % für Freizeit und 20 % für Sparen. Besonders im teuren Ausland hilft diese Struktur, den Überblick zu behalten.", source: { name: "Verbraucherzentrale", url: "https://www.verbraucherzentrale.de/wissen/geld-versicherungen/sparen-und-anlegen/haushaltsbuch-fuehren-so-klappts-11047" } },
  { title: "Kindergeld im Ausland", text: "Eltern, die im EU-Ausland arbeiten, haben unter Umständen weiterhin Anspruch auf deutsches Kindergeld. Die Familienkasse klärt den Anspruch.", source: { name: "Bundesagentur für Arbeit", url: "https://www.arbeitsagentur.de/familie-und-kinder/kindergeld-anspruch" } },
  { title: "Kontowechsel einfach gemacht", text: "Seit 2016 sind deutsche Banken verpflichtet, beim Kontowechsel alle Daueraufträge und Lastschriften automatisch auf das neue Konto umzuleiten.", source: { name: "Deutsche Bundesbank", url: "https://www.bundesbank.de/de/aufgaben/unbarer-zahlungsverkehr/zahlungsverkehrsrecht/kontowechselhilfe-602882" } },
  { title: "Freistellungsauftrag nutzen", text: "Stelle bis zu 1.000 € Freistellungsauftrag pro Person bei deiner Bank ein. So fallen auf Zinserträge bis zu diesem Betrag keine Kapitalertragsteuer an.", source: { name: "Bundesfinanzministerium", url: "https://www.bundesfinanzministerium.de/Web/DE/Themen/Steuern/steuern.html" } },
  { title: "Wechselkurse beobachten", text: "Die Europäische Zentralbank veröffentlicht täglich offizielle Referenzkurse für über 30 Währungen – kostenlos und ohne Werbung unter ecb.europa.eu.", source: { name: "Europäische Zentralbank", url: "https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.de.html" } },
  { title: "Sprachkurs steuerlich absetzen", text: "Sprachkurse im Ausland können als Werbungskosten oder Weiterbildungskosten steuerlich geltend gemacht werden, wenn ein beruflicher Bezug besteht.", source: { name: "Bundesfinanzministerium", url: "https://www.bundesfinanzministerium.de" } },
  { title: "Bargeld im Ausland", text: "Hebe Bargeld lieber an Bankautomaten der Partnerbanken ab – viele deutsche Direktbanken haben kostenlose Netzwerke weltweit. Wechselstuben am Flughafen sind meistens teuer.", source: { name: "Stiftung Warentest", url: "https://www.test.de" } },
  { title: "EU-Einlagensicherung", text: "Bankguthaben in der EU sind bis 100.000 € pro Person und Bank durch die gesetzliche Einlagensicherung geschützt – auch im Ausland innerhalb der EU.", source: { name: "Deutsche Bundesbank", url: "https://www.bundesbank.de/de/aufgaben/bankenaufsicht/einlagensicherung" } },
  { title: "Mietkaution im Ausland", text: "In vielen Ländern ist die Mietkaution gesetzlich begrenzt. In Deutschland sind maximal 3 Monatskaltmieten erlaubt. Kläre die lokalen Regeln vorab.", source: { name: "Verbraucherzentrale", url: "https://www.verbraucherzentrale.de/wissen/wohnen/mieten/mietkaution-so-viel-darf-der-vermieter-verlangen-10656" } },
  { title: "Elektronische Steuererklärung", text: "Mit ELSTER (elster.de) kannst du deine Steuererklärung kostenlos online einreichen – auch wenn du im Ausland lebst und deutsche Einkünfte hast.", source: { name: "Bayerisches Landesamt für Steuern", url: "https://www.elster.de" } },
];

// ── Parse RSS XML (server-side, no external lib needed) ───────────────────
function parseRSS(xml: string): { title: string; description: string; link: string }[] {
  const items: { title: string; description: string; link: string }[] = [];
  const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/g;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];
    const title = (block.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/) ?? block.match(/<title>([\s\S]*?)<\/title>/))?.[1]?.trim() ?? "";
    const desc = (block.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/) ?? block.match(/<description>([\s\S]*?)<\/description>/))?.[1]
      ?.replace(/<[^>]+>/g, "").trim() ?? "";
    const link = (block.match(/<link>([\s\S]*?)<\/link>/) ?? block.match(/<guid[^>]*>(https?:\/\/[^<]+)<\/guid>/))?.[1]?.trim() ?? "";
    if (title && link) items.push({ title, description: desc.slice(0, 200), link });
  }
  return items.slice(0, 4);
}

export async function GET() {
  const today = new Date();
  const todayStr = today.toLocaleDateString("de-DE", { day: "2-digit", month: "long", year: "numeric", timeZone: "Europe/Berlin" });
  const tip = TIPS[today.getDate() % TIPS.length];

  // Fetch in parallel: exchange rates (today + yesterday) + news RSS
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yStr = yesterday.toISOString().slice(0, 10);

  const [ratesRes, prevRatesRes, rssRes] = await Promise.allSettled([
    fetch("https://api.frankfurter.dev/v1/latest?from=EUR", { next: { revalidate: 86400 } }),
    fetch(`https://api.frankfurter.dev/v1/${yStr}?from=EUR`, { next: { revalidate: 86400 } }),
    fetch("https://www.tagesschau.de/wirtschaft/rss2", { next: { revalidate: 3600 } }),
  ]);

  // Exchange rates
  let rates: Record<string, number> = {};
  let prevRates: Record<string, number> = {};
  let rateDate = todayStr;

  if (ratesRes.status === "fulfilled" && ratesRes.value.ok) {
    const d = await ratesRes.value.json();
    rates = d.rates ?? {};
    rateDate = d.date ?? todayStr;
  }
  if (prevRatesRes.status === "fulfilled" && prevRatesRes.value.ok) {
    const d = await prevRatesRes.value.json();
    prevRates = d.rates ?? {};
  }

  const DISPLAY_CURRENCIES = ["USD", "GBP", "CHF", "JPY", "SEK", "PLN"];
  const exchangeRates = DISPLAY_CURRENCIES.filter((c) => rates[c]).map((code) => {
    const current = rates[code];
    const prev = prevRates[code];
    const change = prev ? ((current - prev) / prev) * 100 : 0;
    return { code, rate: current, change: Math.round(change * 100) / 100 };
  });

  // News from Tagesschau
  let articles: { title: string; summary: string; link: string }[] = [];
  if (rssRes.status === "fulfilled" && rssRes.value.ok) {
    const xml = await rssRes.value.text();
    const parsed = parseRSS(xml);
    articles = parsed.map((item) => ({
      title: item.title,
      summary: item.description || "Mehr auf tagesschau.de",
      link: item.link,
    }));
  }

  // Fallback articles if RSS unavailable
  if (articles.length === 0) {
    articles = [
      { title: "Tagesschau Wirtschaftsnachrichten", summary: "Aktuelle Wirtschaftsnachrichten aus Deutschland und der Welt.", link: "https://www.tagesschau.de/wirtschaft" },
    ];
  }

  const newsletter = {
    date: todayStr,
    rateDate,
    exchangeRates,
    articles: articles.map((a) => ({
      ...a,
      source: { name: "Tagesschau", url: "https://www.tagesschau.de/wirtschaft", hint: "Öffentlich-rechtliche Berichterstattung (ARD)" },
    })),
    tip,
  };

  return NextResponse.json(newsletter, {
    headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
  });
}
