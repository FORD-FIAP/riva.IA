/**
 * Função serverless (Vercel) que busca a imagem real de um veículo via
 * CarImages (https://carimagesapi.com) — mantém a chave fora do app mobile.
 *
 * Requer a env var CARIMAGES_API_KEY configurada no projeto Vercel
 * (Settings > Environment Variables). Plano Free: 5.000 req/mês, com marca
 * d'água e só WebP — suficiente pra validar a integração.
 */

const CARIMAGES_URL = 'https://carimagesapi.com/api/v1/signed-url';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Método não permitido' });
    return;
  }

  const apiKey = process.env.CARIMAGES_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'CARIMAGES_API_KEY não configurada no servidor' });
    return;
  }

  const { make, model, year, view } = req.query;
  if (!make) {
    res.status(400).json({ error: 'make é obrigatório' });
    return;
  }

  const params = new URLSearchParams({ api_key: apiKey, make: String(make) });
  if (model) params.set('model', String(model));
  if (year) params.set('year', String(year));
  if (view) params.set('view', String(view));

  try {
    const response = await fetch(`${CARIMAGES_URL}?${params.toString()}`);

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
      console.error('CarImages respondeu erro:', response.status, errorBody);
      res.status(200).json({ url: null });
      return;
    }

    const data = await response.json();
    res.status(200).json({ url: data?.url ?? null });
  } catch (err) {
    console.error('Erro de rede ao consultar a CarImages:', err);
    res.status(200).json({ url: null });
  }
}
