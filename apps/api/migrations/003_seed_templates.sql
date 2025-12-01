-- Template Seed Data for LegalDocs Production
-- Run with: wrangler d1 execute legaldocs-db --file=./migrations/003_seed_templates.sql
-- This script seeds all 13 system templates with complete multilingual content

-- First, delete existing system templates to avoid duplicates
DELETE FROM templates WHERE is_system = 1;

-- ============================================================================
-- EXISTING TEMPLATES (5) - Updated with full content
-- ============================================================================

-- 1. DEPOSIT RECEIPT (Real Estate)
INSERT INTO templates (
    id, org_id, created_by,
    name, name_ar, name_ur,
    description, description_ar, description_ur,
    category,
    content_en, content_ar,
    variables,
    is_public, is_system, usage_count,
    created_at, updated_at
) VALUES (
    'tpl_deposit_receipt',
    NULL,
    NULL,
    'Deposit Receipt',
    'إيصال إيداع',
    'جمع کی رسید',
    'Standard deposit receipt for property transactions',
    'إيصال إيداع قياسي للمعاملات العقارية',
    'جائیداد کے لین دین کے لیے معیاری جمع رسید',
    'real_estate',
    '# DEPOSIT RECEIPT

**Receipt Number:** {{receipt_number}}
**Date:** {{receipt_date}}

## Received From
**Name:** {{payer_name}}
**Emirates ID:** {{payer_emirates_id}}
**Contact:** {{payer_contact}}

## Payment Details
**Amount Received:** AED {{amount}}
**Payment Method:** {{payment_method}}
**Purpose:** Deposit for property located at {{property_address}}

## Property Details
**Property Type:** {{property_type}}
**Location:** {{property_address}}
**Unit Number:** {{unit_number}}

## Terms
This deposit is received as part payment towards the {{property_purpose}} of the above-mentioned property. The deposit is {{deposit_type}} and will be {{deposit_terms}}.

**Balance Due:** AED {{balance_due}}
**Due Date:** {{balance_due_date}}

---
**Received By:** {{receiver_name}}
**Signature:** _________________
**Date:** {{receipt_date}}',
    '# إيصال إيداع

**رقم الإيصال:** {{receipt_number}}
**التاريخ:** {{receipt_date}}

## استلم من
**الاسم:** {{payer_name}}
**الهوية الإماراتية:** {{payer_emirates_id}}
**الاتصال:** {{payer_contact}}

## تفاصيل الدفع
**المبلغ المستلم:** {{amount}} درهم
**طريقة الدفع:** {{payment_method}}
**الغرض:** إيداع للعقار الواقع في {{property_address}}

## تفاصيل العقار
**نوع العقار:** {{property_type}}
**الموقع:** {{property_address}}
**رقم الوحدة:** {{unit_number}}

## الشروط
يتم استلام هذا الإيداع كدفعة جزئية نحو {{property_purpose}} للعقار المذكور أعلاه. الإيداع {{deposit_type}} وسيتم {{deposit_terms}}.

**الرصيد المستحق:** {{balance_due}} درهم
**تاريخ الاستحقاق:** {{balance_due_date}}

---
**استلم بواسطة:** {{receiver_name}}
**التوقيع:** _________________
**التاريخ:** {{receipt_date}}',
    '["receipt_number","receipt_date","payer_name","payer_emirates_id","payer_contact","amount","payment_method","property_address","property_type","unit_number","property_purpose","deposit_type","deposit_terms","balance_due","balance_due_date","receiver_name"]',
    1, 1, 0,
    datetime('now'), datetime('now')
);

-- 2. RENTAL AGREEMENT (Real Estate)
INSERT INTO templates (
    id, org_id, created_by,
    name, name_ar, name_ur,
    description, description_ar, description_ur,
    category,
    content_en, content_ar,
    variables,
    is_public, is_system, usage_count,
    created_at, updated_at
) VALUES (
    'tpl_rental_agreement',
    NULL,
    NULL,
    'Rental Agreement',
    'عقد إيجار',
    'کرایہ کا معاہدہ',
    'Standard rental agreement for residential properties',
    'عقد إيجار قياسي للعقارات السكنية',
    'رہائشی جائیداد کے لیے معیاری کرایہ کا معاہدہ',
    'real_estate',
    '# RENTAL AGREEMENT

**Contract Number:** {{contract_number}}
**Date:** {{contract_date}}

## LANDLORD (First Party)
**Name:** {{landlord_name}}
**Emirates ID:** {{landlord_emirates_id}}
**Address:** {{landlord_address}}
**Contact:** {{landlord_contact}}

## TENANT (Second Party)
**Name:** {{tenant_name}}
**Emirates ID:** {{tenant_emirates_id}}
**Address:** {{tenant_address}}
**Contact:** {{tenant_contact}}

## PROPERTY DETAILS
**Property Type:** {{property_type}}
**Location:** {{property_address}}
**Unit Number:** {{unit_number}}
**Bedrooms:** {{bedrooms}}
**Furnished:** {{furnished_status}}

## RENTAL TERMS
**Rental Period:** {{rental_period}}
**Start Date:** {{start_date}}
**End Date:** {{end_date}}
**Annual Rent:** AED {{annual_rent}}
**Payment Terms:** {{payment_terms}}
**Security Deposit:** AED {{security_deposit}}

## UTILITIES
The following utilities are {{utilities_responsibility}}: {{utilities_list}}

## TERMS AND CONDITIONS
1. The Tenant shall use the property solely for residential purposes
2. The Tenant shall maintain the property in good condition
3. No structural modifications without written consent
4. The Landlord has the right to inspect the property with 24 hours notice
5. {{additional_terms}}

---
**Landlord Signature:** _________________
**Tenant Signature:** _________________
**Date:** {{contract_date}}',
    '# عقد إيجار

**رقم العقد:** {{contract_number}}
**التاريخ:** {{contract_date}}

## المؤجر (الطرف الأول)
**الاسم:** {{landlord_name}}
**الهوية الإماراتية:** {{landlord_emirates_id}}
**العنوان:** {{landlord_address}}
**الاتصال:** {{landlord_contact}}

## المستأجر (الطرف الثاني)
**الاسم:** {{tenant_name}}
**الهوية الإماراتية:** {{tenant_emirates_id}}
**العنوان:** {{tenant_address}}
**الاتصال:** {{tenant_contact}}

## تفاصيل العقار
**نوع العقار:** {{property_type}}
**الموقع:** {{property_address}}
**رقم الوحدة:** {{unit_number}}
**غرف النوم:** {{bedrooms}}
**مفروش:** {{furnished_status}}

## شروط الإيجار
**فترة الإيجار:** {{rental_period}}
**تاريخ البدء:** {{start_date}}
**تاريخ الانتهاء:** {{end_date}}
**الإيجار السنوي:** {{annual_rent}} درهم
**شروط الدفع:** {{payment_terms}}
**التأمين:** {{security_deposit}} درهم

## المرافق
المرافق التالية {{utilities_responsibility}}: {{utilities_list}}

## الأحكام والشروط
1. يستخدم المستأجر العقار للأغراض السكنية فقط
2. يحافظ المستأجر على العقار في حالة جيدة
3. لا تعديلات هيكلية بدون موافقة خطية
4. للمؤجر الحق في تفتيش العقار بإشعار 24 ساعة
5. {{additional_terms}}

---
**توقيع المؤجر:** _________________
**توقيع المستأجر:** _________________
**التاريخ:** {{contract_date}}',
    '["contract_number","contract_date","landlord_name","landlord_emirates_id","landlord_address","landlord_contact","tenant_name","tenant_emirates_id","tenant_address","tenant_contact","property_type","property_address","unit_number","bedrooms","furnished_status","rental_period","start_date","end_date","annual_rent","payment_terms","security_deposit","utilities_responsibility","utilities_list","additional_terms"]',
    1, 1, 0,
    datetime('now'), datetime('now')
);

