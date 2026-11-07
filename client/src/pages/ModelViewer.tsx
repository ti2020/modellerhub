import { useLanguage } from '@/contexts/LanguageContext';
import { MODELLER_NAME, MODELS, type ModelData, type SheetData } from '@/data/models';
import { ArrowLeft, Loader2, Lock } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useRoute } from 'wouter';

/** Excel column width (characters) → pixels. */
const px = (w: number) => Math.round(w * 7 + 5);
const looksNumeric = (t: string) => /^[\s(\-–$€£]*[\d.,]+\s*[%x]?[\s)]*$|^\s*[–-]\s*$/.test(t);

function SheetTable({ sheet, styles, accent }: { sheet: SheetData; styles: ModelData['styles']; accent: string }) {
  // Work out merged areas: top-left cell gets row/col span, the rest are skipped.
  const { spans, covered } = useMemo(() => {
    const visibleRows = sheet.rows.map(r => r.r);
    const spans = new Map<string, { rs: number; cs: number }>();
    const covered = new Set<string>();
    for (const [r1, c1, r2, c2] of sheet.merges) {
      const rowsIn = visibleRows.filter(r => r >= r1 && r <= r2);
      if (!rowsIn.length) continue;
      const top = rowsIn[0];
      spans.set(`${top}:${c1}`, { rs: rowsIn.length, cs: c2 - c1 + 1 });
      for (const r of rowsIn) for (let c = c1; c <= c2; c++) if (r !== top || c !== c1) covered.add(`${r}:${c}`);
    }
    return { spans, covered };
  }, [sheet]);

  const visibleCols = sheet.cols.map((w, i) => ({ w, i })).filter(c => c.w > 0);

  return (
    <table className="border-collapse text-[12px] leading-tight" style={{ tableLayout: 'fixed', fontFamily: 'Calibri, Arial, sans-serif' }}>
      <colgroup>
        {visibleCols.map(c => (
          <col key={c.i} style={{ width: px(c.w) }} />
        ))}
      </colgroup>
      <tbody>
        {sheet.rows.map(row => {
          const byCol = new Map(row.c.map(([c, t, s]) => [c, { t, s }]));
          // Like Excel, left-aligned text may spill into the empty cells to its right.
          // "Center Across Selection" (cc) spreads over the following empty cc cells.
          const spillWidth = (col: number, centerAcross: boolean) => {
            let w = 0;
            for (const { w: cw, i } of visibleCols) {
              if (i <= col) continue;
              const next = byCol.get(i);
              if (next?.t || covered.has(`${row.r}:${i}`) || spans.has(`${row.r}:${i}`)) break;
              if (centerAcross && styles[next?.s ?? 0]?.a !== 'cc') break;
              w += px(cw);
            }
            return w;
          };
          return (
            <tr key={row.r} style={{ height: 20 }}>
              {visibleCols.map(({ i }) => {
                const key = `${row.r}:${i}`;
                if (covered.has(key)) return null;
                const cell = byCol.get(i);
                const st = cell ? styles[cell.s] ?? {} : {};
                const span = spans.get(key);
                const text = cell?.t ?? '';
                const centerAcross = st.a === 'cc';
                const align: 'left' | 'center' | 'right' = centerAcross ? 'center' : st.a === 'center' || st.a === 'right' ? st.a : looksNumeric(text) ? 'right' : 'left';
                const spills = !!text && !span && (align === 'left' || centerAcross);
                return (
                  <td
                    key={key}
                    rowSpan={span?.rs}
                    colSpan={span?.cs}
                    className="px-1 whitespace-nowrap"
                    style={{
                      fontWeight: st.b ? 700 : undefined,
                      fontStyle: st.i ? 'italic' : undefined,
                      textDecoration: st.u ? 'underline' : undefined,
                      color: st.c,
                      background: st.bg,
                      textAlign: align,
                      paddingLeft: st.in ? 4 + st.in * 10 : undefined,
                      borderTop: st.bt ? '1px solid #555' : undefined,
                      borderBottom: st.bb === 2 ? '3px double #555' : st.bb ? '1px solid #555' : undefined,
                      fontSize: st.sz ? `${Math.min(st.sz, 22)}px` : undefined,
                      outline: sheet.grid ? '1px solid #eceff3' : undefined,
                      maxWidth: 0,
                      overflow: spills ? 'visible' : 'hidden',
                    }}
                  >
                    {spills ? (
                      <span
                        className="relative z-[1] block overflow-hidden"
                        style={{ width: `calc(100% + ${spillWidth(i, centerAcross)}px)` }}
                      >
                        {text}
                      </span>
                    ) : (
                      text
                    )}
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default function ModelViewer() {
  const [, params] = useRoute('/models/:slug');
  const { t } = useLanguage();
  const info = MODELS.find(m => m.slug === params?.slug);
  const [data, setData] = useState<ModelData | null>(null);
  const [error, setError] = useState(false);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!info) return;
    setData(null);
    setError(false);
    setActive(0);
    fetch(`/models/${info.slug}.json`)
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then((d: ModelData) => {
        setData(d);
        // Open on the MODEL sheet when there is one.
        const i = d.sheets.findIndex(s => s.name.toUpperCase() === 'MODEL');
        setActive(i >= 0 ? i : 0);
      })
      .catch(() => setError(true));
  }, [info?.slug]);

  if (!info) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-gray-600 mb-4">{t('models.notFound', 'Model not found.')}</p>
        <Link href="/models" className="text-[#002B5C] underline">
          {t('models.back', 'Back to all models')}
        </Link>
      </div>
    );
  }

  const block = (e: React.SyntheticEvent) => e.preventDefault();

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Model header in the model's own colour, with the modeller's name */}
      <header style={{ background: info.accent }} className="text-white">
        <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <div>
            <Link href="/models" className="inline-flex items-center gap-1 text-white/80 hover:text-white text-sm mb-2">
              <ArrowLeft size={16} /> {t('models.all', 'All models')}
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold">{info.name}</h1>
            <p className="text-white/85 mt-1">{t('models.subtitle', 'Integrated three-statement model · FMI AFM exam practice')}</p>
          </div>
          <div className="md:text-right">
            <p className="text-xs uppercase tracking-widest text-white/70">{t('models.by', 'Modelled by')}</p>
            <p className="text-2xl font-semibold">{MODELLER_NAME}</p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {info.youtubeId && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="aspect-video max-h-[480px] w-full">
              <iframe
                className="w-full h-full"
                src={`https://www.youtube-nocookie.com/embed/${info.youtubeId}`}
                title={`${info.name} walkthrough`}
                allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
              />
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <h2 className="font-semibold text-[#002B5C]">{t('models.workbook', 'Model workbook')}</h2>
            <span className="inline-flex items-center gap-1 text-xs text-gray-500">
              <Lock size={14} /> {t('models.readOnly', 'View only — values shown, formulas not published')}
            </span>
          </div>

          {error ? (
            <p className="p-8 text-center text-gray-600">{t('models.loadError', 'The model could not be loaded. Please refresh the page.')}</p>
          ) : !data ? (
            <div className="flex justify-center py-16">
              <Loader2 className="animate-spin" style={{ color: info.accent }} size={32} />
            </div>
          ) : (
            <>
              <div
                dir="ltr"
                className="overflow-auto max-h-[70vh] select-none"
                onCopy={block}
                onCut={block}
                onContextMenu={block}
                onDragStart={block}
              >
                <SheetTable sheet={data.sheets[active]} styles={data.styles} accent={info.accent} />
              </div>
              {/* Sheet tabs, like Excel */}
              <div dir="ltr" className="flex gap-1 overflow-x-auto border-t bg-gray-100 px-2">
                {data.sheets.map((s, i) => (
                  <button
                    key={s.name}
                    onClick={() => setActive(i)}
                    className="px-4 py-2 text-sm whitespace-nowrap border-t-2 transition-colors"
                    style={
                      i === active
                        ? { borderColor: info.accent, color: info.accent, background: '#fff', fontWeight: 600 }
                        : { borderColor: 'transparent', color: '#4b5563' }
                    }
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
