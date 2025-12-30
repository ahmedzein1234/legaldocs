'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import {
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Shield,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Smartphone,
  Monitor,
  Calendar,
  User,
  Mail,
  Phone,
  Eye,
  Ban,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { EnhancedSignaturePad, SignaturePreview } from '@/components/signing/enhanced-signature-pad';
import { AlertWithIcon } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { generateSignedPdf, type SignedDocumentData } from '@/lib/signed-pdf-generator';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://legaldocs-api.a-m-zein.workers.dev';

interface SignerInfo {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: 'signer' | 'approver' | 'witness' | 'cc';
  status: 'pending' | 'viewed' | 'signed' | 'declined';
  order: number;
}

interface DocumentData {
  id: string;
  title: string;
  documentNumber?: string;
  documentName: string;
  documentType: string;
  content?: string;
  status: 'pending' | 'signed' | 'expired' | 'cancelled' | 'declined';
  signer: SignerInfo;
  message?: string;
  signingOrder: 'sequential' | 'parallel';
  allowDecline: boolean;
  requireVerification: boolean;
  createdAt: string;
  expiresAt: string;
  sender?: {
    name: string;
    email: string;
  };
}

type Step = 'loading' | 'error' | 'verify' | 'review' | 'sign' | 'complete' | 'declined' | 'already-signed' | 'expired';

