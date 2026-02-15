import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { trpc } from '@/lib/trpc';
import { Loader2, Plus, Edit2, Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function AdminCourses() {
  const { data: courses, isLoading } = trpc.content.getAllCourses.useQuery();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    titleEn: '',
    titleAr: '',
    descriptionEn: '',
    descriptionAr: '',
    duration: '',
    certification: '',
    level: 'beginner' as const,
    featured: 0,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'featured' ? (e.target as HTMLInputElement).checked ? 1 : 0 : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement create/update course mutation
    console.log('Form submitted:', formData);
    setShowForm(false);
    setFormData({
      titleEn: '',
      titleAr: '',
      descriptionEn: '',
      descriptionAr: '',
      duration: '',
      certification: '',
      level: 'beginner',
      featured: 0,
    });
  };

  return (
    <AdminLayout>
      <div>
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-[#002B5C]">Manage Courses</h1>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-[#002B5C] hover:bg-[#003d7a] text-white flex items-center gap-2"
          >
            <Plus size={20} />
            Add Course
          </Button>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <Card className="border-0 bg-white mb-8">
            <CardHeader>
              <CardTitle>{editingId ? 'Edit Course' : 'Add New Course'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title (English)
                    </label>
                    <Input
                      type="text"
                      name="titleEn"
                      value={formData.titleEn}
                      onChange={handleInputChange}
                      placeholder="Course title in English"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title (Arabic)
                    </label>
                    <Input
                      type="text"
                      name="titleAr"
                      value={formData.titleAr}
                      onChange={handleInputChange}
                      placeholder="عنوان الدورة بالعربية"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description (English)
                    </label>
                    <textarea
                      name="descriptionEn"
                      value={formData.descriptionEn}
                      onChange={handleInputChange}
                      placeholder="Course description in English"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#002B5C]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description (Arabic)
                    </label>
                    <textarea
                      name="descriptionAr"
                      value={formData.descriptionAr}
                      onChange={handleInputChange}
                      placeholder="وصف الدورة بالعربية"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#002B5C]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duration
                    </label>
                    <Input
                      type="text"
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      placeholder="e.g., 4 weeks"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Certification
                    </label>
                    <Input
                      type="text"
                      name="certification"
                      value={formData.certification}
                      onChange={handleInputChange}
                      placeholder="e.g., Certificate of Completion"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Level
                    </label>
                    <select
                      name="level"
                      value={formData.level}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#002B5C]"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={formData.featured === 1}
                    onChange={handleInputChange}
                    id="featured"
                    className="w-4 h-4 rounded"
                  />
                  <label htmlFor="featured" className="text-sm font-medium text-gray-700">
                    Featured Course
                  </label>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button type="submit" className="bg-[#002B5C] hover:bg-[#003d7a] text-white">
                    {editingId ? 'Update Course' : 'Create Course'}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="bg-gray-300 hover:bg-gray-400 text-black"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Courses List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-[#002B5C]" size={32} />
          </div>
        ) : (
          <Card className="border-0 bg-white">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Title</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Duration</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Level</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Featured</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {courses && courses.length > 0 ? (
                      courses.map((course: any) => (
                        <tr key={course.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-900">{course.titleEn}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{course.duration}</td>
                          <td className="px-6 py-4 text-sm">
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                              {course.level}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {course.featured ? (
                              <span className="text-green-600 font-semibold">Yes</span>
                            ) : (
                              <span className="text-gray-400">No</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm flex gap-2">
                            <button className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                              <Edit2 size={16} />
                            </button>
                            <button className="p-2 text-red-600 hover:bg-red-50 rounded">
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                          No courses yet. Click "Add Course" to create one.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
