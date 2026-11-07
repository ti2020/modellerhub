/**
 * Tarig Salah's AFM practice models.
 * Sheet data lives in client/public/models/<slug>.json — values only, exported by
 * scripts/export_models.py. Formulas are never published.
 */
export const MODELLER_NAME = 'Tarig Salah';

export interface ModelInfo {
  slug: string;
  name: string;
  /** Accent colour used for this model's header and highlights. */
  accent: string;
  youtubeId?: string;
}

export const MODELS: ModelInfo[] = [
  { slug: 'henderson', name: 'Henderson Manufacturing', accent: '#1F4E79', youtubeId: 'xGWlE_y2vpQ' },
  { slug: 'passion-paints', name: 'Passion Paints', accent: '#B83B5E', youtubeId: 'xrmiFZqyOmU' },
  { slug: 'transatlantic', name: 'Transatlantic Railway', accent: '#2E6E5E', youtubeId: '2l3uoIOS0F0' },
  { slug: 'global-discount', name: 'Global Discount', accent: '#C5A065', youtubeId: 'ZFSRP28kLkw' },
  { slug: 'nudu-noodles', name: 'Nudu Noodles', accent: '#D97706', youtubeId: 'WOleqsaOY_Y' },
  { slug: 'blue-rose', name: 'Blue Rose', accent: '#2563EB', youtubeId: 'bVJAETY12gw' },
  { slug: 'bnd', name: 'BND Company', accent: '#7C3AED', youtubeId: 'Iw9EHkmO7FU' },
  { slug: 'purewave-sips', name: 'PureWave Sips', accent: '#0891B2', youtubeId: 'oqgng9J-hh0' },
  { slug: 'etd-homes', name: 'ETD Homes', accent: '#9A3412', youtubeId: 'eXhYtDYzCTI' },
  { slug: 'fast-moving', name: 'Fast Moving Inc.', accent: '#16A34A', youtubeId: '1Li2IFyN5d0' },
  { slug: 'fresh-and-fab', name: 'Fresh & Fab', accent: '#65A30D', youtubeId: 'PQ4peGM23p8' },
  { slug: 'gator', name: 'Gator Inc.', accent: '#047857', youtubeId: '7vfA5IhHkkY' },
  { slug: 'jkl-logistics', name: 'JKL Logistics', accent: '#4338CA', youtubeId: 'c1482vXpljo' },
  { slug: 'lnc-manufacturing', name: 'LNC Manufacturing', accent: '#BE123C', youtubeId: '2qzTiZQz33k' },
  { slug: 'parker', name: 'Parker Inc.', accent: '#0F766E', youtubeId: 'WqaiiSbrij0' },
  { slug: 'storage-corp', name: 'Storage Corporation', accent: '#475569', youtubeId: 'xuKXPeu1uXI' },
  { slug: 'farley', name: 'Farley Inc.', accent: '#A21CAF', youtubeId: 'vYhPDhpBn0I' },
];

export interface SheetData {
  name: string;
  cols: number[];
  rows: { r: number; c: [number, string, number][] }[];
  merges: [number, number, number, number][];
  grid: boolean;
}

export interface ModelData {
  slug: string;
  name: string;
  accent: string;
  sheets: SheetData[];
  styles: { b?: 1; i?: 1; u?: 1; c?: string; bg?: string; a?: 'center' | 'right' | 'cc'; in?: number; bt?: 1; bb?: 1 | 2; sz?: number }[];
}
