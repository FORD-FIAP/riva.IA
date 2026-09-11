/** Notícias do setor automotivo exibidas na Sidebar e na tela de Notícias — fallback mockado (vazio) */
export interface Noticia {
  id: string;
  titulo: string;
  fonte: string;
  descricao?: string;
  url?: string;
  publicadoEm?: string;
}

export const noticias: Noticia[] = [];
