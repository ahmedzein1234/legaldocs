'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';

// Translations
const translations = {
  en: {
    title: 'Template Marketplace',
    subtitle: 'Premium legal templates created by verified law firms',
    search: 'Search templates...',
    filters: {
      all: 'All Categories',
      contracts: 'Contracts',
      corporate: 'Corporate',
      employment: 'Employment',
      realestate: 'Real Estate',
      ip: 'Intellectual Property',
      family: 'Family Law',
      commercial: 'Commercial',
    },
    sort: {
      popular: 'Most Popular',
      newest: 'Newest',
      priceAsc: 'Price: Low to High',
      priceDesc: 'Price: High to Low',
      rating: 'Highest Rated',
    },
    template: {
      by: 'By',
      downloads: 'downloads',
      rating: 'rating',
      preview: 'Preview',
      purchase: 'Purchase',
      addToCart: 'Add to Cart',
      free: 'Free',
      languages: 'Languages',
      jurisdiction: 'Jurisdiction',
      lastUpdated: 'Last Updated',
      includes: 'Includes',
    },
    featured: 'Featured',
    verified: 'Verified Seller',
    trending: 'Trending',
    new: 'New',
    categories: {
      title: 'Browse by Category',
    },
    sellers: {
      title: 'Top Sellers',
      viewProfile: 'View Profile',
      templates: 'templates',
    },
    cart: {
      title: 'Your Cart',
      empty: 'Your cart is empty',
      total: 'Total',
      checkout: 'Checkout',
      remove: 'Remove',
    },
    noResults: 'No templates found matching your criteria',
    loadMore: 'Load More',
  },
  ar: {
    title: 'سوق القوالب',
    subtitle: 'قوالب قانونية متميزة من مكاتب محاماة معتمدة',
    search: 'ابحث عن قوالب...',
    filters: {
      all: 'جميع الفئات',
      contracts: 'العقود',
      corporate: 'الشركات',
      employment: 'التوظيف',
      realestate: 'العقارات',
      ip: 'الملكية الفكرية',
      family: 'قانون الأسرة',
      commercial: 'التجارية',
    },
    sort: {
      popular: 'الأكثر شعبية',
      newest: 'الأحدث',
      priceAsc: 'السعر: من الأقل للأعلى',
      priceDesc: 'السعر: من الأعلى للأقل',
      rating: 'الأعلى تقييماً',
    },
    template: {
      by: 'من',
      downloads: 'تنزيلات',
      rating: 'تقييم',
      preview: 'معاينة',
      purchase: 'شراء',
      addToCart: 'أضف للسلة',
      free: 'مجاني',
      languages: 'اللغات',
      jurisdiction: 'الولاية القضائية',
      lastUpdated: 'آخر تحديث',
      includes: 'يتضمن',
    },
    featured: 'مميز',
    verified: 'بائع موثق',
    trending: 'رائج',
    new: 'جديد',
    categories: {
      title: 'تصفح حسب الفئة',
    },
    sellers: {
      title: 'أفضل البائعين',
      viewProfile: 'عرض الملف',
      templates: 'قوالب',
    },
    cart: {
      title: 'سلتك',
      empty: 'سلتك فارغة',
      total: 'المجموع',
      checkout: 'إتمام الشراء',
      remove: 'إزالة',
    },
    noResults: 'لم يتم العثور على قوالب مطابقة',
    loadMore: 'تحميل المزيد',
  },
};

