'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  SignatureStatus,
  DeliveryMethod,
  SignerRole,
  getStatusColor,
  getStatusLabel,
  getRoleLabel,
} from '@/lib/digital-signature';

interface SignatureRequestSummary {
  id: string;
  title: string;
  documentName: string;
  status: SignatureStatus;
  signers: {
    name: string;
    status: SignatureStatus;
    deliveryMethod: DeliveryMethod;
  }[];
  createdAt: string;
  expiresAt?: string;
}

// Mock data for demonstration
const mockRequests: SignatureRequestSummary[] = [
  {
    id: 'sig_001',
    title: 'Employment Contract - Ahmed Hassan',
    documentName: 'employment_contract_ahmed.pdf',
    status: 'pending',
    signers: [
      { name: 'Ahmed Hassan', status: 'pending', deliveryMethod: 'email' },
      { name: 'HR Manager', status: 'pending', deliveryMethod: 'email' },
    ],
    createdAt: '2024-01-15T10:00:00Z',
    expiresAt: '2024-01-30T10:00:00Z',
  },
  {
    id: 'sig_002',
    title: 'Service Agreement - ABC Corp',
    documentName: 'service_agreement_abc.pdf',
    status: 'signed',
    signers: [
      { name: 'John Smith', status: 'signed', deliveryMethod: 'whatsapp' },
      { name: 'Legal Director', status: 'signed', deliveryMethod: 'email' },
    ],
    createdAt: '2024-01-10T14:30:00Z',
  },
];

export default function SignaturesPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const isArabic = locale === 'ar';

  const [requests] = useState<SignatureRequestSummary[]>(mockRequests);
  const [filter, setFilter] = useState<'all' | SignatureStatus>('all');

  const filteredRequests = filter === 'all'
    ? requests
    : requests.filter(r => r.status === filter);

  const translations = {
    title: isArabic ? 'التوقيعات الرقمية' : 'Digital Signatures',
    subtitle: isArabic ? 'إدارة طلبات التوقيع' : 'Manage signature requests',
    newRequest: isArabic ? 'طلب توقيع جديد' : 'New Signature Request',
    all: isArabic ? 'الكل' : 'All',
    document: isArabic ? 'المستند' : 'Document',
    signers: isArabic ? 'الموقعون' : 'Signers',
    status: isArabic ? 'الحالة' : 'Status',
    created: isArabic ? 'تاريخ الإنشاء' : 'Created',
    expires: isArabic ? 'ينتهي في' : 'Expires',
    actions: isArabic ? 'الإجراءات' : 'Actions',
    view: isArabic ? 'عرض' : 'View',
    remind: isArabic ? 'تذكير' : 'Remind',
    cancel: isArabic ? 'إلغاء' : 'Cancel',
    noRequests: isArabic ? 'لا توجد طلبات توقيع' : 'No signature requests',
    via: isArabic ? 'عبر' : 'via',
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(isArabic ? 'ar-AE' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900" dir={isArabic ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {translations.title}
            </h1>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              {translations.subtitle}
            </p>
          </div>
          <Link
            href={`/${locale}/dashboard/signatures/new`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {translations.newRequest}
          </Link>
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {(['all', 'pending', 'signed', 'declined', 'expired'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {status === 'all' ? translations.all : getStatusLabel(status, isArabic)}
            </button>
          ))}
        </div>

        {/* Requests list */}
        {filteredRequests.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-500 dark:text-gray-400">{translations.noRequests}</p>
            <Link
              href={`/${locale}/dashboard/signatures/new`}
              className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {translations.newRequest}
            </Link>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {translations.document}
                    </th>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {translations.signers}
                    </th>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {translations.status}
                    </th>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {translations.created}
                    </th>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {translations.actions}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {request.title}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {request.documentName}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {request.signers.map((signer, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm">
                              <span className={`w-2 h-2 rounded-full ${
                                signer.status === 'signed' ? 'bg-green-500' :
                                signer.status === 'declined' ? 'bg-red-500' :
                                'bg-yellow-500'
                              }`} />
                              <span className="text-gray-700 dark:text-gray-300">{signer.name}</span>
                              <span className="text-gray-400 text-xs">
                                {translations.via} {signer.deliveryMethod === 'email' ? '📧' : '📱'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}>
                          {getStatusLabel(request.status, isArabic)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(request.createdAt)}
                        {request.expiresAt && (
                          <p className="text-xs text-orange-500">
                            {translations.expires}: {formatDate(request.expiresAt)}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/${locale}/dashboard/signatures/${request.id}`}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            {translations.view}
                          </Link>
                          {request.status === 'pending' && (
                            <>
                              <button className="text-yellow-600 hover:text-yellow-800 text-sm font-medium">
                                {translations.remind}
                              </button>
                              <button className="text-red-600 hover:text-red-800 text-sm font-medium">
                                {translations.cancel}
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
