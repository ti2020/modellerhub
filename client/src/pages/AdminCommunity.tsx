import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { trpc } from '@/lib/trpc';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const SECTIONS = [
  { key: 'mission', label: 'Mission', page: 'Mission & Vision page' },
  { key: 'vision', label: 'Vision', page: 'Mission & Vision page' },
  { key: 'modeling_field', label: 'Modelling Field', page: 'Modelling Field page' },
] as const;

type Key = (typeof SECTIONS)[number]['key'];
type Values = { titleEn: string; titleAr: string; contentEn: string; contentAr: string };
const blank: Values = { titleEn: '', titleAr: '', contentEn: '', contentAr: '' };

function SectionEditor({ sectionKey, label, page, initial }: { sectionKey: Key; label: string; page: string; initial: Values }) {
  const utils = trpc.useUtils();
  const save = trpc.admin.saveCommunityInfo.useMutation();
  const [values, setValues] = useState<Values>(initial);
  const set = (k: keyof Values) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setValues(v => ({ ...v, [k]: e.target.value }));
  const area = 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#002B5C]';

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await save.mutateAsync({ key: sectionKey, ...values });
      toast.success(`${label} saved`);
      utils.content.getCommunityInfo.invalidate();
      utils.admin.listCommunityInfo.invalidate();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Save failed');
    }
  };

  return (
    <Card className="border-0 bg-white mb-6">
      <CardHeader>
        <CardTitle>
          {label} <span className="text-sm font-normal text-gray-500">— shown on the {page}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input placeholder="Title (English)" value={values.titleEn} onChange={set('titleEn')} />
          <Input placeholder="العنوان (عربي)" dir="rtl" value={values.titleAr} onChange={set('titleAr')} />
          <textarea className={area} rows={5} placeholder="Text (English)" value={values.contentEn} onChange={set('contentEn')} />
          <textarea className={area} rows={5} dir="rtl" placeholder="النص (عربي)" value={values.contentAr} onChange={set('contentAr')} />
          <div className="md:col-span-2">
            <Button type="submit" disabled={save.isPending} className="bg-[#C5A065] hover:bg-[#b08d55] text-white">
              {save.isPending && <Loader2 className="animate-spin mr-2" size={16} />}
              Save {label}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default function AdminCommunity() {
  const list = trpc.admin.listCommunityInfo.useQuery();

  return (
    <AdminLayout>
      <h1 className="text-4xl font-bold text-[#002B5C] mb-8">Community Info</h1>
      {list.isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-[#002B5C]" size={32} />
        </div>
      ) : (
        SECTIONS.map(s => {
          const row = list.data?.find(r => r.key === s.key);
          const initial: Values = row
            ? {
                titleEn: row.titleEn ?? '',
                titleAr: row.titleAr ?? '',
                contentEn: row.contentEn ?? '',
                contentAr: row.contentAr ?? '',
              }
            : blank;
          return <SectionEditor key={`${s.key}-${row?.updatedAt ?? 'new'}`} sectionKey={s.key} label={s.label} page={s.page} initial={initial} />;
        })
      )}
    </AdminLayout>
  );
}