// Mock data
const mockTemplates = [
  {
    id: '1',
    name: 'UAE Employment Contract',
    nameAr: 'عقد عمل إماراتي',
    category: 'employment',
    price: 299,
    rating: 4.9,
    downloads: 1250,
    seller: { name: 'Al-Rashid Legal', verified: true, avatar: 'AR' },
    languages: ['en', 'ar'],
    jurisdiction: 'UAE',
    featured: true,
    trending: true,
    description: 'Comprehensive employment contract compliant with UAE Labor Law',
    lastUpdated: '2025-12-15',
    includes: ['Main Contract', 'Addendums', 'Termination Letter'],
  },
  {
    id: '2',
    name: 'Commercial Lease Agreement',
    nameAr: 'اتفاقية إيجار تجاري',
    category: 'realestate',
    price: 449,
    rating: 4.8,
    downloads: 890,
    seller: { name: 'Dubai Legal Partners', verified: true, avatar: 'DL' },
    languages: ['en', 'ar'],
    jurisdiction: 'UAE',
    featured: true,
    description: 'Full commercial lease with all RERA requirements',
    lastUpdated: '2025-12-20',
    includes: ['Lease Agreement', 'Addendum Templates', 'Renewal Form'],
  },
  {
    id: '3',
    name: 'Shareholder Agreement',
    nameAr: 'اتفاقية المساهمين',
    category: 'corporate',
    price: 699,
    rating: 4.7,
    downloads: 567,
    seller: { name: 'Corporate Counsel UAE', verified: true, avatar: 'CC' },
    languages: ['en', 'ar'],
    jurisdiction: 'UAE',
    new: true,
    description: 'Detailed shareholder agreement for UAE companies',
    lastUpdated: '2026-01-02',
    includes: ['SHA', 'Voting Rights Schedule', 'Exit Provisions'],
  },
  {
    id: '4',
    name: 'NDA - Non-Disclosure Agreement',
    nameAr: 'اتفاقية عدم الإفصاح',
    category: 'commercial',
    price: 0,
    rating: 4.6,
    downloads: 3420,
    seller: { name: 'Legal Templates Pro', verified: false, avatar: 'LT' },
    languages: ['en', 'ar', 'ur'],
    jurisdiction: 'GCC',
    description: 'Standard NDA suitable for business discussions',
    lastUpdated: '2025-11-30',
    includes: ['One-way NDA', 'Mutual NDA'],
  },
  {
    id: '5',
    name: 'Technology Services Agreement',
    nameAr: 'اتفاقية خدمات التكنولوجيا',
    category: 'ip',
    price: 549,
    rating: 4.8,
    downloads: 432,
    seller: { name: 'Tech Legal UAE', verified: true, avatar: 'TL' },
    languages: ['en'],
    jurisdiction: 'UAE',
    trending: true,
    description: 'IT/Software services agreement with IP protections',
    lastUpdated: '2025-12-28',
    includes: ['MSA', 'SLA Template', 'IP Assignment'],
  },
  {
    id: '6',
    name: 'Will & Testament (Islamic)',
    nameAr: 'وصية شرعية',
    category: 'family',
    price: 399,
    rating: 4.9,
    downloads: 678,
    seller: { name: 'Sharia Legal Advisors', verified: true, avatar: 'SL' },
    languages: ['en', 'ar'],
    jurisdiction: 'UAE',
    featured: true,
    description: 'Sharia-compliant will for Muslims in UAE',
    lastUpdated: '2025-12-10',
    includes: ['Will Template', 'Asset Schedule', 'Executor Guidelines'],
  },
];

const mockCategories = [
  { id: 'contracts', icon: '📄', count: 45 },
  { id: 'corporate', icon: '🏢', count: 32 },
  { id: 'employment', icon: '👔', count: 28 },
  { id: 'realestate', icon: '🏠', count: 24 },
  { id: 'ip', icon: '💡', count: 18 },
  { id: 'family', icon: '👨‍👩‍👧', count: 15 },
  { id: 'commercial', icon: '🤝', count: 38 },
];

const mockSellers = [
  { name: 'Al-Rashid Legal', avatar: 'AR', templates: 24, rating: 4.9, verified: true },
  { name: 'Dubai Legal Partners', avatar: 'DL', templates: 18, rating: 4.8, verified: true },
  { name: 'Corporate Counsel UAE', avatar: 'CC', templates: 15, rating: 4.7, verified: true },
];