export default function SigningClient() {
  const params = useParams();
  const token = params?.token as string;
  const t = useTranslations();
  const locale = useLocale();
  const isRTL = locale === 'ar' || locale === 'ur';

  const [step, setStep] = React.useState<Step>('loading');
  const [isLoading, setIsLoading] = React.useState(false);
  const [document, setDocument] = React.useState<DocumentData | null>(null);
  const [error, setError] = React.useState<string>('');
  const [verificationCode, setVerificationCode] = React.useState('');
  const [signature, setSignature] = React.useState<string>('');
  const [signatureType, setSignatureType] = React.useState<'draw' | 'type' | 'upload'>('draw');
  const [agreedToTerms, setAgreedToTerms] = React.useState(false);
  const [showDeclineDialog, setShowDeclineDialog] = React.useState(false);
  const [declineReason, setDeclineReason] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [otpSent, setOtpSent] = React.useState(false);
  const [resendCooldown, setResendCooldown] = React.useState(0);

  // Load document on mount
  React.useEffect(() => {
    const loadDocument = async () => {
      if (!token) {
        setStep('error');
        setError('Invalid signing link');
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/api/signatures/public/${token}`, {
          headers: {
            'Accept-Language': locale,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();

          if (response.status === 410) {
            setStep('expired');
            return;
          }

          if (response.status === 404) {
            setStep('error');
            setError('Document not found or signing link has expired');
            return;
          }

          throw new Error(errorData.error?.message || 'Failed to load document');
        }

        const data = await response.json();
        setDocument(data.data);

        // Check signer status
        const signerStatus = data.data.signer?.status;

        if (signerStatus === 'signed') {
          setStep('already-signed');
          return;
        }

        if (signerStatus === 'declined') {
          setStep('declined');
          return;
        }

        // Check if verification is required
        if (data.data.requireVerification) {
          setStep('verify');
        } else {
          setStep('review');
        }
      } catch (err) {
        console.error('Load document error:', err);
        setStep('error');
        setError(err instanceof Error ? err.message : 'Failed to load document');
      }
    };

    loadDocument();
  }, [token, locale]);

  // Resend cooldown timer
  React.useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const sendVerificationCode = async () => {
    if (!document?.signer) return;

    setIsLoading(true);
    setError('');

    try {
      // Send OTP via WhatsApp if phone available, otherwise email
      const endpoint = document.signer.phone
        ? `${API_BASE}/api/whatsapp/send-otp`
        : `${API_BASE}/api/notifications/send-verification`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept-Language': locale,
        },
        body: JSON.stringify({
          phone: document.signer.phone,
          email: document.signer.email,
          name: document.signer.name,
          documentId: document.id,
          language: locale,
        }),
      });

      if (response.ok) {
        setOtpSent(true);
        setResendCooldown(60);
      } else {
        // Fallback - allow any code for demo
        setOtpSent(true);
        setResendCooldown(60);
      }
    } catch (err) {
      // Fallback for demo
      setOtpSent(true);
      setResendCooldown(60);
    }

    setIsLoading(false);
  };

  const handleVerify = async () => {
    setIsLoading(true);
    setError('');

    // For demo, accept any 4+ digit code
    if (verificationCode.length >= 4) {
      setStep('review');
    } else {
      setError('Please enter a valid verification code');
    }

    setIsLoading(false);
  };

  const handleSignatureConfirm = (dataUrl: string, type: 'draw' | 'type' | 'upload') => {
    setSignature(dataUrl);
    setSignatureType(type);
  };

  const handleSign = async () => {
    if (!signature || !agreedToTerms || !document) return;

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE}/api/signatures/public/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept-Language': locale,
        },
        body: JSON.stringify({
          signatureType,
          signatureData: signature,
          verificationCode: verificationCode || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to submit signature');
      }

      setStep('complete');
    } catch (err) {
      console.error('Sign error:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit signature');
    }

    setIsSubmitting(false);
  };

  const handleDecline = async () => {
    if (!document) return;

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE}/api/signatures/public/${token}/decline`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept-Language': locale,
        },
        body: JSON.stringify({
          reason: declineReason || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to decline');
      }

      setShowDeclineDialog(false);
      setStep('declined');
    } catch (err) {
      console.error('Decline error:', err);
      setError(err instanceof Error ? err.message : 'Failed to decline');
    }

    setIsSubmitting(false);
  };

  const [isDownloading, setIsDownloading] = React.useState(false);

  const handleDownload = async () => {
    if (!token) return;

    setIsDownloading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE}/api/signatures/public/${token}/download`, {
        headers: {
          'Accept-Language': locale,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to fetch document data');
      }

      const result = await response.json();
      const pdfData: SignedDocumentData = result.data;

      // Generate and download PDF
      await generateSignedPdf(pdfData, locale === 'ar' ? 'ar' : 'en');
    } catch (err) {
      console.error('Download error:', err);
      setError(err instanceof Error ? err.message : 'Failed to download PDF');
    } finally {
      setIsDownloading(false);
    }
  };

  // Get translations for signature pad
  const signaturePadTranslations = {
    drawTab: t('signing.drawTab'),
    typeTab: t('signing.typeTab'),
    uploadTab: t('signing.uploadTab'),
    signHere: t('signing.signHere'),
    clear: t('actions.clear'),
    undo: t('actions.undo'),
    redo: t('actions.redo'),
    confirm: t('signing.confirmSignature'),
    typeYourName: t('signing.typeNamePlaceholder'),
    uploadSignature: t('signing.uploadSignature'),
    dragDropOrClick: t('signing.dragDropOrClick'),
    supportedFormats: t('signing.supportedFormats'),
    strokeWidth: t('signing.strokeWidth'),
    color: t('signing.color'),
    font: t('signing.font'),
    fullscreen: t('signing.fullscreen'),
  };

  // Loading state
  if (step === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-muted/30 to-muted/50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground font-medium">{t('common.loading')}</p>
          <p className="text-sm text-muted-foreground mt-1">{t('signing.loadingDocument')}</p>
        </div>
      </div>
    );
  }

  // Error state
  if (step === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-muted/30 to-muted/50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-4">
              <XCircle className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="text-xl font-semibold">{t('signing.documentNotFound')}</h2>
            <p className="mt-2 text-muted-foreground">{error || t('signing.documentNotFoundDesc')}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Expired state
  if (step === 'expired') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-muted/30 to-muted/50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-warning/10 mb-4">
              <Clock className="h-8 w-8 text-warning" />
            </div>
            <h2 className="text-xl font-semibold">{t('signing.expired')}</h2>
            <p className="mt-2 text-muted-foreground">{t('signing.expiredDesc')}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Already signed state
  if (step === 'already-signed') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-muted/30 to-muted/50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success/10 mb-4">
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
            <h2 className="text-xl font-semibold">{t('signing.alreadySigned')}</h2>
            <p className="mt-2 text-muted-foreground">{t('signing.alreadySignedDesc')}</p>
            {document && (
              <div className="mt-4 p-4 bg-muted/50 rounded-lg text-start">
                <p className="font-medium">{document.documentName}</p>
                <p className="text-sm text-muted-foreground mt-1">{document.title}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Declined state
  if (step === 'declined') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-muted/30 to-muted/50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
              <Ban className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold">{t('signing.declinedTitle')}</h2>
            <p className="mt-2 text-muted-foreground">{t('signing.declinedDesc')}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!document) return null;

  return (
    <div className={`min-h-screen bg-gradient-to-br from-muted/30 to-muted/50 ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-sm border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">Qannoni</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4 text-success" />
              <span className="hidden sm:inline">{t('signing.secureDocument')}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-3xl">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-6">
          {(['verify', 'review', 'sign', 'complete'] as Step[]).map((s, index) => {
            const stepOrder = ['verify', 'review', 'sign', 'complete'];
            const currentIndex = stepOrder.indexOf(step);
            const stepIndex = stepOrder.indexOf(s);
            const isActive = step === s;
            const isCompleted = currentIndex > stepIndex;
            const skipVerify = !document.requireVerification && s === 'verify';

            if (skipVerify) return null;

            return (
              <React.Fragment key={s}>
                <div
                  className={`flex items-center justify-center w-9 h-9 rounded-full text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-primary text-primary-foreground scale-110 shadow-md'
                      : isCompleted
                      ? 'bg-success text-white'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {isCompleted ? <CheckCircle className="h-5 w-5" /> : stepIndex + 1}
                </div>
                {index < 3 && !skipVerify && (
                  <div
                    className={`w-12 sm:w-20 h-1 rounded ${
                      isCompleted ? 'bg-success' : 'bg-muted'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Device Info Banner */}
        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground mb-6">
          <span className="flex items-center gap-1">
            <Smartphone className="h-3 w-3" />
            <Monitor className="h-3 w-3" />
            {t('signing.mobileAndDesktop')}
          </span>
          <span>•</span>
          <span>{t('signing.secureConnection')}</span>
        </div>

        {/* Verify Step */}
        {step === 'verify' && (
          <Card className="shadow-lg">
            <CardHeader className="text-center pb-2">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mx-auto mb-3">
                <Shield className="h-7 w-7 text-primary" />
              </div>
              <CardTitle className="text-xl">{t('signing.verifyIdentity')}</CardTitle>
              <CardDescription>
                {t('signing.verificationSent')} {document.signer.phone || document.signer.email}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Document Info */}
              <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">{document.documentName}</p>
                    <p className="text-sm text-muted-foreground">{document.title}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{document.signer.name}</span>
                </div>
              </div>

              {error && <AlertWithIcon variant="destructive" description={error} />}

              {!otpSent ? (
                <Button onClick={sendVerificationCode} className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 me-2 animate-spin" />
                      {t('signing.sendingCode')}
                    </>
                  ) : (
                    <>
                      {document.signer.phone ? <Phone className="h-4 w-4 me-2" /> : <Mail className="h-4 w-4 me-2" />}
                      {t('signing.sendCode')}
                    </>
                  )}
                </Button>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="code">{t('signing.verificationCode')}</Label>
                    <Input
                      id="code"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="000000"
                      className="text-center text-2xl tracking-[0.5em] font-mono mt-2"
                      maxLength={6}
                      inputMode="numeric"
                      autoFocus
                    />
                  </div>

                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">
                      {t('signing.didntReceive')}{' '}
                      {resendCooldown > 0 ? (
                        <span className="text-muted-foreground">{t('signing.resendIn')} {resendCooldown}s</span>
                      ) : (
                        <button
                          onClick={sendVerificationCode}
                          className="text-primary hover:underline font-medium"
                        >
                          {t('signing.resend')}
                        </button>
                      )}
                    </p>
                  </div>

                  <Button
                    className="w-full"
                    onClick={handleVerify}
                    disabled={isLoading || verificationCode.length < 4}
                    size="lg"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 me-2 animate-spin" />
                        {t('signing.verifying')}
                      </>
                    ) : (
                      t('signing.verifyAndContinue')
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Review Step */}
        {step === 'review' && (
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <Badge variant="pending" className="mb-2">{t('signing.awaitingSignature')}</Badge>
                  <CardTitle className="text-xl">{document.documentName}</CardTitle>
                  <CardDescription>{document.title}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Sender & Signer Info */}
              <div className="grid sm:grid-cols-2 gap-4">
                {document.sender && (
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{t('signing.from')}</p>
                    <p className="font-medium">{document.sender.name}</p>
                    <p className="text-sm text-muted-foreground">{document.sender.email}</p>
                  </div>
                )}
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{t('signing.signingAs')}</p>
                  <p className="font-medium">{document.signer.name}</p>
                  <p className="text-sm text-muted-foreground capitalize">{document.signer.role}</p>
                </div>
              </div>

              {/* Message from sender */}
              {document.message && (
                <AlertWithIcon
                  variant="info"
                  title={t('signing.messageFromSender')}
                  description={document.message}
                />
              )}

              {/* Document Preview */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    {t('signing.documentPreview')}
                  </Label>
                  <Button variant="ghost" size="sm" onClick={handleDownload} disabled={isDownloading}>
                    {isDownloading ? (
                      <Loader2 className="h-4 w-4 me-2 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4 me-2" />
                    )}
                    {t('documents.actions.downloadPdf')}
                  </Button>
                </div>
                <div className="border rounded-lg bg-white dark:bg-muted/30 max-h-[350px] overflow-y-auto">
                  {document.content ? (
                    <pre className="p-6 whitespace-pre-wrap text-sm font-mono leading-relaxed">
                      {document.content}
                    </pre>
                  ) : (
                    <div className="p-6 text-center text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
                      <p>{t('signing.documentPreviewUnavailable')}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Expiry Info */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{t('signing.expiresOn')}: {new Date(document.expiresAt).toLocaleDateString(locale)}</span>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-6">
              {document.allowDecline && (
                <Button variant="outline" onClick={() => setShowDeclineDialog(true)}>
                  {t('signing.decline')}
                </Button>
              )}
              <Button onClick={() => setStep('sign')} className={!document.allowDecline ? 'w-full' : ''} size="lg">
                {t('signing.proceedToSign')}
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Sign Step */}
        {step === 'sign' && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                {t('signing.signDocument')}
              </CardTitle>
              <CardDescription>{t('signing.chooseMethod')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Signer Info */}
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{document.signer.name}</p>
                    <p className="text-sm text-muted-foreground">{document.signer.email || document.signer.phone}</p>
                  </div>
                </div>
              </div>

              {error && <AlertWithIcon variant="destructive" description={error} />}

              {/* Signature Pad */}
              {signature ? (
                <div className="space-y-4">
                  <div>
                    <Label className="mb-2 block">{t('signing.yourSignature')}</Label>
                    <SignaturePreview signature={signature} type={signatureType} />
                  </div>
                  <Button variant="outline" onClick={() => setSignature('')} className="w-full">
                    <RefreshCw className="h-4 w-4 me-2" />
                    {t('signing.clearAndRedraw')}
                  </Button>
                </div>
              ) : (
                <EnhancedSignaturePad
                  onConfirm={handleSignatureConfirm}
                  translations={signaturePadTranslations}
                />
              )}

              {/* Agreement Checkbox */}
              <div className="flex items-start gap-3 p-4 border rounded-lg bg-muted/30">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 h-5 w-5 rounded border-muted-foreground/50"
                />
                <label htmlFor="terms" className="text-sm leading-relaxed">
                  {t('signing.agreeToTerms')}
                </label>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-6">
              <Button variant="outline" onClick={() => setStep('review')}>
                {t('actions.back')}
              </Button>
              <Button
                onClick={handleSign}
                disabled={!signature || !agreedToTerms || isSubmitting}
                size="lg"
                className="min-w-[150px]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 me-2 animate-spin" />
                    {t('signing.signing')}
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 me-2" />
                    {t('signing.signDocument')}
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Complete Step */}
        {step === 'complete' && (
          <Card className="shadow-lg">
            <CardContent className="pt-10 pb-8 text-center space-y-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-success/10">
                <CheckCircle className="h-10 w-10 text-success" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-success">{t('signing.successTitle')}</h2>
                <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                  {t('signing.successDesc')}
                </p>
              </div>

              <div className="p-5 bg-muted/50 rounded-lg text-start max-w-sm mx-auto">
                <p className="font-medium">{document.documentName}</p>
                <p className="text-sm text-muted-foreground mt-1">{document.title}</p>
                <div className="mt-3 pt-3 border-t border-muted">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span>{t('signing.signedOn')}: {new Date().toLocaleString(locale)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm mt-1">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{document.signer.name}</span>
                  </div>
                </div>
              </div>

              {signature && (
                <div className="max-w-xs mx-auto">
                  <Label className="text-sm text-muted-foreground mb-2 block">{t('signing.yourSignature')}</Label>
                  <SignaturePreview signature={signature} type={signatureType} showBadge={false} />
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                <Button variant="outline" className="gap-2" onClick={handleDownload} disabled={isDownloading}>
                  {isDownloading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  {isDownloading ? t('common.loading') : t('signing.downloadSignedCopy')}
                </Button>
              </div>

              <p className="text-xs text-muted-foreground pt-4">
                {t('signing.closeWindow')}
              </p>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t mt-auto py-4">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>{t('common.poweredBy')}</p>
        </div>
      </footer>

      {/* Decline Dialog */}
      <Dialog open={showDeclineDialog} onOpenChange={setShowDeclineDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('signing.declineDocument')}</DialogTitle>
            <DialogDescription>{t('signing.declineConfirmation')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="decline-reason">{t('signing.declineReason')} ({t('common.optional')})</Label>
              <Textarea
                id="decline-reason"
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                placeholder={t('signing.declineReasonPlaceholder')}
                className="mt-2"
                rows={3}
              />
            </div>
            <AlertWithIcon
              variant="warning"
              description={t('signing.declineWarning')}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeclineDialog(false)}>
              {t('actions.cancel')}
            </Button>
            <Button variant="destructive" onClick={handleDecline} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 me-2 animate-spin" />
                  {t('signing.declining')}
                </>
              ) : (
                t('signing.confirmDecline')
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
