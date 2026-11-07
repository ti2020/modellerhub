import AdminCrud, { type Field } from '@/components/AdminCrud';
import AdminLayout from '@/components/AdminLayout';
import { trpc } from '@/lib/trpc';

const fields: Field[] = [
  { name: 'nameEn', label: 'Name (English)', required: true },
  { name: 'nameAr', label: 'Name (Arabic)', required: true, rtl: true },
  { name: 'bioEn', label: 'Bio (English)', type: 'textarea' },
  { name: 'bioAr', label: 'Bio (Arabic)', type: 'textarea', rtl: true },
  { name: 'credentials', label: 'Credentials', placeholder: 'e.g. AFM, CFA Level I' },
  { name: 'photoUrl', label: 'Photo link', type: 'url', placeholder: 'https://…' },
  {
    name: 'role',
    label: 'Role',
    type: 'select',
    options: [
      { value: 'founder', label: 'Founder' },
      { value: 'admin', label: 'Admin' },
      { value: 'mentor', label: 'Mentor' },
    ],
  },
  { name: 'order', label: 'Display order (1 = first)', type: 'number' },
];

export default function AdminTeam() {
  const utils = trpc.useUtils();
  const list = trpc.content.getTeamMembers.useQuery();
  const create = trpc.admin.createTeamMember.useMutation();
  const update = trpc.admin.updateTeamMember.useMutation();
  const remove = trpc.admin.deleteTeamMember.useMutation();

  return (
    <AdminLayout>
      <AdminCrud
        title="Manage Team"
        itemLabel="Team member"
        rows={list.data}
        isLoading={list.isLoading}
        fields={fields}
        columns={[
          ['Name', r => r.nameEn],
          ['Role', r => r.role],
          ['Order', r => r.order ?? 0],
        ]}
        onCreate={input => create.mutateAsync({ ...input, order: input.order ?? 0 })}
        onUpdate={input => update.mutateAsync({ ...input, order: input.order ?? 0 })}
        onDelete={remove.mutateAsync}
        onChanged={() => utils.content.invalidate()}
      />
    </AdminLayout>
  );
}
