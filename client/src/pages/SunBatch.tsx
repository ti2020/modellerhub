import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'wouter';
import { REGISTER_CALL_URL, REGISTER_PHONE, TELEGRAM_URL, registerWhatsAppUrl } from '@/const';

// Sun batch (Batch 1) of the AFM Integrated Three-Statement Model course.
// Content lives here (not in LanguageContext) so the batch page can be edited in one place.
// Price is intentionally absent until agreed with the institute.

type Week = { en: [string, string]; ar: [string, string] };

const WEEKS: Week[] = [
  {
    en: ['Architecture and historical base', 'Timeline, tab order, sign and colour conventions, historical statements, first balance and cash checks.'],
    ar: ['هيكل النموذج والبيانات التاريخية', 'الخط الزمني، ترتيب الأوراق، اتفاقيات الإشارات والألوان، القوائم التاريخية، وأول فحص للميزانية والنقد.'],
  },
  {
    en: ['Revenue and operating forecast', 'Driver-based revenue, costs through net income, growth and margin diagnostics.'],
    ar: ['الإيرادات والتوقعات التشغيلية', 'إيرادات مبنية على المحركات، التكاليف حتى صافي الربح، ومؤشرات النمو والهوامش.'],
  },
  {
    en: ['PP&E, depreciation and taxes', 'PP&E roll-forward, capex drivers, depreciation methods, current and deferred tax.'],
    ar: ['الأصول الثابتة والإهلاك والضرائب', 'حركة الأصول الثابتة، محركات الإنفاق الرأسمالي، طرق الإهلاك، والضريبة الحالية والمؤجلة.'],
  },
  {
    en: ['Working capital and cash conversion', 'Receivables, inventory and payables from days drivers, and the signs on the cash flow statement.'],
    ar: ['رأس المال العامل وتحويل النقد', 'الذمم المدينة والمخزون والذمم الدائنة من محركات الأيام، وإشاراتها في قائمة التدفقات النقدية.'],
  },
  {
    en: ['Debt, interest, equity and cash sweep', 'Debt roll-forward, interest conventions, minimum cash, retained earnings and controlled circularity.'],
    ar: ['الديون والفوائد وحقوق الملكية والسداد النقدي', 'حركة الدين، طرق احتساب الفائدة، الحد الأدنى للنقد، الأرباح المحتجزة، والدوائر المرجعية المضبوطة.'],
  },
  {
    en: ['Full integration, checks and scenarios', 'Three-statement links, a master check, scenario switch and outputs page.'],
    ar: ['الربط الكامل والفحوصات والسيناريوهات', 'ربط القوائم الثلاث، فحص رئيسي شامل، مفتاح السيناريوهات، وصفحة المخرجات.'],
  },
  {
    en: ['Audit, presentation and timed rebuild', 'Find planted errors, rebuild a module from blank, timed mini-assessment.'],
    ar: ['التدقيق والعرض وإعادة البناء الموقوتة', 'اكتشاف الأخطاء المزروعة، إعادة بناء وحدة من الصفر، وتقييم قصير موقوت.'],
  },
  {
    en: ['Capstone and exam readiness', 'Final model, timed mock exam and a personal readiness score with a practice plan.'],
    ar: ['المشروع الختامي والجاهزية للاختبار', 'النموذج النهائي، اختبار تجريبي موقوت، ودرجة جاهزية شخصية مع خطة تدريب.'],
  },
];

