import { useLanguage } from '@/contexts/LanguageContext';
import { findModel, MODELLER } from '@/data/models';
import { ArrowLeft, Loader2, Lock } from 'lucide-react';
import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { Link, useParams } from 'wouter';

type Style = { b?: 1; i?: 1; u?: 1; c?: string; s?: number; bg?: string; a?: 'left' | 'center' | 'right'; in?: number; bt?: number; bb?: number };
type Cell = string | [string, number];
type Sheet = { name: string; cols: { w: number; h: boolean }[]; rows: { r: number; c: Cell[] }[]; merges: number[][]; tab: string | null };
type ModelData = { styles: Style[]; sheets: Sheet[] };

const colLetter = (n: number) => {
  let s = '';
  for (; n > 0; n = Math.floor((n - 1) / 26)) s = String.fromCharCode(65 + ((n - 1) % 26)) + s;
  return s;
};

function cellStyle(st: Style | undefined, width: number): CSSProperties {
  const css: CSSProperties = { minWidth: width, maxWidth: width, width };
  if (!st) return css;
  if (st.b) css.fontWeight = 700;
  if (st.i) css.fontStyle = 'italic';
  if (st.u) css.textDecoration = 'underline';
  if (st.c) css.color = `#${st.c}`;
  if (st.s) css.fontSize = Math.max(11, Math.min(20, Math.round(st.s * 1.15)));
  if (st.bg) css.background = `#${st.bg}`;
  if (st.a) css.textAlign = st.a;
  if (st.in) css.paddingLeft = 6 + st.in * 10;
  if (st.bt) css.borderTop = `${st.bt}px solid #333`;
  if (st.bb) css.borderBottom = `${st.bb}px solid #333`;
  return css;
}

export default function ModelViewer() {
  const { slug = '' } = useParams<{ slug: string }>();
  const { t } = useLanguage();
  const model = findModel(slug);
  const [data, setData] = useState<ModelData | null>(null);
  const [failed, setFailed] = useState(false);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!model) return;
    setData(null);
    setFailed(false);
    setActive(0);
    fetch(`/models/${model.slug}.json`)
      .then(r => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then(setData)
      .catch(() => setFailed(true));
  }, [model?.slug]);

  const sheet = data?.sheets[active];

  // Merged ranges: top-left cell gets colSpan/rowSpan, covered cells are skipped.
  const mergeInfo = useMemo(() => {
    const span = new Map<string, { cs: number; rs: number }>();
    const covered = new Set<string>();
    sheet?.merges.forEach(([r1, c1, r2, c2]) => {
      span.set(`${r1}:${c1}`, { cs: c2 - c1 + 1, rs: r2 - r1 + 1 });
      for (let r = r1; r <= r2; r++) for (let c = c1; c <= c2; c++) if (r !== r1 || c !== c1) covered.add(`${r}:${c}`);
    });
    return { span, covered };
  }, [sheet]);

  if (!model) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
        <p className="text-gray-700">{t('models.notFound')}</p>
        <Link href="/models"><a className="text-[#002B5C] underline">{t('models.back')}</a></Link>
      </div>
    );
  }

  const visibleCols = sheet ? sheet.cols.map((c, i) => ({ ...c, n: i + 1 })).filter(c => !c.h) : [];
  const shownRows = sheet ? new Set(sheet.rows.map(r => r.r)) : new Set<number>();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="text-white" style={{ background: model.color }}>
        <div className="container mx-auto px-4 py-6">
          <Link href="/models">
            <a className="inline-flex items-center gap-1 text-sm opacity-90 hover:opacity-100"><ArrowLeft size={16} aria-hidden="true" /> {t('models.back')}</a>
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold mt-2">{model.name}</h1>
          <p className="mt-1 text-sm opacity-95">{t('models.modelledBy')} <b>{MODELLER}</b> · {model.focus}</p>
          <p className="mt-2 text-xs opacity-90 inline-flex items-center gap-1"><Lock size={12} aria-hidden="true" /> {t('models.readOnly')}</p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {failed && <p className="text-red-700">{t('models.loadError')}</p>}
        {!data && !failed && (
          <div className="flex justify-center py-16"><Loader2 className="animate-spin text-[#002B5C]" size={32} /></div>
        )}
        {data && sheet && (
          <>
            <div role="tablist" aria-label={t('models.sheets')} className="flex flex-wrap gap-2 mb-3">
              {data.sheets.map((s, i) => (
                <button
                  key={s.name}
                  role="tab"
                  aria-selected={i === active}
                  onClick={() => setActive(i)}
                  className={`px-4 py-2 rounded-t-lg text-sm font-medium border ${i === active ? 'bg-white text-gray-900 border-gray-300 border-b-white' : 'bg-gray-200 text-gray-700 border-transparent hover:bg-gray-300'}`}
                  style={i === active ? { borderTop: `3px solid ${model.color}` } : undefined}
                >
                  {s.name}
                </button>
              ))}
            </div>
            <div
              className="bg-white border border-gray-300 rounded-b-lg overflow-auto select-none"
              style={{ maxHeight: '75vh' }}
              onCopy={e => e.preventDefault()}
              onContextMenu={e => e.preventDefault()}
            >
              <table className="border-collapse text-[13px]" style={{ fontFamily: 'Calibri, Carlito, Arial, sans-serif' }}>
                <thead>
                  <tr>
                    <th className="sticky top-0 left-0 z-20 bg-gray-100 border border-gray-300 w-10" />
                    {visibleCols.map(c => (
                      <th key={c.n} scope="col" className="sticky top-0 z-10 bg-gray-100 border border-gray-300 font-normal text-gray-500 text-xs" style={{ minWidth: c.w, width: c.w }}>
                        {colLetter(c.n)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sheet.rows.map(row => (
                    <tr key={row.r}>
                      <th scope="row" className="sticky left-0 z-10 bg-gray-100 border border-gray-300 font-normal text-gray-500 text-xs px-1 text-right">{row.r}</th>
                      {visibleCols.map(col => {
                        const key = `${row.r}:${col.n}`;
                        if (mergeInfo.covered.has(key)) return null;
                        const raw = row.c[col.n - 1];
                        const text = raw === undefined ? '' : typeof raw === 'string' ? raw : raw[0];
                        const st = raw !== undefined && typeof raw !== 'string' ? data.styles[raw[1]] : undefined;
                        const sp = mergeInfo.span.get(key);
                        const rs = sp ? Array.from({ length: sp.rs }, (_, k) => row.r + k).filter(r => shownRows.has(r)).length : 1;
                        return (
                          <td
                            key={key}
                            colSpan={sp?.cs}
                            rowSpan={rs > 1 ? rs : undefined}
                            className="border border-gray-100 px-1.5 py-0.5 whitespace-nowrap overflow-hidden text-ellipsis"
                            style={cellStyle(st, col.w)}
                          >
                            {text}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-500 mt-3">{t('models.note')}</p>
          </>
        )}
      </div>
    </div>
  );
}
