import AdminResource, { type Field } from '@/components/AdminResource';
import { trpc } from '@/lib/trpc';

const fields: Field[] = [
  { name: 'nameEn', label: 'Name (English)', type: 'text', required: true, group: 'name' },
  { name: 'nameAr', label: 'Name (Arabic)', type: 'text', required: true, rtl: true, group: 'name' },
  { name: 'bioEn', label: 'Bio (English)', type: 'textarea', group: 'bio' },
  { name: 'bioAr', label: 'Bio (Arabic)', type: 'textarea', rtl: true, group: 'bio' },
  { name: 'credentials', label: 'Credentials', type: 'text', placeholder: 'e.g. AFM, CFA Level I' },
  { name: 'photoUrl', label: 'Photo link', type: 'url', placeholder: 'https://…' },
  {
    name: 'role',
    label: 'Role',
    type: 'select',
    group: 'meta',
    options: [
      { value: 'founder', label: 'Founder' },
      { value: 'admin', label: 'Admin' },
      { value: 'mentor', label: 'Mentor' },
    ],
  },
  { name: 'order', label: 'Display order (lower shows first)', type: 'number', group: 'meta' },
];

export default function AdminTeam() {
  const utils = trpc.useUtils();
  const list = trpc.content.getTeamMembers.useQuery();
  return (
    <AdminResource
      title="Manage Team"
      singular="Team member"
      fields={fields}
      rows={list.data}
      isLoading={list.isLoading}
      create={trpc.admin.createTeamMember.useMutation()}
      update={trpc.admin.updateTeamMember.useMutation()}
      remove={trpc.admin.deleteTeamMember.useMutation()}
      onChanged={() => utils.content.invalidate()}
      columns={[
        { label: 'Name', render: r => r.nameEn },
        { label: 'Role', render: r => <span className="capitalize">{r.role}</span> },
        { label: 'Credentials', render: r => r.credentials || '—' },
        { label: 'Order', render: r => r.order ?? 0 },
      ]}
    />
  );
}
