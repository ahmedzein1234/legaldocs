'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams } from 'next/navigation';

// Translations
const translations = {
  en: {
    title: 'Smart Witness Video',
    subtitle: 'Secure video attestation for legal documents',
    steps: {
      select: 'Select Document',
      identity: 'Verify Identity',
      record: 'Record Statement',
      witnesses: 'Add Witnesses',
      complete: 'Complete',
    },
    selectDocument: {
      title: 'Select Document for Attestation',
      description: 'Choose the document you want to create a video attestation for',
      noDocuments: 'No documents available for attestation',
      selected: 'Selected',
    },
    identity: {
      title: 'Identity Verification',
      description: 'Verify your identity before recording',
      scanId: 'Scan ID Document',
      takeSelfie: 'Take Selfie',
      idTypes: {
        emiratesId: 'Emirates ID',
        passport: 'Passport',
        license: 'Driving License',
      },
      verified: 'Verified',
      pending: 'Pending',
      instructions: 'Hold your ID within the frame and keep it steady',
      selfieInstructions: 'Look directly at the camera for face verification',
    },
    record: {
      title: 'Record Your Statement',
      description: 'Read the statement aloud while being recorded',
      script: 'Statement to Read',
      startRecording: 'Start Recording',
      stopRecording: 'Stop Recording',
      retake: 'Retake',
      continue: 'Continue',
      duration: 'Duration',
      minDuration: 'Minimum 10 seconds required',
      recording: 'Recording...',
      preview: 'Preview',
      tips: [
        'Speak clearly and at a normal pace',
        'Look directly at the camera',
        'Ensure good lighting on your face',
        'Read the entire statement without pausing',
      ],
    },
    witnesses: {
      title: 'Add Witnesses',
      description: 'Invite witnesses to attest to your signature',
      addWitness: 'Add Witness',
      witnessName: 'Full Name',
      witnessEmail: 'Email Address',
      witnessPhone: 'Phone Number',
      invite: 'Send Invitation',
      optional: 'Optional',
      status: {
        pending: 'Pending',
        invited: 'Invited',
        completed: 'Completed',
      },
      skip: 'Skip Witnesses',
    },
    complete: {
      title: 'Attestation Complete',
      description: 'Your video attestation has been created successfully',
      reference: 'Reference Number',
      summary: 'Summary',
      document: 'Document',
      recordedAt: 'Recorded At',
      duration: 'Video Duration',
      witnesses: 'Witnesses',
      download: 'Download Certificate',
      share: 'Share Link',
      viewVideo: 'View Video',
      newAttestation: 'New Attestation',
    },
    actions: {
      back: 'Back',
      next: 'Next',
      cancel: 'Cancel',
    },
    features: {
      title: 'Why Video Attestation?',
      items: [
        { icon: '🔒', title: 'Tamper-Proof', description: 'Blockchain-secured video with cryptographic hash' },
        { icon: '⏱️', title: 'Timestamped', description: 'Precise date/time proof with GPS location' },
        { icon: '🪪', title: 'ID Verified', description: 'AI-powered identity verification' },
        { icon: '📜', title: 'Legal Standing', description: 'Admissible in UAE courts' },
      ],
    },
  },
  ar: {
    title: 'شاهد ذكي بالفيديو',
    subtitle: 'توثيق فيديو آمن للمستندات القانونية',
    steps: {
      select: 'اختر المستند',
      identity: 'تحقق من الهوية',
      record: 'سجل البيان',
      witnesses: 'أضف الشهود',
      complete: 'اكتمل',
    },
    selectDocument: {
      title: 'اختر المستند للتوثيق',
      description: 'اختر المستند الذي تريد إنشاء توثيق فيديو له',
      noDocuments: 'لا توجد مستندات متاحة للتوثيق',
      selected: 'محدد',
    },
    identity: {
      title: 'التحقق من الهوية',
      description: 'تحقق من هويتك قبل التسجيل',
      scanId: 'مسح وثيقة الهوية',
      takeSelfie: 'التقط صورة سيلفي',
      idTypes: {
        emiratesId: 'الهوية الإماراتية',
        passport: 'جواز السفر',
        license: 'رخصة القيادة',
      },
      verified: 'تم التحقق',
      pending: 'قيد الانتظار',
      instructions: 'ضع هويتك داخل الإطار وابقها ثابتة',
      selfieInstructions: 'انظر مباشرة إلى الكاميرا للتحقق من الوجه',
    },
    record: {
      title: 'سجل بيانك',
      description: 'اقرأ البيان بصوت عالٍ أثناء التسجيل',
      script: 'البيان للقراءة',
      startRecording: 'بدء التسجيل',
      stopRecording: 'إيقاف التسجيل',
      retake: 'إعادة التسجيل',
      continue: 'متابعة',
      duration: 'المدة',
      minDuration: 'الحد الأدنى 10 ثوان',
      recording: 'جاري التسجيل...',
      preview: 'معاينة',
      tips: [
        'تحدث بوضوح وبسرعة عادية',
        'انظر مباشرة إلى الكاميرا',
        'تأكد من الإضاءة الجيدة على وجهك',
        'اقرأ البيان كاملاً دون توقف',
      ],
    },
    witnesses: {
      title: 'أضف الشهود',
      description: 'ادعُ الشهود للإدلاء بشهادتهم على توقيعك',
      addWitness: 'إضافة شاهد',
      witnessName: 'الاسم الكامل',
      witnessEmail: 'البريد الإلكتروني',
      witnessPhone: 'رقم الهاتف',
      invite: 'إرسال الدعوة',
      optional: 'اختياري',
      status: {
        pending: 'قيد الانتظار',
        invited: 'تم الدعوة',
        completed: 'مكتمل',
      },
      skip: 'تخطي الشهود',
    },
    complete: {
      title: 'اكتمل التوثيق',
      description: 'تم إنشاء توثيق الفيديو بنجاح',
      reference: 'رقم المرجع',
      summary: 'الملخص',
      document: 'المستند',
      recordedAt: 'تم التسجيل في',
      duration: 'مدة الفيديو',
      witnesses: 'الشهود',
      download: 'تحميل الشهادة',
      share: 'مشاركة الرابط',
      viewVideo: 'عرض الفيديو',
      newAttestation: 'توثيق جديد',
    },
    actions: {
      back: 'رجوع',
      next: 'التالي',
      cancel: 'إلغاء',
    },
    features: {
      title: 'لماذا توثيق الفيديو؟',
      items: [
        { icon: '🔒', title: 'مقاوم للتلاعب', description: 'فيديو مؤمن بالبلوكتشين مع تشفير' },
        { icon: '⏱️', title: 'موقت', description: 'إثبات دقيق للتاريخ والوقت مع الموقع' },
        { icon: '🪪', title: 'هوية موثقة', description: 'تحقق من الهوية بالذكاء الاصطناعي' },
        { icon: '📜', title: 'صلاحية قانونية', description: 'مقبول في المحاكم الإماراتية' },
      ],
    },
  },
};

