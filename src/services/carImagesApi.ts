/**
 * Cliente do backend de imagens (função serverless em `/api/carImage`, proxy
 * pra CarImages). Mesmo padrão do chat/notícias: se `EXPO_PUBLIC_API_BASE_URL`
 * não estiver configurada, ou a chamada falhar, retorna `null` — quem chama
 * decide o fallback (ícone genérico).
 */
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? '';

export async function fetchCarImageUrl(marca: string, modelo?: string): Promise<string | null> {
  if (!API_BASE_URL) return null;

  try {
    const params = new URLSearchParams({ make: marca });
    if (modelo) params.set('model', modelo);
    const response = await fetch(`${API_BASE_URL}/api/carImage?${params.toString()}`);
    if (!response.ok) return null;
    const data = await response.json();
    return typeof data?.url === 'string' ? data.url : null;
  } catch {
    return null;
  }
}
