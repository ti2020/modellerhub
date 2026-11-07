import AdminCrud, { type Field } from '@/components/AdminCrud';
import AdminLayout from '@/components/AdminLayout';
import { trpc } from '@/lib/trpc';

const fields: Field[] = [
  { name: 'titleEn', label: 'Title (English)', required: true },
  { name: 'titleAr', label: 'Title (Arabic)', required: true, rtl: true },
  { name: 'descriptionEn', label: 'Description (English)', type: 'textarea' },
  { name: 'descriptionAr', label: 'Description (Arabic)', type: 'textarea', rtl: true },
  { name: 'eventDate', label: 'Date', type: 'date', required: true },
  { name: 'eventTime', label: 'Time', placeholder: 'e.g. 8:00 PM KSA' },
  { name: 'topic', label: 'Topic' },
  { name: 'speaker', label: 'Speaker' },
  { name: 'location', label: 'Location', placeholder: 'e.g. Online — Telegram' },
  { name: 'featured', label: 'Show on home page', type: 'checkbox' },
];

export default function AdminEvents() {
  const utils = trpc.useUtils();
  const list = trpc.content.getAllEvents.useQuery();
  const create = trpc.admin.createEvent.useMutation();
  const update = trpc.admin.updateEvent.useMutation();
  const remove = trpc.admin.deleteEvent.useMutation();

  return (
    <AdminLayout>
      <AdminCrud
        title="Manage Events"
        itemLabel="Event"
        rows={list.data}
        isLoading={list.isLoading}
        fields={fields}
        columns={[
          ['Title', r => r.titleEn],
          ['Date', r => new Date(r.eventDate).toLocaleDateString()],
          ['Speaker', r => r.speaker ?? '—'],
          ['Home page', r => (r.featured ? 'Yes' : 'No')],
        ]}
        onCreate={create.mutateAsync}
        onUpdate={update.mutateAsync}
        onDelete={remove.mutateAsync}
        onChanged={() => utils.content.invalidate()}
      />
    </AdminLayout>
  );
}