// Mock documents
const mockDocuments = [
  { id: '1', name: 'Employment Contract - John Smith', type: 'employment', date: '2026-01-02' },
  { id: '2', name: 'Property Sale Agreement', type: 'realestate', date: '2026-01-03' },
  { id: '3', name: 'Business Partnership MOU', type: 'corporate', date: '2026-01-04' },
];

type Step = 'select' | 'identity' | 'record' | 'witnesses' | 'complete';

export default function VideoAttestationPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const t = translations[locale as keyof typeof translations] || translations.en;
  const isRTL = locale === 'ar';

  const [currentStep, setCurrentStep] = useState<Step>('select');
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [idVerified, setIdVerified] = useState(false);
  const [selfieVerified, setSelfieVerified] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState<string | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [witnesses, setWitnesses] = useState<{ name: string; email: string; phone: string; status: string }[]>([]);
  const [newWitness, setNewWitness] = useState({ name: '', email: '', phone: '' });
  const [attestationComplete, setAttestationComplete] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const steps: Step[] = ['select', 'identity', 'record', 'witnesses', 'complete'];
  const currentStepIndex = steps.indexOf(currentStep);

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStep(steps[currentStepIndex + 1]);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1]);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        setRecordedVideo(URL.createObjectURL(blob));
      };

      mediaRecorder.start();
      setIsRecording(true);

      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setIsRecording(false);
  };

  const retakeRecording = () => {
    setRecordedVideo(null);
    setRecordingDuration(0);
  };

  const addWitness = () => {
    if (newWitness.name && newWitness.email) {
      setWitnesses([...witnesses, { ...newWitness, status: 'invited' }]);
      setNewWitness({ name: '', email: '', phone: '' });
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const attestationScript = locale === 'ar'
    ? `أنا، [اسمك]، أؤكد وأقر طواعية بأنني قرأت وفهمت وأوافق على جميع شروط وأحكام هذا المستند. أفهم أن هذا التسجيل سيكون بمثابة توثيق لموافقتي ويمكن استخدامه كدليل قانوني.`
    : `I, [Your Name], hereby confirm and voluntarily declare that I have read, understood, and agree to all terms and conditions of this document. I understand that this recording will serve as attestation of my consent and may be used as legal evidence.`;

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  if (attestationComplete) {
    return (
      <div className={`min-h-screen bg-gray-50 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="max-w-2xl mx-auto px-4 py-16">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{t.complete.title}</h1>
            <p className="text-gray-600 mb-6">{t.complete.description}</p>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-500">{t.complete.reference}</p>
              <p className="text-2xl font-mono font-bold text-purple-600">
                VA-2026-{Math.random().toString(36).substring(2, 8).toUpperCase()}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6 text-left">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">{t.complete.document}</p>
                <p className="font-medium">Employment Contract</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">{t.complete.duration}</p>
                <p className="font-medium">{formatDuration(recordingDuration)}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">{t.complete.recordedAt}</p>
                <p className="font-medium">{new Date().toLocaleString()}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">{t.complete.witnesses}</p>
                <p className="font-medium">{witnesses.length}</p>
              </div>
            </div>

            <div className="flex gap-4">
              <button className="flex-1 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                {t.complete.download}
              </button>
              <button className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                {t.complete.viewVideo}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-600 to-pink-700 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl font-bold">{t.title}</h1>
          <p className="text-rose-100">{t.subtitle}</p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      index < currentStepIndex
                        ? 'bg-green-600 text-white'
                        : index === currentStepIndex
                        ? 'bg-rose-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {index < currentStepIndex ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span className={`text-xs mt-1 hidden sm:block ${index === currentStepIndex ? 'text-rose-600 font-medium' : 'text-gray-500'}`}>
                    {t.steps[step]}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`hidden sm:block h-1 w-16 mx-2 ${index < currentStepIndex ? 'bg-green-600' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
              {/* Step 1: Select Document */}
              {currentStep === 'select' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">{t.selectDocument.title}</h2>
                  <p className="text-gray-600 mb-6">{t.selectDocument.description}</p>

                  <div className="space-y-3">
                    {mockDocuments.map((doc) => (
                      <button
                        key={doc.id}
                        onClick={() => setSelectedDocument(doc.id)}
                        className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                          selectedDocument === doc.id
                            ? 'border-rose-600 bg-rose-50'
                            : 'border-gray-200 hover:border-rose-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{doc.name}</p>
                              <p className="text-sm text-gray-500">{doc.date}</p>
                            </div>
                          </div>
                          {selectedDocument === doc.id && (
                            <span className="px-2 py-1 bg-rose-100 text-rose-700 text-xs rounded-full">
                              {t.selectDocument.selected}
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Identity Verification */}
              {currentStep === 'identity' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">{t.identity.title}</h2>
                  <p className="text-gray-600 mb-6">{t.identity.description}</p>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* ID Scan */}
                    <div className={`p-6 border-2 rounded-xl text-center ${idVerified ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                      <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${idVerified ? 'bg-green-100' : 'bg-gray-100'}`}>
                        {idVerified ? (
                          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                          </svg>
                        )}
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">{t.identity.scanId}</h3>
                      <p className="text-sm text-gray-500 mb-4">{t.identity.instructions}</p>
                      <button
                        onClick={() => setIdVerified(true)}
                        disabled={idVerified}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          idVerified
                            ? 'bg-green-100 text-green-700'
                            : 'bg-rose-600 text-white hover:bg-rose-700'
                        }`}
                      >
                        {idVerified ? t.identity.verified : t.identity.scanId}
                      </button>
                    </div>

                    {/* Selfie */}
                    <div className={`p-6 border-2 rounded-xl text-center ${selfieVerified ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                      <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${selfieVerified ? 'bg-green-100' : 'bg-gray-100'}`}>
                        {selfieVerified ? (
                          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        )}
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">{t.identity.takeSelfie}</h3>
                      <p className="text-sm text-gray-500 mb-4">{t.identity.selfieInstructions}</p>
                      <button
                        onClick={() => setSelfieVerified(true)}
                        disabled={selfieVerified}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          selfieVerified
                            ? 'bg-green-100 text-green-700'
                            : 'bg-rose-600 text-white hover:bg-rose-700'
                        }`}
                      >
                        {selfieVerified ? t.identity.verified : t.identity.takeSelfie}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Record Statement */}
              {currentStep === 'record' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">{t.record.title}</h2>
                  <p className="text-gray-600 mb-6">{t.record.description}</p>

                  {/* Script */}
                  <div className="bg-gray-50 rounded-xl p-4 mb-6">
                    <h3 className="font-medium text-gray-900 mb-2">{t.record.script}</h3>
                    <p className="text-gray-700 italic">{attestationScript}</p>
                  </div>

                  {/* Video Preview */}
                  <div className="relative aspect-video bg-black rounded-xl overflow-hidden mb-4">
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover"
                      muted={isRecording}
                      autoPlay={isRecording}
                      playsInline
                    />
                    {isRecording && (
                      <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1 bg-red-600 text-white rounded-full">
                        <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        {t.record.recording} {formatDuration(recordingDuration)}
                      </div>
                    )}
                    {recordedVideo && !isRecording && (
                      <video src={recordedVideo} className="w-full h-full object-cover" controls />
                    )}
                  </div>

                  {/* Controls */}
                  <div className="flex justify-center gap-4">
                    {!isRecording && !recordedVideo && (
                      <button
                        onClick={startRecording}
                        className="px-6 py-3 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors flex items-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <circle cx="10" cy="10" r="6" />
                        </svg>
                        {t.record.startRecording}
                      </button>
                    )}
                    {isRecording && (
                      <button
                        onClick={stopRecording}
                        disabled={recordingDuration < 10}
                        className={`px-6 py-3 rounded-lg flex items-center gap-2 transition-colors ${
                          recordingDuration < 10
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-red-600 text-white hover:bg-red-700'
                        }`}
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <rect x="4" y="4" width="12" height="12" rx="2" />
                        </svg>
                        {t.record.stopRecording}
                      </button>
                    )}
                    {recordedVideo && (
                      <button
                        onClick={retakeRecording}
                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        {t.record.retake}
                      </button>
                    )}
                  </div>
                  {recordingDuration < 10 && isRecording && (
                    <p className="text-center text-sm text-gray-500 mt-2">{t.record.minDuration}</p>
                  )}
                </div>
              )}

              {/* Step 4: Witnesses */}
              {currentStep === 'witnesses' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">{t.witnesses.title}</h2>
                  <p className="text-gray-600 mb-6">{t.witnesses.description}</p>

                  {/* Add Witness Form */}
                  <div className="bg-gray-50 rounded-xl p-4 mb-6">
                    <div className="grid md:grid-cols-3 gap-4 mb-4">
                      <input
                        type="text"
                        value={newWitness.name}
                        onChange={(e) => setNewWitness({ ...newWitness, name: e.target.value })}
                        placeholder={t.witnesses.witnessName}
                        className="px-4 py-2 border border-gray-300 rounded-lg"
                      />
                      <input
                        type="email"
                        value={newWitness.email}
                        onChange={(e) => setNewWitness({ ...newWitness, email: e.target.value })}
                        placeholder={t.witnesses.witnessEmail}
                        className="px-4 py-2 border border-gray-300 rounded-lg"
                      />
                      <input
                        type="tel"
                        value={newWitness.phone}
                        onChange={(e) => setNewWitness({ ...newWitness, phone: e.target.value })}
                        placeholder={t.witnesses.witnessPhone}
                        className="px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <button
                      onClick={addWitness}
                      className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
                    >
                      {t.witnesses.addWitness}
                    </button>
                  </div>

                  {/* Witnesses List */}
                  {witnesses.length > 0 && (
                    <div className="space-y-3 mb-6">
                      {witnesses.map((witness, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">{witness.name}</p>
                            <p className="text-sm text-gray-500">{witness.email}</p>
                          </div>
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                            {t.witnesses.status.invited}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <p className="text-center text-sm text-gray-500">
                    {t.witnesses.optional}
                  </p>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={handleBack}
                  disabled={currentStepIndex === 0}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    currentStepIndex === 0
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {t.actions.back}
                </button>

                {currentStep === 'witnesses' ? (
                  <button
                    onClick={() => setAttestationComplete(true)}
                    className="px-6 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
                  >
                    {t.complete.title}
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    disabled={
                      (currentStep === 'select' && !selectedDocument) ||
                      (currentStep === 'identity' && (!idVerified || !selfieVerified)) ||
                      (currentStep === 'record' && !recordedVideo)
                    }
                    className="px-6 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {t.actions.next}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Features */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">{t.features.title}</h3>
              <div className="space-y-4">
                {t.features.items.map((feature, index) => (
                  <div key={index} className="flex gap-3">
                    <span className="text-2xl">{feature.icon}</span>
                    <div>
                      <h4 className="font-medium text-gray-900">{feature.title}</h4>
                      <p className="text-sm text-gray-500">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tips */}
            {currentStep === 'record' && (
              <div className="bg-amber-50 rounded-xl p-6">
                <h3 className="font-semibold text-amber-900 mb-3">Recording Tips</h3>
                <ul className="space-y-2">
                  {t.record.tips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-amber-800">
                      <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
