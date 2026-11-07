import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Edit2, Loader2, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export type FieldType = 'text' | 'textarea' | 'date' | 'number' | 'select' | 'checkbox' | 'url';

export interface Field {
  name: string;
  label: string;
  type?: FieldType;
  required?: boolean;
  options?: { value: string; label: string }[];
  /** Right-to-left input for Arabic fields. */
  rtl?: boolean;
  placeholder?: string;
}

type FormValues = Record<string, string | boolean>;

interface AdminCrudProps<Row extends { id: number }> {
  title: string;
  itemLabel: string;
  rows: Row[] | undefined;
  isLoading: boolean;
  fields: Field[];
  /** Columns shown in the list: [header, value getter]. */
  columns: [string, (row: Row) => React.ReactNode][];
  onCreate: (input: any) => Promise<unknown>;
  onUpdate: (input: any) => Promise<unknown>;
  onDelete: (input: { id: number }) => Promise<unknown>;
  onChanged: () => void;
}

const toDateInput = (value: unknown) => {
  if (!value) return '';
  const d = new Date(value as string);
  return Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
};

function emptyForm(fields: Field[]): FormValues {
  return Object.fromEntries(fields.map(f => [f.name, f.type === 'checkbox' ? false : f.options?.[0]?.value ?? '']));
}

function rowToForm(fields: Field[], row: Record<string, unknown>): FormValues {
  return Object.fromEntries(
    fields.map(f => {
      const v = row[f.name];
      if (f.type === 'checkbox') return [f.name, v === 1 || v === true];
      if (f.type === 'date') return [f.name, toDateInput(v)];
      return [f.name, v === null || v === undefined ? '' : String(v)];
    })
  );
}

function formToInput(fields: Field[], form: FormValues) {
  return Object.fromEntries(
    fields.map(f => {
      const v = form[f.name];
      if (f.type === 'checkbox') return [f.name, v ? 1 : 0];
      if (f.type === 'number') return [f.name, v === '' ? null : Number(v)];
      if (f.type === 'date') return [f.name, v === '' ? null : v];
      return [f.name, v];
    })
  );
}

export default function AdminCrud<Row extends { id: number }>(props: AdminCrudProps<Row>) {
  const { title, itemLabel, rows, isLoading, fields, columns } = props;
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormValues>(() => emptyForm(fields));
  const [saving, setSaving] = useState(false);

  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm(fields));
    setShowForm(true);
  };

  const openEdit = (row: Row) => {
    setEditingId(row.id);
    setForm(rowToForm(fields, row as unknown as Record<string, unknown>));
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const input = formToInput(fields, form);
      if (editingId) await props.onUpdate({ id: editingId, ...input });
      else await props.onCreate(input);
      toast.success(`${itemLabel} saved`);
      setShowForm(false);
      props.onChanged();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (row: Row) => {
    if (!window.confirm(`Delete this ${itemLabel.toLowerCase()}? It will be hidden from the site.`)) return;
    try {
      await props.onDelete({ id: row.id });
      toast.success(`${itemLabel} deleted`);
      props.onChanged();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Delete failed');
    }
  };

  const set = (name: string, value: string | boolean) => setForm(prev => ({ ...prev, [name]: value }));
  const inputClass =
    'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#002B5C]';

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-[#002B5C]">{title}</h1>
        <Button onClick={openNew} className="bg-[#002B5C] hover:bg-[#003d7a] text-white flex items-center gap-2">
          <Plus size={20} />
          Add {itemLabel}
        </Button>
      </div>

      {showForm && (
        <Card className="border-0 bg-white mb-8">
          <CardHeader>
            <CardTitle>{editingId ? `Edit ${itemLabel}` : `Add ${itemLabel}`}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fields.map(f => (
                <div key={f.name} className={f.type === 'textarea' ? 'md:col-span-1' : ''}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {f.label}
                    {f.required && <span className="text-red-600"> *</span>}
                  </label>
                  {f.type === 'textarea' ? (
                    <textarea
                      className={inputClass}
                      rows={4}
                      dir={f.rtl ? 'rtl' : 'ltr'}
                      required={f.required}
                      placeholder={f.placeholder}
                      value={form[f.name] as string}
                      onChange={e => set(f.name, e.target.value)}
                    />
                  ) : f.type === 'select' ? (
                    <select
                      className={inputClass}
                      value={form[f.name] as string}
                      onChange={e => set(f.name, e.target.value)}
                    >
                      {f.options?.map(o => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  ) : f.type === 'checkbox' ? (
                    <input
                      type="checkbox"
                      className="h-5 w-5 accent-[#002B5C]"
                      checked={form[f.name] as boolean}
                      onChange={e => set(f.name, e.target.checked)}
                    />
                  ) : (
                    <Input
                      type={f.type ?? 'text'}
                      dir={f.rtl ? 'rtl' : 'ltr'}
                      required={f.required}
                      placeholder={f.placeholder}
                      value={form[f.name] as string}
                      onChange={e => set(f.name, e.target.value)}
                    />
                  )}
                </div>
              ))}
              <div className="md:col-span-2 flex gap-3 pt-2">
                <Button type="submit" disabled={saving} className="bg-[#C5A065] hover:bg-[#b08d55] text-white">
                  {saving && <Loader2 className="animate-spin mr-2" size={16} />}
                  Save
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className="border-0 bg-white">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-[#002B5C]" size={32} />
            </div>
          ) : !rows?.length ? (
            <p className="text-center text-gray-500 py-12">Nothing here yet. Click “Add {itemLabel}” to start.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {columns.map(([header]) => (
                      <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        {header}
                      </th>
                    ))}
                    <th className="px-6 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {rows.map(row => (
                    <tr key={row.id} className="hover:bg-gray-50">
                      {columns.map(([header, get]) => (
                        <td key={header} className="px-6 py-4 text-sm text-gray-900">
                          {get(row)}
                        </td>
                      ))}
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <button onClick={() => openEdit(row)} className="text-[#002B5C] hover:text-[#C5A065] mr-4" title="Edit">
                          <Edit2 size={18} />
                        </button>
                        <button onClick={() => handleDelete(row)} className="text-red-600 hover:text-red-800" title="Delete">
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