-- 3. NON-DISCLOSURE AGREEMENT (NDA)
INSERT INTO templates (
    id, org_id, created_by,
    name, name_ar, name_ur,
    description, description_ar, description_ur,
    category,
    content_en, content_ar,
    variables,
    is_public, is_system, usage_count,
    created_at, updated_at
) VALUES (
    'tpl_nda',
    NULL,
    NULL,
    'Non-Disclosure Agreement',
    'اتفاقية عدم إفصاح',
    'عدم افشاء کا معاہدہ',
    'Standard NDA for protecting confidential business information',
    'اتفاقية عدم إفصاح قياسية لحماية المعلومات التجارية السرية',
    'خفیہ کاروباری معلومات کی حفاظت کے لیے معیاری این ڈی اے',
    'nda',
    '# NON-DISCLOSURE AGREEMENT

**Agreement Date:** {{agreement_date}}

## DISCLOSING PARTY
**Name:** {{disclosing_party_name}}
**Entity Type:** {{disclosing_party_type}}
**Address:** {{disclosing_party_address}}
**Contact:** {{disclosing_party_contact}}

## RECEIVING PARTY
**Name:** {{receiving_party_name}}
**Entity Type:** {{receiving_party_type}}
**Address:** {{receiving_party_address}}
**Contact:** {{receiving_party_contact}}

## PURPOSE
The parties wish to explore a business opportunity relating to: {{purpose_description}}

## CONFIDENTIAL INFORMATION
Confidential Information includes but is not limited to: {{confidential_info_types}}

## OBLIGATIONS
1. The Receiving Party shall maintain confidentiality of all Confidential Information
2. Information shall only be used for the stated purpose
3. Information shall not be disclosed to third parties without written consent
4. Reasonable security measures shall be implemented
5. {{additional_obligations}}

## TERM
This Agreement shall remain in effect for {{term_duration}} from the date of signing.

## RETURN OF INFORMATION
Upon termination, all Confidential Information must be returned or destroyed within {{return_period}}.

## GOVERNING LAW
This Agreement shall be governed by the laws of {{governing_jurisdiction}}.

---
**Disclosing Party Signature:** _________________
**Receiving Party Signature:** _________________
**Date:** {{agreement_date}}',
    '# اتفاقية عدم إفصاح

**تاريخ الاتفاقية:** {{agreement_date}}

## الطرف المفصح
**الاسم:** {{disclosing_party_name}}
**نوع الكيان:** {{disclosing_party_type}}
**العنوان:** {{disclosing_party_address}}
**الاتصال:** {{disclosing_party_contact}}

## الطرف المتلقي
**الاسم:** {{receiving_party_name}}
**نوع الكيان:** {{receiving_party_type}}
**العنوان:** {{receiving_party_address}}
**الاتصال:** {{receiving_party_contact}}

## الغرض
ترغب الأطراف في استكشاف فرصة عمل تتعلق بـ: {{purpose_description}}

## المعلومات السرية
تشمل المعلومات السرية على سبيل المثال لا الحصر: {{confidential_info_types}}

## الالتزامات
1. يحافظ الطرف المتلقي على سرية جميع المعلومات السرية
2. تستخدم المعلومات فقط للغرض المحدد
3. لا يتم الكشف عن المعلومات لأطراف ثالثة بدون موافقة خطية
4. يتم تطبيق تدابير أمنية معقولة
5. {{additional_obligations}}

## المدة
تظل هذه الاتفاقية سارية لمدة {{term_duration}} من تاريخ التوقيع.

## إرجاع المعلومات
عند الإنهاء، يجب إرجاع أو إتلاف جميع المعلومات السرية في غضون {{return_period}}.

## القانون الحاكم
تخضع هذه الاتفاقية لقوانين {{governing_jurisdiction}}.

---
**توقيع الطرف المفصح:** _________________
**توقيع الطرف المتلقي:** _________________
**التاريخ:** {{agreement_date}}',
    '["agreement_date","disclosing_party_name","disclosing_party_type","disclosing_party_address","disclosing_party_contact","receiving_party_name","receiving_party_type","receiving_party_address","receiving_party_contact","purpose_description","confidential_info_types","additional_obligations","term_duration","return_period","governing_jurisdiction"]',
    1, 1, 0,
    datetime('now'), datetime('now')
);

-- 4. SERVICE AGREEMENT (Services)
INSERT INTO templates (
    id, org_id, created_by,
    name, name_ar, name_ur,
    description, description_ar, description_ur,
    category,
    content_en, content_ar,
    variables,
    is_public, is_system, usage_count,
    created_at, updated_at
) VALUES (
    'tpl_service_agreement',
    NULL,
    NULL,
    'Service Agreement',
    'اتفاقية خدمات',
    'خدمات کا معاہدہ',
    'General service agreement template for service providers',
    'قالب اتفاقية خدمات عامة لمقدمي الخدمات',
    'خدمات فراہم کرنے والوں کے لیے عمومی خدمات کا معاہدہ',
    'services',
    '# SERVICE AGREEMENT

**Agreement Number:** {{agreement_number}}
**Date:** {{agreement_date}}

## SERVICE PROVIDER
**Name:** {{provider_name}}
**Trade License:** {{provider_license}}
**Address:** {{provider_address}}
**Contact:** {{provider_contact}}

## CLIENT
**Name:** {{client_name}}
**Company:** {{client_company}}
**Address:** {{client_address}}
**Contact:** {{client_contact}}

## SERVICES TO BE PROVIDED
{{services_description}}

## DELIVERABLES
{{deliverables_list}}

## PAYMENT TERMS
**Total Contract Value:** AED {{total_value}}
**Payment Schedule:** {{payment_schedule}}
**Payment Method:** {{payment_method}}
**Late Payment:** {{late_payment_terms}}

## TIMELINE
**Start Date:** {{start_date}}
**Completion Date:** {{completion_date}}
**Milestones:** {{milestone_dates}}

## RESPONSIBILITIES

### Provider Responsibilities:
{{provider_responsibilities}}

### Client Responsibilities:
{{client_responsibilities}}

## INTELLECTUAL PROPERTY
{{ip_terms}}

## CONFIDENTIALITY
Both parties agree to maintain confidentiality of all proprietary information.

## TERMINATION
Either party may terminate this agreement with {{termination_notice}} written notice.

## GOVERNING LAW
This Agreement is governed by the laws of {{governing_jurisdiction}}.

---
**Service Provider Signature:** _________________
**Client Signature:** _________________
**Date:** {{agreement_date}}',
    '# اتفاقية خدمات

**رقم الاتفاقية:** {{agreement_number}}
**التاريخ:** {{agreement_date}}

## مقدم الخدمة
**الاسم:** {{provider_name}}
**الرخصة التجارية:** {{provider_license}}
**العنوان:** {{provider_address}}
**الاتصال:** {{provider_contact}}

## العميل
**الاسم:** {{client_name}}
**الشركة:** {{client_company}}
**العنوان:** {{client_address}}
**الاتصال:** {{client_contact}}

## الخدمات المقدمة
{{services_description}}

## المخرجات
{{deliverables_list}}

## شروط الدفع
**القيمة الإجمالية للعقد:** {{total_value}} درهم
**جدول الدفع:** {{payment_schedule}}
**طريقة الدفع:** {{payment_method}}
**الدفع المتأخر:** {{late_payment_terms}}

## الجدول الزمني
**تاريخ البدء:** {{start_date}}
**تاريخ الإنجاز:** {{completion_date}}
**المعالم:** {{milestone_dates}}

## المسؤوليات

### مسؤوليات المزود:
{{provider_responsibilities}}

### مسؤوليات العميل:
{{client_responsibilities}}

## الملكية الفكرية
{{ip_terms}}

## السرية
يوافق الطرفان على الحفاظ على سرية جميع المعلومات الخاصة.

## الإنهاء
يمكن لأي طرف إنهاء هذه الاتفاقية بإشعار خطي {{termination_notice}}.

## القانون الحاكم
تخضع هذه الاتفاقية لقوانين {{governing_jurisdiction}}.

---
**توقيع مقدم الخدمة:** _________________
**توقيع العميل:** _________________
**التاريخ:** {{agreement_date}}',
    '["agreement_number","agreement_date","provider_name","provider_license","provider_address","provider_contact","client_name","client_company","client_address","client_contact","services_description","deliverables_list","total_value","payment_schedule","payment_method","late_payment_terms","start_date","completion_date","milestone_dates","provider_responsibilities","client_responsibilities","ip_terms","termination_notice","governing_jurisdiction"]',
    1, 1, 0,
    datetime('now'), datetime('now')
);

-- 5. EMPLOYMENT OFFER (Employment)
INSERT INTO templates (
    id, org_id, created_by,
    name, name_ar, name_ur,
    description, description_ar, description_ur,
    category,
    content_en, content_ar,
    variables,
    is_public, is_system, usage_count,
    created_at, updated_at
) VALUES (
    'tpl_employment_offer',
    NULL,
    NULL,
    'Employment Offer Letter',
    'عرض توظيف',
    'ملازمت کی پیشکش',
    'Standard employment offer letter template',
    'قالب عرض توظيف قياسي',
    'معیاری ملازمت کی پیشکش کا خط',
    'employment',
    '# EMPLOYMENT OFFER LETTER

**Date:** {{offer_date}}

**Dear {{candidate_name}},**

We are pleased to offer you the position of **{{job_title}}** at {{company_name}}.

## POSITION DETAILS
**Department:** {{department}}
**Reports To:** {{reports_to}}
**Location:** {{work_location}}
**Employment Type:** {{employment_type}}

## COMPENSATION
**Base Salary:** AED {{annual_salary}} per annum
**Payment Frequency:** {{payment_frequency}}
**Probation Period:** {{probation_period}}

## BENEFITS
{{benefits_list}}

## START DATE
Your anticipated start date is {{start_date}}.

## WORKING HOURS
**Standard Hours:** {{working_hours}}
**Work Week:** {{work_week}}

## LEAVE ENTITLEMENT
**Annual Leave:** {{annual_leave_days}} days
**Sick Leave:** {{sick_leave_days}} days
**Other Leave:** {{other_leave}}

## CONDITIONS
This offer is contingent upon:
{{employment_conditions}}

## TERMINATION
Either party may terminate employment with {{notice_period}} notice.

## GOVERNING LAW
This employment is governed by {{labor_law}}.

To accept this offer, please sign and return this letter by {{acceptance_deadline}}.

We look forward to welcoming you to our team!

**Sincerely,**
{{hr_name}}
{{hr_title}}
{{company_name}}

---
**I accept this offer:**
**Signature:** _________________
**Name:** {{candidate_name}}
**Date:** _________________',
    '# عرض توظيف

**التاريخ:** {{offer_date}}

**عزيزي/عزيزتي {{candidate_name}}،**

يسعدنا أن نعرض عليك منصب **{{job_title}}** في {{company_name}}.

## تفاصيل الوظيفة
**القسم:** {{department}}
**التقارير إلى:** {{reports_to}}
**الموقع:** {{work_location}}
**نوع التوظيف:** {{employment_type}}

## التعويض
**الراتب الأساسي:** {{annual_salary}} درهم سنويًا
**تكرار الدفع:** {{payment_frequency}}
**فترة الاختبار:** {{probation_period}}

## المزايا
{{benefits_list}}

## تاريخ البدء
تاريخ البدء المتوقع هو {{start_date}}.

## ساعات العمل
**الساعات القياسية:** {{working_hours}}
**أسبوع العمل:** {{work_week}}

## استحقاق الإجازة
**الإجازة السنوية:** {{annual_leave_days}} يوم
**الإجازة المرضية:** {{sick_leave_days}} يوم
**إجازات أخرى:** {{other_leave}}

## الشروط
هذا العرض مشروط بـ:
{{employment_conditions}}

## الإنهاء
يمكن لأي طرف إنهاء التوظيف بإشعار {{notice_period}}.

## القانون الحاكم
يخضع هذا التوظيف لـ {{labor_law}}.

لقبول هذا العرض، يرجى التوقيع وإرجاع هذه الرسالة بحلول {{acceptance_deadline}}.

نتطلع للترحيب بك في فريقنا!

**مع خالص التحيات،**
{{hr_name}}
{{hr_title}}
{{company_name}}

---
**أقبل هذا العرض:**
**التوقيع:** _________________
**الاسم:** {{candidate_name}}
**التاريخ:** _________________',
    '["offer_date","candidate_name","job_title","company_name","department","reports_to","work_location","employment_type","annual_salary","payment_frequency","probation_period","benefits_list","start_date","working_hours","work_week","annual_leave_days","sick_leave_days","other_leave","employment_conditions","notice_period","labor_law","acceptance_deadline","hr_name","hr_title"]',
    1, 1, 0,
    datetime('now'), datetime('now')
);

