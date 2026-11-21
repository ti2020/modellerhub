import AdminResource, { formatDate, type Field } from '@/components/AdminResource';
import { trpc } from '@/lib/trpc';

const fields: Field[] = [
  { name: 'titleEn', label: 'Title (English)', type: 'text', required: true, group: 'title' },
  { name: 'titleAr', label: 'Title (Arabic)', type: 'text', required: true, rtl: true, group: 'title' },
  { name: 'descriptionEn', label: 'Description (English)', type: 'textarea', group: 'desc' },
  { name: 'descriptionAr', label: 'Description (Arabic)', type: 'textarea', rtl: true, group: 'desc' },
  { name: 'eventDate', label: 'Date', type: 'date', required: true, group: 'when' },
  { name: 'eventTime', label: 'Time', type: 'text', placeholder: 'e.g. 8:30 PM KSA', group: 'when' },
  { name: 'location', label: 'Where', type: 'text', placeholder: 'e.g. Zoom', group: 'when' },
  { name: 'topic', label: 'Topic', type: 'text', group: 'who' },
  { name: 'speaker', label: 'Speaker', type: 'text', group: 'who' },
  { name: 'featured', label: 'Show on the home page', type: 'checkbox' },
];

export default function AdminEvents() {
  const utils = trpc.useUtils();
  const list = trpc.content.getAllEvents.useQuery();
  return (
    <AdminResource
      title="Manage Events"
      singular="Event"
      fields={fields}
      rows={list.data}
      isLoading={list.isLoading}
      create={trpc.admin.createEvent.useMutation()}
      update={trpc.admin.updateEvent.useMutation()}
      remove={trpc.admin.deleteEvent.useMutation()}
      onChanged={() => utils.content.invalidate()}
      emptyHint='No events yet. Add the orientation session here once the institute confirms the date.'
      columns={[
        { label: 'Title', render: r => r.titleEn },
        { label: 'Date', render: r => formatDate(r.eventDate) },
        { label: 'Time', render: r => r.eventTime || '—' },
        { label: 'Home page', render: r => (r.featured ? 'Yes' : 'No') },
      ]}
    />
  );
}
