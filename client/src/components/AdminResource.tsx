import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Edit2, Loader2, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

/**
 * One admin screen for a list of records (courses, events, batches, team).
 * Each page passes its field list, table columns and the tRPC hooks to use.
 */

export type FieldType = 'text' | 'textarea' | 'date' | 'number' | 'select' | 'checkbox' | 'url';

export type Field = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  /** Arabic fields are typed right-to-left. */
  rtl?: boolean;
  options?: { value: string; label: string }[];
  /** Fields with the same group sit side by side (e.g. English/Arabic pairs). */
  group?: string;
};

export type Column = {
  label: string;
  render: (row: any) => React.ReactNode;
};

type Mutation = {
  mutateAsync: (input: any) => Promise<unknown>;
  isPending: boolean;
};

type Props = {
  title: string;
  singular: string;
  fields: Field[];
  columns: Column[];
  rows: any[] | undefined;
  isLoading: boolean;
  create: Mutation;
  update: Mutation;
  remove: Mutation;
  onChanged: () => void;
  emptyHint?: string;
};

type FormValues = Record<string, string | boolean>;

function toDateInput(value: unknown): string {
  if (!value) return '';
  const d = new Date(value as string);
  if (Number.isNaN(d.getTime())) return '';
  // Use the local calendar date so the day shown matches the day picked.
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function emptyValues(fields: Field[]): FormValues {
  const v: FormValues = {};
  for (const f of fields) {
    if (f.type === 'checkbox') v[f.name] = false;
    else if (f.type === 'select') v[f.name] = f.options?.[0]?.value ?? '';
    else v[f.name] = '';
  }
  return v;
}

function rowToValues(fields: Field[], row: any): FormValues {
  const v: FormValues = {};
  for (const f of fields) {
    const raw = row[f.name];
    if (f.type === 'checkbox') v[f.name] = raw === 1 || raw === true;
    else if (f.type === 'date') v[f.name] = toDateInput(raw);
    else v[f.name] = raw === null || raw === undefined ? '' : String(raw);
  }
  return v;
}

function valuesToInput(fields: Field[], values: FormValues) {
  const out: Record<string, unknown> = {};
  for (const f of fields) {
    const raw = values[f.name];
    if (f.type === 'checkbox') {
      out[f.name] = raw ? 1 : 0;
    } else if (f.type === 'date') {
      // Noon local time avoids the date slipping a day across time zones.
      out[f.name] = raw ? new Date(`${raw}T12:00:00`) : null;
    } else if (f.type === 'number') {
      out[f.name] = raw === '' ? null : Number(raw);
    } else {
      out[f.name] = String(raw ?? '');
    }
  }
  return out;
}

function groupFields(fields: Field[]): Field[][] {
  const rows: Field[][] = [];
  const byGroup = new Map<string, Field[]>();
  for (const f of fields) {
    if (!f.group) {
      rows.push([f]);
      continue;
    }
    const existing = byGroup.get(f.group);
    if (existing) existing.push(f);
    else {
      const row = [f];
      byGroup.set(f.group, row);
      rows.push(row);
    }
  }
  return rows;
}

const inputClass =
  'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#002B5C]';

export default function AdminResource(props: Props) {
  const { title, singular, fields, columns, rows, isLoading, create, update, remove, onChanged } = props;
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [values, setValues] = useState<FormValues>(() => emptyValues(fields));

  const openNew = () => {
    setEditingId(null);
    setValues(emptyValues(fields));
    setShowForm(true);
  };

  const openEdit = (row: any) => {
    setEditingId(row.id);
    setValues(rowToValues(fields, row));
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const close = () => {
    setShowForm(false);
    setEditingId(null);
  };

  const setField = (name: string, value: string | boolean) =>
    setValues(prev => ({ ...prev, [name]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const input = valuesToInput(fields, values);
    try {
      if (editingId) {
        await update.mutateAsync({ id: editingId, ...input });
        toast.success(`${singular} updated`);
      } else {
        await create.mutateAsync(input);
        toast.success(`${singular} added`);
      }
      onChanged();
      close();
    } catch (err: any) {
      toast.error(err?.message ? `Could not save: ${err.message}` : 'Could not save');
    }
  };

  const handleDelete = async (row: any) => {
    const name = row.titleEn || row.nameEn || singular;
    if (!window.confirm(`Delete "${name}"? It will be removed from the public website.`)) return;
    try {
      await remove.mutateAsync({ id: row.id });
      toast.success(`${singular} deleted`);
      onChanged();
      if (editingId === row.id) close();
    } catch (err: any) {
      toast.error(err?.message ? `Could not delete: ${err.message}` : 'Could not delete');
    }
  };

  const saving = create.isPending || update.isPending;

  const renderField = (f: Field) => {
    const id = `field-${f.name}`;
    const value = values[f.name];
    const common = {
      id,
      name: f.name,
      required: f.required,
      placeholder: f.placeholder,
      dir: f.rtl ? 'rtl' : undefined,
    } as const;

    if (f.type === 'checkbox') {
      return (
        <div key={f.name} className="flex items-center gap-2 pt-6">
          <input
            id={id}
            type="checkbox"
            checked={Boolean(value)}
            onChange={e => setField(f.name, e.target.checked)}
            className="w-4 h-4 rounded"
          />
          <label htmlFor={id} className="text-sm font-medium text-gray-700">{f.label}</label>
        </div>
      );
    }

    let control: React.ReactNode;
    if (f.type === 'textarea') {
      control = (
        <textarea
          {...common}
          rows={4}
          value={String(value)}
          onChange={e => setField(f.name, e.target.value)}
          className={inputClass}
        />
      );
    } else if (f.type === 'select') {
      control = (
        <select {...common} value={String(value)} onChange={e => setField(f.name, e.target.value)} className={inputClass}>
          {f.options?.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      );
    } else {
      const htmlType = f.type === 'date' ? 'date' : f.type === 'number' ? 'number' : f.type === 'url' ? 'url' : 'text';
      control = (
        <Input
          {...common}
          type={htmlType}
          min={f.type === 'number' ? 0 : undefined}
          value={String(value)}
          onChange={e => setField(f.name, e.target.value)}
        />
      );
    }

    return (
      <div key={f.name}>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
          {f.label}
          {f.required && <span className="text-red-600"> *</span>}
        </label>
        {control}
      </div>
    );
  };

  return (
    <AdminLayout>
      <div>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <h1 className="text-4xl font-bold text-[#002B5C]">{title}</h1>
          {!showForm && (
            <Button onClick={openNew} className="bg-[#002B5C] hover:bg-[#003d7a] text-white flex items-center gap-2">
              <Plus size={20} />
              Add {singular}
            </Button>
          )}
        </div>

        {showForm && (
          <Card className="border-0 bg-white mb-8">
            <CardHeader>
              <CardTitle>{editingId ? `Edit ${singular}` : `New ${singular}`}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {groupFields(fields).map((row, i) => (
                  <div
                    key={i}
                    className={`grid grid-cols-1 gap-4 ${row.length === 2 ? 'md:grid-cols-2' : row.length >= 3 ? 'md:grid-cols-3' : ''}`}
                  >
                    {row.map(renderField)}
                  </div>
                ))}
                <div className="flex gap-4 pt-4">
                  <Button type="submit" disabled={saving} className="bg-[#002B5C] hover:bg-[#003d7a] text-white">
                    {saving && <Loader2 className="animate-spin mr-2" size={16} />}
                    {editingId ? 'Save changes' : `Add ${singular}`}
                  </Button>
                  <Button type="button" onClick={close} className="bg-gray-300 hover:bg-gray-400 text-black">
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-[#002B5C]" size={32} />
          </div>
        ) : (
          <Card className="border-0 bg-white">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      {columns.map(c => (
                        <th key={c.label} className="px-6 py-3 text-left text-sm font-semibold text-gray-700">{c.label}</th>
                      ))}
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {rows && rows.length > 0 ? (
                      rows.map(row => (
                        <tr key={row.id} className="hover:bg-gray-50">
                          {columns.map(c => (
                            <td key={c.label} className="px-6 py-4 text-sm text-gray-800">{c.render(row)}</td>
                          ))}
                          <td className="px-6 py-4 text-sm">
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => openEdit(row)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                                aria-label={`Edit ${row.titleEn || row.nameEn || singular}`}
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(row)}
                                disabled={remove.isPending}
                                className="p-2 text-red-600 hover:bg-red-50 rounded"
                                aria-label={`Delete ${row.titleEn || row.nameEn || singular}`}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={columns.length + 1} className="px-6 py-8 text-center text-gray-500">
                          {props.emptyHint ?? `Nothing here yet. Click "Add ${singular}" to create one.`}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}

export function formatDate(value: unknown) {
  if (!value) return '—';
  const d = new Date(value as string);
  return Number.isNaN(d.getTime())
    ? '—'
    : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}
