import AdminCrud, { type Field } from '@/components/AdminCrud';
import AdminLayout from '@/components/AdminLayout';
import { trpc } from '@/lib/trpc';

const fields: Field[] = [
  { name: 'nameEn', label: 'Name (English)', required: true, placeholder: 'e.g. Batch 1 — Sun' },
  { name: 'nameAr', label: 'Name (Arabic)', required: true, rtl: true, placeholder: 'مثال: الدفعة 1 — الشمس' },
  { name: 'descriptionEn', label: 'Description (English)', type: 'textarea' },
  { name: 'descriptionAr', label: 'Description (Arabic)', type: 'textarea', rtl: true },
  { name: 'startDate', label: 'Start date', type: 'date', required: true },
  { name: 'endDate', label: 'End date', type: 'date' },
  {
    name: 'enrollmentStatus',
    label: 'Enrollment',
    type: 'select',
    options: [
      { value: 'open', label: 'Open' },
      { value: 'closed', label: 'Closed' },
      { value: 'full', label: 'Full' },
    ],
  },
  { name: 'capacity', label: 'Capacity (seats)', type: 'number' },
  { name: 'enrolled', label: 'Enrolled so far', type: 'number' },
];

export default function AdminBatches() {
  const utils = trpc.useUtils();
  const list = trpc.content.getBatches.useQuery();
  const create = trpc.admin.createBatch.useMutation();
  const update = trpc.admin.updateBatch.useMutation();
  const remove = trpc.admin.deleteBatch.useMutation();

  return (
    <AdminLayout>
      <AdminCrud
        title="Manage Batches"
        itemLabel="Batch"
        rows={list.data}
        isLoading={list.isLoading}
        fields={fields}
        columns={[
          ['Name', r => r.nameEn],
          ['Starts', r => new Date(r.startDate).toLocaleDateString()],
          ['Enrollment', r => r.enrollmentStatus],
          ['Seats', r => `${r.enrolled ?? 0} / ${r.capacity ?? '—'}`],
        ]}
        onCreate={input => create.mutateAsync({ ...input, enrolled: input.enrolled ?? 0 })}
        onUpdate={input => update.mutateAsync({ ...input, enrolled: input.enrolled ?? 0 })}
        onDelete={remove.mutateAsync}
        onChanged={() => utils.content.invalidate()}
      />
    </AdminLayout>
  );
}
