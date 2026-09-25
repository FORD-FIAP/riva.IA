/** Helpers compartilhados pra exibir a ficha técnica dos veículos mockados. */
import { FichaTecnica } from '../mock/mockVehicles';

export const SECTION_LABELS: Record<keyof FichaTecnica, string> = {
  identificacao: 'Identificação',
  motor: 'Motor',
  desempenho: 'Desempenho',
  transmissao: 'Transmissão / Tração',
  dimensoes: 'Dimensões',
  pesoCapacidade: 'Peso e Capacidade',
  suspensaoFreiosDirecao: 'Suspensão / Freios / Direção',
  consumoEmissoes: 'Consumo / Emissões',
  seguranca: 'Segurança',
  eletricoHibrido: 'Elétrico / Híbrido',
};

/** "potenciaMaxima" -> "Potência Maxima" (sem acentuar de volta — só separa as palavras). */
export function formatFieldLabel(key: string): string {
  const spaced = key.replace(/([A-Z])/g, ' $1').toLowerCase();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

/**
 * Campos de "desempenho"/"pesoCapacidade"/"consumoEmissoes" que dá pra
 * comparar numericamente entre veículos, e em que direção um valor maior é
 * "melhor" — usado só pra destacar o vencedor na comparação, não muda o dado.
 */
export const COMPARABLE_FIELDS: Record<string, 'maior' | 'menor'> = {
  potência: 'maior',
  torque: 'maior',
  velMáxima: 'maior',
  zeroA100: 'menor',
  pesoPorPotência: 'menor',
  consumoUrbano: 'maior',
  consumoEstrada: 'maior',
  portaMalas: 'maior',
};

/** Extrai o primeiro número de uma string tipo "205 cv @ 3.500 rpm" -> 205. */
export function extractLeadingNumber(value: string): number | null {
  const match = value.replace(/\./g, '').match(/-?\d+(?:,\d+)?/);
  if (!match) return null;
  return parseFloat(match[0].replace(',', '.'));
}

/** Índice do melhor valor entre uma lista (ou null se o campo não é comparável / empate). */
export function bestValueIndex(fieldKey: string, values: (string | undefined)[]): number | null {
  const direction = COMPARABLE_FIELDS[fieldKey];
  if (!direction) return null;

  const parsed = values.map((v) => (v ? extractLeadingNumber(v) : null));
  if (parsed.every((n) => n === null)) return null;

  let bestIndex: number | null = null;
  let bestValue: number | null = null;
  parsed.forEach((n, i) => {
    if (n === null) return;
    if (bestValue === null || (direction === 'maior' ? n > bestValue : n < bestValue)) {
      bestValue = n;
      bestIndex = i;
    }
  });
  return bestIndex;
}
