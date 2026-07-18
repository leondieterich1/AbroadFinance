export type KnownBank = {
  name: string;
  color: string;
  logo: string;
  blz: string;
  url: string;
};

export const KNOWN_BANKS: KnownBank[] = [
  {
    name: "DKB",
    color: "#1C3661",
    logo: "https://logo.clearbit.com/dkb.de",
    blz: "12030000",
    url: "https://banking.dkb.de/banking",
  },
  {
    name: "ING",
    color: "#FF6200",
    logo: "https://logo.clearbit.com/ing.de",
    blz: "50010517",
    url: "https://fints.ing.de/fints",
  },
  {
    name: "Comdirect",
    color: "#FFCC00",
    logo: "https://logo.clearbit.com/comdirect.de",
    blz: "20041133",
    url: "https://fints.comdirect.de/fints",
  },
  {
    name: "Postbank",
    color: "#FFCC00",
    logo: "https://logo.clearbit.com/postbank.de",
    blz: "20010020",
    url: "https://banking.postbank.de/banking",
  },
  {
    name: "Deutsche Bank",
    color: "#005EB8",
    logo: "https://logo.clearbit.com/deutsche-bank.de",
    blz: "10070000",
    url: "https://fints.deutsche-bank.de/banking",
  },
  {
    name: "Commerzbank",
    color: "#FFCC00",
    logo: "https://logo.clearbit.com/commerzbank.de",
    blz: "20040000",
    url: "https://fints.commerzbank.de/banking",
  },
  {
    name: "Volksbank / VR-Bank",
    color: "#004B9B",
    logo: "https://logo.clearbit.com/volksbank.de",
    blz: "",
    url: "",
  },
  {
    name: "Sparkasse",
    color: "#E30613",
    logo: "https://logo.clearbit.com/sparkasse.de",
    blz: "",
    url: "",
  },
  {
    name: "Andere Bank",
    color: "#374151",
    logo: "",
    blz: "",
    url: "",
  },
];
