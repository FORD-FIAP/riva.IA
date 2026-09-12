/** Tipo compartilhado do filtro por marca — usado por Veículos e Comparar. */
export interface FilterState {
  brands: string[];
  bodyStyle: string | null;
  priceMin: number | null;
  priceMax: number | null;
}

export const EMPTY_FILTERS: FilterState = {
  brands: [],
  bodyStyle: null,
  priceMin: null,
  priceMax: null,
};