const COPY = {
  en: {
    back: 'All batches',
    batch: 'Batch 1 · Sun',
    title: 'AFM Integrated Three-Statement Model',
    lede: 'Eight weeks, one model. You watch every module built live, then build it yourself before the next lecture, until you can build, audit and defend a fully integrated model on your own.',
    orientationLabel: 'Orientation',
    orientation: 'First Friday or Saturday of December 2026. The institute will announce the exact date.',
    formatLabel: 'Format',
    format: '8 live online lectures on Zoom, 2 hours each with a 20-minute break.',
    languageLabel: 'Language',
    language: 'Arabic and English',
    mapTitle: 'The eight weeks',
    mapNote: 'Every week adds a working part to the same model, so each assignment prepares the next.',
    rolesTitle: 'Who does what',
    teacher: 'The instructor',
    teacherText: 'Builds each module live in Excel and is the only one working in the file during the lecture. Reviews every submission and returns coded feedback.',
    student: 'You',
    studentText: 'Watch and ask questions in class, then complete that week’s template before the next lecture.',
    rulesTitle: 'How the batch runs',
    rules: [
      'The Zoom room opens 15 minutes before each lecture and stays open 15 minutes after for questions.',
      'Assignments are submitted through the course Telegram bot and approved by the instructor.',
      'Week n + 1 opens only after your week n assignment is delivered.',
      'You stay anonymous: classmates see only your planet ID (Sun-01, Sun-02 …), never your name or number.',
      'Feedback uses a fixed error code (source, formula, link, sign, timing, formatting, integration) with the cell and the fix.',
      'Assessment is a set of pass/fail tests you can run on your own model. A model that does not integrate is not exam-ready, however polished it looks.',
    ],
    prereqTitle: 'Before you join',
    prereqs: ['Windows 10 or 11', 'Intel Core i5 or newer', 'Excel 2019 or newer', 'A Telegram account and an email address'],
    afterTitle: 'After the course',
    after: 'A staged library of 15–16 practice models with check files, Telegram support, guidance on the FMI scholarship application and reminders up to the exam.',
    admission: 'Admission is selective and handled by our partner institute. A batch runs with at least 8 students.',
    registerTitle: 'Register',
    registerText: 'Message our partner institute on WhatsApp to register, or call the same number.',
    whatsapp: 'Register on WhatsApp',
    call: 'Call',
    cta: 'Course bot on Telegram',
  },
  ar: {
    back: 'كل الدفعات',
    batch: 'الدفعة 1 · الشمس',
    title: 'نموذج القوائم المالية الثلاث المتكاملة – AFM',
    lede: 'ثمانية أسابيع ونموذج واحد. تشاهد بناء كل وحدة مباشرة، ثم تبنيها بنفسك قبل المحاضرة التالية، حتى تستطيع بناء نموذج متكامل وتدقيقه والدفاع عنه بمفردك.',
    orientationLabel: 'الجلسة التعريفية',
    orientation: 'أول جمعة أو سبت من ديسمبر 2026. سيعلن المعهد التاريخ المحدد.',
    formatLabel: 'الصيغة',
    format: '8 محاضرات مباشرة عبر Zoom، مدة كل منها ساعتان مع استراحة 20 دقيقة.',
    languageLabel: 'اللغة',
    language: 'العربية والإنجليزية',
    mapTitle: 'الأسابيع الثمانية',
    mapNote: 'كل أسبوع يضيف جزءاً عاملاً إلى النموذج نفسه، فكل واجب يمهّد للذي يليه.',
    rolesTitle: 'الأدوار',
    teacher: 'المدرّب',
    teacherText: 'يبني كل وحدة مباشرة في Excel وهو الوحيد الذي يعمل في الملف أثناء المحاضرة. يراجع كل تسليم ويعيد ملاحظات مرمّزة.',
    student: 'أنت',
    studentText: 'تشاهد وتسأل أثناء المحاضرة، ثم تُكمل قالب الأسبوع قبل المحاضرة التالية.',
    rulesTitle: 'كيف تسير الدفعة',
    rules: [
      'تُفتح غرفة Zoom قبل كل محاضرة بـ 15 دقيقة وتبقى مفتوحة 15 دقيقة بعدها للأسئلة.',
      'تُسلَّم الواجبات عبر بوت الدورة على تيليجرام ويعتمدها المدرّب.',
      'لا يُفتح الأسبوع التالي إلا بعد تسليم واجب الأسبوع الحالي.',
      'تبقى هويتك مجهولة: لا يرى زملاؤك إلا رمزك (Sun-01، Sun-02 …)، لا اسمك ولا رقمك.',
      'الملاحظات تستخدم رمز خطأ ثابتاً (مصدر، معادلة، ربط، إشارة، توقيت، تنسيق، تكامل) مع الخلية والتصحيح.',
      'التقييم مجموعة اختبارات ناجح/راسب تطبّقها على نموذجك بنفسك. النموذج غير المتكامل ليس جاهزاً للاختبار مهما بدا متقناً.',
    ],
    prereqTitle: 'قبل الانضمام',
    prereqs: ['Windows 10 أو 11', 'معالج Intel Core i5 أو أحدث', 'Excel 2019 أو أحدث', 'حساب تيليجرام وبريد إلكتروني'],
    afterTitle: 'بعد الدورة',
    after: 'مكتبة مرحلية من 15–16 نموذجاً تدريبياً مع ملفات فحص، دعم عبر تيليجرام، توجيه في طلب منحة FMI، وتذكيرات حتى موعد الاختبار.',
    admission: 'القبول انتقائي ويتولاه المعهد الشريك. تنطلق الدفعة بحد أدنى 8 طلاب.',
    registerTitle: 'التسجيل',
    registerText: 'راسل المعهد الشريك عبر واتساب للتسجيل، أو اتصل على الرقم نفسه.',
    whatsapp: 'سجّل عبر واتساب',
    call: 'اتصال',
    cta: 'بوت الدورة على تيليجرام',
  },
};

function SunMark() {
  return (
    <svg viewBox="0 0 64 64" className="w-16 h-16" aria-hidden="true">
      <circle cx="32" cy="32" r="12" fill="#C5A065" />
      {Array.from({ length: 12 }).map((_, i) => (
        <line
          key={i}
          x1="32" y1="6" x2="32" y2="14"
          stroke="#C5A065" strokeWidth="3" strokeLinecap="round"
          transform={`rotate(${i * 30} 32 32)`}
        />
      ))}
    </svg>
  );
}