-- ============================================================================
-- NEW TEMPLATES (8)
-- ============================================================================

-- 6. POWER OF ATTORNEY (Family/General)
INSERT INTO templates (
    id, org_id, created_by,
    name, name_ar, name_ur,
    description, description_ar, description_ur,
    category,
    content_en, content_ar,
    variables,
    is_public, is_system, usage_count,
    created_at, updated_at
) VALUES (
    'tpl_power_of_attorney',
    NULL,
    NULL,
    'Power of Attorney',
    'توكيل رسمي',
    'پاور آف اٹارنی',
    'General power of attorney document',
    'وثيقة توكيل رسمي عام',
    'عمومی پاور آف اٹارنی دستاویز',
    'family',
    '# POWER OF ATTORNEY

**Document Number:** {{document_number}}
**Date:** {{document_date}}

## PRINCIPAL (Grantor)
**Name:** {{principal_name}}
**Emirates ID:** {{principal_emirates_id}}
**Passport:** {{principal_passport}}
**Address:** {{principal_address}}
**Contact:** {{principal_contact}}

## ATTORNEY (Agent)
**Name:** {{attorney_name}}
**Emirates ID:** {{attorney_emirates_id}}
**Passport:** {{attorney_passport}}
**Address:** {{attorney_address}}
**Contact:** {{attorney_contact}}

## GRANT OF AUTHORITY
I, {{principal_name}}, hereby appoint {{attorney_name}} as my attorney-in-fact to act on my behalf.

## POWERS GRANTED
The Attorney is authorized to:
{{powers_list}}

## SCOPE
**Type:** {{poa_type}}
**Effective Date:** {{effective_date}}
**Expiration:** {{expiration_date}}

## LIMITATIONS
The following limitations apply:
{{limitations}}

## AFFIRMATION
I declare that I am of sound mind and grant this power voluntarily.

## GOVERNING LAW
This Power of Attorney is executed under the laws of {{governing_jurisdiction}}.

---
**Principal Signature:** _________________
**Attorney Signature:** _________________

**Witness 1:**
Name: {{witness1_name}}
Signature: _________________

**Witness 2:**
Name: {{witness2_name}}
Signature: _________________

**Notary Seal:** _________________',
    '# توكيل رسمي

**رقم الوثيقة:** {{document_number}}
**التاريخ:** {{document_date}}

## الموكل (المانح)
**الاسم:** {{principal_name}}
**الهوية الإماراتية:** {{principal_emirates_id}}
**جواز السفر:** {{principal_passport}}
**العنوان:** {{principal_address}}
**الاتصال:** {{principal_contact}}

## الوكيل
**الاسم:** {{attorney_name}}
**الهوية الإماراتية:** {{attorney_emirates_id}}
**جواز السفر:** {{attorney_passport}}
**العنوان:** {{attorney_address}}
**الاتصال:** {{attorney_contact}}

## منح السلطة
أنا، {{principal_name}}، أعين بموجب هذا {{attorney_name}} وكيلاً عني للتصرف نيابة عني.

## الصلاحيات الممنوحة
الوكيل مخول بـ:
{{powers_list}}

## النطاق
**النوع:** {{poa_type}}
**تاريخ السريان:** {{effective_date}}
**تاريخ الانتهاء:** {{expiration_date}}

## القيود
تنطبق القيود التالية:
{{limitations}}

## التأكيد
أعلن أنني في كامل قواي العقلية وأمنح هذه السلطة طواعية.

## القانون الحاكم
ينفذ هذا التوكيل بموجب قوانين {{governing_jurisdiction}}.

---
**توقيع الموكل:** _________________
**توقيع الوكيل:** _________________

**الشاهد 1:**
الاسم: {{witness1_name}}
التوقيع: _________________

**الشاهد 2:**
الاسم: {{witness2_name}}
التوقيع: _________________

**ختم الكاتب العدل:** _________________',
    '["document_number","document_date","principal_name","principal_emirates_id","principal_passport","principal_address","principal_contact","attorney_name","attorney_emirates_id","attorney_passport","attorney_address","attorney_contact","powers_list","poa_type","effective_date","expiration_date","limitations","governing_jurisdiction","witness1_name","witness2_name"]',
    1, 1, 0,
    datetime('now'), datetime('now')
);

-- 7. SALES CONTRACT (General)
INSERT INTO templates (
    id, org_id, created_by,
    name, name_ar, name_ur,
    description, description_ar, description_ur,
    category,
    content_en, content_ar,
    variables,
    is_public, is_system, usage_count,
    created_at, updated_at
) VALUES (
    'tpl_sales_contract',
    NULL,
    NULL,
    'Sales Contract',
    'عقد بيع',
    'فروخت کا معاہدہ',
    'General sales contract for goods and products',
    'عقد بيع عام للسلع والمنتجات',
    'سامان اور مصنوعات کے لیے عمومی فروخت کا معاہدہ',
    'general',
    '# SALES CONTRACT

**Contract Number:** {{contract_number}}
**Date:** {{contract_date}}

## SELLER
**Name:** {{seller_name}}
**Company:** {{seller_company}}
**Trade License:** {{seller_license}}
**Address:** {{seller_address}}
**Contact:** {{seller_contact}}

## BUYER
**Name:** {{buyer_name}}
**Company:** {{buyer_company}}
**Address:** {{buyer_address}}
**Contact:** {{buyer_contact}}

## GOODS/PRODUCTS
{{product_description}}

**Quantity:** {{quantity}}
**Unit Price:** AED {{unit_price}}
**Total Price:** AED {{total_price}}

## DELIVERY TERMS
**Delivery Date:** {{delivery_date}}
**Delivery Location:** {{delivery_location}}
**Shipping Method:** {{shipping_method}}
**Delivery Terms:** {{delivery_terms}}

## PAYMENT TERMS
**Payment Method:** {{payment_method}}
**Payment Schedule:** {{payment_schedule}}
**Advance Payment:** AED {{advance_payment}}
**Balance:** AED {{balance_payment}}

## QUALITY STANDARDS
{{quality_standards}}

## WARRANTY
**Warranty Period:** {{warranty_period}}
**Warranty Terms:** {{warranty_terms}}

## INSPECTION
Buyer has {{inspection_period}} to inspect goods upon delivery.

## RISK AND TITLE
Risk and title pass to Buyer upon {{risk_transfer_point}}.

## FORCE MAJEURE
{{force_majeure_clause}}

## DISPUTE RESOLUTION
Disputes shall be resolved through {{dispute_resolution}}.

## GOVERNING LAW
This contract is governed by {{governing_jurisdiction}}.

---
**Seller Signature:** _________________
**Buyer Signature:** _________________
**Date:** {{contract_date}}',
    '# عقد بيع

**رقم العقد:** {{contract_number}}
**التاريخ:** {{contract_date}}

## البائع
**الاسم:** {{seller_name}}
**الشركة:** {{seller_company}}
**الرخصة التجارية:** {{seller_license}}
**العنوان:** {{seller_address}}
**الاتصال:** {{seller_contact}}

## المشتري
**الاسم:** {{buyer_name}}
**الشركة:** {{buyer_company}}
**العنوان:** {{buyer_address}}
**الاتصال:** {{buyer_contact}}

## السلع/المنتجات
{{product_description}}

**الكمية:** {{quantity}}
**سعر الوحدة:** {{unit_price}} درهم
**السعر الإجمالي:** {{total_price}} درهم

## شروط التسليم
**تاريخ التسليم:** {{delivery_date}}
**موقع التسليم:** {{delivery_location}}
**طريقة الشحن:** {{shipping_method}}
**شروط التسليم:** {{delivery_terms}}

## شروط الدفع
**طريقة الدفع:** {{payment_method}}
**جدول الدفع:** {{payment_schedule}}
**الدفعة المقدمة:** {{advance_payment}} درهم
**الرصيد:** {{balance_payment}} درهم

## معايير الجودة
{{quality_standards}}

## الضمان
**فترة الضمان:** {{warranty_period}}
**شروط الضمان:** {{warranty_terms}}

## الفحص
للمشتري {{inspection_period}} لفحص البضائع عند التسليم.

## المخاطر والملكية
تنتقل المخاطر والملكية للمشتري عند {{risk_transfer_point}}.

## القوة القاهرة
{{force_majeure_clause}}

## حل النزاعات
تحل النزاعات من خلال {{dispute_resolution}}.

## القانون الحاكم
يخضع هذا العقد لـ {{governing_jurisdiction}}.

---
**توقيع البائع:** _________________
**توقيع المشتري:** _________________
**التاريخ:** {{contract_date}}',
    '["contract_number","contract_date","seller_name","seller_company","seller_license","seller_address","seller_contact","buyer_name","buyer_company","buyer_address","buyer_contact","product_description","quantity","unit_price","total_price","delivery_date","delivery_location","shipping_method","delivery_terms","payment_method","payment_schedule","advance_payment","balance_payment","quality_standards","warranty_period","warranty_terms","inspection_period","risk_transfer_point","force_majeure_clause","dispute_resolution","governing_jurisdiction"]',
    1, 1, 0,
    datetime('now'), datetime('now')
);

