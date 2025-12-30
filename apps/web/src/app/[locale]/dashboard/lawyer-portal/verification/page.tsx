'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Shield,
  CheckCircle2,
  XCircle,
  Clock,
  Upload,
  FileText,
  User,
  Building2,
  MapPin,
  Award,
  AlertCircle,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface VerificationLevel {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  icon: string;
  color: string;
  requirements: string[];
  requirementsAr: string[];
  benefits: string[];
  benefitsAr: string[];
}

const verificationLevels: VerificationLevel[] = [
  {
    id: 'basic',
    name: 'Basic Verification',
    nameAr: 'التحقق الأساسي',
    description: 'Email and phone verification',
    descriptionAr: 'التحقق من البريد الإلكتروني والهاتف',
    icon: 'user',
    color: 'blue',
    requirements: ['Valid email address', 'Phone number'],
    requirementsAr: ['عنوان بريد إلكتروني صالح', 'رقم هاتف'],
    benefits: ['Create profile', 'Browse lawyers', 'Basic visibility'],
    benefitsAr: ['إنشاء الملف الشخصي', 'تصفح المحامين', 'رؤية أساسية'],
  },
  {
    id: 'identity',
    name: 'Identity Verification',
    nameAr: 'التحقق من الهوية',
    description: 'Emirates ID or Passport verification',
    descriptionAr: 'التحقق من الهوية الإماراتية أو جواز السفر',
    icon: 'shield',
    color: 'yellow',
    requirements: ['Emirates ID or Passport', 'Selfie verification', 'Address proof'],
    requirementsAr: ['الهوية الإماراتية أو جواز السفر', 'التحقق بالصورة الشخصية', 'إثبات العنوان'],
    benefits: ['Identity badge', 'Higher trust', 'Accept consultations'],
    benefitsAr: ['شارة الهوية', 'ثقة أعلى', 'قبول الاستشارات'],
  },
  {
    id: 'professional',
    name: 'Professional Verification',
    nameAr: 'التحقق المهني',
    description: 'Bar license and practicing certificate',
    descriptionAr: 'ترخيص نقابة المحامين وشهادة المزاولة',
    icon: 'award',
    color: 'purple',
    requirements: [
      'Bar Association membership',
      'License number verification',
      'Practicing certificate',
      'UAE authority verification',
    ],
    requirementsAr: [
      'عضوية نقابة المحامين',
      'التحقق من رقم الترخيص',
      'شهادة المزاولة',
      'التحقق من السلطات الإماراتية',
    ],
    benefits: [
      'Professional badge',
      'Featured listings',
      'Accept cases',
      'Document certification',
    ],
    benefitsAr: [
      'شارة مهنية',
      'قوائم مميزة',
      'قبول القضايا',
      'توثيق المستندات',
    ],
  },
  {
    id: 'enhanced',
    name: 'Enhanced Verification',
    nameAr: 'التحقق المحسّن',
    description: 'Background check and professional references',
    descriptionAr: 'فحص الخلفية والمراجع المهنية',
    icon: 'sparkles',
    color: 'green',
    requirements: [
      'All previous verifications',
      'Background check',
      'Professional references (2)',
      'Court records check',
    ],
    requirementsAr: [
      'جميع التحققات السابقة',
      'فحص الخلفية',
      'مراجع مهنية (2)',
      'فحص السجلات القضائية',
    ],
    benefits: [
      'Premium badge',
      'Top listings',
      'Priority support',
      'Higher visibility',
    ],
    benefitsAr: [
      'شارة مميزة',
      'قوائم أولوية',
      'دعم ذو أولوية',
      'رؤية أعلى',
    ],
  },
];

