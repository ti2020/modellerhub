import AdminLayout from '@/components/AdminLayout';
import ExportTemplates from '@/components/ExportTemplates';

export default function AdminExport() {
  return (
    <AdminLayout>
      <div>
        <h1 className="text-4xl font-bold text-[#002B5C] mb-8">Export & Templates</h1>
        <ExportTemplates />
      </div>
    </AdminLayout>
  );
}
