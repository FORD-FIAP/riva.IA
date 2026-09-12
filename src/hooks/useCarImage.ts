/** Imagem real do veículo (CarImages), com fallback pro ícone genérico. */
import { useEffect, useState } from 'react';
import { fetchCarImageUrl } from '../services/carImagesApi';

export function useCarImage(marca: string, modelo?: string) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchCarImageUrl(marca, modelo).then((result) => {
      if (cancelled) return;
      setUrl(result);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [marca, modelo]);

  return { url, loading };
}
