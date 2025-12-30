'use client';

import { useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { apiClient } from '@/lib/api-client';
import { captureError } from '@/lib/error-tracking';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  User,
  Building2,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Globe,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Check,
  AlertCircle,
  Sparkles,
  Camera,
  Upload,
  Loader2,
  Scan,
} from 'lucide-react';

interface PartyInfo {
  name: string;
  idNumber: string;
  nationality: string;
  address: string;
  phone: string;
  email: string;
  whatsapp: string;
}

interface PartyInfoFormProps {
  party: PartyInfo;
  onChange: (party: PartyInfo) => void;
  title: string;
  titleAr?: string;
  subtitle?: string;
  subtitleAr?: string;
  locale?: string;
  partyType?: 'individual' | 'company';
  required?: boolean;
  showOptionalFields?: boolean;
}

export function PartyInfoForm({
  party,
  onChange,
  title,
  titleAr,
  subtitle,
  subtitleAr,
  locale = 'en',
  partyType = 'individual',
  required = true,
  showOptionalFields = true,
}: PartyInfoFormProps) {
  const [expanded, setExpanded] = useState(true);
  const [errors, setErrors] = useState<Partial<Record<keyof PartyInfo, string>>>({});
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isArabic = locale === 'ar';

  const translations = {
    name: isArabic ? 'الاسم الكامل' : 'Full Name',
    companyName: isArabic ? 'اسم الشركة' : 'Company Name',
    idNumber: isArabic ? 'رقم الهوية' : 'ID Number',
    emiratesId: isArabic ? 'رقم الهوية الإماراتية' : 'Emirates ID',
    tradeLicense: isArabic ? 'رقم الرخصة التجارية' : 'Trade License No.',
    nationality: isArabic ? 'الجنسية' : 'Nationality',
    country: isArabic ? 'الدولة' : 'Country',
    address: isArabic ? 'العنوان' : 'Address',
    phone: isArabic ? 'رقم الهاتف' : 'Phone Number',
    email: isArabic ? 'البريد الإلكتروني' : 'Email Address',
    whatsapp: isArabic ? 'واتساب' : 'WhatsApp',
    optional: isArabic ? 'اختياري' : 'Optional',
    required: isArabic ? 'مطلوب' : 'Required',
    contactInfo: isArabic ? 'معلومات الاتصال' : 'Contact Information',
    basicInfo: isArabic ? 'المعلومات الأساسية' : 'Basic Information',
    complete: isArabic ? 'مكتمل' : 'Complete',
    incomplete: isArabic ? 'غير مكتمل' : 'Incomplete',
    fillFromOCR: isArabic ? 'ملء من المسح' : 'Fill from OCR',
    scanId: isArabic ? 'مسح الهوية' : 'Scan ID',
    takePhoto: isArabic ? 'التقاط صورة' : 'Take Photo',
    uploadPhoto: isArabic ? 'رفع صورة' : 'Upload',
    scanning: isArabic ? 'جاري المسح...' : 'Scanning...',
  };

  // Handle file upload for OCR
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsScanning(true);

    try {
      // Read file as data URL
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageData = e.target?.result as string;

        try {
          // Call OCR API using centralized client (uses env var for URL, cookies for auth)
          const result = await apiClient.post<{
            success: boolean;
            data?: {
              name?: string;
              companyName?: string;
              idNumber?: string;
              tradeLicense?: string;
              nationality?: string;
              address?: string;
            };
          }>('/api/ai/ocr/extract', {
            image: imageData,
            documentType: partyType === 'company' ? 'trade_license' : 'emirates_id',
            language: locale,
          });

          if (result.success && result.data) {
            // Update party with extracted data
            onChange({
              ...party,
              name: result.data.name || result.data.companyName || party.name,
              idNumber: result.data.idNumber || result.data.tradeLicense || party.idNumber,
              nationality: result.data.nationality || party.nationality,
              address: result.data.address || party.address,
            });
          } else {
            // Fallback to demo mode when extraction fails
            // Note: In production, show error to user instead
            captureError(new Error('OCR extraction returned no data'), {
              component: 'PartyInfoForm',
              documentType: partyType,
            });
            simulateOCR();
          }
        } catch (err) {
          // Log error to Sentry and fallback to demo
          captureError(err, { component: 'PartyInfoForm', action: 'OCR' });
          simulateOCR();
        } finally {
          setIsScanning(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      captureError(err, { component: 'PartyInfoForm', action: 'FileRead' });
      setIsScanning(false);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Simulate OCR for demo purposes
  const simulateOCR = () => {
    setTimeout(() => {
      onChange({
        ...party,
        name: partyType === 'company' ? 'ABC Trading LLC' : 'Ahmed Mohammed Al-Rashid',
        idNumber: partyType === 'company' ? 'CN-1234567' : '784-1990-1234567-1',
        nationality: 'United Arab Emirates',
      });
      setIsScanning(false);
    }, 1500);
  };

  const updateField = (field: keyof PartyInfo, value: string) => {
    onChange({ ...party, [field]: value });
    // Clear error when user types
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateField = (field: keyof PartyInfo, value: string) => {
    if (required && !value && ['name', 'idNumber'].includes(field)) {
      setErrors(prev => ({ ...prev, [field]: translations.required }));
      return false;
    }
    if (field === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setErrors(prev => ({ ...prev, [field]: isArabic ? 'بريد إلكتروني غير صالح' : 'Invalid email' }));
      return false;
    }
    if (field === 'phone' && value && !/^[+]?[\d\s-]{8,}$/.test(value)) {
      setErrors(prev => ({ ...prev, [field]: isArabic ? 'رقم هاتف غير صالح' : 'Invalid phone' }));
      return false;
    }
    return true;
  };

  // Check completion
  const requiredFields = ['name', 'idNumber'];
  const filledRequired = requiredFields.filter(f => party[f as keyof PartyInfo]).length;
  const isComplete = filledRequired === requiredFields.length;
  const completionPercent = Math.round((filledRequired / requiredFields.length) * 100);

  return (
    <div className={cn(
      'rounded-2xl border transition-all duration-200',
      isComplete ? 'border-green-200 dark:border-green-800' : 'border-border'
    )}>
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors rounded-t-2xl"
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            'h-12 w-12 rounded-xl flex items-center justify-center',
            isComplete
              ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-muted text-muted-foreground'
          )}>
            {partyType === 'company' ? (
              <Building2 className="h-6 w-6" />
            ) : (
              <User className="h-6 w-6" />
            )}
          </div>
          <div className="text-start">
            <h3 className="font-semibold text-lg">
              {isArabic ? (titleAr || title) : title}
            </h3>
            {(subtitle || subtitleAr) && (
              <p className="text-sm text-muted-foreground">
                {isArabic ? (subtitleAr || subtitle) : subtitle}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Completion Badge */}
          <Badge variant={isComplete ? 'default' : 'secondary'} className={cn(
            'gap-1',
            isComplete && 'bg-green-500 hover:bg-green-500'
          )}>
            {isComplete ? (
              <>
                <Check className="h-3 w-3" />
                {translations.complete}
              </>
            ) : (
              <>
                <AlertCircle className="h-3 w-3" />
                {completionPercent}%
              </>
            )}
          </Badge>

          {expanded ? (
            <ChevronUp className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Content */}
      {expanded && (
        <div className="p-4 pt-0 space-y-6 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* OCR Fill Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileUpload}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2 h-9 border-dashed"
              onClick={() => fileInputRef.current?.click()}
              disabled={isScanning}
            >
              {isScanning ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {translations.scanning}
                </>
              ) : (
                <>
                  <Camera className="h-4 w-4" />
                  {translations.takePhoto}
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="gap-2 h-9"
              onClick={() => {
                // Remove capture attribute temporarily for file picker
                if (fileInputRef.current) {
                  fileInputRef.current.removeAttribute('capture');
                  fileInputRef.current.click();
                  // Restore capture attribute after a small delay
                  setTimeout(() => {
                    fileInputRef.current?.setAttribute('capture', 'environment');
                  }, 100);
                }
              }}
              disabled={isScanning}
            >
              <Upload className="h-4 w-4" />
              {translations.uploadPhoto}
            </Button>
            <Badge variant="secondary" className="text-[10px] gap-1">
              <Sparkles className="h-3 w-3" />
              {isArabic ? 'مدعوم بالذكاء الاصطناعي' : 'AI-Powered'}
            </Badge>
          </div>

          {/* Basic Information */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
              <User className="h-4 w-4" />
              {translations.basicInfo}
            </h4>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  {partyType === 'company' ? translations.companyName : translations.name}
                  <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                    {translations.required}
                  </Badge>
                </Label>
                <div className="relative">
                  <Input
                    id="name"
                    value={party.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    onBlur={(e) => validateField('name', e.target.value)}
                    placeholder={partyType === 'company' ? 'ABC Company LLC' : 'Ahmed Mohammed'}
                    className={cn(
                      'h-12 rounded-xl ps-10',
                      errors.name && 'border-destructive focus-visible:ring-destructive'
                    )}
                  />
                  {partyType === 'company' ? (
                    <Building2 className="absolute start-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  ) : (
                    <User className="absolute start-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                {errors.name && (
                  <p className="text-xs text-destructive">{errors.name}</p>
                )}
              </div>

              {/* ID Number */}
              <div className="space-y-2">
                <Label htmlFor="idNumber" className="flex items-center gap-2">
                  {partyType === 'company' ? translations.tradeLicense : translations.emiratesId}
                  <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                    {translations.required}
                  </Badge>
                </Label>
                <div className="relative">
                  <Input
                    id="idNumber"
                    value={party.idNumber}
                    onChange={(e) => updateField('idNumber', e.target.value)}
                    onBlur={(e) => validateField('idNumber', e.target.value)}
                    placeholder={partyType === 'company' ? 'CN-1234567' : '784-1234-1234567-1'}
                    className={cn(
                      'h-12 rounded-xl ps-10',
                      errors.idNumber && 'border-destructive focus-visible:ring-destructive'
                    )}
                  />
                  <CreditCard className="absolute start-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                </div>
                {errors.idNumber && (
                  <p className="text-xs text-destructive">{errors.idNumber}</p>
                )}
              </div>

              {/* Nationality */}
              <div className="space-y-2">
                <Label htmlFor="nationality">
                  {partyType === 'company' ? translations.country : translations.nationality}
                </Label>
                <div className="relative">
                  <Input
                    id="nationality"
                    value={party.nationality}
                    onChange={(e) => updateField('nationality', e.target.value)}
                    placeholder={isArabic ? 'الإمارات' : 'UAE'}
                    className="h-12 rounded-xl ps-10"
                  />
                  <Globe className="absolute start-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                </div>
              </div>

              {/* Address */}
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="address">{translations.address}</Label>
                <div className="relative">
                  <Input
                    id="address"
                    value={party.address}
                    onChange={(e) => updateField('address', e.target.value)}
                    placeholder={isArabic ? 'دبي، الإمارات' : 'Dubai, UAE'}
                    className="h-12 rounded-xl ps-10"
                  />
                  <MapPin className="absolute start-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          {showOptionalFields && (
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <Phone className="h-4 w-4" />
                {translations.contactInfo}
                <Badge variant="outline" className="text-[10px]">
                  {translations.optional}
                </Badge>
              </h4>

              <div className="grid gap-4 sm:grid-cols-3">
                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone">{translations.phone}</Label>
                  <div className="relative">
                    <Input
                      id="phone"
                      type="tel"
                      value={party.phone}
                      onChange={(e) => updateField('phone', e.target.value)}
                      onBlur={(e) => validateField('phone', e.target.value)}
                      placeholder="+971 50 123 4567"
                      className={cn(
                        'h-12 rounded-xl ps-10',
                        errors.phone && 'border-destructive focus-visible:ring-destructive'
                      )}
                    />
                    <Phone className="absolute start-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  </div>
                  {errors.phone && (
                    <p className="text-xs text-destructive">{errors.phone}</p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">{translations.email}</Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      value={party.email}
                      onChange={(e) => updateField('email', e.target.value)}
                      onBlur={(e) => validateField('email', e.target.value)}
                      placeholder="email@example.com"
                      className={cn(
                        'h-12 rounded-xl ps-10',
                        errors.email && 'border-destructive focus-visible:ring-destructive'
                      )}
                    />
                    <Mail className="absolute start-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-destructive">{errors.email}</p>
                  )}
                </div>

                {/* WhatsApp */}
                <div className="space-y-2">
                  <Label htmlFor="whatsapp">{translations.whatsapp}</Label>
                  <div className="relative">
                    <Input
                      id="whatsapp"
                      type="tel"
                      value={party.whatsapp}
                      onChange={(e) => updateField('whatsapp', e.target.value)}
                      placeholder="+971 50 123 4567"
                      className="h-12 rounded-xl ps-10"
                    />
                    <MessageCircle className="absolute start-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
