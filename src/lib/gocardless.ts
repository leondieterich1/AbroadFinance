const BASE = "https://bankaccountdata.gocardless.com/api/v2";

// In-memory token cache (per serverless instance)
let cachedToken: { access: string; expiresAt: number } | null = null;

async function getToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.access;
  }
  const res = await fetch(`${BASE}/token/new/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      secret_id: process.env.GOCARDLESS_SECRET_ID,
      secret_key: process.env.GOCARDLESS_SECRET_KEY,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GoCardless auth failed ${res.status}: ${text}`);
  }
  const data = await res.json();
  cachedToken = {
    access: data.access,
    expiresAt: Date.now() + (data.access_expires ?? 86400) * 1000,
  };
  return cachedToken.access;
}

async function gc<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init.headers ?? {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GoCardless ${path} → ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

export type GCInstitution = {
  id: string;
  name: string;
  bic: string;
  transaction_total_days: string;
  countries: string[];
  logo: string;
};

export type GCRequisition = {
  id: string;
  status: string;
  link: string;
  accounts: string[];
};

export type GCAccountDetails = {
  account: {
    iban?: string;
    name?: string;
    ownerName?: string;
    currency?: string;
    product?: string;
    cashAccountType?: string;
  };
};

export type GCBalance = {
  balanceAmount: { amount: string; currency: string };
  balanceType: string;
};

export type GCTransaction = {
  transactionId?: string;
  bookingDate?: string;
  valueDate?: string;
  transactionAmount: { amount: string; currency: string };
  remittanceInformationUnstructured?: string;
  remittanceInformationStructured?: string;
  creditorName?: string;
  debtorName?: string;
};

export async function listInstitutions(country = "DE"): Promise<GCInstitution[]> {
  return gc<GCInstitution[]>(`/institutions/?country=${country}`);
}

export async function createRequisition(
  institutionId: string,
  redirectUrl: string
): Promise<GCRequisition> {
  return gc<GCRequisition>("/requisitions/", {
    method: "POST",
    body: JSON.stringify({
      redirect: redirectUrl,
      institution_id: institutionId,
      user_language: "DE",
    }),
  });
}

export async function getRequisition(id: string): Promise<GCRequisition> {
  return gc<GCRequisition>(`/requisitions/${id}/`);
}

export async function getAccountDetails(accountId: string): Promise<GCAccountDetails> {
  return gc<GCAccountDetails>(`/accounts/${accountId}/details/`);
}

export async function getAccountBalances(accountId: string): Promise<{ balances: GCBalance[] }> {
  return gc<{ balances: GCBalance[] }>(`/accounts/${accountId}/balances/`);
}

export async function getAccountTransactions(accountId: string): Promise<{
  transactions: { booked: GCTransaction[]; pending: GCTransaction[] };
}> {
  return gc(`/accounts/${accountId}/transactions/`);
}

export function isConfigured(): boolean {
  return !!(process.env.GOCARDLESS_SECRET_ID && process.env.GOCARDLESS_SECRET_KEY);
}
