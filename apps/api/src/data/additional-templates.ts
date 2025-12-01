/**
 * Additional Legal Document Templates for UAE/GCC
 * Part 2: Extended template types
 * Production-ready with English and Arabic versions
 */

export const additionalTemplates = {
  power_of_attorney: {
    en: `GENERAL POWER OF ATTORNEY

Date: {{date}}
Place: {{city}}, {{country}}

KNOW ALL MEN BY THESE PRESENTS:

I/We, {{principalName}}, holder of {{idType}} No. {{idNumber}}, resident of {{principalAddress}} (hereinafter referred to as the "Principal")

DO HEREBY APPOINT

{{agentName}}, holder of {{agentIdType}} No. {{agentIdNumber}}, resident of {{agentAddress}} (hereinafter referred to as the "Agent" or "Attorney-in-Fact")

as my true and lawful attorney to act in my name, place, and stead, with full authority to perform the following acts:

1. SCOPE OF AUTHORITY

The Agent is authorized to:
{{authorityScope}}

2. SPECIFIC POWERS

2.1 Financial Matters:
- Open, operate, and close bank accounts
- Execute financial transactions up to {{financialLimit}}
- Sign checks, drafts, and negotiable instruments
- Manage investments and securities

2.2 Legal Matters:
- Execute, sign, and deliver contracts and agreements
- Appear before courts, tribunals, and government authorities
- Institute, defend, or settle legal proceedings
- Engage legal counsel on my behalf

2.3 Property Matters:
- Buy, sell, lease, or mortgage real property
- Execute deeds, transfers, and conveyances
- Manage and maintain properties
- Collect rents and pay expenses

2.4 Administrative Matters:
- Deal with government departments and authorities
- Obtain documents, certificates, and clearances
- Submit applications and representations
- Sign forms and declarations

3. DURATION

This Power of Attorney shall be effective from {{effectiveDate}} and shall remain in force until {{expiryDate}} unless revoked earlier in writing.

4. RATIFICATION

I hereby ratify and confirm all acts lawfully done by my said Attorney pursuant to this Power of Attorney.

5. REVOCATION

This Power of Attorney may be revoked by the Principal at any time by written notice to the Agent and registration of such revocation with the relevant authorities.

6. GOVERNING LAW

This Power of Attorney shall be governed by and construed in accordance with the laws of {{country}}.

IN WITNESS WHEREOF, I have hereunto set my hand and seal on the date first above written.

PRINCIPAL:

Signature: _____________________
Name: {{principalName}}
{{idType}}: {{idNumber}}
Date: {{date}}

WITNESSES:

1. Signature: _____________________
   Name: {{witness1Name}}
   ID: {{witness1Id}}

2. Signature: _____________________
   Name: {{witness2Name}}
   ID: {{witness2Id}}

NOTARIZATION:

Notarized at {{notaryLocation}}
On this {{notaryDate}}
Notary Public: _____________________
Seal:`,

    ar: `توكيل عام

التاريخ: {{date}}
المكان: {{city}}، {{country}}

أقر أنا الموقع أدناه:

أنا/نحن، {{principalName}}، حامل {{idType}} رقم {{idNumber}}، المقيم في {{principalAddress}} (ويُشار إليه فيما بعد بـ "الموكّل")

أوكّل بموجب هذا

{{agentName}}، حامل {{agentIdType}} رقم {{agentIdNumber}}، المقيم في {{agentAddress}} (ويُشار إليه فيما بعد بـ "الوكيل")

وكيلاً عني وباسمي ومقامي، مع كامل الصلاحيات للقيام بالأعمال التالية:

1. نطاق الصلاحيات

يُخوّل الوكيل القيام بما يلي:
{{authorityScope}}

2. الصلاحيات المحددة

2.1 الشؤون المالية:
- فتح وتشغيل وإغلاق الحسابات المصرفية
- تنفيذ المعاملات المالية حتى {{financialLimit}}
- توقيع الشيكات والحوالات والأوراق التجارية
- إدارة الاستثمارات والأوراق المالية

2.2 الشؤون القانونية:
- تنفيذ وتوقيع وتسليم العقود والاتفاقيات
- المثول أمام المحاكم والهيئات والجهات الحكومية
- رفع الدعاوى والدفاع فيها وتسويتها
- توكيل المحامين نيابة عني

2.3 شؤون الملكية:
- شراء وبيع وتأجير ورهن العقارات
- تنفيذ صكوك التحويل والنقل
- إدارة وصيانة العقارات
- تحصيل الإيجارات ودفع المصاريف

2.4 الشؤون الإدارية:
- التعامل مع الدوائر والجهات الحكومية
- الحصول على الوثائق والشهادات والتصاريح
- تقديم الطلبات والمراسلات
- توقيع النماذج والإقرارات

3. المدة

يسري مفعول هذا التوكيل من {{effectiveDate}} ويظل سارياً حتى {{expiryDate}} ما لم يُلغَ كتابياً قبل ذلك.

4. التصديق

أصادق بموجب هذا على جميع الأعمال التي يقوم بها وكيلي المذكور وفقاً لهذا التوكيل.

5. الإلغاء

يجوز للموكّل إلغاء هذا التوكيل في أي وقت بإشعار كتابي للوكيل وتسجيل الإلغاء لدى الجهات المختصة.

6. القانون الحاكم

يخضع هذا التوكيل لقوانين {{country}} ويُفسّر وفقاً لها.

وإثباتاً لما تقدم، وقّعت وختمت في التاريخ المبين أعلاه.

الموكّل:

التوقيع: _____________________
الاسم: {{principalName}}
{{idType}}: {{idNumber}}
التاريخ: {{date}}

الشهود:

1. التوقيع: _____________________
   الاسم: {{witness1Name}}
   الهوية: {{witness1Id}}

2. التوقيع: _____________________
   الاسم: {{witness2Name}}
   الهوية: {{witness2Id}}

التصديق الموثق:

موثق في {{notaryLocation}}
بتاريخ {{notaryDate}}
الموثق العام: _____________________
الختم:`
  },

  sales_contract: {
    en: `SALES CONTRACT

Contract No: {{contractNumber}}
Date: {{date}}

BETWEEN:

{{sellerName}} (the "Seller")
{{sellerIdType}}: {{sellerId}}
Address: {{sellerAddress}}
Contact: {{sellerContact}}

AND:

{{buyerName}} (the "Buyer")
{{buyerIdType}}: {{buyerId}}
Address: {{buyerAddress}}
Contact: {{buyerContact}}

RECITALS:

WHEREAS, the Seller is the owner of certain goods/items described herein;
WHEREAS, the Buyer wishes to purchase such goods/items from the Seller;
NOW, THEREFORE, the parties agree as follows:

1. SUBJECT MATTER

1.1 The Seller agrees to sell and the Buyer agrees to purchase the following:

Description: {{itemDescription}}
Quantity: {{quantity}}
Specifications: {{specifications}}
Condition: {{condition}}

2. PURCHASE PRICE

2.1 Total Purchase Price: {{currency}} {{totalPrice}}
2.2 Payment Terms:
{{paymentTerms}}

3. DELIVERY

3.1 Delivery Date: {{deliveryDate}}
3.2 Delivery Location: {{deliveryLocation}}
3.3 Delivery Terms: {{deliveryTerms}}
3.4 Risk of loss shall pass to the Buyer upon delivery.

4. WARRANTIES

4.1 The Seller warrants that:
- The goods are free from defects in materials and workmanship
- The goods conform to the specifications provided
- The Seller has good and marketable title to the goods
- The goods are free from any liens or encumbrances

4.2 Warranty Period: {{warrantyPeriod}}

5. INSPECTION AND ACCEPTANCE

5.1 The Buyer shall inspect the goods within {{inspectionPeriod}} days of delivery.
5.2 Any defects must be reported in writing within this period.
5.3 Failure to report defects shall constitute acceptance.

6. TITLE TRANSFER

6.1 Title to the goods shall pass to the Buyer upon:
{{titleTransferCondition}}

7. REMEDIES

7.1 In case of defects, the Buyer may:
- Request repair or replacement
- Receive a proportionate reduction in price
- Cancel the contract for material defects

8. LIMITATION OF LIABILITY

8.1 The Seller's liability shall be limited to the purchase price of the goods.
8.2 Neither party shall be liable for indirect or consequential damages.

9. FORCE MAJEURE

9.1 Neither party shall be liable for delays due to events beyond their reasonable control.

10. DISPUTE RESOLUTION

10.1 Disputes shall be resolved by {{disputeResolution}}.
10.2 Governing Law: {{governingLaw}}

11. GENERAL PROVISIONS

11.1 This contract constitutes the entire agreement between the parties.
11.2 Amendments must be in writing and signed by both parties.
11.3 This contract is binding on successors and assigns.

IN WITNESS WHEREOF, the parties have executed this contract:

SELLER:
Signature: _____________________
Name: {{sellerName}}
Date: {{date}}

BUYER:
Signature: _____________________
Name: {{buyerName}}
Date: {{date}}`,

    ar: `عقد بيع

رقم العقد: {{contractNumber}}
التاريخ: {{date}}

بين:

{{sellerName}} ("البائع")
{{sellerIdType}}: {{sellerId}}
العنوان: {{sellerAddress}}
الاتصال: {{sellerContact}}

و:

{{buyerName}} ("المشتري")
{{buyerIdType}}: {{buyerId}}
العنوان: {{buyerAddress}}
الاتصال: {{buyerContact}}

تمهيد:

حيث أن البائع هو المالك لبعض السلع/البنود الموضحة أدناه؛
وحيث أن المشتري يرغب في شراء هذه السلع/البنود من البائع؛
لذا يتفق الطرفان على ما يلي:

1. موضوع العقد

1.1 يوافق البائع على بيع ويوافق المشتري على شراء ما يلي:

الوصف: {{itemDescription}}
الكمية: {{quantity}}
المواصفات: {{specifications}}
الحالة: {{condition}}

2. ثمن البيع

2.1 إجمالي ثمن البيع: {{totalPrice}} {{currency}}
2.2 شروط الدفع:
{{paymentTerms}}

3. التسليم

3.1 تاريخ التسليم: {{deliveryDate}}
3.2 مكان التسليم: {{deliveryLocation}}
3.3 شروط التسليم: {{deliveryTerms}}
3.4 تنتقل مخاطر الهلاك إلى المشتري عند التسليم.

4. الضمانات

4.1 يضمن البائع أن:
- السلع خالية من العيوب في المواد والصنعة
- السلع مطابقة للمواصفات المقدمة
- البائع يملك حق ملكية صحيح وقابل للتسويق
- السلع خالية من أي رهونات أو أعباء

4.2 فترة الضمان: {{warrantyPeriod}}

5. الفحص والقبول

5.1 يقوم المشتري بفحص السلع خلال {{inspectionPeriod}} يوماً من التسليم.
5.2 يجب الإبلاغ عن أي عيوب كتابياً خلال هذه الفترة.
5.3 عدم الإبلاغ عن العيوب يعتبر قبولاً.

6. نقل الملكية

6.1 تنتقل ملكية السلع إلى المشتري عند:
{{titleTransferCondition}}

7. سبل الانتصاف

7.1 في حالة العيوب، يجوز للمشتري:
- طلب الإصلاح أو الاستبدال
- الحصول على تخفيض متناسب في السعر
- إلغاء العقد للعيوب الجوهرية

8. تحديد المسؤولية

8.1 تقتصر مسؤولية البائع على ثمن شراء السلع.
8.2 لا يتحمل أي طرف مسؤولية الأضرار غير المباشرة أو التبعية.

9. القوة القاهرة

9.1 لا يتحمل أي طرف مسؤولية التأخير الناجم عن ظروف خارجة عن السيطرة المعقولة.

10. تسوية النزاعات

10.1 يتم حل النزاعات عن طريق {{disputeResolution}}.
10.2 القانون الحاكم: {{governingLaw}}

11. أحكام عامة

11.1 يمثل هذا العقد الاتفاق الكامل بين الطرفين.
11.2 يجب أن تكون التعديلات كتابية وموقعة من الطرفين.
11.3 هذا العقد ملزم للخلفاء والمتنازل لهم.

وإثباتاً لما تقدم، وقّع الطرفان على هذا العقد:

البائع:
التوقيع: _____________________
الاسم: {{sellerName}}
التاريخ: {{date}}

المشتري:
التوقيع: _____________________
الاسم: {{buyerName}}
التاريخ: {{date}}`
  },

  memorandum_of_understanding: {
    en: `MEMORANDUM OF UNDERSTANDING

Date: {{date}}
Reference: {{referenceNumber}}

BETWEEN:

{{party1Name}} ("First Party")
Registration: {{party1Registration}}
Address: {{party1Address}}
Represented by: {{party1Representative}}, {{party1RepTitle}}

AND:

{{party2Name}} ("Second Party")
Registration: {{party2Registration}}
Address: {{party2Address}}
Represented by: {{party2Representative}}, {{party2RepTitle}}

(Collectively referred to as the "Parties")

PREAMBLE:

WHEREAS, the First Party is engaged in {{party1Business}};
WHEREAS, the Second Party is engaged in {{party2Business}};
WHEREAS, the Parties wish to explore potential collaboration in {{collaborationArea}};

NOW, THEREFORE, the Parties hereby enter into this Memorandum of Understanding:

1. PURPOSE

1.1 This MOU sets forth the terms and understanding between the Parties regarding:
{{purpose}}

1.2 This MOU establishes a framework for cooperation and does not create legally binding obligations except as expressly stated herein.

2. AREAS OF COOPERATION

The Parties agree to explore cooperation in the following areas:
{{cooperationAreas}}

3. RESPONSIBILITIES

3.1 First Party shall:
{{party1Responsibilities}}

3.2 Second Party shall:
{{party2Responsibilities}}

4. RESOURCES AND COSTS

4.1 Each Party shall bear its own costs in connection with this MOU unless otherwise agreed.
4.2 Any joint activities requiring funding will be subject to separate written agreements.

5. INTELLECTUAL PROPERTY

5.1 Each Party retains ownership of its pre-existing intellectual property.
5.2 Intellectual property developed jointly shall be addressed in separate agreements.

6. CONFIDENTIALITY

6.1 The Parties agree to maintain confidentiality of all information exchanged under this MOU.
6.2 Confidential information shall not be disclosed to third parties without prior written consent.
6.3 This obligation shall survive termination of this MOU for {{confidentialityPeriod}}.

7. DURATION AND TERMINATION

7.1 This MOU shall be effective from {{effectiveDate}} for a period of {{duration}}.
7.2 Either Party may terminate this MOU with {{noticePeriod}} days' written notice.
7.3 Termination shall not affect obligations that have accrued prior to termination.

8. NON-BINDING NATURE

8.1 This MOU is a statement of intent and does not create any legally binding obligations, except for:
- Confidentiality provisions
- Intellectual property provisions
- Dispute resolution provisions

9. AMENDMENT

9.1 This MOU may be amended only by written agreement signed by both Parties.

10. GOVERNING LAW

10.1 This MOU shall be governed by the laws of {{governingLaw}}.
10.2 Any disputes shall be resolved through {{disputeResolution}}.

11. ENTIRE UNDERSTANDING

11.1 This MOU represents the entire understanding between the Parties.
11.2 This MOU supersedes all prior discussions and negotiations.

IN WITNESS WHEREOF, the Parties have executed this MOU:

FIRST PARTY:
Signature: _____________________
Name: {{party1Representative}}
Title: {{party1RepTitle}}
Date: {{date}}

SECOND PARTY:
Signature: _____________________
Name: {{party2Representative}}
Title: {{party2RepTitle}}
Date: {{date}}`,

    ar: `مذكرة تفاهم

التاريخ: {{date}}
المرجع: {{referenceNumber}}

بين:

{{party1Name}} ("الطرف الأول")
السجل التجاري: {{party1Registration}}
العنوان: {{party1Address}}
ويمثله: {{party1Representative}}، {{party1RepTitle}}

و:

{{party2Name}} ("الطرف الثاني")
السجل التجاري: {{party2Registration}}
العنوان: {{party2Address}}
ويمثله: {{party2Representative}}، {{party2RepTitle}}

(يُشار إليهما مجتمعين بـ "الطرفين")

تمهيد:

حيث أن الطرف الأول يعمل في مجال {{party1Business}}؛
وحيث أن الطرف الثاني يعمل في مجال {{party2Business}}؛
وحيث أن الطرفين يرغبان في استكشاف التعاون المحتمل في {{collaborationArea}}؛

لذا يدخل الطرفان في مذكرة التفاهم هذه:

1. الغرض

1.1 تحدد هذه المذكرة الشروط والتفاهم بين الطرفين بشأن:
{{purpose}}

1.2 تنشئ هذه المذكرة إطاراً للتعاون ولا تُنشئ التزامات قانونية ملزمة إلا كما هو منصوص عليه صراحة.

2. مجالات التعاون

يتفق الطرفان على استكشاف التعاون في المجالات التالية:
{{cooperationAreas}}

3. المسؤوليات

3.1 يتعهد الطرف الأول بما يلي:
{{party1Responsibilities}}

3.2 يتعهد الطرف الثاني بما يلي:
{{party2Responsibilities}}

4. الموارد والتكاليف

4.1 يتحمل كل طرف تكاليفه الخاصة فيما يتعلق بهذه المذكرة ما لم يُتفق على خلاف ذلك.
4.2 أي أنشطة مشتركة تتطلب تمويلاً ستخضع لاتفاقيات مكتوبة منفصلة.

5. الملكية الفكرية

5.1 يحتفظ كل طرف بملكية حقوقه الفكرية السابقة.
5.2 ستُعالج الملكية الفكرية المطورة بشكل مشترك في اتفاقيات منفصلة.

6. السرية

6.1 يتفق الطرفان على الحفاظ على سرية جميع المعلومات المتبادلة بموجب هذه المذكرة.
6.2 لا يجوز الإفصاح عن المعلومات السرية لأطراف ثالثة دون موافقة كتابية مسبقة.
6.3 يستمر هذا الالتزام بعد إنهاء هذه المذكرة لمدة {{confidentialityPeriod}}.

7. المدة والإنهاء

7.1 تسري هذه المذكرة من {{effectiveDate}} لمدة {{duration}}.
7.2 يجوز لأي طرف إنهاء هذه المذكرة بإشعار كتابي مدته {{noticePeriod}} يوماً.
7.3 لا يؤثر الإنهاء على الالتزامات المستحقة قبل الإنهاء.

8. الطبيعة غير الملزمة

8.1 هذه المذكرة هي بيان نوايا ولا تُنشئ أي التزامات قانونية ملزمة، باستثناء:
- أحكام السرية
- أحكام الملكية الفكرية
- أحكام حل النزاعات

9. التعديل

9.1 لا يجوز تعديل هذه المذكرة إلا باتفاق كتابي موقع من الطرفين.

10. القانون الحاكم

10.1 تخضع هذه المذكرة لقوانين {{governingLaw}}.
10.2 يتم حل أي نزاعات من خلال {{disputeResolution}}.

11. الاتفاق الكامل

11.1 تمثل هذه المذكرة التفاهم الكامل بين الطرفين.
11.2 تحل هذه المذكرة محل جميع المناقشات والمفاوضات السابقة.

وإثباتاً لما تقدم، وقّع الطرفان على هذه المذكرة:

الطرف الأول:
التوقيع: _____________________
الاسم: {{party1Representative}}
المنصب: {{party1RepTitle}}
التاريخ: {{date}}

الطرف الثاني:
التوقيع: _____________________
الاسم: {{party2Representative}}
المنصب: {{party2RepTitle}}
التاريخ: {{date}}`
  },

  partnership_agreement: {
    en: `PARTNERSHIP AGREEMENT

Date: {{date}}
Partnership Name: {{partnershipName}}

THIS AGREEMENT is made between:

{{partner1Name}} ("First Partner")
{{partner1IdType}}: {{partner1Id}}
Address: {{partner1Address}}
Contribution: {{partner1Contribution}}
Share: {{partner1Share}}%

{{partner2Name}} ("Second Partner")
{{partner2IdType}}: {{partner2Id}}
Address: {{partner2Address}}
Contribution: {{partner2Contribution}}
Share: {{partner2Share}}%

{{#if partner3Name}}
{{partner3Name}} ("Third Partner")
{{partner3IdType}}: {{partner3Id}}
Address: {{partner3Address}}
Contribution: {{partner3Contribution}}
Share: {{partner3Share}}%
{{/if}}

(Collectively, the "Partners")

1. FORMATION AND NAME

1.1 The Partners hereby form a partnership under the name "{{partnershipName}}".
1.2 The partnership shall be registered as required by applicable law.

2. BUSINESS PURPOSE

2.1 The partnership is formed for the purpose of:
{{businessPurpose}}

2.2 The partnership may engage in any lawful activity approved by all Partners.

3. PRINCIPAL PLACE OF BUSINESS

3.1 The principal place of business shall be at {{businessAddress}}.
3.2 Additional locations may be established with Partners' approval.

4. TERM

4.1 The partnership shall commence on {{commencementDate}}.
4.2 The partnership shall continue until {{termType}}.

5. CAPITAL CONTRIBUTIONS

5.1 Initial capital contributions:
{{capitalContributions}}

5.2 Additional contributions may be made as unanimously agreed.
5.3 No Partner shall withdraw capital without unanimous consent.

6. PROFIT AND LOSS ALLOCATION

6.1 Net profits and losses shall be allocated as follows:
{{profitAllocation}}

6.2 Profits shall be distributed {{distributionFrequency}}.
6.3 Distributions require {{distributionApproval}}.

7. MANAGEMENT AND VOTING

7.1 Management Authority:
{{managementStructure}}

7.2 Voting Rights:
- Ordinary decisions: {{ordinaryDecisionVote}}
- Major decisions: {{majorDecisionVote}}

7.3 Major decisions include:
{{majorDecisions}}

8. PARTNER DUTIES

8.1 Each Partner shall:
- Devote {{timeCommitment}} to partnership business
- Act in good faith and loyalty to the partnership
- Not engage in competing businesses without consent
- Maintain confidentiality of partnership information

9. BANKING AND ACCOUNTS

9.1 Partnership bank account: {{bankName}}
9.2 Authorized signatories: {{authorizedSignatories}}
9.3 Books and records shall be maintained at {{recordsLocation}}.

10. WITHDRAWAL OF A PARTNER

10.1 A Partner may withdraw with {{withdrawalNotice}} written notice.
10.2 Upon withdrawal:
{{withdrawalTerms}}

11. DEATH OR INCAPACITY

11.1 Upon death or incapacity of a Partner:
{{deathIncapacityTerms}}

12. DISSOLUTION

12.1 The partnership may be dissolved by:
- Unanimous written consent
- Court order
- Events making continuation unlawful

12.2 Upon dissolution:
{{dissolutionProcedure}}

13. DISPUTE RESOLUTION

13.1 Disputes shall first be addressed through mediation.
13.2 Unresolved disputes shall be settled by {{arbitrationBody}}.

14. AMENDMENTS

14.1 This Agreement may be amended only by unanimous written consent.

15. GOVERNING LAW

15.1 This Agreement shall be governed by the laws of {{governingLaw}}.

IN WITNESS WHEREOF, the Partners have executed this Agreement:

FIRST PARTNER:
Signature: _____________________
Name: {{partner1Name}}
Date: {{date}}

SECOND PARTNER:
Signature: _____________________
Name: {{partner2Name}}
Date: {{date}}

{{#if partner3Name}}
THIRD PARTNER:
Signature: _____________________
Name: {{partner3Name}}
Date: {{date}}
{{/if}}`,

    ar: `اتفاقية شراكة

التاريخ: {{date}}
اسم الشراكة: {{partnershipName}}

أُبرمت هذه الاتفاقية بين:

{{partner1Name}} ("الشريك الأول")
{{partner1IdType}}: {{partner1Id}}
العنوان: {{partner1Address}}
المساهمة: {{partner1Contribution}}
الحصة: {{partner1Share}}%

{{partner2Name}} ("الشريك الثاني")
{{partner2IdType}}: {{partner2Id}}
العنوان: {{partner2Address}}
المساهمة: {{partner2Contribution}}
الحصة: {{partner2Share}}%

{{#if partner3Name}}
{{partner3Name}} ("الشريك الثالث")
{{partner3IdType}}: {{partner3Id}}
العنوان: {{partner3Address}}
المساهمة: {{partner3Contribution}}
الحصة: {{partner3Share}}%
{{/if}}

(يُشار إليهم مجتمعين بـ "الشركاء")

1. التأسيس والاسم

1.1 يؤسس الشركاء بموجب هذا شراكة تحت اسم "{{partnershipName}}".
1.2 يتم تسجيل الشراكة وفقاً للقانون المعمول به.

2. غرض العمل

2.1 تأسست الشراكة لغرض:
{{businessPurpose}}

2.2 يجوز للشراكة ممارسة أي نشاط مشروع يوافق عليه جميع الشركاء.

3. المقر الرئيسي

3.1 يكون المقر الرئيسي في {{businessAddress}}.
3.2 يجوز إنشاء مواقع إضافية بموافقة الشركاء.

4. المدة

4.1 تبدأ الشراكة في {{commencementDate}}.
4.2 تستمر الشراكة حتى {{termType}}.

5. المساهمات الرأسمالية

5.1 المساهمات الرأسمالية الأولية:
{{capitalContributions}}

5.2 يجوز تقديم مساهمات إضافية بموافقة إجماعية.
5.3 لا يجوز لأي شريك سحب رأس المال دون موافقة إجماعية.

6. توزيع الأرباح والخسائر

6.1 توزع صافي الأرباح والخسائر كما يلي:
{{profitAllocation}}

6.2 توزع الأرباح {{distributionFrequency}}.
6.3 تتطلب التوزيعات {{distributionApproval}}.

7. الإدارة والتصويت

7.1 سلطة الإدارة:
{{managementStructure}}

7.2 حقوق التصويت:
- القرارات العادية: {{ordinaryDecisionVote}}
- القرارات الرئيسية: {{majorDecisionVote}}

7.3 تشمل القرارات الرئيسية:
{{majorDecisions}}

8. واجبات الشركاء

8.1 يتعهد كل شريك بما يلي:
- تخصيص {{timeCommitment}} لأعمال الشراكة
- التصرف بحسن نية وولاء للشراكة
- عدم الانخراط في أعمال منافسة دون موافقة
- الحفاظ على سرية معلومات الشراكة

9. الحسابات المصرفية

9.1 الحساب المصرفي للشراكة: {{bankName}}
9.2 المفوضون بالتوقيع: {{authorizedSignatories}}
9.3 تُحفظ الدفاتر والسجلات في {{recordsLocation}}.

10. انسحاب الشريك

10.1 يجوز للشريك الانسحاب بإشعار كتابي مدته {{withdrawalNotice}}.
10.2 عند الانسحاب:
{{withdrawalTerms}}

11. الوفاة أو العجز

11.1 عند وفاة أو عجز الشريك:
{{deathIncapacityTerms}}

12. الحل

12.1 يجوز حل الشراكة بموجب:
- الموافقة الكتابية بالإجماع
- أمر المحكمة
- الأحداث التي تجعل الاستمرار غير قانوني

12.2 عند الحل:
{{dissolutionProcedure}}

13. حل النزاعات

13.1 يتم معالجة النزاعات أولاً من خلال الوساطة.
13.2 يتم حل النزاعات غير المحلولة من قبل {{arbitrationBody}}.

14. التعديلات

14.1 لا يجوز تعديل هذه الاتفاقية إلا بموافقة كتابية بالإجماع.

15. القانون الحاكم

15.1 تخضع هذه الاتفاقية لقوانين {{governingLaw}}.

وإثباتاً لما تقدم، وقّع الشركاء على هذه الاتفاقية:

الشريك الأول:
التوقيع: _____________________
الاسم: {{partner1Name}}
التاريخ: {{date}}

الشريك الثاني:
التوقيع: _____________________
الاسم: {{partner2Name}}
التاريخ: {{date}}

{{#if partner3Name}}
الشريك الثالث:
التوقيع: _____________________
الاسم: {{partner3Name}}
التاريخ: {{date}}
{{/if}}`
  },

  consultancy_agreement: {
    en: `CONSULTANCY AGREEMENT

Date: {{date}}
Agreement No: {{agreementNumber}}

BETWEEN:

{{clientName}} (the "Client")
Registration: {{clientRegistration}}
Address: {{clientAddress}}

AND:

{{consultantName}} (the "Consultant")
{{consultantIdType}}: {{consultantId}}
Address: {{consultantAddress}}

1. ENGAGEMENT

1.1 The Client hereby engages the Consultant to provide the following services:
{{servicesDescription}}

1.2 The Consultant accepts this engagement on the terms set forth herein.

2. TERM

2.1 This Agreement shall commence on {{startDate}} and continue until {{endDate}}, unless terminated earlier.

2.2 This Agreement may be renewed by mutual written agreement.

3. SCOPE OF SERVICES

3.1 The Consultant shall:
{{scopeOfServices}}

3.2 Deliverables:
{{deliverables}}

3.3 Timeline:
{{timeline}}

4. FEES AND PAYMENT

4.1 The Client shall pay the Consultant:
{{feeStructure}}

4.2 Payment Terms: {{paymentTerms}}

4.3 Expenses: {{expensePolicy}}

4.4 Invoices shall be submitted {{invoiceFrequency}} and paid within {{paymentDays}} days.

5. INDEPENDENT CONTRACTOR

5.1 The Consultant is an independent contractor, not an employee.

5.2 The Consultant is responsible for own taxes and insurance.

5.3 The Consultant may engage other clients, subject to confidentiality obligations.

6. CONFIDENTIALITY

6.1 The Consultant shall maintain strict confidentiality of all Client information.

6.2 Confidential information includes:
{{confidentialInfo}}

6.3 This obligation survives termination for {{confidentialityPeriod}}.

7. INTELLECTUAL PROPERTY

7.1 Work Product: {{ipOwnership}}

7.2 Pre-existing IP remains with its original owner.

7.3 The Consultant grants the Client {{licenseTerms}}.

8. NON-SOLICITATION

8.1 During the term and for {{nonSolicitPeriod}} after, the Consultant shall not solicit Client's employees or clients.

9. REPRESENTATIONS AND WARRANTIES

9.1 The Consultant represents and warrants:
- Possession of necessary skills and qualifications
- Services will be performed professionally
- No conflict of interest exists
- Compliance with applicable laws

10. LIABILITY AND INDEMNIFICATION

10.1 The Consultant's liability is limited to {{liabilityLimit}}.

10.2 Each party shall indemnify the other against claims arising from breach.

11. TERMINATION

11.1 Either party may terminate with {{noticePeriod}} written notice.

11.2 The Client may terminate immediately for:
{{immediateTerminationCauses}}

11.3 Upon termination:
{{terminationObligations}}

12. DISPUTE RESOLUTION

12.1 Disputes shall be resolved by {{disputeResolution}}.

12.2 Governing Law: {{governingLaw}}

13. GENERAL PROVISIONS

13.1 This Agreement constitutes the entire understanding.
13.2 Amendments require written agreement.
13.3 Neither party may assign without consent.
13.4 Waiver of breach does not waive future breaches.

IN WITNESS WHEREOF:

CLIENT:
Signature: _____________________
Name: {{clientSignatory}}
Title: {{clientSignatoryTitle}}
Date: {{date}}

CONSULTANT:
Signature: _____________________
Name: {{consultantName}}
Date: {{date}}`,

    ar: `اتفاقية استشارات

التاريخ: {{date}}
رقم الاتفاقية: {{agreementNumber}}

بين:

{{clientName}} ("العميل")
السجل التجاري: {{clientRegistration}}
العنوان: {{clientAddress}}

و:

{{consultantName}} ("المستشار")
{{consultantIdType}}: {{consultantId}}
العنوان: {{consultantAddress}}

1. التعاقد

1.1 يتعاقد العميل بموجب هذا مع المستشار لتقديم الخدمات التالية:
{{servicesDescription}}

1.2 يقبل المستشار هذا التعاقد وفقاً للشروط المنصوص عليها.

2. المدة

2.1 تبدأ هذه الاتفاقية في {{startDate}} وتستمر حتى {{endDate}}، ما لم تُنهَ قبل ذلك.

2.2 يجوز تجديد هذه الاتفاقية باتفاق كتابي متبادل.

3. نطاق الخدمات

3.1 يتعهد المستشار بما يلي:
{{scopeOfServices}}

3.2 المخرجات:
{{deliverables}}

3.3 الجدول الزمني:
{{timeline}}

4. الأتعاب والدفع

4.1 يدفع العميل للمستشار:
{{feeStructure}}

4.2 شروط الدفع: {{paymentTerms}}

4.3 المصاريف: {{expensePolicy}}

4.4 تُقدم الفواتير {{invoiceFrequency}} وتُدفع خلال {{paymentDays}} يوماً.

5. المقاول المستقل

5.1 المستشار مقاول مستقل وليس موظفاً.

5.2 المستشار مسؤول عن ضرائبه وتأمينه.

5.3 يجوز للمستشار التعامل مع عملاء آخرين، مع مراعاة التزامات السرية.

6. السرية

6.1 يحافظ المستشار على السرية التامة لجميع معلومات العميل.

6.2 تشمل المعلومات السرية:
{{confidentialInfo}}

6.3 يستمر هذا الالتزام بعد الإنهاء لمدة {{confidentialityPeriod}}.

7. الملكية الفكرية

7.1 ناتج العمل: {{ipOwnership}}

7.2 تبقى الملكية الفكرية السابقة مع مالكها الأصلي.

7.3 يمنح المستشار العميل {{licenseTerms}}.

8. عدم الاستقطاب

8.1 خلال المدة ولمدة {{nonSolicitPeriod}} بعدها، لا يجوز للمستشار استقطاب موظفي أو عملاء العميل.

9. الإقرارات والضمانات

9.1 يقر المستشار ويضمن:
- امتلاك المهارات والمؤهلات اللازمة
- أداء الخدمات بشكل مهني
- عدم وجود تضارب في المصالح
- الامتثال للقوانين المعمول بها

10. المسؤولية والتعويض

10.1 تقتصر مسؤولية المستشار على {{liabilityLimit}}.

10.2 يعوض كل طرف الآخر عن المطالبات الناشئة عن الإخلال.

11. الإنهاء

11.1 يجوز لأي طرف الإنهاء بإشعار كتابي مدته {{noticePeriod}}.

11.2 يجوز للعميل الإنهاء فوراً في حالة:
{{immediateTerminationCauses}}

11.3 عند الإنهاء:
{{terminationObligations}}

12. تسوية النزاعات

12.1 يتم حل النزاعات عن طريق {{disputeResolution}}.

12.2 القانون الحاكم: {{governingLaw}}

13. أحكام عامة

13.1 تمثل هذه الاتفاقية الاتفاق الكامل.
13.2 تتطلب التعديلات اتفاقاً كتابياً.
13.3 لا يجوز لأي طرف التنازل دون موافقة.
13.4 التنازل عن الإخلال لا يعني التنازل عن الإخلالات المستقبلية.

وإثباتاً لما تقدم:

العميل:
التوقيع: _____________________
الاسم: {{clientSignatory}}
المنصب: {{clientSignatoryTitle}}
التاريخ: {{date}}

المستشار:
التوقيع: _____________________
الاسم: {{consultantName}}
التاريخ: {{date}}`
  },

  termination_letter: {
    en: `EMPLOYMENT TERMINATION LETTER

Date: {{date}}
Reference: {{referenceNumber}}

{{employeeName}}
{{employeeAddress}}

Dear {{employeeName}},

Subject: Termination of Employment

This letter is to formally notify you that your employment with {{companyName}} (the "Company") will be terminated effective {{terminationDate}}.

1. REASON FOR TERMINATION

{{terminationReason}}

2. FINAL WORKING DAY

Your last day of work will be {{lastWorkingDay}}. You are {{noticeRequirement}}.

3. NOTICE PERIOD

{{noticePeriodDetails}}

4. FINAL SETTLEMENT

Your final settlement will include:

a) Outstanding Salary: {{outstandingSalary}}
b) Accrued Annual Leave: {{accruedLeave}} days ({{accruedLeaveAmount}})
c) End of Service Gratuity: {{gratuityAmount}}
   - Service period: {{servicePeriod}}
   - Calculation per UAE Labour Law Article 51
d) Other entitlements: {{otherEntitlements}}

Total Settlement Amount: {{currency}} {{totalSettlement}}

Payment will be processed within {{paymentTimeline}} after clearance completion.

5. COMPANY PROPERTY

Please return all company property by {{returnDate}}:
{{companyPropertyList}}

6. CLEARANCE PROCESS

You are required to complete the exit clearance process:
{{clearanceProcess}}

7. FINAL DOCUMENTATION

The following documents will be provided upon clearance:
- Experience/Service Certificate
- Salary Certificate (if required)
- Visa Cancellation documentation

8. CONFIDENTIALITY

You remain bound by the confidentiality obligations in your employment agreement. You must not disclose any confidential information obtained during your employment.

9. NON-COMPETE/NON-SOLICITATION

{{nonCompeteClause}}

10. EXIT INTERVIEW

{{exitInterviewDetails}}

11. REFERENCES

{{referencePolicy}}

12. CONTACT INFORMATION

For any queries regarding your termination or final settlement, please contact:
{{hrContactDetails}}

Please sign and return one copy of this letter to acknowledge receipt and acceptance of the terms.

We thank you for your service to {{companyName}} and wish you well in your future endeavors.

Yours sincerely,

_____________________
{{signatoryName}}
{{signatoryTitle}}
{{companyName}}

ACKNOWLEDGEMENT

I, {{employeeName}}, acknowledge receipt of this termination letter and understand its contents.

Signature: _____________________
Name: {{employeeName}}
Date: _____________________
Employee ID: {{employeeId}}`,

    ar: `خطاب إنهاء خدمات

التاريخ: {{date}}
المرجع: {{referenceNumber}}

{{employeeName}}
{{employeeAddress}}

عزيزي/عزيزتي {{employeeName}}،

الموضوع: إنهاء خدمات

نحيطكم علماً بموجب هذا الخطاب بأن خدماتكم لدى {{companyName}} ("الشركة") سيتم إنهاؤها اعتباراً من {{terminationDate}}.

1. سبب الإنهاء

{{terminationReason}}

2. آخر يوم عمل

سيكون آخر يوم عمل لك هو {{lastWorkingDay}}. {{noticeRequirement}}.

3. فترة الإشعار

{{noticePeriodDetails}}

4. التسوية النهائية

تشمل تسويتك النهائية ما يلي:

أ) الراتب المستحق: {{outstandingSalary}}
ب) الإجازات السنوية المستحقة: {{accruedLeave}} يوماً ({{accruedLeaveAmount}})
ج) مكافأة نهاية الخدمة: {{gratuityAmount}}
   - فترة الخدمة: {{servicePeriod}}
   - يُحسب وفقاً للمادة 51 من قانون العمل الإماراتي
د) مستحقات أخرى: {{otherEntitlements}}

إجمالي مبلغ التسوية: {{totalSettlement}} {{currency}}

سيتم صرف المبلغ خلال {{paymentTimeline}} بعد إتمام المخالصة.

5. ممتلكات الشركة

يرجى إرجاع جميع ممتلكات الشركة بحلول {{returnDate}}:
{{companyPropertyList}}

6. إجراءات المخالصة

يُطلب منك إتمام إجراءات مخالصة الخروج:
{{clearanceProcess}}

7. المستندات النهائية

سيتم تقديم المستندات التالية عند إتمام المخالصة:
- شهادة خبرة/خدمة
- شهادة راتب (عند الطلب)
- وثائق إلغاء التأشيرة

8. السرية

تظل ملتزماً بواجبات السرية الواردة في عقد عملك. يجب عدم الإفصاح عن أي معلومات سرية تم الحصول عليها خلال فترة عملك.

9. عدم المنافسة/عدم الاستقطاب

{{nonCompeteClause}}

10. مقابلة الخروج

{{exitInterviewDetails}}

11. المراجع

{{referencePolicy}}

12. معلومات الاتصال

لأي استفسارات بخصوص إنهاء خدماتك أو التسوية النهائية، يرجى التواصل مع:
{{hrContactDetails}}

يرجى التوقيع وإرجاع نسخة من هذا الخطاب للإقرار بالاستلام وقبول الشروط.

نشكرك على خدمتك في {{companyName}} ونتمنى لك التوفيق في مساعيك المستقبلية.

مع خالص التحية،

_____________________
{{signatoryName}}
{{signatoryTitle}}
{{companyName}}

إقرار بالاستلام

أقر أنا، {{employeeName}}، باستلام خطاب إنهاء الخدمات هذا وأفهم محتوياته.

التوقيع: _____________________
الاسم: {{employeeName}}
التاريخ: _____________________
الرقم الوظيفي: {{employeeId}}`
  },

  loan_agreement: {
    en: `LOAN AGREEMENT

Date: {{date}}
Loan Reference: {{loanReference}}

BETWEEN:

{{lenderName}} (the "Lender")
{{lenderIdType}}: {{lenderId}}
Address: {{lenderAddress}}
Contact: {{lenderContact}}

AND:

{{borrowerName}} (the "Borrower")
{{borrowerIdType}}: {{borrowerId}}
Address: {{borrowerAddress}}
Contact: {{borrowerContact}}

1. LOAN DETAILS

1.1 Principal Amount: {{currency}} {{principalAmount}}
1.2 Purpose of Loan: {{loanPurpose}}
1.3 Loan Type: {{loanType}}

2. INTEREST

2.1 Interest Rate: {{interestRate}}% per annum
2.2 Interest Calculation: {{interestCalculation}}
2.3 Total Interest: {{currency}} {{totalInterest}}

3. TOTAL REPAYMENT

3.1 Total Amount Due: {{currency}} {{totalRepayment}}
3.2 (Principal + Interest)

4. REPAYMENT TERMS

4.1 Repayment Period: {{repaymentPeriod}}
4.2 Number of Installments: {{numberOfInstallments}}
4.3 Installment Amount: {{currency}} {{installmentAmount}}
4.4 Payment Schedule:
{{paymentSchedule}}

4.5 Payment Method: {{paymentMethod}}
4.6 Payment Account: {{paymentAccount}}

5. DISBURSEMENT

5.1 The Lender shall disburse the loan amount to:
Bank: {{borrowerBank}}
Account: {{borrowerAccount}}
IBAN: {{borrowerIBAN}}

5.2 Disbursement Date: {{disbursementDate}}

6. LATE PAYMENT

6.1 Late Payment Fee: {{lateFee}} per day/month of delay
6.2 Grace Period: {{gracePeriod}} days
6.3 After {{defaultDays}} days of non-payment, the loan shall be in default.

7. PREPAYMENT

7.1 The Borrower may prepay the loan in full or in part.
7.2 Prepayment Fee: {{prepaymentFee}}
7.3 Upon prepayment, interest shall be calculated on the actual loan period.

8. SECURITY/COLLATERAL

{{securityDetails}}

9. REPRESENTATIONS AND WARRANTIES

9.1 The Borrower represents and warrants:
- Authority to enter into this Agreement
- Accuracy of information provided
- No existing defaults on other obligations
- No pending litigation affecting ability to repay

10. COVENANTS

10.1 The Borrower agrees to:
- Use the loan only for the stated purpose
- Provide financial information upon request
- Notify Lender of any material changes
- Maintain adequate insurance (if applicable)

11. EVENTS OF DEFAULT

11.1 The following shall constitute events of default:
- Failure to make any payment when due
- Breach of any term of this Agreement
- False representation or warranty
- Bankruptcy or insolvency
- Deterioration of creditworthiness

12. REMEDIES UPON DEFAULT

12.1 Upon default, the Lender may:
- Declare all amounts immediately due
- Enforce security/collateral
- Pursue legal remedies
- Report to credit bureaus

13. INDEMNIFICATION

13.1 The Borrower shall indemnify the Lender against all costs and expenses arising from default or breach.

14. DISPUTE RESOLUTION

14.1 Disputes shall be resolved by {{disputeResolution}}.
14.2 Governing Law: {{governingLaw}}
14.3 Jurisdiction: {{jurisdiction}}

15. NOTICES

All notices shall be in writing and sent to the addresses above.

16. GENERAL PROVISIONS

16.1 This Agreement constitutes the entire understanding.
16.2 Amendments require written agreement.
16.3 Invalidity of any provision does not affect others.
16.4 No waiver unless in writing.

IN WITNESS WHEREOF:

LENDER:
Signature: _____________________
Name: {{lenderName}}
Date: {{date}}

BORROWER:
Signature: _____________________
Name: {{borrowerName}}
Date: {{date}}

WITNESSES:

1. Signature: _____________________
   Name: {{witness1Name}}
   ID: {{witness1Id}}

2. Signature: _____________________
   Name: {{witness2Name}}
   ID: {{witness2Id}}`,

    ar: `اتفاقية قرض

التاريخ: {{date}}
مرجع القرض: {{loanReference}}

بين:

{{lenderName}} ("المُقرض")
{{lenderIdType}}: {{lenderId}}
العنوان: {{lenderAddress}}
الاتصال: {{lenderContact}}

و:

{{borrowerName}} ("المُقترض")
{{borrowerIdType}}: {{borrowerId}}
العنوان: {{borrowerAddress}}
الاتصال: {{borrowerContact}}

1. تفاصيل القرض

1.1 المبلغ الأساسي: {{principalAmount}} {{currency}}
1.2 الغرض من القرض: {{loanPurpose}}
1.3 نوع القرض: {{loanType}}

2. الفائدة

2.1 معدل الفائدة: {{interestRate}}% سنوياً
2.2 طريقة حساب الفائدة: {{interestCalculation}}
2.3 إجمالي الفائدة: {{totalInterest}} {{currency}}

3. إجمالي السداد

3.1 إجمالي المبلغ المستحق: {{totalRepayment}} {{currency}}
3.2 (الأصل + الفائدة)

4. شروط السداد

4.1 فترة السداد: {{repaymentPeriod}}
4.2 عدد الأقساط: {{numberOfInstallments}}
4.3 قيمة القسط: {{installmentAmount}} {{currency}}
4.4 جدول الدفع:
{{paymentSchedule}}

4.5 طريقة الدفع: {{paymentMethod}}
4.6 حساب الدفع: {{paymentAccount}}

5. صرف القرض

5.1 يقوم المُقرض بصرف مبلغ القرض إلى:
البنك: {{borrowerBank}}
الحساب: {{borrowerAccount}}
رقم الآيبان: {{borrowerIBAN}}

5.2 تاريخ الصرف: {{disbursementDate}}

6. التأخر في السداد

6.1 رسوم التأخير: {{lateFee}} عن كل يوم/شهر تأخير
6.2 فترة السماح: {{gracePeriod}} يوماً
6.3 بعد {{defaultDays}} يوماً من عدم الدفع، يُعتبر القرض متعثراً.

7. السداد المبكر

7.1 يجوز للمُقترض السداد المبكر للقرض كلياً أو جزئياً.
7.2 رسوم السداد المبكر: {{prepaymentFee}}
7.3 عند السداد المبكر، تُحسب الفائدة على فترة القرض الفعلية.

8. الضمانات

{{securityDetails}}

9. الإقرارات والضمانات

9.1 يُقر المُقترض ويضمن:
- الصلاحية للدخول في هذه الاتفاقية
- دقة المعلومات المقدمة
- عدم وجود تعثرات حالية في التزامات أخرى
- عدم وجود دعاوى قضائية معلقة تؤثر على القدرة على السداد

10. التعهدات

10.1 يتعهد المُقترض بما يلي:
- استخدام القرض فقط للغرض المذكور
- تقديم المعلومات المالية عند الطلب
- إخطار المُقرض بأي تغييرات جوهرية
- الاحتفاظ بتأمين مناسب (إن وُجد)

11. حالات التعثر

11.1 تُعتبر الحالات التالية حالات تعثر:
- عدم سداد أي دفعة عند استحقاقها
- الإخلال بأي شرط من شروط هذه الاتفاقية
- الإقرارات أو الضمانات الكاذبة
- الإفلاس أو الإعسار
- تدهور الجدارة الائتمانية

12. سبل الانتصاف عند التعثر

12.1 عند التعثر، يجوز للمُقرض:
- إعلان استحقاق جميع المبالغ فوراً
- تنفيذ الضمانات
- اللجوء إلى سبل الانتصاف القانونية
- الإبلاغ إلى مكاتب الائتمان

13. التعويض

13.1 يعوض المُقترض المُقرض عن جميع التكاليف والمصاريف الناشئة عن التعثر أو الإخلال.

14. تسوية النزاعات

14.1 يتم حل النزاعات عن طريق {{disputeResolution}}.
14.2 القانون الحاكم: {{governingLaw}}
14.3 الاختصاص القضائي: {{jurisdiction}}

15. الإشعارات

جميع الإشعارات تكون كتابية وتُرسل إلى العناوين المذكورة أعلاه.

16. أحكام عامة

16.1 تمثل هذه الاتفاقية الاتفاق الكامل.
16.2 تتطلب التعديلات اتفاقاً كتابياً.
16.3 بطلان أي حكم لا يؤثر على الأحكام الأخرى.
16.4 لا يُعتبر تنازلاً إلا إذا كان كتابياً.

وإثباتاً لما تقدم:

المُقرض:
التوقيع: _____________________
الاسم: {{lenderName}}
التاريخ: {{date}}

المُقترض:
التوقيع: _____________________
الاسم: {{borrowerName}}
التاريخ: {{date}}

الشهود:

1. التوقيع: _____________________
   الاسم: {{witness1Name}}
   الهوية: {{witness1Id}}

2. التوقيع: _____________________
   الاسم: {{witness2Name}}
   الهوية: {{witness2Id}}`
  },

  purchase_agreement: {
    en: `PURCHASE AGREEMENT

Agreement No: {{agreementNumber}}
Date: {{date}}

BETWEEN:

{{sellerName}} (the "Seller")
{{sellerIdType}}: {{sellerId}}
Address: {{sellerAddress}}
Contact: {{sellerContact}}

AND:

{{buyerName}} (the "Buyer")
{{buyerIdType}}: {{buyerId}}
Address: {{buyerAddress}}
Contact: {{buyerContact}}

1. ITEM DESCRIPTION

The Seller agrees to sell and the Buyer agrees to purchase:

Item: {{itemName}}
Description: {{itemDescription}}
Serial/ID Number: {{itemSerialNumber}}
Condition: {{itemCondition}}
{{additionalSpecs}}

2. PURCHASE PRICE

2.1 Total Purchase Price: {{currency}} {{purchasePrice}}
2.2 Payment Schedule:
{{paymentSchedule}}

3. DEPOSIT

3.1 Deposit Amount: {{currency}} {{depositAmount}}
3.2 Deposit Due Date: {{depositDueDate}}
3.3 Deposit is {{depositRefundable}}.

4. BALANCE PAYMENT

4.1 Balance Due: {{currency}} {{balanceAmount}}
4.2 Due Date: {{balanceDueDate}}
4.3 Payment Method: {{paymentMethod}}

5. DELIVERY/TRANSFER

5.1 Delivery Date: {{deliveryDate}}
5.2 Delivery Location: {{deliveryLocation}}
5.3 Delivery Costs: {{deliveryCosts}}
5.4 Risk transfers to Buyer upon {{riskTransferPoint}}.

6. INSPECTION

6.1 The Buyer has {{inspectionPeriod}} to inspect the item.
6.2 Any defects must be reported in writing within this period.

7. WARRANTIES

7.1 The Seller warrants:
- Good and marketable title
- Free from liens and encumbrances
- Authority to sell
- {{additionalWarranties}}

7.2 Warranty Period: {{warrantyPeriod}}

8. AS-IS CLAUSE (if applicable)

{{asIsClause}}

9. TITLE TRANSFER

9.1 Title shall pass to the Buyer upon {{titleTransferCondition}}.
9.2 The Seller shall provide all necessary documents for title transfer.

10. REPRESENTATIONS

10.1 The Seller represents:
{{sellerRepresentations}}

10.2 The Buyer represents:
{{buyerRepresentations}}

11. DEFAULT

11.1 Buyer Default: {{buyerDefaultConsequences}}
11.2 Seller Default: {{sellerDefaultConsequences}}

12. DISPUTE RESOLUTION

12.1 Disputes shall be resolved by {{disputeResolution}}.
12.2 Governing Law: {{governingLaw}}

13. ENTIRE AGREEMENT

This Agreement constitutes the entire understanding between the parties.

IN WITNESS WHEREOF:

SELLER:
Signature: _____________________
Name: {{sellerName}}
Date: {{date}}

BUYER:
Signature: _____________________
Name: {{buyerName}}
Date: {{date}}

WITNESS:
Signature: _____________________
Name: {{witnessName}}
ID: {{witnessId}}`,

    ar: `اتفاقية شراء

رقم الاتفاقية: {{agreementNumber}}
التاريخ: {{date}}

بين:

{{sellerName}} ("البائع")
{{sellerIdType}}: {{sellerId}}
العنوان: {{sellerAddress}}
الاتصال: {{sellerContact}}

و:

{{buyerName}} ("المشتري")
{{buyerIdType}}: {{buyerId}}
العنوان: {{buyerAddress}}
الاتصال: {{buyerContact}}

1. وصف البند

يوافق البائع على بيع ويوافق المشتري على شراء:

البند: {{itemName}}
الوصف: {{itemDescription}}
الرقم التسلسلي/التعريفي: {{itemSerialNumber}}
الحالة: {{itemCondition}}
{{additionalSpecs}}

2. سعر الشراء

2.1 إجمالي سعر الشراء: {{purchasePrice}} {{currency}}
2.2 جدول الدفع:
{{paymentSchedule}}

3. العربون

3.1 مبلغ العربون: {{depositAmount}} {{currency}}
3.2 تاريخ استحقاق العربون: {{depositDueDate}}
3.3 العربون {{depositRefundable}}.

4. الرصيد المتبقي

4.1 الرصيد المستحق: {{balanceAmount}} {{currency}}
4.2 تاريخ الاستحقاق: {{balanceDueDate}}
4.3 طريقة الدفع: {{paymentMethod}}

5. التسليم/النقل

5.1 تاريخ التسليم: {{deliveryDate}}
5.2 مكان التسليم: {{deliveryLocation}}
5.3 تكاليف التسليم: {{deliveryCosts}}
5.4 تنتقل المخاطر إلى المشتري عند {{riskTransferPoint}}.

6. الفحص

6.1 للمشتري {{inspectionPeriod}} لفحص البند.
6.2 يجب الإبلاغ عن أي عيوب كتابياً خلال هذه الفترة.

7. الضمانات

7.1 يضمن البائع:
- ملكية صحيحة وقابلة للتسويق
- خلو من الرهونات والأعباء
- الصلاحية للبيع
- {{additionalWarranties}}

7.2 فترة الضمان: {{warrantyPeriod}}

8. شرط "كما هو" (إن وُجد)

{{asIsClause}}

9. نقل الملكية

9.1 تنتقل الملكية إلى المشتري عند {{titleTransferCondition}}.
9.2 يقدم البائع جميع الوثائق اللازمة لنقل الملكية.

10. الإقرارات

10.1 يُقر البائع بما يلي:
{{sellerRepresentations}}

10.2 يُقر المشتري بما يلي:
{{buyerRepresentations}}

11. التعثر

11.1 تعثر المشتري: {{buyerDefaultConsequences}}
11.2 تعثر البائع: {{sellerDefaultConsequences}}

12. تسوية النزاعات

12.1 يتم حل النزاعات عن طريق {{disputeResolution}}.
12.2 القانون الحاكم: {{governingLaw}}

13. الاتفاق الكامل

تمثل هذه الاتفاقية الاتفاق الكامل بين الطرفين.

وإثباتاً لما تقدم:

البائع:
التوقيع: _____________________
الاسم: {{sellerName}}
التاريخ: {{date}}

المشتري:
التوقيع: _____________________
الاسم: {{buyerName}}
التاريخ: {{date}}

الشاهد:
التوقيع: _____________________
الاسم: {{witnessName}}
الهوية: {{witnessId}}`
  }
};

