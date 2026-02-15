import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, FileText, Image, Presentation, Mail } from 'lucide-react';

export default function ExportTemplates() {
  const templates = [
    {
      icon: Presentation,
      title: 'Presentation Slides',
      description: 'Export branded presentation slides with ModellerHub branding',
      format: 'HTML/PDF',
      action: 'Export Slides',
    },
    {
      icon: FileText,
      title: 'Word Document',
      description: 'Create course materials and documentation',
      format: 'DOCX',
      action: 'Export Document',
    },
    {
      icon: FileText,
      title: 'PDF Certificate',
      description: 'Generate course completion certificates',
      format: 'PDF',
      action: 'Export Certificate',
    },
    {
      icon: Mail,
      title: 'Email Signature',
      description: 'Professional email signature template',
      format: 'HTML',
      action: 'Export Signature',
    },
    {
      icon: Image,
      title: 'WhatsApp Graphics',
      description: 'Social media graphics for announcements and events',
      format: 'PNG/JPG',
      action: 'Export Graphics',
    },
    {
      icon: Image,
      title: 'Community Icons',
      description: 'Icons for various community activities',
      format: 'PNG/SVG',
      action: 'Export Icons',
    },
  ];

  const handleExport = (templateType: string) => {
    console.log(`Exporting ${templateType}`);
    // TODO: Implement export functionality
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-[#002B5C] mb-2">Export Templates</h2>
        <p className="text-gray-600">
          Download branded templates for presentations, documents, and social media content.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template, idx) => {
          const Icon = template.icon;
          return (
            <Card key={idx} className="border-0 bg-white hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <Icon size={32} className="text-[#C5A065]" />
                  <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {template.format}
                  </span>
                </div>
                <CardTitle className="text-lg text-[#002B5C]">{template.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">{template.description}</p>
                <Button
                  onClick={() => handleExport(template.title)}
                  className="w-full bg-[#002B5C] hover:bg-[#003d7a] text-white flex items-center justify-center gap-2"
                >
                  <Download size={16} />
                  {template.action}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Branding Guidelines */}
      <Card className="border-0 bg-gradient-to-r from-[#002B5C] to-[#003d7a] text-white">
        <CardHeader>
          <CardTitle className="text-white">Brand Guidelines</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <h4 className="font-semibold mb-2">Color Palette</h4>
            <div className="flex gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#002B5C] rounded border border-white"></div>
                <span>Primary: #002B5C</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#C5A065] rounded"></div>
                <span>Accent: #C5A065</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white rounded border border-gray-300"></div>
                <span>White: #FFFFFF</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Typography</h4>
            <p className="text-sm">Primary Font: Roboto, Open Sans | Heading: Bold 24-32px | Body: Regular 14-16px</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Community Slogan</h4>
            <p className="text-lg italic">"We Thrive Together"</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
