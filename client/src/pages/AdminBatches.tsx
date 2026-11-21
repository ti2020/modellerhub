import AdminResource, { formatDate, type Field } from '@/components/AdminResource';
import { trpc } from '@/lib/trpc';

const fields: Field[] = [
  { name: 'nameEn', label: 'Name (English)', type: 'text', required: true, placeholder: 'e.g. Batch 1 · Sun', group: 'name' },
  { name: 'nameAr', label: 'Name (Arabic)', type: 'text', required: true, rtl: true, placeholder: 'الدفعة 1 · الشمس', group: 'name' },
  { name: 'descriptionEn', label: 'Description (English)', type: 'textarea', group: 'desc' },
  { name: 'descriptionAr', label: 'Description (Arabic)', type: 'textarea', rtl: true, group: 'desc' },
  { name: 'startDate', label: 'Start date', type: 'date', required: true, group: 'dates' },
  { name: 'endDate', label: 'End date', type: 'date', group: 'dates' },
  {
    name: 'enrollmentStatus',
    label: 'Registration',
    type: 'select',
    group: 'status',
    options: [
      { value: 'open', label: 'Open' },
      { value: 'full', label: 'Full' },
      { value: 'closed', label: 'Closed' },
    ],
  },
  { name: 'capacity', label: 'Seats', type: 'number', group: 'status' },
  { name: 'enrolled', label: 'Registered so far', type: 'number', group: 'status' },
];

const statusStyle: Record<string, string> = {
  open: 'bg-green-100 text-green-800',
  full: 'bg-red-100 text-red-800',
  closed: 'bg-gray-100 text-gray-800',
};

export default function AdminBatches() {
  const utils = trpc.useUtils();
  const list = trpc.content.getBatches.useQuery();
  return (
    <AdminResource
      title="Manage Batches"
      singular="Batch"
      fields={fields}
      rows={list.data}
      isLoading={list.isLoading}
      create={trpc.admin.createBatch.useMutation()}
      update={trpc.admin.updateBatch.useMutation()}
      remove={trpc.admin.deleteBatch.useMutation()}
      onChanged={() => utils.content.invalidate()}
      columns={[
        { label: 'Name', render: r => r.nameEn },
        { label: 'Starts', render: r => formatDate(r.startDate) },
        {
          label: 'Registration',
          render: r => (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${statusStyle[r.enrollmentStatus] ?? statusStyle.closed}`}>
              {r.enrollmentStatus}
            </span>
          ),
        },
        { label: 'Seats', render: r => (r.capacity ? `${r.enrolled ?? 0} / ${r.capacity}` : `${r.enrolled ?? 0}`) },
      ]}
    />
  );
}
