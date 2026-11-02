import type { SeedModuleBundle } from './seedCurriculum';

/**
 * Gaprito (গ্যাপ্রিটো ৫০ মি.গ্রা. — Itopride Hydrochloride INN 50 mg Tablet)
 * Novatek Pharmaceuticals Ltd. — Complete Bangla Multimedia Training Module
 * & 25-Question (100-Mark) Certification Exam.
 */
export const GAPRITO_SEED_BUNDLE: SeedModuleBundle = {
  product: {
    id: 'prod_gaprito_50',
    brandName: 'Gaprito (গ্যাপ্রিটো ৫০ মি.গ্রা.)',
    genericComposition: 'Itopride Hydrochloride INN 50 mg Film-Coated Tablet',
    therapeuticClass: 'Gastroenterology',
    summary:
      'ফংশনাল ডিসপেপসিয়া ও জিআই মটিলিটি সমস্যার আধুনিক ডুয়াল-অ্যাকশন গ্যাস্ট্রোপ্রোকাইনেটিক (D2 ব্লকার + AChE ইনহিবিটর)—"Dual Action, Smooth Digestion"।',
    indications:
      'ফংশনাল ডিসপেপসিয়া ও ক্রনিক গ্যাস্ট্রাইটিসজনিত জিআই উপসর্গ: খাবার পর পেট ভরা ভাব (gastric fullness), অল্প খেলেই পেট ভরে যাওয়া (early satiety), পেট ফাঁপা (bloating), উপরের পেটে অস্বস্তি/ব্যথা, অরুচি (anorexia), হার্টবার্ন এবং বমিভাব ও বমি।',
    dosageGuidance:
      'প্রাপ্তবয়স্ক মাত্রা: ৫০ মি.গ্রা. (১টি ট্যাবলেট) দিনে ৩ বার (দৈনিক ১৫০ মি.গ্রা.), খাবারের প্রায় ৩০ মিনিট আগে সেব্য। রোগীর বয়স ও উপসর্গ অনুসারে চিকিৎসক মাত্রা সমন্বয় করতে পারেন।',
    keySellingPoints:
      '১. ডুয়াল মেকানিজম: পেরিফেরাল D2 রিসেপ্টর ব্লক + AChE ইনহিবিশন = বেশি অ্যাসিটাইলকোলিন ও উন্নত গ্যাস্ট্রিক এম্পটিয়িং।\n২. দ্রুত ও কার্যকর: ৪৮ মিনিটে কাজ শুরু (ডমপেরিডোন ৭২ মিনিট) এবং ৮১% উপসর্গ উপশম (ডমপেরিডোন ৭০%)।\n৩. PPI-এর সাথে শ্রেষ্ঠ Add-on ও উন্নত নিরাপত্তা: BBB অতিক্রম করে না, স্টাডিতে QTc প্রলংগেশন নেই এবং FMO পথে বিপাক হওয়ায় ওষুধের মিথস্ক্রিয়া কম।',
    coverImageKey: 'gaprito_pack',
    passingPercentage: 80,
    examDurationMinutes: 30,
    resourceCount: 6,
    questionCount: 25,
    status: 'published',
  },
  resources: [
    {
      id: 'res_gaprito_01',
      productId: 'prod_gaprito_50',
      productStatus: 'published',
      orderIndex: 0,
      resourceType: 'text',
      title: 'প্রোডাক্ট পরিচিতি, ব্র্যান্ড নামের ব্যাখ্যা (Ga-Pri-Ito) ও 5D স্মৃতি-মানচিত্র',
      estimatedMinutes: 5,
      bodyText: `গ্যাপ্রিটো (Gaprito®) হলো Novatek Pharmaceuticals Ltd. (ISO 9001:2015 ও GMP Certified)-এর আধুনিক gastroprokinetic প্রস্তুতি, যার প্রতিটি ফিল্ম-কোটেড ট্যাবলেটে রয়েছে Itopride Hydrochloride INN 50 mg।

• এক লাইনের পজিশনিং (Positioning):
"Functional dyspepsia-র উপসর্গে dual-action prokinetic (D2 antagonism + acetylcholinesterase inhibition)।"

• ব্র্যান্ড ট্যাগলাইন (Tagline):
"Dual Action, Smooth Digestion।"

• শক্তি, প্যাকিং ও সংরক্ষণ (Strength, Pack & Storage):
- শক্তি: ৫০ মি.গ্রা. ফিল্ম-কোটেড ট্যাবলেট।
- প্যাক সাইজ: প্রতি বক্সে ৩০টি ট্যাবলেট (৩ × ১০ ব্লিস্টার প্যাক)।
- সংরক্ষণ: ৩০°C তাপমাত্রার নিচে, শুকনো ও আলোমুক্ত স্থানে রাখুন এবং শিশুদের নাগালের বাইরে রাখুন।

• ব্র্যান্ড নাম "Gaprito" কেন? (Brand Name Justification):
- Ga = Gastro (পাকস্থলী ও পরিপাকতন্ত্র এলাকা নির্দেশ করে)
- Pri = Prokinetic (ওষুধের ক্লাস এবং Itopride-এর "pri" অংশ নির্দেশ করে)
- Ito / To = Itopride জেনেরিক নামের "ito" অংশ থেকে নেওয়া
ফলে নামটি জেনেরিক মলিকুলের সাথে ধ্বনিগত সংযোগ তৈরি করে, বাংলা ও ইংরেজি উভয় ভাষায় উচ্চারণ সহজ এবং প্রেসক্রিপশনে দ্রুত লেখা যায়। এটি কোনো অতিরঞ্জিত দাবি করে না, তাই সম্পূর্ণ প্রোমোশনাল নিয়মের মধ্যে থাকে।

• ১০ সেকেন্ডের স্মৃতি-মানচিত্র (5D Memory Map):
১. Drug: Itopride HCl 50 mg
২. Dual: D2 antagonist + AChE inhibitor
৩. Disease: Functional dyspepsia
৪. Distinct symptoms: খাবার পরের ভরা ভাব (postprandial fullness), early satiety
৫. Dose: ৫০ মি.গ্রা. দিনে ৩ বার, খাবারের ৩০ মিনিট আগে।`,
      mediaUrl: '',
      mediaCaption: '',
      clinicalTakeaway:
        'চেম্বারে ঢোকার আগে ১০ সেকেন্ডের 5D (Drug, Dual, Disease, Distinct symptoms, Dose) মনে করুন এবং ব্র্যান্ড স্লোগান "Dual Action, Smooth Digestion" স্পষ্টভাবে উপস্থাপন করুন।',
    },
    {
      id: 'res_gaprito_02',
      productId: 'prod_gaprito_50',
      productStatus: 'published',
      orderIndex: 1,
      resourceType: 'image',
      title: 'এক-পাতার ইনফোগ্রাফিক ট্রেনিং শিট: FAB বিশ্লেষণ, টার্গেট চিকিৎসক ও বাজার চিত্র',
      estimatedMinutes: 6,
      bodyText: `উপরের অফিসিয়াল ইনফোগ্রাফিক ট্রেনিং শিটে গ্যাপ্রিটো-র সম্পূর্ণ মাঠপর্যায়ের তথ্য এক নজরে সাজানো হয়েছে:

• Feature – Advantage – Clinical Benefit (FAB):
১. D2 receptor antagonism → ডোপামিনের বাধাদানকারী প্রভাব কমায় → কোলিনার্জিক কার্যকারিতা ও GI motility বাড়ায়।
২. Acetylcholinesterase (AChE) inhibition → অ্যাসিটাইলকোলিন ভাঙন রোধ করে → পাকস্থলী দ্রুত খালি হওয়া (gastric emptying) ও উপরের পরিপাকতন্ত্রের সঞ্চালন উন্নত করে।
৩. Dual mechanism → একই মলিকুলে দুটি পরিপূরক পথ → একক মেকানিজমের চেয়ে অধিকতর কার্যকর উপসর্গ উপশম।
৪. Prokinetic action → পাকস্থলী ও ডিওডেনামের সমন্বিত সংকোচন বাড়ায় → খাবার পরের পেট ভরা ভাব, early satiety, পেট ফাঁপা ও বমিভাব দূর করে।
৫. Favorable tolerability profile → কম CNS প্রবেশ ও স্টাডিতে উল্লেখযোগ্য QTc প্রলংগেশন নেই → উপযুক্ত রোগীদের দীর্ঘমেয়াদি (৫২ সপ্তাহ পর্যন্ত) ব্যবস্থাপনায় নির্ভরযোগ্য।

• টার্গেট প্রেসক্রাইবার (Potential Prescribers):
Gastroenterologist, Internal Medicine Physician, Family Physician, General Practitioner (GP), Diabetologist, Endocrinologist, Cardiologist, Geriatric Specialist, Gynecologist, ENT Specialist, General Surgeon, PC, DMF ও SACMO।

• বাজারের শীর্ষ প্রতিদ্বন্দ্বী ব্র্যান্ড (Incumbent Brands):
- Itopride 50 mg (Top 5): Itokine (Everest), Peritop (Beacon), Itopa (Aristo), Itogut (ACI), Dizmo (Square)।
- Domperidone 10 mg (Top 5): Omidon (Incepta), Don-A (ACME), Deflux (Beximco), Motigut (Square), Efodio (Radiant)।`,
      mediaUrl: 'gaprito_sheet',
      mediaCaption:
        'চিত্র ১ — Novatek Gaprito® (Itopride HCl 50 mg) অফিসিয়াল এক-পাতার মাস্টার ট্রেনিং ইনফোগ্রাফিক।',
      clinicalTakeaway:
        'ডমপেরিডোন ব্যবহারকারী চিকিৎসকদের কাছে কার্ডিয়াক ও সিএনএস নিরাপত্তার সুবিধা এবং ডুয়াল মেকানিজমের বাড়তি কার্যকারিতা তুলে ধরুন।',
    },
    {
      id: 'res_gaprito_03',
      productId: 'prod_gaprito_50',
      productStatus: 'published',
      orderIndex: 2,
      resourceType: 'image',
      title: 'আণবিক গঠন ও ডুয়াল মেকানিজম অফ অ্যাকশন (D2 Block + AChE Inhibition)',
      estimatedMinutes: 5,
      bodyText: `গ্যাপ্রিটো (Itopride HCl) কীভাবে কাজ করে তা সহজ ফর্মুলায় মনে রাখুন:
D2 block + AChE block = বেশি Acetylcholine = ভালো GI motility = উন্নত Gastric emptying।

• কেন এই দুটি পথ গুরুত্বপূর্ণ?
১. পেরিফেরাল D2 Receptor Antagonism: পাকস্থলী ও পরিপাকতন্ত্রে ডোপামিন সাধারণত প্যারাসিমপ্যাথেটিক স্নায়ু থেকে অ্যাসিটাইলকোলিন (Acetylcholine) নিঃসরণ কমিয়ে রাখে। গ্যাপ্রিটো D2 রিসেপ্টর ব্লক করে সেই বাধা দূর করে, ফলে অ্যাসিটাইলকোলিন নিঃসরণ বাড়ে।
২. Acetylcholinesterase (AChE) Inhibition: নিঃসৃত অ্যাসিটাইলকোলিন যেন দ্রুত ভেঙে না যায়, সেজন্য গ্যাপ্রিটো AChE এনজাইমকে ইনহিবিট করে। ফলে গ্যাস্ট্রোইনটেস্টাইনাল সিন্যাপ্সে অ্যাসিটাইলকোলিনের পরিমাণ ও স্থায়িত্ব বাড়ে এবং স্মুথ মাসল সংকোচন ও গ্যাস্ট্রিক এম্পটিয়িং ত্বরান্বিত হয়।

• বমিভাব প্রতিরোধে ভূমিকা (CTZ Action):
গ্যাপ্রিটো মস্তিষ্কের রক্ত-জালিকার বাইরের Chemoreceptor Trigger Zone (CTZ)-এ D2 রিসেপ্টর ব্লক করে বমির সংকেত (vomiting signal) থামায়। সতর্কতা: অনুমোদিত ইন্ডিকেশনের বাইরে এটিকে আলাদা স্বতন্ত্র antiemetic হিসেবে প্রচার করবেন না।

• গ্যাপ্রিটো কি অ্যাসিড কমায়?
না। এটি একটি motility agent (prokinetic), কোনো acid suppressant বা PPI-এর বিকল্প নয়।

• আণবিক গঠনের ৩টি অংশ (শুধু ফার্মাকোলজি-আগ্রহী চিকিৎসকের জন্য):
১. 3,4-Dimethoxybenzamide Core
২. Benzyl / Phenyl Linker
৩. Dimethylaminoethoxy (বা Dimethylaminopropoxy) Side Chain।`,
      mediaUrl: 'gaprito_pack',
      mediaCaption:
        'চিত্র ২ — গ্যাপ্রিটো ৩০ ট্যাবলেট প্যাক এবং ডুয়াল প্রোকাইনেটিক ও CTZ অ্যান্টি-এমেটিক মোড অফ অ্যাকশন ফ্লোচার্ট।',
      clinicalTakeaway:
        'গ্যাপ্রিটো অ্যাসিড কমায় না—এটি ডুয়াল পাথওয়েতে পরিপাকতন্ত্রের সঞ্চালন (motility) স্বাভাবিক করে; তাই প্রয়োজনে চিকিৎসক PPI-এর সাথেও দিতে পারেন।',
    },
    {
      id: 'res_gaprito_04',
      productId: 'prod_gaprito_50',
      productStatus: 'published',
      orderIndex: 3,
      resourceType: 'image',
      title: 'ক্লিনিক্যাল এভিডেন্স: ডমপেরিডোনের তুলনায় দ্রুত কার্যকারিতা ও GERD-এ PPI Add-On সুফল',
      estimatedMinutes: 6,
      bodyText: `• ফংশনাল ডিসপেপসিয়া (FD) ও এর ধরন:
রুটিন পরীক্ষায় কোনো আলসার বা অর্গানিক কারণ ছাড়াই গ্যাস্ট্রোডিওডেনাল উপসর্গ থাকলে তাকে Functional Dyspepsia বলে। এর ২টি সাবটাইপ:
১. Postprandial Distress Syndrome (PDS): খাবারের পরে পেট ভরা ভাব (postprandial fullness) এবং অল্প খেলেই পেট ভরে যাওয়া (early satiety)।
২. Epigastric Pain Syndrome (EPS): উপরের পেটে ব্যথা বা জ্বালাপোড়া।
যাদের খাবার পরের ভরা ভাব, early satiety ও পেট ফাঁপা বেশি, গ্যাপ্রিটো তাদের জন্য সবচেয়ে উপযোগী।

• ক্লিনিক্যাল এভিডেন্স ১ — Itopride বনাম Domperidone:
- কাজ শুরু হওয়ার সময় (Onset of Action): Itopride মাত্র ৪৮ মিনিটে কাজ শুরু করে, যেখানে Domperidone নেয় ৭২ মিনিটের বেশি।
- উপসর্গ উপশমের হার (Efficacy): ২ সপ্তাহের র‍্যান্ডমাইজড স্টাডিতে (Itopride 50 mg TID বনাম Domperidone 10 mg TID) মাঝারি থেকে সম্পূর্ণ উপসর্গ মুক্তি পাওয়া গেছে Itopride গ্রুপে ৮১% রোগীতে বনাম Domperidone গ্রুপে ৭০% রোগীতে।

• ক্লিনিক্যাল এভিডেন্স ২ — GERD উপসর্গে PPI-এর সাথে Add-On থেরাপি:
শুধু PPI ব্যবহারের পরও যাদের রিফ্লাক্স বা মটিলিটিজনিত উপসর্গ থেকে যায়, তাদের ক্ষেত্রে PPI + Itopride যোগ করলে উপসর্গের হার নাটকীয়ভাবে কমে আসে:
- Heartburn (বুক জ্বালাপোড়া): শুধু PPI-তে ৮০% বনাম Itopride + PPI-তে মাত্র ১০%।
- Regurgitation (টক ঢেকুর/খাবার উঠে আসা): শুধু PPI-তে ৫০% বনাম Itopride + PPI-তে মাত্র ৩%।
- Burning in Esophagus (খাদ্যনালীতে জ্বালা): শুধু PPI-তে ৩১% বনাম Itopride + PPI-তে মাত্র ৪%।`,
      mediaUrl: 'gaprito_evidence',
      mediaCaption:
        'চিত্র ৩ — ডমপেরিডোনের সাথে তুলনামূলক কার্যকারিতা (৪৮ মি. বনাম ৭২ মি.; ৮১% বনাম ৭০%) এবং PPI + Itopride GERD স্টাডি চার্ট।',
      clinicalTakeaway:
        'চিকিৎসক "PPI-তেই আমার কাজ হয়" বললে সম্মানের সাথে জিজ্ঞেস করুন: "অ্যাসিড নিয়ন্ত্রণের পরও যাদের খাবার পরে পেট ভরা ভাব বা রিজার্জিটেশন থাকে, তাদের ক্ষেত্রে PPI + Gaprito চমৎকার Add-on সমাধান দেয়।"',
    },
    {
      id: 'res_gaprito_05',
      productId: 'prod_gaprito_50',
      productStatus: 'published',
      orderIndex: 4,
      resourceType: 'image',
      title: 'মাত্রা, সেবনবিধি, সেফটি প্রোফাইল ও প্রতিনির্দেশনা (Prescribing Information)',
      estimatedMinutes: 6,
      bodyText: `• মাত্রা ও সেবনবিধি (Dosage & Administration):
- প্রাপ্তবয়স্কদের মাত্রা: ৫০ মি.গ্রা. ট্যাবলেট দিনে ৩ বার (দৈনিক মোট ১৫০ মি.গ্রা.)।
- কখন খাবেন: খাবারের প্রায় ৩০ মিনিট আগে।
- দীর্ঘমেয়াদি ব্যবহার: ক্লিনিক্যাল স্টাডিতে ৫২ সপ্তাহ পর্যন্ত অনুকূল নিরাপত্তা ও সহনশীলতা (favorable safety & tolerability) দেখা গেছে। তবে উপসর্গের উন্নতি না হলে অযথা দীর্ঘদিন চালিয়ে যাওয়া উচিত নয়। ডোজ বাদ পড়লে রোগীকে চিকিৎসক বা ফার্মাসিস্টের পরামর্শ নিতে বলুন (নিজে পরামর্শ দেবেন না)।

• চারটি বিশেষ ফার্মাকোলজিক্যাল নিরাপত্তা সুবিধা:
১. CNS Safety: এটি Blood-Brain Barrier (BBB) অতিক্রম করে না বললেই চলে, ফলে মাথা ঝিমঝিম বা এক্সট্রাপিরামিডাল CNS পার্শ্বপ্রতিক্রিয়া অত্যন্ত কম।
২. Cardiac Safety: বড় placebo-controlled ক্লিনিক্যাল ট্রায়ালে QTc prolongation দেখা যায়নি (কখনোই "side-effect free" বা "কখনোই QTc বাড়ায় না" বলবেন না—বলুন "ওই স্টাডিতে QTc prolongation দেখা যায়নি")।
৩. কম Drug-Drug Interaction: এটি CYP450 নয়, বরং Flavin-containing Monooxygenase (FMO) দ্বারা বিপাক হয়। তবে Anticholinergic ওষুধের (যেমন scopolamine butyl bromide, tiquizium, timepidium) সাথে সতর্কতার সাথে দিতে হবে।
৪. Prolactin সতর্কতা: বেশি ডোজের একটি ট্রায়ালে প্রোল্যাক্টিন কিছুটা বেড়েছিল তবে ক্লিনিক্যাল লক্ষণ ছিল না; তাই কখনো "প্রোল্যাক্টিনে প্রভাব নেই" বলবেন না।

• সাধারণ পার্শ্বপ্রতিক্রিয়া (মৃদু বা মাঝারি):
পেটে ব্যথা, ডায়রিয়া, বমিভাব, কোষ্ঠকাঠিন্য, অতিরিক্ত লালা নিঃসরণ (salivary hypersecretion), মাথা ঘোরা ও মাথাব্যথা।

• কারা খাবেন না (Contraindications) ও বিশেষ সতর্কতা:
- Itopride বা কোনো উপাদানে অতিসংবেদনশীলতা (hypersensitivity)।
- যেখানে GI motility বাড়ানো ক্ষতিকর: পাকস্থলী বা অন্ত্রের রক্তক্ষরণ (GI hemorrhage), যান্ত্রিক প্রতিবন্ধকতা (mechanical obstruction), বা ছিদ্র (GI perforation)।
- গর্ভাবস্থায় কেবল সুফল ঝুঁকির চেয়ে স্পষ্টভাবে বেশি হলে বিবেচ্য; স্তন্যদানকালে (lactation) ব্যবহার করতে বলা হয় না।
- ১৬ বছরের কম বয়সী শিশুদের ক্ষেত্রে নিরাপত্তা প্রতিষ্ঠিত হয়নি। বয়স্ক ও যকৃতের সমস্যায় (ALT/AST বৃদ্ধি বা জন্ডিস) সতর্ক পর্যবেক্ষণ প্রয়োজন।`,
      mediaUrl: 'gaprito_pi',
      mediaCaption:
        'চিত্র ৪ — গ্যাপ্রিটো-র ৫টি মূল সুবিধা, অনুমোদিত ইন্ডিকেশন, মাত্রা ও সংক্ষিপ্ত প্রেসক্রাইবিং ইনফরমেশন।',
      clinicalTakeaway:
        'প্রোমোশনাল কমপ্লায়েন্স বজায় রাখুন: কখনোই কোনো ওষুধকে "১০০% পার্শ্বপ্রতিক্রিয়ামুক্ত" বলবেন না; প্রমাণিত ট্রায়ালের ভাষা ব্যবহার করুন।',
    },
    {
      id: 'res_gaprito_06',
      productId: 'prod_gaprito_50',
      productStatus: 'published',
      orderIndex: 5,
      resourceType: 'video',
      title: 'চেম্বার ডিটেইলিং টক ও চিকিৎসকের আপত্তি মোকাবিলা (L-A-C-E কৌশল)',
      estimatedMinutes: 6,
      bodyText: `• ডক্টর চেম্বার ডিটেইলিং টকের ৬টি ধাপ (Detailing Flow):
১. ওপেনিং প্রশ্ন: "স্যার, আপনার দৈনন্দিন প্র্যাকটিসে ডিসপেপসিয়া ও GI motility সমস্যার অনেক রোগী পান। ডমপেরিডোন ভালো ওষুধ হলেও QT prolongation ও CNS জটিলতার কিছু সীমাবদ্ধতা আছে—তাই না স্যার?"
২. ব্র্যান্ড উপস্থাপন: "দ্রুততর ও উন্নত উপশম এবং অনুকূল কার্ডিয়াক ও CNS নিরাপত্তার প্রয়োজন বিবেচনায় Novatek Pharma নিয়ে এসেছে Gaprito (Itopride HCl 50 mg)—Dual Action, Smooth Digestion।"
৩. মেকানিজম প্রদর্শন: "গ্যাপ্রিটো পেরিফেরাল D2 রিসেপ্টর ব্লক এবং AChE ইনহিবিট করে অ্যাসিটাইলকোলিন বাড়ায় এবং CTZ-এ কাজ করে বমিভাব কমায়।"
৪. এভিডেন্স তুলনা: "র‍্যান্ডমাইজড স্টাডিতে গ্যাপ্রিটো ৪৮ মিনিটে কাজ শুরু করে (ডমপেরিডোন ৭২ মিনিট) এবং ৮১% রোগীতে উপশম দেয় (ডমপেরিডোন ৭০%)। পাশাপাশি PPI-এর সাথে GERD উপসর্গে চমৎকার Add-on সুফল দেয়।"
৫. ৫টি মূল পয়েন্ট ও মাত্রা: Dual Action, Powerful Prokinetic, Fast & Effective, Better with PPIs, এবং ৫২ সপ্তাহ পর্যন্ত Proven Tolerability। মাত্রা: ৫০ মি.গ্রা. দিনে ৩ বার খাবারের ৩০ মিনিট আগে।
৬. ক্লোজিং অনুরোধ: "স্যার, এই সুবিধাগুলো বিবেচনায় আপনার উপযুক্ত ডিসপেপসিয়া রোগীদের জন্য Gaprito-র মূল্যবান প্রেসক্রিপশন প্রত্যাশা করছি।"

• চিকিৎসকের আপত্তি মোকাবিলার L-A-C-E ফ্রেমওয়ার্ক:
- L = Listen (মনোযোগ দিয়ে শুনুন)
- A = Acknowledge (চিকিৎসকের অভিজ্ঞতাকে সম্মান জানিয়ে স্বীকার করুন)
- C = Clarify (প্রয়োজনীয় ক্লিনিক্যাল দিকটি স্পষ্ট করুন)
- E = Evidence (স্টাডি বা মেটা-অ্যানালাইসিস থেকে প্রমাণ দিন, তারপর ১টি উপযুক্ত রোগীতে চেষ্টা করার অনুরোধ করুন)

• প্রধান আপত্তি ও প্রস্তুত উত্তর:
- "Domperidone দিয়েই ভালো রেজাল্ট পাই": "আপনার অভিজ্ঞতাকে সম্মান করি, স্যার। আমি বদলাতে বলছি না; নির্বাচিত রোগীর জন্য গ্যাপ্রিটো ডুয়াল মেকানিজম এবং কার্ডিয়াক/CNS নিরাপত্তা যোগ করে।"
- "PPI-তেই আমার কাজ হয়": "অ্যাসিড-সম্পর্কিত উপসর্গে অবশ্যই, স্যার। তবে অ্যাসিড নিয়ন্ত্রণের পরও যাদের খাবার পরে পেট ভরা ভাব থাকে, তাদের কীভাবে ম্যানেজ করেন স্যার?"
- "আমি নতুন ব্র্যান্ড লিখি না" / "রেখে যান": "আজই সব বদলাতে বলছি না, স্যার। আপনার ডিসপেপটিক রোগীদের মধ্যে খাবার পরের ভরা ভাব বেশি নাকি হার্টবার্ন, স্যার? উপযুক্ত ১ জন রোগীর জন্য ক্লিনিক্যাল তথ্যটি রেখে যেতে পারি?"`,
      mediaUrl: 'novatek-briefing://gaprito-bangla',
      mediaCaption:
        'নভাটেক মেডিকেল ব্রিফিং — গ্যাপ্রিটো ডুয়াল অ্যাকশন, ক্লিনিক্যাল ট্রায়াল ডেটা ও চেম্বার ডিটেইলিং গাইড (বাংলা)',
      clinicalTakeaway:
        'কখনোই চিকিৎসককে "আপনি ভুল" বলবেন না বা তর্কে জড়াবেন না; সর্বদা L-A-C-E পদ্ধতিতে সম্মান জানিয়ে ক্লিনিক্যাল প্রশ্ন ও প্রমাণ উপস্থাপন করুন।',
    },
  ],
  questions: [
    {
      id: 'q_gaprito_01',
      productId: 'prod_gaprito_50',
      productStatus: 'published',
      orderIndex: 0,
      questionType: 'mcq',
      prompt: 'গ্যাপ্রিটো (Gaprito)-র প্রতিটি ফিল্ম-কোটেড ট্যাবলেটে কোন সক্রিয় উপাদান ও শক্তি রয়েছে?',
      points: 4,
      options: [
        'Itopride Hydrochloride INN 50 mg',
        'Domperidone Maleate BP 10 mg',
        'Levosulpiride INN 25 mg',
        'Prucalopride Succinate 2 mg',
      ],
      correctOptionIndex: 0,
      rubricKeywords: [],
      modelAnswer:
        'গ্যাপ্রিটো-র প্রতিটি ফিল্ম-কোটেড ট্যাবলেটে Itopride Hydrochloride INN 50 mg রয়েছে, যা Novatek Pharmaceuticals Ltd. প্রস্তুত করে।',
    },
    {
      id: 'q_gaprito_02',
      productId: 'prod_gaprito_50',
      productStatus: 'published',
      orderIndex: 1,
      questionType: 'mcq',
      prompt: 'গ্যাপ্রিটো (Gaprito) ব্র্যান্ডের অফিসিয়াল স্লোগান বা ট্যাগলাইন কোনটি?',
      points: 4,
      options: [
        'Fast Acid Control Every Day',
        'Dual Action, Smooth Digestion',
        'Single Pathway Rapid Relief',
        'Complete Ulcer Protection',
      ],
      correctOptionIndex: 1,
      rubricKeywords: [],
      modelAnswer:
        'গ্যাপ্রিটো-র অফিসিয়াল ব্র্যান্ড ট্যাগলাইন হলো "Dual Action, Smooth Digestion"।',
    },
    {
      id: 'q_gaprito_03',
      productId: 'prod_gaprito_50',
      productStatus: 'published',
      orderIndex: 2,
      questionType: 'mcq',
      prompt: 'গ্যাপ্রিটো-র বাণিজ্যিক প্যাক সাইজ এবং সঠিক সংরক্ষণ পদ্ধতি কোনটি?',
      points: 4,
      options: [
        'প্রতি বক্সে ২০টি ট্যাবলেট; রেফ্রিজারেটরে ২°–৮°C তাপমাত্রায় সংরক্ষণ',
        'প্রতি বক্সে ৩০টি ট্যাবলেট (৩×১০ ব্লিস্টার প্যাক); ৩০°C-এর নিচে শুকনো ও আলোমুক্ত স্থানে সংরক্ষণ',
        'প্রতি বক্সে ৫০টি ট্যাবলেট; ৪০°C পর্যন্ত খোলা স্থানে সংরক্ষণ',
        'প্রতি বক্সে ১০টি ক্যাপসুল; অ্যালুমিনিয়াম বোতলে সংরক্ষণ',
      ],
      correctOptionIndex: 1,
      rubricKeywords: [],
      modelAnswer:
        'গ্যাপ্রিটো প্রতি বক্সে ৩০টি ট্যাবলেট (৩×১০ ব্লিস্টার প্যাক) হিসেবে পাওয়া যায় এবং এটি ৩০°C তাপমাত্রার নিচে, শুকনো ও আলোমুক্ত স্থানে শিশুদের নাগালের বাইরে সংরক্ষণ করতে হয়।',
    },
    {
      id: 'q_gaprito_04',
      productId: 'prod_gaprito_50',
      productStatus: 'published',
      orderIndex: 3,
      questionType: 'mcq',
      prompt: 'ব্র্যান্ড নাম "Gaprito"-র তিনটি অংশ (Ga – Pri – Ito) কীভাবে গঠিত হয়েছে?',
      points: 4,
      options: [
        'Ga = Gastric acid, Pri = Primary, Ito = Isomer',
        'Ga = Gastro, Pri = Prokinetic (ও Itopride-এর pri), Ito = Itopride ("ito")',
        'Ga = Gallbladder, Pri = Proton, Ito = Inhibitor',
        'Ga = Gastrin, Pri = Protection, Ito = Tonic',
      ],
      correctOptionIndex: 1,
      rubricKeywords: [],
      modelAnswer:
        'Ga ইঙ্গিত দেয় Gastro (পরিপাকতন্ত্র), Pri ইঙ্গিত দেয় Prokinetic অ্যাকশন, এবং Ito নেওয়া হয়েছে জেনেরিক নাম Itopride থেকে।',
    },
    {
      id: 'q_gaprito_05',
      productId: 'prod_gaprito_50',
      productStatus: 'published',
      orderIndex: 4,
      questionType: 'mcq',
      prompt: 'গ্যাপ্রিটো কোন দুটি পরিপূরক কৌশলে (Dual Mechanism) পরিপাকতন্ত্রের সঞ্চালন বাড়ায়?',
      points: 4,
      options: [
        'H2 রিসেপ্টর ব্লক এবং প্রোটন পাম্প ইনহিবিশন',
        'পেরিফেরাল Dopamine D2 রিসেপ্টর ব্লক এবং Acetylcholinesterase (AChE) ইনহিবিশন',
        '5-HT3 রিসেপ্টর ব্লক এবং মিউকাস নিঃসরণ বৃদ্ধি',
        'ক্যালসিয়াম চ্যানেল ব্লক এবং অ্যান্টাসিড প্রশমন',
      ],
      correctOptionIndex: 1,
      rubricKeywords: [],
      modelAnswer:
        'গ্যাপ্রিটো পেরিফেরাল D2 রিসেপ্টর ব্লক করে অ্যাসিটাইলকোলিন নিঃসরণের বাধা কমায় এবং AChE এনজাইম ইনহিবিট করে নিঃসৃত অ্যাসিটাইলকোলিন ভাঙন রোধ করে।',
    },
    {
      id: 'q_gaprito_06',
      productId: 'prod_gaprito_50',
      productStatus: 'published',
      orderIndex: 5,
      questionType: 'mcq',
      prompt: 'ট্রেনিং শিটের ফর্মুলা অনুযায়ী "D2 block + AChE block"-এর সরাসরি শারীরবৃত্তীয় ফলাফল কী?',
      points: 4,
      options: [
        'পাকস্থলীর pH দ্রুত বৃদ্ধি ও অ্যাসিড নিঃসরণ বন্ধ হওয়া',
        'সিন্যাপ্সে বেশি Acetylcholine জমা হওয়া → ভালো GI motility → উন্নত gastric emptying',
        'পিত্তথলির সংকোচন সম্পূর্ণ বন্ধ হওয়া',
        'অন্ত্রের মসৃণ পেশী শিথিল হয়ে সঞ্চালন কমে যাওয়া',
      ],
      correctOptionIndex: 1,
      rubricKeywords: [],
      modelAnswer:
        'মনে রাখার ফর্মুলা: D2 block + AChE block = বেশি acetylcholine = ভালো GI motility = উন্নত gastric emptying।',
    },
    {
      id: 'q_gaprito_07',
      productId: 'prod_gaprito_50',
      productStatus: 'published',
      orderIndex: 6,
      questionType: 'mcq',
      prompt: 'বমিভাব ও বমি (Nausea & Vomiting) কমাতে Itopride কোথায় কাজ করে?',
      points: 4,
      options: [
        'পাকস্থলীর প্যারাইটাল কোষে প্রোটন পাম্পে',
        'Chemoreceptor Trigger Zone (CTZ)-এ D2 রিসেপ্টর ব্লক করে',
        'কানের ভেস্টিবুলার স্নায়ুতে H1 রিসেপ্টর ব্লক করে',
        'সেরিব্রাল কর্টেক্সে GABA রিসেপ্টর সক্রিয় করে',
      ],
      correctOptionIndex: 1,
      rubricKeywords: [],
      modelAnswer:
        'গ্যাপ্রিটো Chemoreceptor Trigger Zone (CTZ)-এ ডোপামিন D2 রিসেপ্টর ব্লক করে বমির সংকেত থামায়; তবে অনুমোদিত ইন্ডিকেশনের বাইরে আলাদা antiemetic হিসেবে প্রচার করা যাবে না।',
    },
    {
      id: 'q_gaprito_08',
      productId: 'prod_gaprito_50',
      productStatus: 'published',
      orderIndex: 7,
      questionType: 'mcq',
      prompt: 'গ্যাপ্রিটো কি পাকস্থলীর অ্যাসিড কমিয়ে কাজ করে কিংবা এটি কি PPI-এর বিকল্প?',
      points: 4,
      options: [
        'হ্যাঁ, এটি শক্তিশালী অ্যাসিড সাপ্রেসেন্ট এবং PPI-এর সরাসরি বিকল্প',
        'না, এটি একটি motility agent (acid suppressant নয়); প্রয়োজনে চিকিৎসক PPI-এর সাথে একসাথে দিতে পারেন',
        'এটি কেবল অ্যান্টাসিড হিসেবে পাকস্থলীর অ্যাসিড নিরপেক্ষ করে',
        'এটি শুধুমাত্র H. pylori জীবাণু ধ্বংস করে',
      ],
      correctOptionIndex: 1,
      rubricKeywords: [],
      modelAnswer:
        'গ্যাপ্রিটো অ্যাসিড কমায় না; PPI অ্যাসিডকে টার্গেট করে আর গ্যাপ্রিটো মটিলিটিকে টার্গেট করে—চিকিৎসক প্রয়োজনে দুটি একসাথে বিবেচনা করতে পারেন।',
    },
    {
      id: 'q_gaprito_09',
      productId: 'prod_gaprito_50',
      productStatus: 'published',
      orderIndex: 8,
      questionType: 'mcq',
      prompt: 'ফার্মাকোলজি-আগ্রহী চিকিৎসকের জন্য Itopride অণুর (Molecule) তিনটি গাঠনিক অংশ কী কী?',
      points: 4,
      options: [
        'Benzimidazole ring, pyridine ring ও sulfinyl linker',
        '3,4-dimethoxybenzamide core, benzyl/phenyl linker ও dimethylaminoethoxy (বা propoxy) chain',
        'Beta-lactam ring, thiazolidine ring ও acyl side chain',
        'Steroid nucleus, lactone ring ও sugar moiety',
      ],
      correctOptionIndex: 1,
      rubricKeywords: [],
      modelAnswer:
        'Itopride অণুর তিনটি অংশ হলো: 3,4-dimethoxybenzamide core, benzyl (বা phenyl) linker এবং dimethylaminoethoxy (বা dimethylaminopropoxy) side chain।',
    },
    {
      id: 'q_gaprito_10',
      productId: 'prod_gaprito_50',
      productStatus: 'published',
      orderIndex: 9,
      questionType: 'mcq',
      prompt: 'Functional Dyspepsia (FD)-এর প্রধান দুটি ক্লিনিক্যাল সাবটাইপ (Subtype) কোনগুলো?',
      points: 4,
      options: [
        'Crohn’s disease এবং Ulcerative colitis',
        'Postprandial Distress Syndrome (PDS) এবং Epigastric Pain Syndrome (EPS)',
        'Acute gastritis এবং Peptic perforation',
        'Zollinger-Ellison syndrome এবং Barrett’s esophagus',
      ],
      correctOptionIndex: 1,
      rubricKeywords: [],
      modelAnswer:
        'Functional Dyspepsia-র দুটি সাবটাইপ হলো Postprandial Distress Syndrome (খাবার পরের ভরা ভাব ও early satiety) এবং Epigastric Pain Syndrome (উপরের পেটে ব্যথা বা জ্বালাপোড়া)।',
    },
    {
      id: 'q_gaprito_11',
      productId: 'prod_gaprito_50',
      productStatus: 'published',
      orderIndex: 10,
      questionType: 'mcq',
      prompt: 'ক্লিনিক্যাল পরিভাষায় "Early Satiety" বলতে কী বোঝায়?',
      points: 4,
      options: [
        'রাতে ঘুমের মধ্যে তীব্র বুক জ্বালাপোড়া হওয়া',
        'স্বাভাবিক পরিমাণ খাবার শেষ করার আগেই পেট ভরে যাওয়ার অনুভূতি',
        'খাবার খাওয়ার ৪ ঘণ্টা পর তীব্র ক্ষুধা লাগা',
        'খাবার গিলতে গলায় ব্যথা অনুভব করা',
      ],
      correctOptionIndex: 1,
      rubricKeywords: [],
      modelAnswer:
        'স্বাভাবিক খাবার শেষ করার আগেই পেট ভরে যাওয়ার অনুভূতিকে Early Satiety বলা হয়, যা মটিলিটি সমস্যার অন্যতম প্রধান লক্ষণ।',
    },
    {
      id: 'q_gaprito_12',
      productId: 'prod_gaprito_50',
      productStatus: 'published',
      orderIndex: 11,
      questionType: 'mcq',
      prompt: 'কোন ধরনের রোগীর জন্য গ্যাপ্রিটো সবচেয়ে বেশি উপযোগী?',
      points: 4,
      options: [
        'যাদের শুধুমাত্র তীব্র ব্যাকটেরিয়াল আমাশয় রয়েছে',
        'যাদের খাবার পরের ভরা ভাব (postprandial fullness), early satiety বা পেট ফাঁপা (bloating) বেশি এবং মটিলিটি সমস্যা সন্দেহ করা হয়',
        'যাদের অন্ত্রের যান্ত্রিক প্রতিবন্ধকতা (mechanical obstruction) রয়েছে',
        '১৬ বছরের কম বয়সী শিশুদের সাধারণ সর্দি-কাশিতে',
      ],
      correctOptionIndex: 1,
      rubricKeywords: [],
      modelAnswer:
        'যাদের খাবার পরের ভরা ভাব, early satiety ও bloating বেশি এবং GI motility সমস্যা সন্দেহ করা হয়, তাদের জন্য গ্যাপ্রিটো সবচেয়ে উপযোগী।',
    },
    {
      id: 'q_gaprito_13',
      productId: 'prod_gaprito_50',
      productStatus: 'published',
      orderIndex: 12,
      questionType: 'mcq',
      prompt: 'প্রাপ্তবয়স্ক রোগীদের জন্য গ্যাপ্রিটো-র অনুমোদিত সাধারণ মাত্রা ও সেবনের সঠিক সময় কোনটি?',
      points: 4,
      options: [
        '৫০ মি.গ্রা. দিনে ১ বার রাতে ঘুমানোর পর',
        '৫০ মি.গ্রা. (১টি ট্যাবলেট) দিনে ৩ বার (দৈনিক ১৫০ মি.গ্রা.), খাবারের প্রায় ৩০ মিনিট আগে',
        '১০০ মি.গ্রা. দিনে ২ বার ভরা পেটে খাবারের ১ ঘণ্টা পর',
        '২৫ মি.গ্রা. সপ্তাহে ১ দিন সকালে খালি পেটে',
      ],
      correctOptionIndex: 1,
      rubricKeywords: [],
      modelAnswer:
        'গ্যাপ্রিটো-র প্রাপ্তবয়স্ক মাত্রা হলো ৫০ মি.গ্রা. ট্যাবলেট দিনে ৩ বার (মোট দৈনিক ১৫০ মি.গ্রা.), খাবারের প্রায় ৩০ মিনিট আগে।',
    },
    {
      id: 'q_gaprito_14',
      productId: 'prod_gaprito_50',
      productStatus: 'published',
      orderIndex: 13,
      questionType: 'mcq',
      prompt: 'তুলনামূলক ক্লিনিক্যাল তথ্য অনুযায়ী Itopride বনাম Domperidone-এর কাজ শুরু হওয়ার সময় (Onset of Action) কত?',
      points: 4,
      options: [
        'Itopride ৯০ মিনিট বনাম Domperidone ৩০ মিনিট',
        'Itopride ৪৮ মিনিট বনাম Domperidone ৭২ মিনিট',
        'Itopride ১২০ মিনিট বনাম Domperidone ১২০ মিনিট',
        'Itopride ১৫ মিনিট বনাম Domperidone ১৮০ মিনিট',
      ],
      correctOptionIndex: 1,
      rubricKeywords: [],
      modelAnswer:
        'ক্লিনিক্যাল স্টাডিতে দেখা গেছে Itopride ৪৮ মিনিটের মধ্যে কাজ শুরু করে, যেখানে Domperidone ৭২ মিনিটের বেশি সময় নেয়।',
    },
    {
      id: 'q_gaprito_15',
      productId: 'prod_gaprito_50',
      productStatus: 'published',
      orderIndex: 14,
      questionType: 'mcq',
      prompt: 'র‍্যান্ডমাইজড স্টাডিতে ২ সপ্তাহ পর ডিসপেপসিয়া থেকে মাঝারি-থেকে-সম্পূর্ণ উপশম (Symptomatic Relief) Itopride বনাম Domperidone-এ কত শতাংশ রোগীতে পাওয়া গেছে?',
      points: 4,
      options: [
        'Itopride ৬০% বনাম Domperidone ৭৫%',
        'Itopride ৮১% বনাম Domperidone ৭০%',
        'Itopride ৫০% বনাম Domperidone ৫০%',
        'Itopride ৯৯% বনাম Domperidone ২৫%',
      ],
      correctOptionIndex: 1,
      rubricKeywords: [],
      modelAnswer:
        'র‍্যান্ডমাইজড তুলনামূলক গবেষণায় Itopride 50 mg TID গ্রহণকারী ৮১% রোগীতে উপশম পাওয়া গেছে, যেখানে Domperidone 10 mg TID-তে ছিল ৭০%।',
    },
    {
      id: 'q_gaprito_16',
      productId: 'prod_gaprito_50',
      productStatus: 'published',
      orderIndex: 15,
      questionType: 'mcq',
      prompt: 'GERD স্টাডিতে শুধু PPI বনাম Itopride + PPI একসাথে ব্যবহারে Heartburn, Regurgitation ও Esophageal burning উপসর্গের হার কীভাবে কমেছে?',
      points: 4,
      options: [
        'Heartburn ৮০%→১০%, Regurgitation ৫০%→৩%, এবং Burning in esophagus ৩১%→৪%',
        'Heartburn ৫০%→৪৫%, Regurgitation ৪০%→৩৮%, এবং Burning in esophagus ৩০%→২৮%',
        'তিনটি উপসর্গই কোনো পরিবর্তন ছাড়া একই ছিল',
        'শুধু PPI একক থেরাপি বেশি কার্যকর ছিল',
      ],
      correctOptionIndex: 0,
      rubricKeywords: [],
      modelAnswer:
        'PPI-এর সাথে Itopride 50 mg যোগ করলে Heartburn ৮০% থেকে ১০%-এ, Regurgitation ৫০% থেকে ৩%-এ এবং খাদ্যনালীর জ্বালাপোড়া ৩১% থেকে ৪%-এ নেমে আসে।',
    },
    {
      id: 'q_gaprito_17',
      productId: 'prod_gaprito_50',
      productStatus: 'published',
      orderIndex: 16,
      questionType: 'mcq',
      prompt: 'ক্লিনিক্যাল গবেষণায় কত সপ্তাহ পর্যন্ত Itopride-এর অনুকূল সেফটি ও টলারেবিলিটি (Proven Tolerability) প্রোফাইল উল্লেখ করা হয়েছে?',
      points: 4,
      options: [
        'সর্বোচ্চ ২ সপ্তাহ পর্যন্ত',
        '৫২ সপ্তাহ পর্যন্ত',
        'কেবল ৩ দিন পর্যন্ত',
        'মাত্র ১ সপ্তাহ পর্যন্ত',
      ],
      correctOptionIndex: 1,
      rubricKeywords: [],
      modelAnswer:
        'ক্লিনিক্যাল এভিডেন্সে ৫২ সপ্তাহ পর্যন্ত Itopride-এর good tolerability ও favorable safety profile পাওয়া গেছে (চালিয়ে যাওয়া চিকিৎসকের সিদ্ধান্ত)।',
    },
    {
      id: 'q_gaprito_18',
      productId: 'prod_gaprito_50',
      productStatus: 'published',
      orderIndex: 17,
      questionType: 'mcq',
      prompt: 'গ্যাপ্রিটো ব্যবহারে কেন্দ্রীয় স্নায়ুতন্ত্রের (CNS) পার্শ্বপ্রতিক্রিয়া কম হওয়ার মূল কারণ কী?',
      points: 4,
      options: [
        'এটি পাকস্থলী থেকে কখনোই রক্তে শোষিত হয় না',
        'এটি উচ্চ পোলারিটির কারণে Blood-Brain Barrier (BBB) অতিক্রম করে না বললেই চলে',
        'এটি কেবল বাহ্যিক ব্যবহারের ওষুধ',
        'এটি মস্তিষ্কের ডোপামিন নিঃসরণ ১০ গুণ বাড়িয়ে দেয়',
      ],
      correctOptionIndex: 1,
      rubricKeywords: [],
      modelAnswer:
        'গ্যাপ্রিটো (Itopride) Blood-Brain Barrier (BBB) অতিক্রম করে না বললেই চলে, ফলে ডমপেরিডোন বা মেটোক্লোপ্রামাইডের তুলনায় CNS পার্শ্বপ্রতিক্রিয়ার ঝুঁকি অনেক কম।',
    },
    {
      id: 'q_gaprito_19',
      productId: 'prod_gaprito_50',
      productStatus: 'published',
      orderIndex: 18,
      questionType: 'mcq',
      prompt: 'গ্যাপ্রিটো প্রধানত কোন এনজাইম পাথওয়েতে বিপাক (Metabolize) হয়, যার ফলে CYP450-জনিত Drug-Drug Interaction কম হয়?',
      points: 4,
      options: [
        'Cytochrome P450 3A4 (CYP3A4) পাথওয়ে',
        'Flavin-containing Monooxygenase (FMO) পাথওয়ে',
        'Monoamine Oxidase-B (MAO-B) পাথওয়ে',
        'Xanthine Oxidase পাথওয়ে',
      ],
      correctOptionIndex: 1,
      rubricKeywords: [],
      modelAnswer:
        'Itopride প্রধানত Flavin-containing Monooxygenase (FMO) দ্বারা বিপাক হয়, ফলে CYP-নির্ভর ওষুধের সাথে মিথস্ক্রিয়ার ঝুঁকি অত্যন্ত কম থাকে।',
    },
    {
      id: 'q_gaprito_20',
      productId: 'prod_gaprito_50',
      productStatus: 'published',
      orderIndex: 19,
      questionType: 'mcq',
      prompt: 'নিচের কোন অবস্থায় গ্যাপ্রিটো সম্পূর্ণ প্রতিনির্দেশিত (Contraindicated), অর্থাৎ রোগীকে দেওয়া যাবে না?',
      points: 4,
      options: [
        'খাবারের পর পেট ভরা ভাব ও পেট ফাঁপা থাকলে',
        'Itopride-এ অতিসংবেদনশীলতা এবং যেখানে GI motility বাড়ানো ক্ষতিকর (GI hemorrhage, mechanical obstruction বা perforation)',
        'ক্রনিক গ্যাস্ট্রাইটিসজনিত অরুচি ও বমিভাব থাকলে',
        'PPI ব্যবহারের পরও GERD উপসর্গ থেকে গেলে',
      ],
      correctOptionIndex: 1,
      rubricKeywords: [],
      modelAnswer:
        'Itopride-এ hypersensitivity থাকলে এবং GI hemorrhage (রক্তক্ষরণ), mechanical obstruction (প্রতিবন্ধকতা) বা perforation (ছিদ্র) থাকলে গ্যাপ্রিটো দেওয়া নিষিদ্ধ।',
    },
    {
      id: 'q_gaprito_21',
      productId: 'prod_gaprito_50',
      productStatus: 'published',
      orderIndex: 20,
      questionType: 'mcq',
      prompt: 'শিশু, গর্ভাবস্থা ও স্তন্যদানকালে গ্যাপ্রিটো ব্যবহারের সঠিক নির্দেশনা কোনটি?',
      points: 4,
      options: [
        'নবজাতক থেকে শুরু করে সব বয়সে ও স্তন্যদানকালে নির্দ্বিধায় ব্যবহার্য',
        '১৬ বছরের কম বয়সীদের ক্ষেত্রে নিরাপত্তা প্রতিষ্ঠিত হয়নি; স্তন্যদানকালে ব্যবহারের পরামর্শ দেওয়া হয় না এবং গর্ভাবস্থায় কেবল সুফল ঝুঁকির চেয়ে বেশি হলেই বিবেচ্য',
        'শুধুমাত্র ১২ বছরের নিচের শিশুদের জন্য অনুমোদিত',
        'স্তন্যদানকালে ডোজ দ্বিগুণ করে দিতে হয়',
      ],
      correctOptionIndex: 1,
      rubricKeywords: [],
      modelAnswer:
        '১৬ বছরের কম বয়সীদের ক্ষেত্রে এর safety ও effectiveness প্রতিষ্ঠিত হয়নি, স্তন্যদানকালে ব্যবহার করতে বলা হয় না এবং গর্ভাবস্থায় কেবল ঝুঁকির চেয়ে সুফল বেশি হলে চিকিৎসক বিবেচনা করবেন।',
    },
    {
      id: 'q_gaprito_22',
      productId: 'prod_gaprito_50',
      productStatus: 'published',
      orderIndex: 21,
      questionType: 'mcq',
      prompt: 'চিকিৎসকের কাছে গ্যাপ্রিটো-র কার্ডিয়াক সেফটি (QT interval) ও সহনশীলতা উপস্থাপনের সময় কোন বক্তব্যটি প্রোমোশনাল নিয়মসম্মত?',
      points: 4,
      options: [
        '"স্যার, গ্যাপ্রিটো ১০০% side-effect free এবং পৃথিবীতে কখনোই কারো QTc বা prolactin বাড়ায় না।"',
        '"স্যার, এর documented tolerability profile আছে এবং বড় placebo-controlled ট্রায়ালে QTc prolongation দেখা যায়নি।"',
        '"স্যার, কোনো ডোজ বাদ পড়লে রোগীকে পরের বেলায় একসাথে ৩টি ট্যাবলেট খেতে বলবেন।"',
        '"স্যার, উপসর্গ না কমলেও আজীবন চিকিৎসকের পরামর্শ ছাড়াই চালিয়ে যাওয়া যাবে।"',
      ],
      correctOptionIndex: 1,
      rubricKeywords: [],
      modelAnswer:
        'কখনোই "side-effect free" বা "কখনোই QTc/prolactin বাড়ায় না" বলা যাবে না; সঠিক ও নৈতিক উপস্থাপন হলো "বড় placebo-controlled ট্রায়ালে QTc prolongation দেখা যায়নি"।',
    },
    {
      id: 'q_gaprito_23',
      productId: 'prod_gaprito_50',
      productStatus: 'published',
      orderIndex: 22,
      questionType: 'mcq',
      prompt: 'চিকিৎসকের আপত্তি মোকাবিলায় (Objection Handling) ব্যবহৃত "L-A-C-E" কৌশলের পূর্ণরূপ কী?',
      points: 4,
      options: [
        'Lecture, Argue, Convince, Exit',
        'Listen (শুনুন), Acknowledge (স্বীকার করুন), Clarify (স্পষ্ট করুন), Evidence (প্রমাণ দিন)',
        'Launch, Advertise, Compare, Enforce',
        'Locate, Ask, Close, Evaluate',
      ],
      correctOptionIndex: 1,
      rubricKeywords: [],
      modelAnswer:
        'L-A-C-E অর্থ: শুনুন (Listen), স্বীকার করুন (Acknowledge), স্পষ্ট করুন (Clarify), এবং Evidence দিন—তারপর ১টি উপযুক্ত রোগীতে চেষ্টা করার বিনীত অনুরোধ করুন।',
    },
    {
      id: 'q_gaprito_24',
      productId: 'prod_gaprito_50',
      productStatus: 'published',
      orderIndex: 23,
      questionType: 'text',
      prompt:
        'চেম্বার আপত্তি মোকাবিলা (লিখিত): একজন চিকিৎসক বললেন, "PPI-তেই আমার রোগীর কাজ হয়ে যায়, গ্যাপ্রিটো কেন দেব?" — L-A-C-E কৌশল অনুসরণ করে ২–৩ বাক্যে আপনার উত্তর বাংলায় লিখুন।',
      points: 4,
      options: [],
      correctOptionIndex: -1,
      rubricKeywords: [
        'acid|অ্যাসিড|এসিড',
        'motility|মটিলিটি|সঞ্চালন',
        'ভরা ভাব|fullness|bloating|regurgitation|হার্টবার্ন',
        'add-on|একসাথে|যোগ',
      ],
      modelAnswer:
        'অ্যাসিড-সম্পর্কিত উপসর্গে অবশ্যই PPI কার্যকর, স্যার। তবে PPI মূলত অ্যাসিড কমায় আর গ্যাপ্রিটো পরিপাকতন্ত্রের মটিলিটি (GI motility) উন্নত করে; তাই অ্যাসিড নিয়ন্ত্রণের পরও যাদের খাবার পরে পেট ভরা ভাব, পেট ফাঁপা বা রিজার্জিটেশন থাকে, তাদের ক্ষেত্রে PPI-এর সাথে গ্যাপ্রিটো চমৎকার Add-on সুফল দেয়।',
    },
    {
      id: 'q_gaprito_25',
      productId: 'prod_gaprito_50',
      productStatus: 'published',
      orderIndex: 24,
      questionType: 'text',
      prompt:
        'স্মৃতি-মানচিত্র (5D — লিখিত): গ্যাপ্রিটো-র ১০ সেকেন্ডের স্মৃতি-মানচিত্রের ৫টি D (Drug, Dual, Disease, Distinct symptoms ও Dose) সংক্ষেপে বাংলায় লিখুন।',
      points: 4,
      options: [],
      correctOptionIndex: -1,
      rubricKeywords: [
        'itopride|আইটোপ্রাইড|50|৫০',
        'd2|ডোপামিন|ache|acetylcholinesterase|অ্যাসিটাইলকোলিন',
        'dyspepsia|ডিসপেপসিয়া|ডিসপেপসিয়া',
        'ভরা ভাব|fullness|satiety',
        '৩ বার|তিনবার|3 times|৩০ মিনিট|30 min',
      ],
      modelAnswer:
        '১. Drug: Itopride HCl 50 mg; ২. Dual: D2 antagonist + AChE inhibitor; ৩. Disease: Functional dyspepsia; ৪. Distinct symptoms: খাবার পরের পেট ভরা ভাব ও early satiety; ৫. Dose: ৫০ মি.গ্রা. দিনে ৩ বার, খাবারের ৩০ মিনিট আগে।',
    },
  ],
};