-- 8. MEMORANDUM OF UNDERSTANDING (Corporate)
INSERT INTO templates (
    id, org_id, created_by,
    name, name_ar, name_ur,
    description, description_ar, description_ur,
    category,
    content_en, content_ar,
    variables,
    is_public, is_system, usage_count,
    created_at, updated_at
) VALUES (
    'tpl_mou',
    NULL,
    NULL,
    'Memorandum of Understanding',
    'مذكرة تفاهم',
    'مفاہمت کی یادداشت',
    'MOU for business cooperation and partnerships',
    'مذكرة تفاهم للتعاون التجاري والشراكات',
    'کاروباری تعاون اور شراکت داری کے لیے ایم او یو',
    'corporate',
    '# MEMORANDUM OF UNDERSTANDING

**Date:** {{mou_date}}

## PARTIES

### FIRST PARTY
**Name:** {{party1_name}}
**Entity:** {{party1_entity}}
**Address:** {{party1_address}}
**Representative:** {{party1_representative}}

### SECOND PARTY
**Name:** {{party2_name}}
**Entity:** {{party2_entity}}
**Address:** {{party2_address}}
**Representative:** {{party2_representative}}

## PURPOSE
The parties wish to establish a framework for cooperation in: {{cooperation_purpose}}

## OBJECTIVES
{{objectives_list}}

## SCOPE OF COOPERATION
{{cooperation_scope}}

## RESPONSIBILITIES

### First Party Responsibilities:
{{party1_responsibilities}}

### Second Party Responsibilities:
{{party2_responsibilities}}

## FINANCIAL ARRANGEMENTS
{{financial_terms}}

## INTELLECTUAL PROPERTY
{{ip_arrangements}}

## CONFIDENTIALITY
All parties agree to maintain confidentiality regarding {{confidential_matters}}.

## TERM
This MOU is effective from {{effective_date}} and shall remain valid for {{term_duration}}.

## TERMINATION
Either party may terminate with {{termination_notice}} written notice.

## NON-BINDING NATURE
This MOU represents the intentions of the parties but is {{binding_status}}.

## AMENDMENTS
Any amendments must be made in writing and signed by both parties.

## GOVERNING LAW
This MOU is governed by {{governing_jurisdiction}}.

---
**First Party:**
Signature: _________________
Name: {{party1_representative}}
Title: {{party1_title}}

**Second Party:**
Signature: _________________
Name: {{party2_representative}}
Title: {{party2_title}}

**Date:** {{mou_date}}',
    '# مذكرة تفاهم

**التاريخ:** {{mou_date}}

## الأطراف

### الطرف الأول
**الاسم:** {{party1_name}}
**الكيان:** {{party1_entity}}
**العنوان:** {{party1_address}}
**الممثل:** {{party1_representative}}

### الطرف الثاني
**الاسم:** {{party2_name}}
**الكيان:** {{party2_entity}}
**العنوان:** {{party2_address}}
**الممثل:** {{party2_representative}}

## الغرض
يرغب الطرفان في إنشاء إطار للتعاون في: {{cooperation_purpose}}

## الأهداف
{{objectives_list}}

## نطاق التعاون
{{cooperation_scope}}

## المسؤوليات

### مسؤوليات الطرف الأول:
{{party1_responsibilities}}

### مسؤوليات الطرف الثاني:
{{party2_responsibilities}}

## الترتيبات المالية
{{financial_terms}}

## الملكية الفكرية
{{ip_arrangements}}

## السرية
يوافق جميع الأطراف على الحفاظ على السرية فيما يتعلق بـ {{confidential_matters}}.

## المدة
هذه المذكرة سارية من {{effective_date}} وتظل صالحة لمدة {{term_duration}}.

## الإنهاء
يمكن لأي طرف الإنهاء بإشعار خطي {{termination_notice}}.

## الطبيعة غير الملزمة
تمثل هذه المذكرة نوايا الأطراف ولكنها {{binding_status}}.

## التعديلات
يجب إجراء أي تعديلات كتابيًا وتوقيعها من قبل الطرفين.

## القانون الحاكم
تخضع هذه المذكرة لـ {{governing_jurisdiction}}.

---
**الطرف الأول:**
التوقيع: _________________
الاسم: {{party1_representative}}
المسمى الوظيفي: {{party1_title}}

**الطرف الثاني:**
التوقيع: _________________
الاسم: {{party2_representative}}
المسمى الوظيفي: {{party2_title}}

**التاريخ:** {{mou_date}}',
    '["mou_date","party1_name","party1_entity","party1_address","party1_representative","party2_name","party2_entity","party2_address","party2_representative","cooperation_purpose","objectives_list","cooperation_scope","party1_responsibilities","party2_responsibilities","financial_terms","ip_arrangements","confidential_matters","effective_date","term_duration","termination_notice","binding_status","governing_jurisdiction","party1_title","party2_title"]',
    1, 1, 0,
    datetime('now'), datetime('now')
);

-- 9. PURCHASE AGREEMENT (General)
INSERT INTO templates (
    id, org_id, created_by,
    name, name_ar, name_ur,
    description, description_ar, description_ur,
    category,
    content_en, content_ar,
    variables,
    is_public, is_system, usage_count,
    created_at, updated_at
) VALUES (
    'tpl_purchase_agreement',
    NULL,
    NULL,
    'Purchase Agreement',
    'اتفاقية شراء',
    'خریداری کا معاہدہ',
    'Comprehensive purchase agreement for assets and property',
    'اتفاقية شراء شاملة للأصول والممتلكات',
    'اثاثہ اور جائیداد کے لیے جامع خریداری کا معاہدہ',
    'general',
    '# PURCHASE AGREEMENT

**Agreement Number:** {{agreement_number}}
**Date:** {{agreement_date}}

## SELLER
**Name:** {{seller_name}}
**ID/License:** {{seller_id}}
**Address:** {{seller_address}}
**Contact:** {{seller_contact}}

## PURCHASER
**Name:** {{purchaser_name}}
**ID/License:** {{purchaser_id}}
**Address:** {{purchaser_address}}
**Contact:** {{purchaser_contact}}

## ASSET/PROPERTY DESCRIPTION
{{asset_description}}

**Location:** {{asset_location}}
**Condition:** {{asset_condition}}

## PURCHASE PRICE
**Total Purchase Price:** AED {{purchase_price}}
**Deposit:** AED {{deposit_amount}}
**Balance:** AED {{balance_amount}}

## PAYMENT SCHEDULE
{{payment_schedule}}

## CLOSING DATE
The transaction shall close on {{closing_date}}.

## REPRESENTATIONS AND WARRANTIES

### Seller Warrants:
{{seller_warranties}}

### Purchaser Warrants:
{{purchaser_warranties}}

## CONDITIONS PRECEDENT
This agreement is subject to:
{{conditions_precedent}}

## TRANSFER OF OWNERSHIP
Ownership transfers upon {{transfer_conditions}}.

## TAXES AND FEES
{{tax_responsibility}}

## DEFAULT
In event of default, {{default_terms}}.

## INDEMNIFICATION
{{indemnification_terms}}

## GOVERNING LAW
This agreement is governed by {{governing_jurisdiction}}.

---
**Seller Signature:** _________________
**Purchaser Signature:** _________________
**Date:** {{agreement_date}}',
    '# اتفاقية شراء

**رقم الاتفاقية:** {{agreement_number}}
**التاريخ:** {{agreement_date}}

## البائع
**الاسم:** {{seller_name}}
**الهوية/الترخيص:** {{seller_id}}
**العنوان:** {{seller_address}}
**الاتصال:** {{seller_contact}}

## المشتري
**الاسم:** {{purchaser_name}}
**الهوية/الترخيص:** {{purchaser_id}}
**العنوان:** {{purchaser_address}}
**الاتصال:** {{purchaser_contact}}

## وصف الأصل/الممتلكات
{{asset_description}}

**الموقع:** {{asset_location}}
**الحالة:** {{asset_condition}}

## سعر الشراء
**سعر الشراء الإجمالي:** {{purchase_price}} درهم
**العربون:** {{deposit_amount}} درهم
**الرصيد:** {{balance_amount}} درهم

## جدول الدفع
{{payment_schedule}}

## تاريخ الإغلاق
تتم الصفقة في {{closing_date}}.

## الإقرارات والضمانات

### يضمن البائع:
{{seller_warranties}}

### يضمن المشتري:
{{purchaser_warranties}}

## الشروط السابقة
هذه الاتفاقية مشروطة بـ:
{{conditions_precedent}}

## نقل الملكية
تنتقل الملكية عند {{transfer_conditions}}.

## الضرائب والرسوم
{{tax_responsibility}}

## التخلف عن السداد
في حالة التخلف عن السداد، {{default_terms}}.

## التعويض
{{indemnification_terms}}

## القانون الحاكم
تخضع هذه الاتفاقية لـ {{governing_jurisdiction}}.

---
**توقيع البائع:** _________________
**توقيع المشتري:** _________________
**التاريخ:** {{agreement_date}}',
    '["agreement_number","agreement_date","seller_name","seller_id","seller_address","seller_contact","purchaser_name","purchaser_id","purchaser_address","purchaser_contact","asset_description","asset_location","asset_condition","purchase_price","deposit_amount","balance_amount","payment_schedule","closing_date","seller_warranties","purchaser_warranties","conditions_precedent","transfer_conditions","tax_responsibility","default_terms","indemnification_terms","governing_jurisdiction"]',
    1, 1, 0,
    datetime('now'), datetime('now')
);

