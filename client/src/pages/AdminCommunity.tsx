import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { trpc } from '@/lib/trpc';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

type Key = 'mission' | 'vision' | 'modeling_field';

const SECTIONS: { key: Key; label: string; page: string }[] = [
  { key: 'mission', label: 'Mission', page: 'Mission & Vision page' },
  { key: 'vision', label: 'Vision', page: 'Mission & Vision page' },
  { key: 'modeling_field', label: 'Modeling Field', page: 'Modeling Field page' },
];

type Values = { titleEn: string; titleAr: string; contentEn: string; contentAr: string };
const blank: Values = { titleEn: '', titleAr: '', contentEn: '', contentAr: '' };

const textareaClass =
  'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#002B5C]';

function toValues(row: any): Values {
  if (!row) return blank;
  return {
    titleEn: row.titleEn ?? '',
    titleAr: row.titleAr ?? '',
    contentEn: row.contentEn ?? '',
    contentAr: row.contentAr ?? '',
  };
}

function SectionEditor({ section, row }: { section: (typeof SECTIONS)[number]; row: any }) {
  const utils = trpc.useUtils();
  const save = trpc.admin.saveCommunityInfo.useMutation();
  const [values, setValues] = useState<Values>(() => toValues(row));

  // Refill the form only when the saved row itself changes, not on every render.
  useEffect(() => setValues(toValues(row)), [row]);

  const set = (name: keyof Values) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setValues(prev => ({ ...prev, [name]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await save.mutateAsync({ key: section.key, ...values });
      toast.success(`${section.label} saved`);
      utils.admin.getAllCommunityInfo.invalidate();
      utils.content.getCommunityInfo.invalidate();
    } catch (err: any) {
      toast.error(err?.message ? `Could not save: ${err.message}` : 'Could not save');
    }
  };

  const id = (f: string) => `${section.key}-${f}`;

  return (
    <Card className="border-0 bg-white">
      <CardHeader>
        <CardTitle>{section.label}</CardTitle>
        <p className="text-sm text-gray-500">Shown on the {section.page}.</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor={id('titleEn')} className="block text-sm font-medium text-gray-700 mb-1">Heading (English)</label>
              <Input id={id('titleEn')} value={values.titleEn} onChange={set('titleEn')} />
            </div>
            <div>
              <label htmlFor={id('titleAr')} className="block text-sm font-medium text-gray-700 mb-1">Heading (Arabic)</label>
              <Input id={id('titleAr')} dir="rtl" value={values.titleAr} onChange={set('titleAr')} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor={id('contentEn')} className="block text-sm font-medium text-gray-700 mb-1">Text (English)</label>
              <textarea id={id('contentEn')} rows={5} value={values.contentEn} onChange={set('contentEn')} className={textareaClass} />
            </div>
            <div>
              <label htmlFor={id('contentAr')} className="block text-sm font-medium text-gray-700 mb-1">Text (Arabic)</label>
              <textarea id={id('contentAr')} dir="rtl" rows={5} value={values.contentAr} onChange={set('contentAr')} className={textareaClass} />
            </div>
          </div>
          <Button type="submit" disabled={save.isPending} className="bg-[#002B5C] hover:bg-[#003d7a] text-white">
            {save.isPending && <Loader2 className="animate-spin mr-2" size={16} />}
            Save {section.label}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function AdminCommunity() {
  const { data, isLoading } = trpc.admin.getAllCommunityInfo.useQuery();

  const rowFor = (key: Key) => data?.find((r: any) => r.key === key);

  return (
    <AdminLayout>
      <div>
        <h1 className="text-4xl font-bold text-[#002B5C] mb-8">Community Info</h1>
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-[#002B5C]" size={32} />
          </div>
        ) : (
          <div className="space-y-8">
            {SECTIONS.map(s => (
              <SectionEditor key={s.key} section={s} row={rowFor(s.key)} />
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
