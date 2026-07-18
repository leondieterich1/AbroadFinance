export type BankInfo = {
  name: string;
  url: string;
  logo: string;
  color: string;
};

// BLZ → bank info for all major German banks
// BLZ is digits 5–12 of a German IBAN (DE + 2 check + 8 BLZ + 10 account)
const DB: Record<string, BankInfo> = {
  // ── National banks ──────────────────────────────────────────────────────────
  "12030000": { name: "DKB",               url: "https://banking.dkb.de/banking",           logo: "https://logo.clearbit.com/dkb.de",            color: "#1C3661" },
  "50010517": { name: "ING",               url: "https://fints.ing.de/fints",               logo: "https://logo.clearbit.com/ing.de",            color: "#FF6200" },
  "20041133": { name: "Comdirect",         url: "https://fints.comdirect.de/fints",         logo: "https://logo.clearbit.com/comdirect.de",      color: "#FFCC00" },
  "20010020": { name: "Postbank",          url: "https://banking.postbank.de/banking",      logo: "https://logo.clearbit.com/postbank.de",       color: "#FFCC00" },
  "70020270": { name: "HypoVereinsbank",   url: "https://fints.hypovereinsbank.de/banking", logo: "https://logo.clearbit.com/hypovereinsbank.de",color: "#D40511" },
  "21010022": { name: "Santander",         url: "https://fints.santander.de/banking",       logo: "https://logo.clearbit.com/santander.de",      color: "#EC0000" },
  "30020900": { name: "Targobank",         url: "https://fints.targobank.de/banking",       logo: "https://logo.clearbit.com/targobank.de",      color: "#D40511" },
  "76026000": { name: "Norisbank",         url: "https://fints.norisbank.de/banking",       logo: "https://logo.clearbit.com/norisbank.de",      color: "#C00000" },

  // ── Deutsche Bank (many regional BLZs, same URL) ───────────────────────────
  "10070000": { name: "Deutsche Bank",     url: "https://fints.deutsche-bank.de/banking",   logo: "https://logo.clearbit.com/deutsche-bank.de",  color: "#005EB8" },
  "20070000": { name: "Deutsche Bank",     url: "https://fints.deutsche-bank.de/banking",   logo: "https://logo.clearbit.com/deutsche-bank.de",  color: "#005EB8" },
  "30070010": { name: "Deutsche Bank",     url: "https://fints.deutsche-bank.de/banking",   logo: "https://logo.clearbit.com/deutsche-bank.de",  color: "#005EB8" },
  "37070060": { name: "Deutsche Bank",     url: "https://fints.deutsche-bank.de/banking",   logo: "https://logo.clearbit.com/deutsche-bank.de",  color: "#005EB8" },
  "40070080": { name: "Deutsche Bank",     url: "https://fints.deutsche-bank.de/banking",   logo: "https://logo.clearbit.com/deutsche-bank.de",  color: "#005EB8" },
  "44070080": { name: "Deutsche Bank",     url: "https://fints.deutsche-bank.de/banking",   logo: "https://logo.clearbit.com/deutsche-bank.de",  color: "#005EB8" },
  "50070010": { name: "Deutsche Bank",     url: "https://fints.deutsche-bank.de/banking",   logo: "https://logo.clearbit.com/deutsche-bank.de",  color: "#005EB8" },
  "51070021": { name: "Deutsche Bank",     url: "https://fints.deutsche-bank.de/banking",   logo: "https://logo.clearbit.com/deutsche-bank.de",  color: "#005EB8" },
  "60070070": { name: "Deutsche Bank",     url: "https://fints.deutsche-bank.de/banking",   logo: "https://logo.clearbit.com/deutsche-bank.de",  color: "#005EB8" },
  "70070010": { name: "Deutsche Bank",     url: "https://fints.deutsche-bank.de/banking",   logo: "https://logo.clearbit.com/deutsche-bank.de",  color: "#005EB8" },
  "76070024": { name: "Deutsche Bank",     url: "https://fints.deutsche-bank.de/banking",   logo: "https://logo.clearbit.com/deutsche-bank.de",  color: "#005EB8" },
  "80070000": { name: "Deutsche Bank",     url: "https://fints.deutsche-bank.de/banking",   logo: "https://logo.clearbit.com/deutsche-bank.de",  color: "#005EB8" },

  // ── Commerzbank (many regional BLZs) ──────────────────────────────────────
  "10040000": { name: "Commerzbank",       url: "https://fints.commerzbank.de/banking",     logo: "https://logo.clearbit.com/commerzbank.de",    color: "#FFCC00" },
  "20040000": { name: "Commerzbank",       url: "https://fints.commerzbank.de/banking",     logo: "https://logo.clearbit.com/commerzbank.de",    color: "#FFCC00" },
  "30040000": { name: "Commerzbank",       url: "https://fints.commerzbank.de/banking",     logo: "https://logo.clearbit.com/commerzbank.de",    color: "#FFCC00" },
  "37040044": { name: "Commerzbank",       url: "https://fints.commerzbank.de/banking",     logo: "https://logo.clearbit.com/commerzbank.de",    color: "#FFCC00" },
  "40040000": { name: "Commerzbank",       url: "https://fints.commerzbank.de/banking",     logo: "https://logo.clearbit.com/commerzbank.de",    color: "#FFCC00" },
  "47040000": { name: "Commerzbank",       url: "https://fints.commerzbank.de/banking",     logo: "https://logo.clearbit.com/commerzbank.de",    color: "#FFCC00" },
  "50040000": { name: "Commerzbank",       url: "https://fints.commerzbank.de/banking",     logo: "https://logo.clearbit.com/commerzbank.de",    color: "#FFCC00" },
  "60040071": { name: "Commerzbank",       url: "https://fints.commerzbank.de/banking",     logo: "https://logo.clearbit.com/commerzbank.de",    color: "#FFCC00" },
  "70040041": { name: "Commerzbank",       url: "https://fints.commerzbank.de/banking",     logo: "https://logo.clearbit.com/commerzbank.de",    color: "#FFCC00" },
  "80040000": { name: "Commerzbank",       url: "https://fints.commerzbank.de/banking",     logo: "https://logo.clearbit.com/commerzbank.de",    color: "#FFCC00" },

  // ── Major Sparkassen ───────────────────────────────────────────────────────
  "20050550": { name: "Hamburger Sparkasse (Haspa)",      url: "https://www.haspa.de/banking",                      logo: "https://logo.clearbit.com/haspa.de",          color: "#E30613" },
  "37050198": { name: "Sparkasse KölnBonn",              url: "https://www.sparkasse-koelnbonn.de/banking",        logo: "https://logo.clearbit.com/sparkasse.de",      color: "#E30613" },
  "70150000": { name: "Stadtsparkasse München",          url: "https://www.sskm.de/banking",                       logo: "https://logo.clearbit.com/sparkasse.de",      color: "#E30613" },
  "30050110": { name: "Stadtsparkasse Düsseldorf",       url: "https://www.sskduesseldorf.de/banking",             logo: "https://logo.clearbit.com/sparkasse.de",      color: "#E30613" },
  "39050000": { name: "Sparkasse Aachen",                url: "https://www.sparkasse-aachen.de/banking",           logo: "https://logo.clearbit.com/sparkasse.de",      color: "#E30613" },
  "76050101": { name: "Sparkasse Nürnberg",              url: "https://www.sparkasse-nuernberg.de/banking",        logo: "https://logo.clearbit.com/sparkasse.de",      color: "#E30613" },
  "68050101": { name: "Sparkasse Freiburg",              url: "https://www.sparkasse-freiburg.de/banking",         logo: "https://logo.clearbit.com/sparkasse.de",      color: "#E30613" },
  "61150020": { name: "Kreissparkasse Esslingen",        url: "https://www.ksk-es.de/banking",                     logo: "https://logo.clearbit.com/sparkasse.de",      color: "#E30613" },
  "59050101": { name: "Sparkasse Worms-Alzey-Ried",      url: "https://www.sk-war.de/banking",                     logo: "https://logo.clearbit.com/sparkasse.de",      color: "#E30613" },
  "55050110": { name: "Sparkasse Kaiserslautern",        url: "https://www.sparkasse-kl.de/banking",               logo: "https://logo.clearbit.com/sparkasse.de",      color: "#E30613" },
  "53050180": { name: "Sparkasse KoblenzMittelrhein",    url: "https://www.sparkasse-koblenz.de/banking",          logo: "https://logo.clearbit.com/sparkasse.de",      color: "#E30613" },
  "51050015": { name: "Nassauische Sparkasse",           url: "https://www.naspa.de/banking",                      logo: "https://logo.clearbit.com/naspa.de",          color: "#E30613" },
  "50050201": { name: "Frankfurter Sparkasse",           url: "https://www.frankfurter-sparkasse.de/banking",      logo: "https://logo.clearbit.com/sparkasse.de",      color: "#E30613" },
  "46050001": { name: "Sparkasse Paderborn-Detmold",     url: "https://www.sparkasse-paderborn-detmold.de/banking",logo: "https://logo.clearbit.com/sparkasse.de",      color: "#E30613" },
  "43050057": { name: "Sparkasse Gelsenkirchen",         url: "https://www.sparkasse-gelsenkirchen.de/banking",    logo: "https://logo.clearbit.com/sparkasse.de",      color: "#E30613" },
  "25050180": { name: "Sparkasse Hannover",              url: "https://www.sparkasse-hannover.de/banking",         logo: "https://logo.clearbit.com/sparkasse.de",      color: "#E30613" },
  "13051042": { name: "Mittelbrandenburgische Sparkasse",url: "https://www.mbs.de/banking",                        logo: "https://logo.clearbit.com/mbs.de",            color: "#E30613" },
  "10050000": { name: "Berliner Sparkasse",              url: "https://www.berliner-sparkasse.de/banking",         logo: "https://logo.clearbit.com/berliner-sparkasse.de",color: "#E30613" },

  // ── Major Volksbanken / Raiffeisenbanken ───────────────────────────────────
  "20069517": { name: "Hamburger Volksbank",             url: "https://www.hamburger-volksbank.de/banking",        logo: "https://logo.clearbit.com/volksbank.de",      color: "#004B9B" },
  "37060590": { name: "Volksbank Köln Bonn",             url: "https://www.volksbank-koeln-bonn.de/banking",       logo: "https://logo.clearbit.com/volksbank.de",      color: "#004B9B" },
  "70160000": { name: "Volksbank München",               url: "https://www.volksbank-muenchen.de/banking",         logo: "https://logo.clearbit.com/volksbank.de",      color: "#004B9B" },
  "30060601": { name: "Volksbank Düsseldorf Neuss",      url: "https://www.volksbank-duesseldorf-neuss.de/banking",logo: "https://logo.clearbit.com/volksbank.de",      color: "#004B9B" },
  "50190000": { name: "Frankfurter Volksbank",           url: "https://www.frankfurter-volksbank.de/banking",      logo: "https://logo.clearbit.com/volksbank.de",      color: "#004B9B" },
  "76090500": { name: "Volksbank Nürnberg",              url: "https://www.volksbank-nuernberg.de/banking",        logo: "https://logo.clearbit.com/volksbank.de",      color: "#004B9B" },
  "10090000": { name: "Berliner Volksbank",              url: "https://www.berliner-volksbank.de/banking",         logo: "https://logo.clearbit.com/berliner-volksbank.de",color: "#004B9B" },
  "25060000": { name: "Volksbank Hannover",              url: "https://www.volksbank-hannover.de/banking",         logo: "https://logo.clearbit.com/volksbank.de",      color: "#004B9B" },

  // ── Other known banks ─────────────────────────────────────────────────────
  "10011001": { name: "N26",               url: "",                                          logo: "https://logo.clearbit.com/n26.com",            color: "#1E1E1E" },
};