-- 10. PARTNERSHIP AGREEMENT (Corporate)
INSERT INTO templates (
    id, org_id, created_by,
    name, name_ar, name_ur,
    description, description_ar, description_ur,
    category,
    content_en, content_ar,
    variables,
    is_public, is_system, usage_count,
    created_at, updated_at
) VALUES (
    'tpl_partnership_agreement',
    NULL,
    NULL,
    'Partnership Agreement',
    'اتفاقية شراكة',
    'شراکت داری کا معاہدہ',
    'Business partnership agreement template',
    'قالب اتفاقية شراكة تجارية',
    'کاروباری شراکت داری کا معاہدہ ٹیمپلیٹ',
    'corporate',
    '# PARTNERSHIP AGREEMENT

**Date:** {{agreement_date}}

## PARTNERS

### Partner 1
**Name:** {{partner1_name}}
**ID:** {{partner1_id}}
**Address:** {{partner1_address}}
**Investment:** AED {{partner1_investment}}
**Ownership:** {{partner1_percentage}}%

### Partner 2
**Name:** {{partner2_name}}
**ID:** {{partner2_id}}
**Address:** {{partner2_address}}
**Investment:** AED {{partner2_investment}}
**Ownership:** {{partner2_percentage}}%

{{additional_partners}}

## BUSINESS DETAILS
**Business Name:** {{business_name}}
**Business Activity:** {{business_activity}}
**Business Address:** {{business_address}}

## PURPOSE
The partnership is formed for: {{partnership_purpose}}

## CAPITAL CONTRIBUTIONS
**Total Capital:** AED {{total_capital}}
{{capital_breakdown}}

## PROFIT AND LOSS DISTRIBUTION
Profits and losses shall be distributed as follows:
{{profit_distribution}}

## MANAGEMENT AND DECISION MAKING
{{management_structure}}

## DUTIES AND RESPONSIBILITIES
{{partner_duties}}

## BANKING AND FINANCES
{{banking_arrangements}}

## MEETINGS
{{meeting_requirements}}

## ADMISSION OF NEW PARTNERS
{{new_partner_terms}}

## WITHDRAWAL OF PARTNERS
{{withdrawal_terms}}

## DISSOLUTION
The partnership may be dissolved:
{{dissolution_terms}}

## DISPUTE RESOLUTION
{{dispute_resolution}}

## NON-COMPETE
{{non_compete_clause}}

## GOVERNING LAW
This agreement is governed by {{governing_jurisdiction}}.

---
**Partner 1 Signature:** _________________
**Partner 2 Signature:** _________________
**Date:** {{agreement_date}}',
    '# اتفاقية شراكة

**التاريخ:** {{agreement_date}}

## الشركاء

### الشريك 1
**الاسم:** {{partner1_name}}
**الهوية:** {{partner1_id}}
**العنوان:** {{partner1_address}}
**الاستثمار:** {{partner1_investment}} درهم
**الملكية:** {{partner1_percentage}}%

### الشريك 2
**الاسم:** {{partner2_name}}
**الهوية:** {{partner2_id}}
**العنوان:** {{partner2_address}}
**الاستثمار:** {{partner2_investment}} درهم
**الملكية:** {{partner2_percentage}}%

{{additional_partners}}

## تفاصيل العمل
**اسم العمل:** {{business_name}}
**نشاط العمل:** {{business_activity}}
**عنوان العمل:** {{business_address}}

## الغرض
تم تشكيل الشراكة لـ: {{partnership_purpose}}

## المساهمات الرأسمالية
**رأس المال الإجمالي:** {{total_capital}} درهم
{{capital_breakdown}}

## توزيع الأرباح والخسائر
توزع الأرباح والخسائر على النحو التالي:
{{profit_distribution}}

## الإدارة وصنع القرار
{{management_structure}}

## الواجبات والمسؤوليات
{{partner_duties}}

## الخدمات المصرفية والمالية
{{banking_arrangements}}

## الاجتماعات
{{meeting_requirements}}

## قبول شركاء جدد
{{new_partner_terms}}

## انسحاب الشركاء
{{withdrawal_terms}}

## الحل
يمكن حل الشراكة:
{{dissolution_terms}}

## حل النزاعات
{{dispute_resolution}}

## عدم المنافسة
{{non_compete_clause}}

## القانون الحاكم
تخضع هذه الاتفاقية لـ {{governing_jurisdiction}}.

---
**توقيع الشريك 1:** _________________
**توقيع الشريك 2:** _________________
**التاريخ:** {{agreement_date}}',
    '["agreement_date","partner1_name","partner1_id","partner1_address","partner1_investment","partner1_percentage","partner2_name","partner2_id","partner2_address","partner2_investment","partner2_percentage","additional_partners","business_name","business_activity","business_address","partnership_purpose","total_capital","capital_breakdown","profit_distribution","management_structure","partner_duties","banking_arrangements","meeting_requirements","new_partner_terms","withdrawal_terms","dissolution_terms","dispute_resolution","non_compete_clause","governing_jurisdiction"]',
    1, 1, 0,
    datetime('now'), datetime('now')
);

-- 11. CONSULTANCY AGREEMENT (Services)
INSERT INTO templates (
    id, org_id, created_by,
    name, name_ar, name_ur,
    description, description_ar, description_ur,
    category,
    content_en, content_ar,
    variables,
    is_public, is_system, usage_count,
    created_at, updated_at
) VALUES (
    'tpl_consultancy_agreement',
    NULL,
    NULL,
    'Consultancy Agreement',
    'اتفاقية استشارات',
    'مشاورتی معاہدہ',
    'Professional consultancy services agreement',
    'اتفاقية خدمات استشارية مهنية',
    'پیشہ ورانہ مشاورتی خدمات کا معاہدہ',
    'services',
    '# CONSULTANCY AGREEMENT

**Agreement Number:** {{agreement_number}}
**Date:** {{agreement_date}}

## CONSULTANT
**Name:** {{consultant_name}}
**Company:** {{consultant_company}}
**License:** {{consultant_license}}
**Address:** {{consultant_address}}
**Contact:** {{consultant_contact}}

## CLIENT
**Name:** {{client_name}}
**Company:** {{client_company}}
**Address:** {{client_address}}
**Contact:** {{client_contact}}

## SCOPE OF SERVICES
The Consultant agrees to provide the following services:
{{services_scope}}

## DELIVERABLES
{{deliverables}}

## TERM
**Start Date:** {{start_date}}
**End Date:** {{end_date}}
**Duration:** {{contract_duration}}

## COMPENSATION
**Fee Structure:** {{fee_structure}}
**Total Fee:** AED {{total_fee}}
**Payment Terms:** {{payment_terms}}
**Expenses:** {{expense_reimbursement}}

## TIME COMMITMENT
{{time_commitment}}

## INDEPENDENT CONTRACTOR
The Consultant is an independent contractor, not an employee.

## CONFIDENTIALITY
{{confidentiality_terms}}

## INTELLECTUAL PROPERTY
{{ip_ownership}}

## NON-SOLICITATION
{{non_solicitation_clause}}

## TERMINATION
Either party may terminate with {{termination_notice}} written notice.

## WARRANTIES
The Consultant warrants:
{{consultant_warranties}}

## LIABILITY
{{liability_terms}}

## GOVERNING LAW
This agreement is governed by {{governing_jurisdiction}}.

---
**Consultant Signature:** _________________
**Client Signature:** _________________
**Date:** {{agreement_date}}',
    '# اتفاقية استشارات

**رقم الاتفاقية:** {{agreement_number}}
**التاريخ:** {{agreement_date}}

## المستشار
**الاسم:** {{consultant_name}}
**الشركة:** {{consultant_company}}
**الترخيص:** {{consultant_license}}
**العنوان:** {{consultant_address}}
**الاتصال:** {{consultant_contact}}

## العميل
**الاسم:** {{client_name}}
**الشركة:** {{client_company}}
**العنوان:** {{client_address}}
**الاتصال:** {{client_contact}}

## نطاق الخدمات
يوافق المستشار على تقديم الخدمات التالية:
{{services_scope}}

## المخرجات
{{deliverables}}

## المدة
**تاريخ البدء:** {{start_date}}
**تاريخ الانتهاء:** {{end_date}}
**المدة:** {{contract_duration}}

## التعويض
**هيكل الرسوم:** {{fee_structure}}
**الرسوم الإجمالية:** {{total_fee}} درهم
**شروط الدفع:** {{payment_terms}}
**المصاريف:** {{expense_reimbursement}}

## الالتزام الزمني
{{time_commitment}}

## متعاقد مستقل
المستشار متعاقد مستقل، وليس موظفًا.

## السرية
{{confidentiality_terms}}

## الملكية الفكرية
{{ip_ownership}}

## عدم الاستقطاب
{{non_solicitation_clause}}

## الإنهاء
يمكن لأي طرف الإنهاء بإشعار خطي {{termination_notice}}.

## الضمانات
يضمن المستشار:
{{consultant_warranties}}

## المسؤولية
{{liability_terms}}

## القانون الحاكم
تخضع هذه الاتفاقية لـ {{governing_jurisdiction}}.

---
**توقيع المستشار:** _________________
**توقيع العميل:** _________________
**التاريخ:** {{agreement_date}}',
    '["agreement_number","agreement_date","consultant_name","consultant_company","consultant_license","consultant_address","consultant_contact","client_name","client_company","client_address","client_contact","services_scope","deliverables","start_date","end_date","contract_duration","fee_structure","total_fee","payment_terms","expense_reimbursement","time_commitment","confidentiality_terms","ip_ownership","non_solicitation_clause","termination_notice","consultant_warranties","liability_terms","governing_jurisdiction"]',
    1, 1, 0,
    datetime('now'), datetime('now')
);