export default function MarketplacePage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const t = translations[locale as keyof typeof translations] || translations.en;
  const isRTL = locale === 'ar';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [cart, setCart] = useState<string[]>([]);
  const [showCart, setShowCart] = useState(false);

  const filteredTemplates = mockTemplates.filter((template) => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.nameAr.includes(searchQuery);
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (templateId: string) => {
    if (!cart.includes(templateId)) {
      setCart([...cart, templateId]);
    }
  };

  const removeFromCart = (templateId: string) => {
    setCart(cart.filter((id) => id !== templateId));
  };

  const cartItems = mockTemplates.filter((t) => cart.includes(t.id));
  const cartTotal = cartItems.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className={`min-h-screen bg-gray-50 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">{t.title}</h1>
              <p className="text-purple-100">{t.subtitle}</p>
            </div>
            <div className="flex gap-3">
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.search}
                  className="w-64 px-4 py-2 pl-10 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
                />
                <svg className="absolute left-3 top-2.5 w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              {/* Cart */}
              <button
                onClick={() => setShowCart(!showCart)}
                className="relative px-4 py-2 bg-white text-purple-700 rounded-lg hover:bg-purple-50 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {cart.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64 flex-shrink-0 space-y-6">
            {/* Categories */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h3 className="font-semibold text-gray-900 mb-3">{t.categories.title}</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    selectedCategory === 'all' ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-100'
                  }`}
                >
                  {t.filters.all}
                </button>
                {mockCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                      selectedCategory === category.id ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-100'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>{category.icon}</span>
                      <span>{t.filters[category.id as keyof typeof t.filters]}</span>
                    </span>
                    <span className="text-xs text-gray-500">{category.count}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Top Sellers */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h3 className="font-semibold text-gray-900 mb-3">{t.sellers.title}</h3>
              <div className="space-y-3">
                {mockSellers.map((seller) => (
                  <div key={seller.name} className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-semibold">
                      {seller.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <p className="font-medium text-gray-900 text-sm truncate">{seller.name}</p>
                        {seller.verified && (
                          <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">{seller.templates} {t.sellers.templates}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Sort */}
            <div className="flex justify-between items-center mb-6">
              <p className="text-sm text-gray-600">
                {filteredTemplates.length} templates
              </p>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                {Object.entries(t.sort).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            {/* Templates Grid */}
            {filteredTemplates.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                <p className="text-gray-500">{t.noResults}</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTemplates.map((template) => (
                  <div key={template.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
                    {/* Template Header */}
                    <div className="p-4 border-b border-gray-100">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex flex-wrap gap-1">
                          {template.featured && (
                            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">{t.featured}</span>
                          )}
                          {template.trending && (
                            <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full">{t.trending}</span>
                          )}
                          {template.new && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">{t.new}</span>
                          )}
                        </div>
                        <span className={`text-lg font-bold ${template.price === 0 ? 'text-green-600' : 'text-gray-900'}`}>
                          {template.price === 0 ? t.template.free : `AED ${template.price}`}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {locale === 'ar' ? template.nameAr : template.name}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2">{template.description}</p>
                    </div>

                    {/* Template Meta */}
                    <div className="p-4 bg-gray-50">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 text-xs font-semibold">
                            {template.seller.avatar}
                          </div>
                          <div>
                            <div className="flex items-center gap-1">
                              <span className="text-sm font-medium text-gray-900">{template.seller.name}</span>
                              {template.seller.verified && (
                                <svg className="w-3 h-3 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-yellow-500">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="text-sm font-medium text-gray-700">{template.rating}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                        <span>{template.downloads.toLocaleString()} {t.template.downloads}</span>
                        <span>{template.languages.join(', ').toUpperCase()}</span>
                      </div>

                      <div className="flex gap-2">
                        <button className="flex-1 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors text-sm font-medium">
                          {t.template.preview}
                        </button>
                        <button
                          onClick={() => addToCart(template.id)}
                          disabled={cart.includes(template.id)}
                          className={`flex-1 py-2 rounded-lg transition-colors text-sm font-medium ${
                            cart.includes(template.id)
                              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                              : 'bg-purple-600 text-white hover:bg-purple-700'
                          }`}
                        >
                          {cart.includes(template.id) ? 'Added' : template.price === 0 ? 'Get Free' : t.template.addToCart}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Load More */}
            <div className="text-center mt-8">
              <button className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                {t.loadMore}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowCart(false)} />
          <div className={`relative w-full max-w-md bg-white h-full shadow-xl ${isRTL ? 'rtl' : 'ltr'}`}>
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">{t.cart.title}</h2>
              <button onClick={() => setShowCart(false)} className="text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto">
              {cartItems.length === 0 ? (
                <p className="text-gray-500 text-center py-8">{t.cart.empty}</p>
              ) : (
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{locale === 'ar' ? item.nameAr : item.name}</h4>
                        <p className="text-sm text-gray-500">{item.seller.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {item.price === 0 ? t.template.free : `AED ${item.price}`}
                        </p>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-600 text-sm hover:text-red-800"
                        >
                          {t.cart.remove}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="p-6 border-t border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-semibold text-gray-900">{t.cart.total}</span>
                  <span className="text-lg font-bold text-gray-900">AED {cartTotal}</span>
                </div>
                <button className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium">
                  {t.cart.checkout}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