// Sparkasse URL patterns by BLZ prefix (best effort)
const SPARKASSE_REGIONS: Array<{ test: (blz: string) => boolean; suffix: string }> = [
  { test: (b) => b.startsWith("10050") || b.startsWith("1005"),    suffix: "be" },
  { test: (b) => parseInt(b.slice(0,2)) === 13,                    suffix: "bb" },
  { test: (b) => b.startsWith("20050") || b.startsWith("21050") || b.startsWith("22050"), suffix: "sh" },
  { test: (b) => b.startsWith("23050"),                            suffix: "mv" },
  { test: (b) => parseInt(b.slice(0,2)) >= 25 && parseInt(b.slice(0,2)) <= 28, suffix: "nb" },
  { test: (b) => b.startsWith("29"),                               suffix: "hb" },
  { test: (b) => parseInt(b.slice(0,2)) >= 30 && parseInt(b.slice(0,2)) <= 34, suffix: "rw" },
  { test: (b) => parseInt(b.slice(0,2)) >= 35 && parseInt(b.slice(0,2)) <= 39, suffix: "wl" },
  { test: (b) => parseInt(b.slice(0,2)) >= 40 && parseInt(b.slice(0,2)) <= 49, suffix: "wl" },
  { test: (b) => parseInt(b.slice(0,2)) >= 50 && parseInt(b.slice(0,2)) <= 54, suffix: "ht" },
  { test: (b) => parseInt(b.slice(0,2)) >= 55 && parseInt(b.slice(0,2)) <= 58, suffix: "rp" },
  { test: (b) => b.startsWith("59"),                               suffix: "rp" },
  { test: (b) => parseInt(b.slice(0,2)) >= 60 && parseInt(b.slice(0,2)) <= 69, suffix: "bw" },
  { test: (b) => parseInt(b.slice(0,2)) >= 70 && parseInt(b.slice(0,2)) <= 79, suffix: "by" },
  { test: (b) => parseInt(b.slice(0,2)) >= 80 && parseInt(b.slice(0,2)) <= 84, suffix: "sn" },
  { test: (b) => parseInt(b.slice(0,2)) >= 85 && parseInt(b.slice(0,2)) <= 89, suffix: "st" },
];

