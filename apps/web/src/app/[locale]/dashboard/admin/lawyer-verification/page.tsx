'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Shield,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  User,
  Building2,
  MapPin,
  Calendar,
  AlertCircle,
  Eye,
  Download,
  Award,
  History,
} from 'lucide-react';

interface PendingVerification {
  id: string;
  lawyer_id: string;
  verification_type: string;
  status: string;
  document_type?: string;
  document_url?: string;
  document_back_url?: string;
  emirates_id?: string;
  emirates_id_expiry?: string;
  passport_number?: string;
  passport_expiry?: string;
  nationality?: string;
  license_authority?: string;
  license_number?: string;
  license_issue_date?: string;
  license_expiry_date?: string;
  practicing_cert_url?: string;
  reference1_name?: string;
  reference1_contact?: string;
  reference2_name?: string;
  reference2_contact?: string;
  submitted_at: string;
  first_name: string;
  last_name: string;
  email: string;
  emirate: string;
}

export default function LawyerVerificationAdminPage() {
  const t = useTranslations();
  const locale = useLocale();
  const isArabic = locale === 'ar';

  const [verifications, setVerifications] = useState<PendingVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVerification, setSelectedVerification] = useState<PendingVerification | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject'>('approve');
  const [reviewNotes, setReviewNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [mojVerified, setMojVerified] = useState(false);
  const [dubaiCourtsVerified, setDubaiCourtsVerified] = useState(false);
  const [adJudicialVerified, setAdJudicialVerified] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const translations = {
    title: isArabic ? 'التحقق من المحامين' : 'Lawyer Verification',
    subtitle: isArabic ? 'مراجعة وإدارة طلبات التحقق من المحامين' : 'Review and manage lawyer verification requests',
    pending: isArabic ? 'قيد المراجعة' : 'Pending Review',
    approved: isArabic ? 'معتمد' : 'Approved',
    rejected: isArabic ? 'مرفوض' : 'Rejected',
    all: isArabic ? 'الكل' : 'All',
    verifications: isArabic ? 'طلبات التحقق' : 'verifications',
    review: isArabic ? 'مراجعة' : 'Review',
    approve: isArabic ? 'اعتماد' : 'Approve',
    reject: isArabic ? 'رفض' : 'Reject',
    viewDocuments: isArabic ? 'عرض المستندات' : 'View Documents',
    lawyerInfo: isArabic ? 'معلومات المحامي' : 'Lawyer Information',
    verificationDetails: isArabic ? 'تفاصيل التحقق' : 'Verification Details',
    documents: isArabic ? 'المستندات' : 'Documents',
    reviewNotes: isArabic ? 'ملاحظات المراجعة' : 'Review Notes',
    rejectionReason: isArabic ? 'سبب الرفض' : 'Rejection Reason',
    expiryDate: isArabic ? 'تاريخ الانتهاء' : 'Expiry Date',
    uaeAuthorities: isArabic ? 'الجهات الإماراتية' : 'UAE Authorities',
    mojVerified: isArabic ? 'وزارة العدل' : 'Ministry of Justice',
    dubaiCourts: isArabic ? 'محاكم دبي' : 'Dubai Courts',
    adJudicial: isArabic ? 'القضاء أبوظبي' : 'Abu Dhabi Judicial',
    submit: isArabic ? 'إرسال' : 'Submit',
    cancel: isArabic ? 'إلغاء' : 'Cancel',
    email: isArabic ? 'البريد الإلكتروني' : 'Email',
    phone: isArabic ? 'الهاتف' : 'Phone',
    identity: isArabic ? 'الهوية' : 'Identity',
    professional: isArabic ? 'مهني' : 'Professional',
    enhanced: isArabic ? 'محسّن' : 'Enhanced',
    emiratesId: isArabic ? 'الهوية الإماراتية' : 'Emirates ID',
    passport: isArabic ? 'جواز السفر' : 'Passport',
    license: isArabic ? 'الترخيص' : 'License',
    nationality: isArabic ? 'الجنسية' : 'Nationality',
    licenseAuthority: isArabic ? 'جهة الترخيص' : 'License Authority',
    licenseNumber: isArabic ? 'رقم الترخيص' : 'License Number',
    issueDate: isArabic ? 'تاريخ الإصدار' : 'Issue Date',
    references: isArabic ? 'المراجع' : 'References',
    submittedOn: isArabic ? 'تم الإرسال في' : 'Submitted on',
  };

  useEffect(() => {
    fetchPendingVerifications();
  }, []);

  const fetchPendingVerifications = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/lawyers/admin/pending', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setVerifications(data.data.pending);
      }
    } catch (error) {
      console.error('Error fetching verifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const openReviewDialog = (verification: PendingVerification, action: 'approve' | 'reject') => {
    setSelectedVerification(verification);
    setReviewAction(action);
    setReviewDialogOpen(true);
    setReviewNotes('');
    setRejectionReason('');
  };

  const handleSubmitReview = async () => {
    if (!selectedVerification) return;

    try {
      setSubmitting(true);

      const endpoint = reviewAction === 'approve'
        ? `/api/lawyers/admin/verify/${selectedVerification.id}`
        : `/api/lawyers/admin/reject/${selectedVerification.id}`;

      const body = reviewAction === 'approve'
        ? {
            reviewNotes,
            expiresAt: expiryDate || null,
            mojVerified,
            dubaiCourtsVerified,
            adJudicialVerified,
          }
        : {
            rejectionReason,
            reviewNotes,
          };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (data.success) {
        setReviewDialogOpen(false);
        fetchPendingVerifications();
      }
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const getVerificationTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      email: 'bg-blue-100 text-blue-800',
      phone: 'bg-green-100 text-green-800',
      identity: 'bg-yellow-100 text-yellow-800',
      professional: 'bg-purple-100 text-purple-800',
      enhanced: 'bg-red-100 text-red-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_review: 'bg-blue-100 text-blue-800',
      verified: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            {translations.title}
          </h1>
          <p className="text-muted-foreground mt-1">{translations.subtitle}</p>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4">
          <div className="text-center px-4 py-2 bg-yellow-50 rounded-xl">
            <p className="text-2xl font-bold text-yellow-600">
              {verifications.filter((v) => v.status === 'pending').length}
            </p>
            <p className="text-xs text-muted-foreground">{translations.pending}</p>
          </div>
          <div className="text-center px-4 py-2 bg-muted/50 rounded-xl">
            <p className="text-2xl font-bold text-primary">{verifications.length}</p>
            <p className="text-xs text-muted-foreground">{translations.verifications}</p>
          </div>
        </div>
      </div>

      {/* Verifications List */}
      <div className="grid gap-4">
        {loading ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4 animate-spin" />
              <p>Loading verifications...</p>
            </CardContent>
          </Card>
        ) : verifications.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 mb-4" />
              <h3 className="text-lg font-semibold">All caught up!</h3>
              <p className="text-muted-foreground mt-1">No pending verifications to review</p>
            </CardContent>
          </Card>
        ) : (
          verifications.map((verification) => (
            <Card key={verification.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    {/* Lawyer Info */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">
                          {verification.first_name} {verification.last_name}
                        </h3>
                        <p className="text-sm text-muted-foreground">{verification.email}</p>
                      </div>
                      <Badge className={cn('ml-auto', getStatusColor(verification.status))}>
                        {verification.status}
                      </Badge>
                    </div>

                    {/* Verification Details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          {translations.verificationDetails}
                        </p>
                        <Badge className={getVerificationTypeColor(verification.verification_type)}>
                          {translations[verification.verification_type as keyof typeof translations] ||
                            verification.verification_type}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{verification.emirate}</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{new Date(verification.submitted_at).toLocaleDateString()}</span>
                      </div>

                      {verification.license_authority && (
                        <div className="flex items-center gap-2 text-sm">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span className="text-xs">{verification.license_authority}</span>
                        </div>
                      )}
                    </div>

                    {/* Quick Info */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {verification.emirates_id && (
                        <div>
                          <span className="text-muted-foreground">{translations.emiratesId}: </span>
                          <span className="font-medium">{verification.emirates_id}</span>
                        </div>
                      )}
                      {verification.passport_number && (
                        <div>
                          <span className="text-muted-foreground">{translations.passport}: </span>
                          <span className="font-medium">{verification.passport_number}</span>
                        </div>
                      )}
                      {verification.license_number && (
                        <div>
                          <span className="text-muted-foreground">{translations.licenseNumber}: </span>
                          <span className="font-medium">{verification.license_number}</span>
                        </div>
                      )}
                      {verification.nationality && (
                        <div>
                          <span className="text-muted-foreground">{translations.nationality}: </span>
                          <span className="font-medium">{verification.nationality}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    {verification.document_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(verification.document_url, '_blank')}
                      >
                        <Eye className="h-4 w-4 me-2" />
                        {translations.viewDocuments}
                      </Button>
                    )}
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => openReviewDialog(verification, 'approve')}
                    >
                      <CheckCircle2 className="h-4 w-4 me-2" />
                      {translations.approve}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => openReviewDialog(verification, 'reject')}
                    >
                      <XCircle className="h-4 w-4 me-2" />
                      {translations.reject}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {reviewAction === 'approve' ? translations.approve : translations.reject}{' '}
              {translations.verificationDetails}
            </DialogTitle>
            <DialogDescription>
              {selectedVerification &&
                `${selectedVerification.first_name} ${selectedVerification.last_name}`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {reviewAction === 'approve' ? (
              <>
                {/* Expiry Date */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {translations.expiryDate}
                  </label>
                  <Input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                  />
                </div>

                {/* UAE Authorities */}
                {selectedVerification?.verification_type === 'professional' && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      {translations.uaeAuthorities}
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={mojVerified}
                          onChange={(e) => setMojVerified(e.target.checked)}
                          className="rounded"
                        />
                        <span>{translations.mojVerified}</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={dubaiCourtsVerified}
                          onChange={(e) => setDubaiCourtsVerified(e.target.checked)}
                          className="rounded"
                        />
                        <span>{translations.dubaiCourts}</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={adJudicialVerified}
                          onChange={(e) => setAdJudicialVerified(e.target.checked)}
                          className="rounded"
                        />
                        <span>{translations.adJudicial}</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* Review Notes */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {translations.reviewNotes}
                  </label>
                  <Textarea
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="Optional notes..."
                    rows={3}
                  />
                </div>
              </>
            ) : (
              <>
                {/* Rejection Reason */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {translations.rejectionReason} *
                  </label>
                  <Textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Please provide a clear reason for rejection..."
                    rows={4}
                    required
                  />
                </div>

                {/* Review Notes */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {translations.reviewNotes}
                  </label>
                  <Textarea
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="Optional internal notes..."
                    rows={2}
                  />
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>
              {translations.cancel}
            </Button>
            <Button
              onClick={handleSubmitReview}
              disabled={submitting || (reviewAction === 'reject' && !rejectionReason)}
              className={reviewAction === 'reject' ? 'bg-red-600 hover:bg-red-700' : ''}
            >
              {submitting ? 'Submitting...' : translations.submit}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