-- 12. TERMINATION LETTER (Employment)
INSERT INTO templates (
    id, org_id, created_by,
    name, name_ar, name_ur,
    description, description_ar, description_ur,
    category,
    content_en, content_ar,
    variables,
    is_public, is_system, usage_count,
    created_at, updated_at
) VALUES (
    'tpl_termination_letter',
    NULL,
    NULL,
    'Employment Termination Letter',
    'خطاب إنهاء التوظيف',
    'ملازمت ختم کرنے کا خط',
    'Formal employment termination letter',
    'خطاب إنهاء توظيف رسمي',
    'رسمی ملازمت ختم کرنے کا خط',
    'employment',
    '# EMPLOYMENT TERMINATION LETTER

**Date:** {{termination_date}}

**CONFIDENTIAL**

**To:** {{employee_name}}
**Employee ID:** {{employee_id}}
**Position:** {{job_title}}
**Department:** {{department}}

Dear {{employee_name}},

## NOTICE OF TERMINATION

This letter serves as formal notice that your employment with {{company_name}} will be terminated effective {{effective_date}}.

## REASON FOR TERMINATION
{{termination_reason}}

## NOTICE PERIOD
{{notice_period_details}}

## FINAL WORKING DAY
Your last day of work will be {{last_working_day}}.

## FINAL SETTLEMENT
Your final settlement will include:

**End of Service Benefits:** AED {{end_of_service_benefit}}
**Unpaid Salary:** AED {{unpaid_salary}}
**Accrued Leave:** {{accrued_leave_days}} days (AED {{leave_encashment}})
**Other Benefits:** {{other_benefits}}
**Total Amount:** AED {{total_settlement}}

**Payment Date:** {{settlement_payment_date}}

## RETURN OF COMPANY PROPERTY
Please return the following by your last working day:
{{company_property_list}}

## CONTINUING OBLIGATIONS
{{post_employment_obligations}}

## REFERENCES
{{reference_policy}}

## RIGHTS AND APPEALS
{{employee_rights}}

If you have any questions, please contact Human Resources.

**Sincerely,**

{{hr_manager_name}}
{{hr_manager_title}}
{{company_name}}

---
**Employee Acknowledgment:**
I acknowledge receipt of this termination letter.

**Signature:** _________________
**Name:** {{employee_name}}
**Date:** _________________',
    '# خطاب إنهاء التوظيف

**التاريخ:** {{termination_date}}

**سري**

**إلى:** {{employee_name}}
**رقم الموظف:** {{employee_id}}
**المنصب:** {{job_title}}
**القسم:** {{department}}

عزيزي/عزيزتي {{employee_name}}،

## إشعار الإنهاء

يعمل هذا الخطاب كإشعار رسمي بأن توظيفك مع {{company_name}} سينتهي اعتبارًا من {{effective_date}}.

## سبب الإنهاء
{{termination_reason}}

## فترة الإشعار
{{notice_period_details}}

## آخر يوم عمل
آخر يوم عمل لك سيكون {{last_working_day}}.

## التسوية النهائية
ستشمل تسويتك النهائية:

**مكافأة نهاية الخدمة:** {{end_of_service_benefit}} درهم
**الراتب غير المدفوع:** {{unpaid_salary}} درهم
**الإجازة المستحقة:** {{accrued_leave_days}} يوم ({{leave_encashment}} درهم)
**مزايا أخرى:** {{other_benefits}}
**المبلغ الإجمالي:** {{total_settlement}} درهم

**تاريخ الدفع:** {{settlement_payment_date}}

## إرجاع ممتلكات الشركة
يرجى إرجاع ما يلي بحلول آخر يوم عمل:
{{company_property_list}}

## الالتزامات المستمرة
{{post_employment_obligations}}

## التوصيات
{{reference_policy}}

## الحقوق والاستئنافات
{{employee_rights}}

إذا كان لديك أي أسئلة، يرجى الاتصال بالموارد البشرية.

**مع خالص التحيات،**

{{hr_manager_name}}
{{hr_manager_title}}
{{company_name}}

---
**إقرار الموظف:**
أقر باستلام خطاب الإنهاء هذا.

**التوقيع:** _________________
**الاسم:** {{employee_name}}
**التاريخ:** _________________',
    '["termination_date","employee_name","employee_id","job_title","department","company_name","effective_date","termination_reason","notice_period_details","last_working_day","end_of_service_benefit","unpaid_salary","accrued_leave_days","leave_encashment","other_benefits","total_settlement","settlement_payment_date","company_property_list","post_employment_obligations","reference_policy","employee_rights","hr_manager_name","hr_manager_title"]',
    1, 1, 0,
    datetime('now'), datetime('now')
);