function guessSparkasseUrl(blz: string): string[] {
  const region = SPARKASSE_REGIONS.find((r) => r.test(blz));
  if (!region) return [];
  return [
    `https://banking-${blz}.s-fints-pt-${region.suffix}.de/fints30`,
    `https://banking-${blz}.s-fints-pt-${region.suffix}.de/fints`,
  ];
}

function guessVolksbankUrl(blz: string): string[] {
  return [
    `https://banking-${blz}.vr-networld.de/vr-innovations/fints/login`,
    `https://banking-${blz}.vr-networld.de/banking`,
  ];
}

/** Extract BLZ from German IBAN (DE + 2 check + 8 BLZ + 10 account) */
export function ibanToBlz(iban: string): string | null {
  const clean = iban.replace(/\s/g, "").toUpperCase();
  if (!clean.startsWith("DE") || clean.length !== 22) return null;
  return clean.slice(4, 12);
}

/** Look up bank by BLZ (exact match from database) */
export function lookupBlz(blz: string): BankInfo | null {
  return DB[blz] ?? null;
}

/** Return candidate FinTS URLs to try for a BLZ (for auto-discovery) */
export function candidateUrls(blz: string): string[] {
  const known = DB[blz];
  if (known?.url) return [known.url];

  // Sparkasse heuristic (BLZ 2x-8x ranges that aren't in major banks)
  const prefix2 = parseInt(blz.slice(0, 2));
  if ([10, 13, 20, 21, 22, 23, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 37, 38, 39,
       40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59,
       60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79,
       80, 81, 82, 83, 84, 85, 86, 87, 88, 89].includes(prefix2)) {
    const spk = guessSparkasseUrl(blz);
    const vr = guessVolksbankUrl(blz);
    return [...spk, ...vr];
  }
  return [];
}