export default function SunBatch() {
  const { language, isRTL } = useLanguage();
  const c = language === 'ar' ? COPY.ar : COPY.en;
  const lang = language === 'ar' ? 'ar' : 'en';
  const align = isRTL ? 'text-right' : '';

  return (
    <div className="min-h-screen bg-gray-50" dir={isRTL ? 'rtl' : 'ltr'}>
      <section className="bg-[#002B5C] text-white">
        <div className="container mx-auto px-4 py-14">
          <Link href="/batches">
            <a className="text-sm text-white/70 hover:text-white">{isRTL ? '→' : '←'} {c.back}</a>
          </Link>
          <div className={`mt-6 flex flex-col md:flex-row gap-6 md:items-center ${align}`}>
            <SunMark />
            <div>
              <p className="text-[#C5A065] font-semibold">{c.batch}</p>
              <h1 className="text-4xl md:text-5xl font-bold mt-1 max-w-3xl leading-tight">{c.title}</h1>
            </div>
          </div>
          <p className={`mt-6 text-lg text-white/85 max-w-2xl leading-relaxed ${align}`}>{c.lede}</p>

          <dl className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-px bg-white/15 rounded-lg overflow-hidden">
            {[
              [c.orientationLabel, c.orientation],
              [c.formatLabel, c.format],
              [c.languageLabel, c.language],
            ].map(([k, v]) => (
              <div key={k} className={`bg-[#002B5C] p-5 ${align}`}>
                <dt className="text-sm text-[#C5A065]">{k}</dt>
                <dd className="mt-1 text-white/90">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <div className="container mx-auto px-4 py-14 space-y-16">
        <section className={align}>
          <h2 className="text-3xl font-bold text-[#002B5C]">{c.mapTitle}</h2>
          <p className="text-gray-600 mt-2 max-w-2xl">{c.mapNote}</p>
          <ol className="mt-8 relative border-gray-300 border-s-2 ms-3 space-y-7">
            {WEEKS.map((w, i) => (
              <li key={i} className="ps-8 relative">
                <span className="absolute -start-[17px] top-0 w-8 h-8 rounded-full bg-white border-2 border-[#002B5C] text-[#002B5C] text-sm font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <h3 className="text-lg font-semibold text-[#002B5C]">{w[lang][0]}</h3>
                <p className="text-gray-600 mt-1 max-w-2xl">{w[lang][1]}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className={align}>
          <h2 className="text-3xl font-bold text-[#002B5C]">{c.rolesTitle}</h2>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {[[c.teacher, c.teacherText], [c.student, c.studentText]].map(([h, p]) => (
              <div key={h} className="bg-white rounded-lg p-6 border-t-4 border-[#C5A065]">
                <h3 className="text-xl font-semibold text-[#002B5C]">{h}</h3>
                <p className="text-gray-700 mt-2 leading-relaxed">{p}</p>
              </div>
            ))}
          </div>
        </section>

        <section className={align}>
          <h2 className="text-3xl font-bold text-[#002B5C]">{c.rulesTitle}</h2>
          <ul className="mt-6 space-y-3 max-w-3xl">
            {c.rules.map(r => (
              <li key={r} className="flex gap-3 text-gray-700 leading-relaxed">
                <span className="mt-2 w-2 h-2 rounded-full bg-[#C5A065] shrink-0" aria-hidden="true" />
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className={`grid grid-cols-1 md:grid-cols-2 gap-10 ${align}`}>
          <div>
            <h2 className="text-2xl font-bold text-[#002B5C]">{c.prereqTitle}</h2>
            <ul className="mt-4 space-y-2 text-gray-700">
              {c.prereqs.map(p => <li key={p}>{p}</li>)}
            </ul>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#002B5C]">{c.afterTitle}</h2>
            <p className="mt-4 text-gray-700 leading-relaxed">{c.after}</p>
          </div>
        </section>

        <section id="register" className={`bg-white rounded-lg p-8 ${align}`}>
          <h2 className="text-2xl font-bold text-[#002B5C]">{c.registerTitle}</h2>
          <p className="text-gray-700 mt-2 max-w-2xl">{c.registerText}</p>
          <p className="text-gray-500 text-sm mt-1 max-w-2xl">{c.admission}</p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <a
              href={registerWhatsAppUrl(lang)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-[#25D366] hover:bg-[#1ebe5b] text-[#0b3d20] font-semibold px-6 py-3 rounded-md text-center"
            >
              {c.whatsapp}
            </a>
            <a
              href={REGISTER_CALL_URL}
              className="inline-block border border-[#002B5C] text-[#002B5C] hover:bg-[#002B5C] hover:text-white font-semibold px-6 py-3 rounded-md text-center"
            >
              {c.call} <bdi dir="ltr">{REGISTER_PHONE.replace(/^\+(\d{2})(\d{2})(\d+)$/, '+$1 $2 $3')}</bdi>
            </a>
            <a
              href={TELEGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-[#002B5C] underline underline-offset-4 px-2 py-3 text-center"
            >
              {c.cta}
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