-- 13. LOAN AGREEMENT (General)
INSERT INTO templates (
    id, org_id, created_by,
    name, name_ar, name_ur,
    description, description_ar, description_ur,
    category,
    content_en, content_ar,
    variables,
    is_public, is_system, usage_count,
    created_at, updated_at
) VALUES (
    'tpl_loan_agreement',
    NULL,
    NULL,
    'Loan Agreement',
    'اتفاقية قرض',
    'قرض کا معاہدہ',
    'Personal or business loan agreement',
    'اتفاقية قرض شخصي أو تجاري',
    'ذاتی یا کاروباری قرض کا معاہدہ',
    'general',
    '# LOAN AGREEMENT

**Agreement Number:** {{agreement_number}}
**Date:** {{agreement_date}}

## LENDER
**Name:** {{lender_name}}
**ID:** {{lender_id}}
**Address:** {{lender_address}}
**Contact:** {{lender_contact}}

## BORROWER
**Name:** {{borrower_name}}
**ID:** {{borrower_id}}
**Address:** {{borrower_address}}
**Contact:** {{borrower_contact}}

## LOAN DETAILS
**Principal Amount:** AED {{loan_amount}}
**Purpose:** {{loan_purpose}}
**Disbursement Date:** {{disbursement_date}}

## INTEREST
**Interest Rate:** {{interest_rate}}% per annum
**Interest Type:** {{interest_type}}
**Total Interest:** AED {{total_interest}}

## REPAYMENT TERMS
**Repayment Period:** {{repayment_period}}
**Number of Installments:** {{number_of_installments}}
**Installment Amount:** AED {{installment_amount}}
**Payment Frequency:** {{payment_frequency}}
**First Payment Date:** {{first_payment_date}}

## LATE PAYMENT
**Late Fee:** {{late_payment_fee}}
**Grace Period:** {{grace_period}}

## PREPAYMENT
{{prepayment_terms}}

## SECURITY/COLLATERAL
{{collateral_details}}

## DEFAULT
In event of default:
{{default_consequences}}

## REPRESENTATIONS AND WARRANTIES

### Borrower Represents:
{{borrower_representations}}

### Lender Represents:
{{lender_representations}}

## COVENANTS
The Borrower agrees to:
{{borrower_covenants}}

## EVENTS OF DEFAULT
{{events_of_default}}

## GOVERNING LAW
This agreement is governed by {{governing_jurisdiction}}.

---
**Lender Signature:** _________________
**Borrower Signature:** _________________

**Witness 1:**
Name: {{witness1_name}}
Signature: _________________

**Witness 2:**
Name: {{witness2_name}}
Signature: _________________

**Date:** {{agreement_date}}',
    '# اتفاقية قرض

**رقم الاتفاقية:** {{agreement_number}}
**التاريخ:** {{agreement_date}}

## المقرض
**الاسم:** {{lender_name}}
**الهوية:** {{lender_id}}
**العنوان:** {{lender_address}}
**الاتصال:** {{lender_contact}}

## المقترض
**الاسم:** {{borrower_name}}
**الهوية:** {{borrower_id}}
**العنوان:** {{borrower_address}}
**الاتصال:** {{borrower_contact}}

## تفاصيل القرض
**المبلغ الأصلي:** {{loan_amount}} درهم
**الغرض:** {{loan_purpose}}
**تاريخ الصرف:** {{disbursement_date}}

## الفائدة
**معدل الفائدة:** {{interest_rate}}% سنويًا
**نوع الفائدة:** {{interest_type}}
**إجمالي الفائدة:** {{total_interest}} درهم

## شروط السداد
**فترة السداد:** {{repayment_period}}
**عدد الأقساط:** {{number_of_installments}}
**مبلغ القسط:** {{installment_amount}} درهم
**تكرار الدفع:** {{payment_frequency}}
**تاريخ الدفع الأول:** {{first_payment_date}}

## التأخر في الدفع
**رسوم التأخير:** {{late_payment_fee}}
**فترة السماح:** {{grace_period}}

## السداد المبكر
{{prepayment_terms}}

## الضمان/الرهن
{{collateral_details}}

## التخلف عن السداد
في حالة التخلف عن السداد:
{{default_consequences}}

## الإقرارات والضمانات

### يقر المقترض:
{{borrower_representations}}

### يقر المقرض:
{{lender_representations}}

## العهود
يوافق المقترض على:
{{borrower_covenants}}

## حالات التخلف عن السداد
{{events_of_default}}

## القانون الحاكم
تخضع هذه الاتفاقية لـ {{governing_jurisdiction}}.

---
**توقيع المقرض:** _________________
**توقيع المقترض:** _________________

**الشاهد 1:**
الاسم: {{witness1_name}}
التوقيع: _________________

**الشاهد 2:**
الاسم: {{witness2_name}}
التوقيع: _________________

**التاريخ:** {{agreement_date}}',
    '["agreement_number","agreement_date","lender_name","lender_id","lender_address","lender_contact","borrower_name","borrower_id","borrower_address","borrower_contact","loan_amount","loan_purpose","disbursement_date","interest_rate","interest_type","total_interest","repayment_period","number_of_installments","installment_amount","payment_frequency","first_payment_date","late_payment_fee","grace_period","prepayment_terms","collateral_details","default_consequences","borrower_representations","lender_representations","borrower_covenants","events_of_default","governing_jurisdiction","witness1_name","witness2_name"]',
    1, 1, 0,
    datetime('now'), datetime('now')
);

-- ============================================================================
-- COUNTRY-SPECIFIC TEMPLATE VARIANTS
-- ============================================================================

-- 14. UAE EMPLOYMENT CONTRACT (MOL Compliant)
INSERT INTO templates (
    id, org_id, created_by,
    name, name_ar, name_ur,
    description, description_ar, description_ur,
    category,
    content_en, content_ar,
    variables,
    is_public, is_system, usage_count,
    created_at, updated_at
) VALUES (
    'tpl_uae_employment_contract',
    NULL,
    NULL,
    'UAE Employment Contract (MOL Compliant)',
    'عقد عمل إماراتي (متوافق مع وزارة العمل)',
    'یو اے ای ملازمت کا معاہدہ (وزارت محنت کے مطابق)',
    'UAE Ministry of Labour compliant employment contract',
    'عقد عمل متوافق مع وزارة الموارد البشرية والتوطين الإماراتية',
    'یو اے ای کی وزارت محنت کے مطابق ملازمت کا معاہدہ',
    'employment',
    '# UAE EMPLOYMENT CONTRACT
## عقد عمل في دولة الإمارات العربية المتحدة

**Contract Number:** {{contract_number}}
**رقم العقد:** {{contract_number}}

This contract is executed in accordance with UAE Federal Decree-Law No. 33 of 2021.

## EMPLOYER / صاحب العمل
**Company Name:** {{company_name}}
**Trade License:** {{trade_license_number}}
**MOHRE Establishment ID:** {{mohre_id}}
**Address:** {{company_address}}
**P.O. Box:** {{po_box}}
**Contact:** {{company_contact}}

## EMPLOYEE / الموظف
**Full Name:** {{employee_name}}
**Passport Number:** {{passport_number}}
**Emirates ID:** {{emirates_id}}
**Nationality:** {{nationality}}
**Date of Birth:** {{date_of_birth}}
**Address:** {{employee_address}}
**Contact:** {{employee_contact}}

## EMPLOYMENT DETAILS / تفاصيل التوظيف
**Job Title:** {{job_title}}
**Department:** {{department}}
**Work Location:** {{work_location}}

## CONTRACT TYPE / نوع العقد
**Contract Type:** {{contract_type}}
**Contract Duration:** {{contract_duration}}
**Start Date:** {{start_date}}
**End Date:** {{end_date}}
**Probation Period:** {{probation_period}} (Maximum 6 months)

## REMUNERATION / الأجر
**Basic Salary:** AED {{basic_salary}} per month
**Housing Allowance:** AED {{housing_allowance}}
**Transportation Allowance:** AED {{transport_allowance}}
**Other Allowances:** {{other_allowances}}
**Total Monthly Salary:** AED {{total_salary}}

**Payment Method:** Bank transfer
**Payment Date:** {{payment_day}} of each month

## WORKING HOURS / ساعات العمل
**Standard Hours:** {{standard_hours}} hours per week (Maximum 8 hours per day)
**Work Days:** {{work_days}}
**Rest Days:** {{rest_days}}

**Overtime Rate:** {{overtime_rate}} of hourly wage as per UAE Labour Law

## ANNUAL LEAVE / الإجازة السنوية
**Annual Leave:** {{annual_leave}} days per year (Minimum 30 days after 1 year service)
**Leave Calculation:** As per UAE Labour Law Article 29

## PUBLIC HOLIDAYS / العطل الرسمية
Employee entitled to paid leave on all UAE official public holidays.

## SICK LEAVE / الإجازة المرضية
As per UAE Labour Law:
- First 15 days: Full pay
- Next 30 days: Half pay
- Remaining: No pay
**Maximum:** 90 days per year

## END OF SERVICE BENEFITS / مكافأة نهاية الخدمة
Calculated as per UAE Labour Law:
- 21 days of basic salary for each year of first 5 years
- 30 days of basic salary for each year beyond 5 years

## MEDICAL INSURANCE / التأمين الطبي
Employer shall provide comprehensive medical insurance as per UAE regulations.
**Insurance Provider:** {{insurance_provider}}

## VISA AND WORK PERMIT / التأشيرة وتصريح العمل
Employer shall sponsor employee''s residence visa and work permit.

## TERMINATION / إنهاء الخدمة
**Notice Period:** {{notice_period}}

Either party may terminate with notice as per contract type:
- Limited Contract: Mutual agreement or end of term
- Unlimited Contract: Notice period required

## NOTICE PERIOD PAYMENT / مكافأة مدة الإخطار
As per UAE Labour Law Articles 42-43.

## EMPLOYEE OBLIGATIONS / التزامات الموظف
{{employee_obligations}}

## EMPLOYER OBLIGATIONS / التزامات صاحب العمل
{{employer_obligations}}

## CONFIDENTIALITY / السرية
Employee agrees to maintain confidentiality of all business information.

## NON-COMPETE / عدم المنافسة
{{non_compete_clause}}

## GOVERNING LAW / القانون الحاكم
This contract is governed by UAE Federal Decree-Law No. 33 of 2021.

## DISPUTE RESOLUTION / حل النزاعات
Disputes shall be referred to the UAE Ministry of Human Resources and Emiratisation.

---
**EMPLOYER SIGNATURE / توقيع صاحب العمل**
Name: {{employer_representative}}
Title: {{employer_title}}
Signature: _________________
Date: {{contract_date}}

**EMPLOYEE SIGNATURE / توقيع الموظف**
Name: {{employee_name}}
Signature: _________________
Date: {{contract_date}}

**WITNESS / الشاهد**
Name: {{witness_name}}
Signature: _________________',
    '# عقد عمل في دولة الإمارات العربية المتحدة

**رقم العقد:** {{contract_number}}

يتم تنفيذ هذا العقد وفقًا للمرسوم بقانون اتحادي رقم 33 لسنة 2021.

## صاحب العمل
**اسم الشركة:** {{company_name}}
**الرخصة التجارية:** {{trade_license_number}}
**رقم المنشأة في وزارة الموارد البشرية:** {{mohre_id}}
**العنوان:** {{company_address}}
**صندوق البريد:** {{po_box}}
**الاتصال:** {{company_contact}}

## الموظف
**الاسم الكامل:** {{employee_name}}
**رقم جواز السفر:** {{passport_number}}
**الهوية الإماراتية:** {{emirates_id}}
**الجنسية:** {{nationality}}
**تاريخ الميلاد:** {{date_of_birth}}
**العنوان:** {{employee_address}}
**الاتصال:** {{employee_contact}}

## تفاصيل التوظيف
**المسمى الوظيفي:** {{job_title}}
**القسم:** {{department}}
**مكان العمل:** {{work_location}}

## نوع العقد
**نوع العقد:** {{contract_type}}
**مدة العقد:** {{contract_duration}}
**تاريخ البدء:** {{start_date}}
**تاريخ الانتهاء:** {{end_date}}
**فترة التجربة:** {{probation_period}} (بحد أقصى 6 أشهر)

## الأجر
**الراتب الأساسي:** {{basic_salary}} درهم شهريًا
**بدل السكن:** {{housing_allowance}} درهم
**بدل المواصلات:** {{transport_allowance}} درهم
**بدلات أخرى:** {{other_allowances}}
**إجمالي الراتب الشهري:** {{total_salary}} درهم

**طريقة الدفع:** تحويل بنكي
**تاريخ الدفع:** {{payment_day}} من كل شهر

## ساعات العمل
**الساعات القياسية:** {{standard_hours}} ساعة في الأسبوع (بحد أقصى 8 ساعات يوميًا)
**أيام العمل:** {{work_days}}
**أيام الراحة:** {{rest_days}}

**معدل العمل الإضافي:** {{overtime_rate}} من الأجر بالساعة حسب قانون العمل الإماراتي

## الإجازة السنوية
**الإجازة السنوية:** {{annual_leave}} يومًا في السنة (بحد أدنى 30 يومًا بعد سنة خدمة)
**حساب الإجازة:** حسب المادة 29 من قانون العمل الإماراتي

## العطل الرسمية
يحق للموظف إجازة مدفوعة في جميع العطل الرسمية في دولة الإمارات.

## الإجازة المرضية
حسب قانون العمل الإماراتي:
- أول 15 يوم: أجر كامل
- الـ 30 يوم التالية: نصف الأجر
- الباقي: بدون أجر
**الحد الأقصى:** 90 يومًا في السنة

## مكافأة نهاية الخدمة
محسوبة حسب قانون العمل الإماراتي:
- 21 يوم من الراتب الأساسي لكل سنة من أول 5 سنوات
- 30 يوم من الراتب الأساسي لكل سنة بعد 5 سنوات

## التأمين الطبي
يوفر صاحب العمل تأمينًا طبيًا شاملاً حسب لوائح دولة الإمارات.
**مزود التأمين:** {{insurance_provider}}

## التأشيرة وتصريح العمل
يتكفل صاحب العمل بتأشيرة إقامة الموظف وتصريح العمل.

## إنهاء الخدمة
**فترة الإخطار:** {{notice_period}}

يمكن لأي طرف الإنهاء بإشعار حسب نوع العقد:
- عقد محدد المدة: اتفاق متبادل أو نهاية المدة
- عقد غير محدد المدة: فترة إخطار مطلوبة

## مكافأة مدة الإخطار
حسب المواد 42-43 من قانون العمل الإماراتي.

## التزامات الموظف
{{employee_obligations}}

## التزامات صاحب العمل
{{employer_obligations}}

## السرية
يوافق الموظف على الحفاظ على سرية جميع معلومات العمل.

## عدم المنافسة
{{non_compete_clause}}

## القانون الحاكم
يخضع هذا العقد للمرسوم بقانون اتحادي رقم 33 لسنة 2021.

## حل النزاعات
تحال النزاعات إلى وزارة الموارد البشرية والتوطين في دولة الإمارات.

---
**توقيع صاحب العمل**
الاسم: {{employer_representative}}
المسمى الوظيفي: {{employer_title}}
التوقيع: _________________
التاريخ: {{contract_date}}

**توقيع الموظف**
الاسم: {{employee_name}}
التوقيع: _________________
التاريخ: {{contract_date}}

**الشاهد**
الاسم: {{witness_name}}
التوقيع: _________________',
    '["contract_number","company_name","trade_license_number","mohre_id","company_address","po_box","company_contact","employee_name","passport_number","emirates_id","nationality","date_of_birth","employee_address","employee_contact","job_title","department","work_location","contract_type","contract_duration","start_date","end_date","probation_period","basic_salary","housing_allowance","transport_allowance","other_allowances","total_salary","payment_day","standard_hours","work_days","rest_days","overtime_rate","annual_leave","insurance_provider","notice_period","employee_obligations","employer_obligations","non_compete_clause","employer_representative","employer_title","contract_date","witness_name"]',
    1, 1, 0,
    datetime('now'), datetime('now')
);

