import { useCallback, useEffect, useState } from 'react';

export interface CBUCurrencyRow {
  Ccy: string;
  Rate: string;
  Diff: string;
  Date: string;
}

export function parseCbuRate(rate: string): number {
  const n = parseFloat(String(rate).replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
}

export function useCbuRates() {
  const [list, setList] = useState<CBUCurrencyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [updatedAt, setUpdatedAt] = useState('');

  const fetchRates = useCallback(() => {
    setLoading(true);
    setError(false);
    fetch('https://cbu.uz/uz/arkhiv-kursov-valyut/json/')
      .then((r) => r.json())
      .then((rows: CBUCurrencyRow[]) => {
        setList(Array.isArray(rows) ? rows : []);
        const usd = Array.isArray(rows) ? rows.find((c) => c.Ccy === 'USD') : undefined;
        if (usd) setUpdatedAt(usd.Date);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  const usd = list.find((c) => c.Ccy === 'USD') ?? null;
  const eur = list.find((c) => c.Ccy === 'EUR') ?? null;

  return { usd, eur, list, loading, error, updatedAt, refetch: fetchRates };
}
