import AdminResource, { type Field } from '@/components/AdminResource';
import { trpc } from '@/lib/trpc';

const fields: Field[] = [
  { name: 'titleEn', label: 'Title (English)', type: 'text', required: true, group: 'title' },
  { name: 'titleAr', label: 'Title (Arabic)', type: 'text', required: true, rtl: true, group: 'title' },
  { name: 'descriptionEn', label: 'Description (English)', type: 'textarea', group: 'desc' },
  { name: 'descriptionAr', label: 'Description (Arabic)', type: 'textarea', rtl: true, group: 'desc' },
  { name: 'duration', label: 'Duration', type: 'text', placeholder: 'e.g. 8 weeks', group: 'meta' },
  { name: 'certification', label: 'Certification', type: 'text', placeholder: 'e.g. Certificate of completion', group: 'meta' },
  {
    name: 'level',
    label: 'Level',
    type: 'select',
    group: 'meta',
    options: [
      { value: 'beginner', label: 'Beginner' },
      { value: 'intermediate', label: 'Intermediate' },
      { value: 'advanced', label: 'Advanced' },
    ],
  },
  { name: 'featured', label: 'Show on the home page', type: 'checkbox' },
];

export default function AdminCourses() {
  const utils = trpc.useUtils();
  const list = trpc.content.getAllCourses.useQuery();
  return (
    <AdminResource
      title="Manage Courses"
      singular="Course"
      fields={fields}
      rows={list.data}
      isLoading={list.isLoading}
      create={trpc.admin.createCourse.useMutation()}
      update={trpc.admin.updateCourse.useMutation()}
      remove={trpc.admin.deleteCourse.useMutation()}
      onChanged={() => utils.content.invalidate()}
      columns={[
        { label: 'Title', render: r => r.titleEn },
        { label: 'Duration', render: r => r.duration || '—' },
        { label: 'Level', render: r => <span className="capitalize">{r.level}</span> },
        { label: 'Home page', render: r => (r.featured ? 'Yes' : 'No') },
      ]}
    />
  );
}