-- 15. SAUDI EMPLOYMENT CONTRACT (Arabic-Primary)
INSERT INTO templates (
    id, org_id, created_by,
    name, name_ar, name_ur,
    description, description_ar, description_ur,
    category,
    content_en, content_ar,
    variables,
    is_public, is_system, usage_count,
    created_at, updated_at
) VALUES (
    'tpl_saudi_employment_contract',
    NULL,
    NULL,
    'Saudi Employment Contract',
    'عقد عمل سعودي',
    'سعودی ملازمت کا معاہدہ',
    'Saudi Arabia Labour Law compliant employment contract',
    'عقد عمل متوافق مع نظام العمل السعودي',
    'سعودی عرب کے لیبر قانون کے مطابق ملازمت کا معاہدہ',
    'employment',
    '# SAUDI EMPLOYMENT CONTRACT

This contract is executed in accordance with Saudi Labour Law.

## EMPLOYER
**Company Name:** {{company_name}}
**Commercial Registration:** {{cr_number}}
**Address:** {{company_address}}
**GOSI Number:** {{gosi_number}}

## EMPLOYEE
**Full Name:** {{employee_name}}
**Iqama/National ID:** {{iqama_number}}
**Nationality:** {{nationality}}
**Date of Birth:** {{date_of_birth}}
**Qualification:** {{qualification}}

## JOB DETAILS
**Job Title:** {{job_title}}
**Department:** {{department}}
**Work Location:** {{work_location}}

## CONTRACT PERIOD
**Start Date:** {{start_date}}
**Contract Type:** {{contract_type}}
**Probation Period:** {{probation_period}} (Maximum 90 days)

## SALARY
**Basic Salary:** SAR {{basic_salary}}
**Housing Allowance:** SAR {{housing_allowance}}
**Transportation:** SAR {{transport_allowance}}
**Total Salary:** SAR {{total_salary}}

## WORKING HOURS
**Hours per Week:** {{weekly_hours}} (Maximum 48 hours)
**Ramadan Hours:** {{ramadan_hours}} (Maximum 36 hours)

## LEAVE ENTITLEMENT
**Annual Leave:** {{annual_leave}} days (Minimum 21 days)
**Sick Leave:** As per Saudi Labour Law
**Public Holidays:** All official Saudi holidays

## END OF SERVICE
Calculated as per Saudi Labour Law based on last drawn salary.

## GOVERNING LAW
Saudi Labour Law and GOSI regulations.

---
**Employer Signature:** _________________
**Employee Signature:** _________________
**Date:** {{contract_date}}',
    '# عقد عمل في المملكة العربية السعودية

يتم تنفيذ هذا العقد وفقًا لنظام العمل السعودي.

## صاحب العمل
**اسم الشركة:** {{company_name}}
**السجل التجاري:** {{cr_number}}
**العنوان:** {{company_address}}
**رقم التأمينات الاجتماعية:** {{gosi_number}}

## الموظف
**الاسم الكامل:** {{employee_name}}
**رقم الإقامة/الهوية الوطنية:** {{iqama_number}}
**الجنسية:** {{nationality}}
**تاريخ الميلاد:** {{date_of_birth}}
**المؤهل:** {{qualification}}

## تفاصيل الوظيفة
**المسمى الوظيفي:** {{job_title}}
**القسم:** {{department}}
**مكان العمل:** {{work_location}}

## مدة العقد
**تاريخ البدء:** {{start_date}}
**نوع العقد:** {{contract_type}}
**فترة التجربة:** {{probation_period}} (بحد أقصى 90 يوم)

## الراتب
**الراتب الأساسي:** {{basic_salary}} ريال
**بدل السكن:** {{housing_allowance}} ريال
**بدل المواصلات:** {{transport_allowance}} ريال
**إجمالي الراتب:** {{total_salary}} ريال

## ساعات العمل
**ساعات الأسبوع:** {{weekly_hours}} (بحد أقصى 48 ساعة)
**ساعات رمضان:** {{ramadan_hours}} (بحد أقصى 36 ساعة)

## الإجازات
**الإجازة السنوية:** {{annual_leave}} يوم (بحد أدنى 21 يوم)
**الإجازة المرضية:** حسب نظام العمل السعودي
**العطل الرسمية:** جميع العطل الرسمية السعودية

## مكافأة نهاية الخدمة
محسوبة حسب نظام العمل السعودي على أساس آخر راتب مستلم.

## القانون الحاكم
نظام العمل السعودي ولوائح التأمينات الاجتماعية.

---
**توقيع صاحب العمل:** _________________
**توقيع الموظف:** _________________
**التاريخ:** {{contract_date}}',
    '["company_name","cr_number","company_address","gosi_number","employee_name","iqama_number","nationality","date_of_birth","qualification","job_title","department","work_location","start_date","contract_type","probation_period","basic_salary","housing_allowance","transport_allowance","total_salary","weekly_hours","ramadan_hours","annual_leave","contract_date"]',
    1, 1, 0,
    datetime('now'), datetime('now')
);

-- Success message
SELECT 'Template seed completed successfully!' as status,
       COUNT(*) as total_templates
FROM templates
WHERE is_system = 1;