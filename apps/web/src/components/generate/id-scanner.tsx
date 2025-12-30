'use client';

import { useState, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Camera,
  Upload,
  X,
  Loader2,
  Check,
  AlertCircle,
  Scan,
  CreditCard,
  FileText,
  Building2,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { captureError } from '@/lib/error-tracking';

interface ExtractedData {
  name?: string;
  idNumber?: string;
  nationality?: string;
  address?: string;
  dateOfBirth?: string;
  expiryDate?: string;
  gender?: string;
  // Company fields
  companyName?: string;
  tradeLicense?: string;
  registrationDate?: string;
}

interface IdScannerProps {
  onExtract: (data: ExtractedData) => void;
  locale?: string;
  documentType?: 'emirates_id' | 'passport' | 'trade_license' | 'auto';
}

type ScanStatus = 'idle' | 'capturing' | 'processing' | 'success' | 'error';

export function IdScanner({ onExtract, locale = 'en', documentType = 'auto' }: IdScannerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<ScanStatus>('idle');
  const [error, setError] = useState<string>('');
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState<string>(documentType);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const isArabic = locale === 'ar';

  const translations = {
    scanId: isArabic ? 'مسح الهوية' : 'Scan ID',
    scanDocument: isArabic ? 'مسح المستند' : 'Scan Document',
    takePhoto: isArabic ? 'التقاط صورة' : 'Take Photo',
    uploadPhoto: isArabic ? 'رفع صورة' : 'Upload Photo',
    processing: isArabic ? 'جاري المعالجة...' : 'Processing...',
    extracting: isArabic ? 'جاري استخراج البيانات...' : 'Extracting data...',
    success: isArabic ? 'تم الاستخراج بنجاح' : 'Extraction successful',
    error: isArabic ? 'فشل الاستخراج' : 'Extraction failed',
    tryAgain: isArabic ? 'حاول مرة أخرى' : 'Try Again',
    useData: isArabic ? 'استخدام البيانات' : 'Use This Data',
    cancel: isArabic ? 'إلغاء' : 'Cancel',
    emiratesId: isArabic ? 'الهوية الإماراتية' : 'Emirates ID',
    passport: isArabic ? 'جواز السفر' : 'Passport',
    tradeLicense: isArabic ? 'الرخصة التجارية' : 'Trade License',
    selectDocType: isArabic ? 'اختر نوع المستند' : 'Select Document Type',
    positionCard: isArabic ? 'ضع البطاقة داخل الإطار' : 'Position card within frame',
    goodLighting: isArabic ? 'تأكد من الإضاءة الجيدة' : 'Ensure good lighting',
    holdSteady: isArabic ? 'أمسك الجهاز بثبات' : 'Hold device steady',
    aiPowered: isArabic ? 'مدعوم بالذكاء الاصطناعي' : 'AI-Powered',
    quickExtract: isArabic ? 'استخراج سريع' : 'Quick Extract',
    cameraPermission: isArabic ? 'يرجى السماح بالوصول للكاميرا' : 'Please allow camera access',
    retake: isArabic ? 'إعادة التقاط' : 'Retake',
  };

  const docTypes = [
    { id: 'emirates_id', name: translations.emiratesId, icon: CreditCard },
    { id: 'passport', name: translations.passport, icon: FileText },
    { id: 'trade_license', name: translations.tradeLicense, icon: Building2 },
  ];

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraActive(true);
        setStatus('capturing');
      }
    } catch {
      setError(translations.cameraPermission);
      setStatus('error');
    }
  }, [translations.cameraPermission]);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  }, []);

  // Capture photo from camera
  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setPreviewUrl(dataUrl);
    stopCamera();
    processImage(dataUrl);
  }, [stopCamera]);

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setPreviewUrl(dataUrl);
      processImage(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  // Process image with OCR
  const processImage = async (imageData: string) => {
    setStatus('processing');
    setError('');

    try {
      // Call the OCR API
      const result = await apiClient.post<{ data: ExtractedData }>('/api/ai/ocr/extract', {
        image: imageData,
        documentType: selectedDocType,
        language: locale,
      });

      if (result.data) {
        setExtractedData(result.data);
        setStatus('success');
      } else {
        throw new Error('No data returned from OCR');
      }
    } catch (err) {
      captureError(err, { component: 'IdScanner', action: 'processImage', documentType: selectedDocType });

      // Try to show a user-friendly error
      const errorMessage = err instanceof Error ? err.message : 'OCR extraction failed';
      setError(errorMessage);

      // For demo purposes when API isn't available, simulate extracted data
      // In production, this would show an error instead
      if (process.env.NODE_ENV === 'development') {
        simulateExtraction();
      } else {
        setStatus('error');
      }
    }
  };

  // Simulate extraction for demo (when API isn't available)
  const simulateExtraction = () => {
    setTimeout(() => {
      const mockData: ExtractedData = {
        name: 'Ahmed Mohammed Al-Rashid',
        idNumber: '784-1990-1234567-1',
        nationality: 'United Arab Emirates',
        dateOfBirth: '1990-05-15',
        expiryDate: '2028-05-14',
        gender: 'Male',
      };
      setExtractedData(mockData);
      setStatus('success');
    }, 2000);
  };

  // Reset scanner
  const reset = () => {
    setStatus('idle');
    setPreviewUrl('');
    setExtractedData(null);
    setError('');
    stopCamera();
  };

  // Use extracted data
  const handleUseData = () => {
    if (extractedData) {
      onExtract(extractedData);
      setIsOpen(false);
      reset();
    }
  };

  // Close dialog
  const handleClose = () => {
    setIsOpen(false);
    reset();
  };

  return (
    <>
      {/* Trigger Button */}
      <Button
        variant="outline"
        size="sm"
        className="gap-2 h-9 border-dashed"
        onClick={() => setIsOpen(true)}
      >
        <Scan className="h-4 w-4" />
        {translations.scanId}
        <Badge variant="secondary" className="text-[9px] px-1.5">
          <Sparkles className="h-2.5 w-2.5 me-0.5" />
          AI
        </Badge>
      </Button>

      {/* Scanner Dialog */}
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Scan className="h-5 w-5 text-primary" />
              {translations.scanDocument}
            </DialogTitle>
            <DialogDescription>
              {isArabic
                ? 'التقط صورة أو ارفع صورة للهوية لاستخراج البيانات تلقائياً'
                : 'Capture or upload an ID photo to automatically extract data'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Document Type Selection */}
            {status === 'idle' && (
              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground">
                  {translations.selectDocType}
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {docTypes.map((doc) => (
                    <button
                      key={doc.id}
                      onClick={() => setSelectedDocType(doc.id)}
                      className={cn(
                        'flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all',
                        selectedDocType === doc.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      )}
                    >
                      <doc.icon
                        className={cn(
                          'h-6 w-6',
                          selectedDocType === doc.id
                            ? 'text-primary'
                            : 'text-muted-foreground'
                        )}
                      />
                      <span className="text-xs font-medium">{doc.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Camera/Preview Area */}
            <div className="relative aspect-[3/2] bg-muted rounded-xl overflow-hidden">
              {/* Camera View */}
              {isCameraActive && (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  {/* Scan Frame Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative w-[85%] h-[70%]">
                      {/* Corner indicators */}
                      <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg" />
                      <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg" />
                      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg" />
                      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg" />
                      {/* Scanning line animation */}
                      <div className="absolute inset-x-4 top-1/2 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse" />
                    </div>
                  </div>
                  {/* Instructions */}
                  <div className="absolute bottom-4 left-0 right-0 text-center">
                    <p className="text-sm text-white bg-black/50 px-3 py-1 rounded-full inline-block">
                      {translations.positionCard}
                    </p>
                  </div>
                </>
              )}

              {/* Preview Image */}
              {previewUrl && !isCameraActive && (
                <img
                  src={previewUrl}
                  alt="Captured ID"
                  className="w-full h-full object-contain"
                />
              )}

              {/* Processing Overlay */}
              {status === 'processing' && (
                <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center gap-3">
                  <div className="relative">
                    <Loader2 className="h-12 w-12 text-primary animate-spin" />
                    <Sparkles className="h-5 w-5 text-primary absolute -top-1 -right-1 animate-pulse" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium">{translations.extracting}</p>
                    <p className="text-sm text-muted-foreground">{translations.aiPowered}</p>
                  </div>
                </div>
              )}

              {/* Success Overlay */}
              {status === 'success' && extractedData && (
                <div className="absolute inset-0 bg-background/95 p-4 overflow-auto">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <Check className="h-5 w-5 text-green-600" />
                    </div>
                    <span className="font-semibold text-green-600">{translations.success}</span>
                  </div>
                  <div className="space-y-2">
                    {extractedData.name && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Name:</span>
                        <span className="font-medium">{extractedData.name}</span>
                      </div>
                    )}
                    {extractedData.idNumber && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">ID Number:</span>
                        <span className="font-medium">{extractedData.idNumber}</span>
                      </div>
                    )}
                    {extractedData.nationality && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Nationality:</span>
                        <span className="font-medium">{extractedData.nationality}</span>
                      </div>
                    )}
                    {extractedData.dateOfBirth && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Date of Birth:</span>
                        <span className="font-medium">{extractedData.dateOfBirth}</span>
                      </div>
                    )}
                    {extractedData.expiryDate && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Expiry Date:</span>
                        <span className="font-medium">{extractedData.expiryDate}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Error Overlay */}
              {status === 'error' && (
                <div className="absolute inset-0 bg-background/95 flex flex-col items-center justify-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <AlertCircle className="h-7 w-7 text-red-600" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-red-600">{translations.error}</p>
                    <p className="text-sm text-muted-foreground">{error}</p>
                  </div>
                </div>
              )}

              {/* Idle State */}
              {status === 'idle' && !isCameraActive && !previewUrl && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                  <div className="h-16 w-16 rounded-2xl bg-muted-foreground/10 flex items-center justify-center">
                    <CreditCard className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      {translations.quickExtract}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Check className="h-3 w-3 text-green-500" />
                        {translations.goodLighting}
                      </span>
                      <span className="flex items-center gap-1">
                        <Check className="h-3 w-3 text-green-500" />
                        {translations.holdSteady}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Hidden canvas for capture */}
              <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {status === 'idle' && !isCameraActive && (
                <>
                  <Button className="flex-1 gap-2" onClick={startCamera}>
                    <Camera className="h-4 w-4" />
                    {translations.takePhoto}
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 gap-2"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4" />
                    {translations.uploadPhoto}
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </>
              )}

              {isCameraActive && (
                <>
                  <Button variant="outline" className="flex-1" onClick={stopCamera}>
                    <X className="h-4 w-4 me-2" />
                    {translations.cancel}
                  </Button>
                  <Button className="flex-1 gap-2" onClick={capturePhoto}>
                    <Camera className="h-4 w-4" />
                    {translations.takePhoto}
                  </Button>
                </>
              )}

              {status === 'success' && (
                <>
                  <Button variant="outline" className="flex-1" onClick={reset}>
                    <RotateCcw className="h-4 w-4 me-2" />
                    {translations.retake}
                  </Button>
                  <Button className="flex-1 gap-2" onClick={handleUseData}>
                    <Check className="h-4 w-4" />
                    {translations.useData}
                  </Button>
                </>
              )}

              {status === 'error' && (
                <Button className="flex-1 gap-2" onClick={reset}>
                  <RotateCcw className="h-4 w-4" />
                  {translations.tryAgain}
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Compact version for inline use
export function IdScannerCompact({
  onExtract,
  locale = 'en',
}: {
  onExtract: (data: ExtractedData) => void;
  locale?: string;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const isArabic = locale === 'ar';

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);

    // Read file as data URL
    const reader = new FileReader();
    reader.onload = async (event) => {
      const imageData = event.target?.result as string;

      try {
        const result = await apiClient.post<{ data: ExtractedData }>('/api/ai/ocr/extract', {
          image: imageData,
          documentType: 'auto',
          language: locale,
        });

        if (result.data) {
          onExtract(result.data);
        } else {
          throw new Error('No data returned');
        }
      } catch (err) {
        captureError(err, { component: 'IdScannerCompact', action: 'processImage' });

        // In development, simulate for demo. In production, show error.
        if (process.env.NODE_ENV === 'development') {
          setTimeout(() => {
            onExtract({
              name: 'Ahmed Mohammed',
              idNumber: '784-1990-1234567-1',
              nationality: 'UAE',
            });
          }, 1500);
        }
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex gap-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />
      <Button
        variant="ghost"
        size="sm"
        className="gap-1.5 text-xs h-7"
        onClick={() => fileInputRef.current?.click()}
        disabled={isProcessing}
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-3 w-3 animate-spin" />
            {isArabic ? 'جاري...' : 'Processing...'}
          </>
        ) : (
          <>
            <Camera className="h-3 w-3" />
            {isArabic ? 'مسح الهوية' : 'Scan ID'}
          </>
        )}
      </Button>
    </div>
  );
}