export default function LawyerVerificationPage() {
  const t = useTranslations();
  const locale = useLocale();
  const isArabic = locale === 'ar';

  const [currentLevel, setCurrentLevel] = useState<string>('none');
  const [selectedLevel, setSelectedLevel] = useState<VerificationLevel | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [submitting, setSubmitting] = useState(false);
  const [verifications, setVerifications] = useState<any[]>([]);

  const translations = {
    title: isArabic ? 'التحقق من الهوية' : 'Verification',
    subtitle: isArabic ? 'قم بترقية مستوى التحقق الخاص بك لفتح المزيد من الفرص' : 'Upgrade your verification level to unlock more opportunities',
    currentLevel: isArabic ? 'المستوى الحالي' : 'Current Level',
    upgradeNow: isArabic ? 'ترقية الآن' : 'Upgrade Now',
    requirements: isArabic ? 'المتطلبات' : 'Requirements',
    benefits: isArabic ? 'الفوائد' : 'Benefits',
    startVerification: isArabic ? 'بدء التحقق' : 'Start Verification',
    submitDocuments: isArabic ? 'إرسال المستندات' : 'Submit Documents',
    verificationHistory: isArabic ? 'سجل التحقق' : 'Verification History',
    status: isArabic ? 'الحالة' : 'Status',
    pending: isArabic ? 'قيد المراجعة' : 'Pending',
    approved: isArabic ? 'معتمد' : 'Approved',
    rejected: isArabic ? 'مرفوض' : 'Rejected',
    submittedOn: isArabic ? 'تم الإرسال في' : 'Submitted on',
    uploadDocument: isArabic ? 'تحميل المستند' : 'Upload Document',
    emiratesId: isArabic ? 'الهوية الإماراتية' : 'Emirates ID',
    emiratesIdFront: isArabic ? 'الهوية الإماراتية (الأمام)' : 'Emirates ID (Front)',
    emiratesIdBack: isArabic ? 'الهوية الإماراتية (الخلف)' : 'Emirates ID (Back)',
    passport: isArabic ? 'جواز السفر' : 'Passport',
    nationality: isArabic ? 'الجنسية' : 'Nationality',
    dateOfBirth: isArabic ? 'تاريخ الميلاد' : 'Date of Birth',
    expiryDate: isArabic ? 'تاريخ الانتهاء' : 'Expiry Date',
    licenseAuthority: isArabic ? 'جهة الترخيص' : 'License Authority',
    licenseNumber: isArabic ? 'رقم الترخيص' : 'License Number',
    issueDate: isArabic ? 'تاريخ الإصدار' : 'Issue Date',
    practicingCertificate: isArabic ? 'شهادة المزاولة' : 'Practicing Certificate',
    referenceName: isArabic ? 'اسم المرجع' : 'Reference Name',
    referenceContact: isArabic ? 'معلومات الاتصال' : 'Contact Information',
    submit: isArabic ? 'إرسال' : 'Submit',
    cancel: isArabic ? 'إلغاء' : 'Cancel',
  };

  useEffect(() => {
    fetchVerificationStatus();
  }, []);

  const fetchVerificationStatus = async () => {
    try {
      const response = await fetch('/api/lawyers/me/verification', {
        credentials: 'include',
      });
      const data = await response.json();
      if (data.success) {
        setCurrentLevel(data.data.currentLevel || 'none');
        setVerifications(data.data.verifications || []);
      }
    } catch (error) {
      console.error('Error fetching verification status:', error);
    }
  };

  const openVerificationDialog = (level: VerificationLevel) => {
    setSelectedLevel(level);
    setDialogOpen(true);
    setFormData({});
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const uploadFormData = new FormData();
    uploadFormData.append('file', file);
    uploadFormData.append('type', 'verification');

    try {
      const response = await fetch('/api/uploads', {
        method: 'POST',
        credentials: 'include',
        body: uploadFormData,
      });

      const data = await response.json();
      if (data.success) {
        setFormData((prev: any) => ({
          ...prev,
          [field]: data.data.url,
        }));
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const handleSubmitVerification = async () => {
    if (!selectedLevel) return;

    try {
      setSubmitting(true);

      const response = await fetch('/api/lawyers/me/verification', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          verificationType: selectedLevel.id,
          ...formData,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setDialogOpen(false);
        fetchVerificationStatus();
      } else {
        alert(data.error?.message || 'Failed to submit verification');
      }
    } catch (error) {
      console.error('Error submitting verification:', error);
      alert('Failed to submit verification. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getLevelIcon = (iconName: string) => {
    const icons: Record<string, any> = {
      user: User,
      shield: Shield,
      award: Award,
      sparkles: Sparkles,
    };
    return icons[iconName] || Shield;
  };

  const getLevelColor = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'from-blue-500 to-blue-600',
      yellow: 'from-yellow-500 to-yellow-600',
      purple: 'from-purple-500 to-purple-600',
      green: 'from-green-500 to-green-600',
    };
    return colors[color] || 'from-gray-500 to-gray-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center">
            <Shield className="h-5 w-5 text-white" />
          </div>
          {translations.title}
        </h1>
        <p className="text-muted-foreground mt-1">{translations.subtitle}</p>
      </div>

      {/* Current Level Card */}
      <Card className="border-2 border-primary/20 bg-primary/5">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">{translations.currentLevel}</p>
              <h3 className="text-2xl font-bold text-primary">
                {currentLevel === 'none' ? 'Not Verified' : currentLevel}
              </h3>
            </div>
            <Badge className="bg-primary text-white px-4 py-2">
              <Shield className="h-4 w-4 me-2" />
              Active
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Verification Levels */}
      <div className="grid gap-4 md:grid-cols-2">
        {verificationLevels.map((level) => {
          const Icon = getLevelIcon(level.icon);
          const isCompleted = verifications.some(
            (v: any) => v.verification_type === level.id && v.status === 'approved'
          );
          const isPending = verifications.some(
            (v: any) => v.verification_type === level.id && v.status === 'pending'
          );

          return (
            <Card
              key={level.id}
              className={cn(
                'relative overflow-hidden transition-all hover:shadow-lg',
                isCompleted && 'ring-2 ring-green-500'
              )}
            >
              {/* Gradient Header */}
              <div
                className={cn(
                  'h-2 w-full bg-gradient-to-r',
                  getLevelColor(level.color)
                )}
              />

              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'h-12 w-12 rounded-xl bg-gradient-to-br flex items-center justify-center',
                        getLevelColor(level.color)
                      )}
                    >
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {isArabic ? level.nameAr : level.name}
                      </CardTitle>
                      <CardDescription>
                        {isArabic ? level.descriptionAr : level.description}
                      </CardDescription>
                    </div>
                  </div>
                  {isCompleted && (
                    <Badge className="bg-green-500">
                      <CheckCircle2 className="h-3 w-3 me-1" />
                      Verified
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Requirements */}
                <div>
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    {translations.requirements}
                  </h4>
                  <ul className="space-y-1">
                    {(isArabic ? level.requirementsAr : level.requirements).map((req, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Benefits */}
                <div>
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    {translations.benefits}
                  </h4>
                  <ul className="space-y-1">
                    {(isArabic ? level.benefitsAr : level.benefits).map((benefit, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <Award className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Button */}
                <Button
                  className="w-full"
                  onClick={() => openVerificationDialog(level)}
                  disabled={isCompleted || isPending}
                  variant={isPending ? 'outline' : 'default'}
                >
                  {isCompleted ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 me-2" />
                      {isArabic ? 'تم التحقق' : 'Verified'}
                    </>
                  ) : isPending ? (
                    <>
                      <Clock className="h-4 w-4 me-2" />
                      {translations.pending}
                    </>
                  ) : (
                    <>
                      {translations.startVerification}
                      <ChevronRight className="h-4 w-4 ms-2" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Verification Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedLevel && (isArabic ? selectedLevel.nameAr : selectedLevel.name)}
            </DialogTitle>
            <DialogDescription>
              {translations.submitDocuments}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Identity Verification Fields */}
            {selectedLevel?.id === 'identity' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      {translations.emiratesIdFront} *
                    </label>
                    <Input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileUpload(e, 'documentUrl')}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      {translations.emiratesIdBack}
                    </label>
                    <Input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileUpload(e, 'documentBackUrl')}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      {translations.emiratesId} *
                    </label>
                    <Input
                      value={formData.emiratesId || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, emiratesId: e.target.value })
                      }
                      placeholder="784-XXXX-XXXXXXX-X"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      {translations.expiryDate} *
                    </label>
                    <Input
                      type="date"
                      value={formData.emiratesIdExpiry || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, emiratesIdExpiry: e.target.value })
                      }
                    />
                  </div>
                </div>
              </>
            )}

            {/* Professional Verification Fields */}
            {selectedLevel?.id === 'professional' && (
              <>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {translations.licenseAuthority} *
                  </label>
                  <Input
                    value={formData.licenseAuthority || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, licenseAuthority: e.target.value })
                    }
                    placeholder="Ministry of Justice, Dubai Courts, etc."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      {translations.licenseNumber} *
                    </label>
                    <Input
                      value={formData.licenseNumber || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, licenseNumber: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      {translations.issueDate}
                    </label>
                    <Input
                      type="date"
                      value={formData.licenseIssueDate || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, licenseIssueDate: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {translations.practicingCertificate} *
                  </label>
                  <Input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileUpload(e, 'practicingCertUrl')}
                  />
                </div>
              </>
            )}

            {/* Enhanced Verification Fields */}
            {selectedLevel?.id === 'enhanced' && (
              <>
                <div className="space-y-4">
                  <h4 className="font-semibold">{translations.referenceName} 1</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Name *</label>
                      <Input
                        value={formData.reference1Name || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, reference1Name: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Contact *</label>
                      <Input
                        value={formData.reference1Contact || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, reference1Contact: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">{translations.referenceName} 2</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Name *</label>
                      <Input
                        value={formData.reference2Name || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, reference2Name: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Contact *</label>
                      <Input
                        value={formData.reference2Contact || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, reference2Contact: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Submit Button */}
            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setDialogOpen(false)} className="flex-1">
                {translations.cancel}
              </Button>
              <Button
                onClick={handleSubmitVerification}
                disabled={submitting}
                className="flex-1"
              >
                {submitting ? 'Submitting...' : translations.submit}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
