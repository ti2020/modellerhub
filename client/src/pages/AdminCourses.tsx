import AdminCrud, { type Field } from '@/components/AdminCrud';
import AdminLayout from '@/components/AdminLayout';
import { trpc } from '@/lib/trpc';

const fields: Field[] = [
  { name: 'titleEn', label: 'Title (English)', required: true },
  { name: 'titleAr', label: 'Title (Arabic)', required: true, rtl: true },
  { name: 'descriptionEn', label: 'Description (English)', type: 'textarea' },
  { name: 'descriptionAr', label: 'Description (Arabic)', type: 'textarea', rtl: true },
  { name: 'duration', label: 'Duration', placeholder: 'e.g. 8 weeks' },
  { name: 'certification', label: 'Certification' },
  {
    name: 'level',
    label: 'Level',
    type: 'select',
    options: [
      { value: 'beginner', label: 'Beginner' },
      { value: 'intermediate', label: 'Intermediate' },
      { value: 'advanced', label: 'Advanced' },
    ],
  },
  { name: 'featured', label: 'Show on home page', type: 'checkbox' },
];

export default function AdminCourses() {
  const utils = trpc.useUtils();
  const list = trpc.content.getAllCourses.useQuery();
  const create = trpc.admin.createCourse.useMutation();
  const update = trpc.admin.updateCourse.useMutation();
  const remove = trpc.admin.deleteCourse.useMutation();

  return (
    <AdminLayout>
      <AdminCrud
        title="Manage Courses"
        itemLabel="Course"
        rows={list.data}
        isLoading={list.isLoading}
        fields={fields}
        columns={[
          ['Title', r => r.titleEn],
          ['Duration', r => r.duration ?? '—'],
          ['Level', r => r.level],
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