// Template metadata for the additional templates
export const additionalTemplateMetadata = {
  power_of_attorney: {
    id: 'power_of_attorney',
    name: 'Power of Attorney',
    nameAr: 'توكيل',
    nameUr: 'مختار نامہ',
    description: 'General or specific power of attorney document',
    descriptionAr: 'وثيقة توكيل عام أو خاص',
    descriptionUr: 'عمومی یا خاص مختار نامہ دستاویز',
    category: 'general',
    requiredFields: [
      'principalName', 'principalAddress', 'idType', 'idNumber',
      'agentName', 'agentIdType', 'agentIdNumber', 'agentAddress',
      'authorityScope', 'effectiveDate', 'expiryDate'
    ]
  },
  sales_contract: {
    id: 'sales_contract',
    name: 'Sales Contract',
    nameAr: 'عقد بيع',
    nameUr: 'فروخت کا معاہدہ',
    description: 'Contract for sale of goods or items',
    descriptionAr: 'عقد لبيع السلع أو البنود',
    descriptionUr: 'سامان یا اشیاء کی فروخت کا معاہدہ',
    category: 'general',
    requiredFields: [
      'sellerName', 'sellerId', 'buyerName', 'buyerId',
      'itemDescription', 'totalPrice', 'deliveryDate'
    ]
  },
  memorandum_of_understanding: {
    id: 'memorandum_of_understanding',
    name: 'Memorandum of Understanding',
    nameAr: 'مذكرة تفاهم',
    nameUr: 'مفاہمت کی یادداشت',
    description: 'MOU for business collaboration',
    descriptionAr: 'مذكرة تفاهم للتعاون التجاري',
    descriptionUr: 'کاروباری تعاون کے لیے ایم او یو',
    category: 'corporate',
    requiredFields: [
      'party1Name', 'party2Name', 'purpose', 'cooperationAreas',
      'effectiveDate', 'duration'
    ]
  },
  partnership_agreement: {
    id: 'partnership_agreement',
    name: 'Partnership Agreement',
    nameAr: 'اتفاقية شراكة',
    nameUr: 'شراکت داری کا معاہدہ',
    description: 'Agreement for business partnership',
    descriptionAr: 'اتفاقية للشراكة التجارية',
    descriptionUr: 'کاروباری شراکت داری کا معاہدہ',
    category: 'corporate',
    requiredFields: [
      'partnershipName', 'partner1Name', 'partner2Name',
      'businessPurpose', 'capitalContributions', 'profitAllocation'
    ]
  },
  consultancy_agreement: {
    id: 'consultancy_agreement',
    name: 'Consultancy Agreement',
    nameAr: 'اتفاقية استشارات',
    nameUr: 'مشاورتی معاہدہ',
    description: 'Agreement for consultancy services',
    descriptionAr: 'اتفاقية لخدمات الاستشارات',
    descriptionUr: 'مشاورتی خدمات کا معاہدہ',
    category: 'services',
    requiredFields: [
      'clientName', 'consultantName', 'servicesDescription',
      'startDate', 'endDate', 'feeStructure'
    ]
  },
  termination_letter: {
    id: 'termination_letter',
    name: 'Termination Letter',
    nameAr: 'خطاب إنهاء خدمات',
    nameUr: 'برطرفی کا خط',
    description: 'Employment termination notification',
    descriptionAr: 'إشعار إنهاء خدمات الموظف',
    descriptionUr: 'ملازمت ختم کرنے کی اطلاع',
    category: 'employment',
    requiredFields: [
      'employeeName', 'companyName', 'terminationDate',
      'terminationReason', 'lastWorkingDay', 'totalSettlement'
    ]
  },
  loan_agreement: {
    id: 'loan_agreement',
    name: 'Loan Agreement',
    nameAr: 'اتفاقية قرض',
    nameUr: 'قرض کا معاہدہ',
    description: 'Personal or business loan agreement',
    descriptionAr: 'اتفاقية قرض شخصي أو تجاري',
    descriptionUr: 'ذاتی یا کاروباری قرض کا معاہدہ',
    category: 'general',
    requiredFields: [
      'lenderName', 'borrowerName', 'principalAmount',
      'interestRate', 'repaymentPeriod', 'installmentAmount'
    ]
  },
  purchase_agreement: {
    id: 'purchase_agreement',
    name: 'Purchase Agreement',
    nameAr: 'اتفاقية شراء',
    nameUr: 'خریداری کا معاہدہ',
    description: 'Agreement for purchasing items or property',
    descriptionAr: 'اتفاقية لشراء الأصناف أو الممتلكات',
    descriptionUr: 'اشیاء یا جائیداد کی خریداری کا معاہدہ',
    category: 'general',
    requiredFields: [
      'sellerName', 'buyerName', 'itemName', 'purchasePrice',
      'depositAmount', 'deliveryDate'
    ]
  }
};
