import React, { useState } from 'react';
import { Download, FileText, Maximize2, Printer, X } from 'lucide-react';
import { GAPRITO_REFERENCE_PDFS } from '../lib/assets';
import { ResilientImage } from './ResilientImage';

const LITERATURE_PLATES = [
  {
    key: 'gaprito_sheet',
    title: 'প্লেট ০১: এক-পাতার ইনফোগ্রাফিক ট্রেনিং শিট (FAB ও বাজার চিত্র)',
    caption: 'Gaprito® প্রোডাক্ট ওভারভিউ, ব্র্যান্ড জাস্টিফিকেশন, ডুয়াল মেকানিজম, FAB ও টপ ১০ ব্র্যান্ড।',
  },
  {
    key: 'gaprito_molecule',
    title: 'প্লেট ০২: আইটোপ্রাইড হাইড্রোক্লোরাইডের অনন্য আণবিক গঠন',
    caption: '3,4-Dimethoxybenzamide Core, Benzyl Linker ও Dimethylaminoethoxy Tail।',
  },
  {
    key: 'gaprito_pack',
    title: 'প্লেট ০৩: লঞ্চিং লিটারেচার কভার, প্যাক ও ডুয়াল অ্যাকশন ফ্লোচার্ট',
    caption: '৩০ ট্যাবলেট ব্লিস্টার বক্স, D2 + AChE ডুয়াল পাথওয়ে এবং CTZ অ্যান্টি-এমেটিক ক্রিয়া।',
  },
  {
    key: 'gaprito_evidence',
    title: 'প্লেট ০৪: ক্লিনিক্যাল ট্রায়াল ও GERD Add-On এভিডেন্স চার্ট',
    caption: '৪৮ মিনিট বনাম ৭২ মিনিট Onset, ৮১% বনাম ৭০% উপশম এবং PPI + Itopride তুলনা।',
  },
  {
    key: 'gaprito_pi',
    title: 'প্লেট ০৫: ৫টি মূল সুবিধা ও সংক্ষিপ্ত প্রেসক্রাইবিং ইনফরমেশন',
    caption: 'ইন্ডিকেশন, মাত্রা (৫০ মি.গ্রা. দিনে ৩ বার খাবারের ৩০ মিনিট আগে) ও সেফটি নির্দেশিকা।',
  },
];

const FAB_ROWS = [
  {
    feature: 'পেরিফেরাল D2 রিসেপ্টর অ্যান্টাগনিজম',
    advantage: 'পরিপাকতন্ত্রে ডোপামিনের বাধাদানকারী প্রভাব কমায়',
    benefit: 'কোলিনার্জিক সক্রিয়তা ও সমন্বিত GI motility বৃদ্ধি করে',
  },
  {
    feature: 'Acetylcholinesterase (AChE) ইনহিবিশন',
    advantage: 'নিঃসৃত অ্যাসিটাইলকোলিনের ভাঙন রোধ করে প্রাপ্যতা বাড়ায়',
    benefit: 'দ্রুত পাকস্থলী খালি হওয়া (gastric emptying) নিশ্চিত করে',
  },
  {
    feature: 'ডুয়াল মেকানিজম (Dual Action)',
    advantage: 'একই মলিকুলে দুটি পরিপূরক প্রোকাইনেটিক পাথওয়ে কাজ করে',
    benefit: 'একক পাথওয়ের তুলনায় দ্রুত ও কার্যকর উপসর্গ উপশম দেয়',
  },
  {
    feature: 'লক্ষ্যভেদী প্রোকাইনেটিক ও CTZ ক্রিয়া',
    advantage: 'গ্যাস্ট্রো-ডিওডেনাল সমন্বয় বাড়ায় ও বমির সংকেত কমায়',
    benefit: 'খাবার পরের ভরা ভাব, early satiety, পেট ফাঁপা ও বমিভাব দূর করে',
  },
  {
    feature: 'অনুকূল সেফটি ও টলারেবিলিটি প্রোফাইল',
    advantage: 'BBB অতিক্রম করে না, স্টাডিতে QTc প্রলংগেশন নেই ও FMO বিপাক',
    benefit: 'উপযুক্ত রোগীদের ৫২ সপ্তাহ পর্যন্ত দীর্ঘমেয়াদি ব্যবস্থাপনায় নির্ভরযোগ্য',
  },
];

const OBJECTION_QA = [
  {
    objection: '১. "Domperidone দিয়ে আমি ভালো রেজাল্ট পাই।"',
    response:
      '"আপনার অভিজ্ঞতাকে সম্মান করি, স্যার। কোন ধরনের রোগীতে আপনি prokinetic ভাবেন? আমি সব বদলাতে বলছি না—নির্বাচিত রোগীর জন্য গ্যাপ্রিটো ডুয়াল মেকানিজম (D2 + AChE inhibition) এবং অনুকূল কার্ডিয়াক ও CNS নিরাপত্তা যোগ করে।"',
  },
  {
    objection: '২. "Itopride-এ বিশেষ কিছু নেই।"',
    response:
      '"কোন দিকটি কম convincing মনে হচ্ছে, স্যার: mechanism, efficacy নাকি evidence?" — এরপর র‍্যান্ডমাইজড ট্রায়াল (৪৮ মিনিট onset, ৮১% উপশম) ও মেটা-অ্যানালাইসিস থেকে সংক্ষেপে তথ্য দিন।',
  },
  {
    objection: '৩. "PPI-তেই আমার কাজ হয়ে যায়।"',
    response:
      '"Acid-related উপসর্গে অবশ্যই, স্যার। তবে অ্যাসিড নিয়ন্ত্রণের পরও যাদের খাবারের পরে পেট ভরা ভাব বা রিজার্জিটেশন থাকে, তাদের কীভাবে manage করেন স্যার? সেখানে গ্যাপ্রিটো কার্যকর Add-on সমাধান দেয়।"',
  },
  {
    objection: '৪. "এটা ধীরে কাজ করে।"',
    response:
      '"কোন রোগীতে এমন দেখেছেন, স্যার?" — কখনো "আপনি ভুল" বলবেন না; শান্তভাবে লিটারেচার দেখান যে স্টাডিতে Itopride ৪৮ মিনিটে কাজ শুরু করেছে (Domperidone ৭২ মিনিট)।',
  },
  {
    objection: '৫. "রোগী সস্তা ওষুধ চান।"',
    response:
      '"Adherence-এর জন্য দাম অবশ্যই গুরুত্বপূর্ণ, স্যার। সঠিক রোগী নির্বাচনও তাই—যাতে দ্রুত উপশমে বারবার ওষুধ বদলাতে না হয়।" (শুধু অনুমোদিত বর্তমান মূল্যতথ্য বলুন)।',
  },
  {
    objection: '৬. "আমি নতুন ব্র্যান্ড লিখি না।"',
    response:
      '"আজই সব বদলাতে বলছি না, স্যার। উপযুক্ত ১ জন ফংশনাল ডিসপেপসিয়া রোগীর জন্য ক্লিনিক্যাল তথ্যটি আপনার টেবিলে রেখে যেতে পারি?"',
  },
  {
    objection: '৭. "Evidence তো mixed।"',
    response:
      '"জি স্যার, সব স্টাডি সম্পূর্ণ একরকম নয়। তবে pooled RCT ও মেটা-অ্যানালাইসিসে global assessment, খাবার পরের ভরা ভাব ও early satiety-তে স্পষ্ট সুফল পাওয়া গেছে।"',
  },
  {
    objection: '৮. "রেখে যান।" (উদাসীনতা)',
    response:
      'একটি সংক্ষিপ্ত ক্লিনিক্যাল প্রশ্ন করুন: "স্যার, আপনার ডিসপেপটিক রোগীদের মধ্যে খাবারের পরের ভরা ভাব বেশি দেখেন, নাকি হার্টবার্ন?"',
  },
];

export const GapritoTrainingSheet: React.FC = () => {
  const [selectedPlate, setSelectedPlate] = useState<(typeof LITERATURE_PLATES)[number] | null>(
    null
  );

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 md:p-10 space-y-10">
      {/* Sheet Header & Action Controls */}
      <div className="flex flex-wrap items-start justify-between gap-6 pb-6 border-b border-slate-200">
        <div className="space-y-1.5">
          <p className="text-xs text-slate-500">
            Novatek Pharmaceuticals Ltd. · ISO 9001:2015 ও GMP Certified · MSO মাস্টার ট্রেনিং শিট
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            Gaprito® (গ্যাপ্রিটো) — Itopride Hydrochloride INN 50 mg Tablet
          </h2>
          <p className="text-sm font-medium text-teal-800">
            ব্র্যান্ড স্লোগান: &ldquo;Dual Action, Smooth Digestion&rdquo; · পজিশনিং: Functional
            dyspepsia-র উপসর্গে ডুয়াল-অ্যাকশন প্রোকাইনেটিক
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 no-print">
          <a
            href={GAPRITO_REFERENCE_PDFS.faqSheet}
            download="Gaprito_MSO_FAQ_Bangla.pdf"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5 text-teal-700" />
            বাংলা FAQ শিট (PDF)
          </a>
          <a
            href={GAPRITO_REFERENCE_PDFS.detailTalk}
            download="Gaprito_Detailing_Talk.pdf"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors whitespace-nowrap"
          >
            <FileText className="w-3.5 h-3.5 text-teal-700" />
            ডিটেইলিং টক (PDF)
          </a>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-teal-700 transition-colors cursor-pointer whitespace-nowrap"
          >
            <Printer className="w-3.5 h-3.5" />
            ট্রেনিং শিট প্রিন্ট করুন
          </button>
        </div>
      </div>

      {/* Section 01: Product Identity, Ga-Pri-Ito & 5D Memory Map */}
      <section className="space-y-5">
        <h3 className="text-lg font-bold text-slate-900">
          ০১. প্রোডাক্ট পরিচিতি, ব্র্যান্ড নামের ব্যাখ্যা (Ga–Pri–Ito) ও ১০ সেকেন্ডের 5D স্মৃতি-মানচিত্র
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-1">
          <div className="lg:col-span-7 divide-y divide-slate-200 border-t border-b border-slate-200 text-sm">
            <div className="py-2.5 flex justify-between gap-4">
              <span className="text-slate-500">ব্র্যান্ড নাম ও জেনেরিক</span>
              <span className="font-semibold text-slate-900 text-right">
                Gaprito® (Itopride Hydrochloride INN 50 mg)
              </span>
            </div>
            <div className="py-2.5 flex justify-between gap-4">
              <span className="text-slate-500">ডোজেজ ফর্ম ও থেরাপিউটিক ক্লাস</span>
              <span className="font-medium text-slate-900 text-right">
                ফিল্ম-কোটেড ট্যাবলেট · Gastroprokinetic Agent
              </span>
            </div>
            <div className="py-2.5 flex justify-between gap-4">
              <span className="text-slate-500">প্যাক সাইজ</span>
              <span className="font-medium text-slate-900 text-right tabular-nums">
                প্রতি বক্সে ৩০টি ট্যাবলেট (৩ × ১০ ব্লিস্টার প্যাক)
              </span>
            </div>
            <div className="py-2.5 flex justify-between gap-4">
              <span className="text-slate-500">সংরক্ষণ বিধি</span>
              <span className="font-medium text-slate-900 text-right">
                ৩০°C-এর নিচে, শুকনো ও আলোমুক্ত স্থানে, শিশুদের নাগালের বাইরে
              </span>
            </div>
            <div className="py-2.5 flex justify-between gap-4">
              <span className="text-slate-500">ব্র্যান্ড নামের ব্যাখ্যা</span>
              <span className="font-medium text-slate-900 text-right">
                Ga (Gastro) + Pri (Prokinetic) + Ito (Itopride)
              </span>
            </div>
          </div>

          <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-lg p-5 space-y-2.5">
            <p className="text-xs font-mono font-semibold text-teal-800">
              ১০ সেকেন্ডের স্মৃতি-মানচিত্র (5D Memory Map)
            </p>
            <ul className="space-y-1.5 text-sm text-slate-800 leading-relaxed">
              <li>
                <strong className="text-slate-900">1. Drug:</strong> Itopride HCl 50 mg
              </li>
              <li>
                <strong className="text-slate-900">2. Dual:</strong> D2 antagonist + AChE inhibitor
              </li>
              <li>
                <strong className="text-slate-900">3. Disease:</strong> Functional dyspepsia (FD)
              </li>
              <li>
                <strong className="text-slate-900">4. Distinct symptoms:</strong> খাবার পরের ভরা ভাব
                (postprandial fullness), early satiety
              </li>
              <li>
                <strong className="text-slate-900">5. Dose:</strong> ৫০ মি.গ্রা. দিনে ৩ বার, খাবারের
                ৩০ মিনিট আগে
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Section 02: Dual Mechanism & FAB Table */}
      <section className="space-y-5 pt-8 border-t border-slate-200">
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-slate-900">
            ০২. ডুয়াল মেকানিজম অফ অ্যাকশন, আণবিক গঠন ও FAB (Feature–Advantage–Benefit)
          </h3>
          <p className="text-sm text-slate-700 leading-relaxed">
            <strong>মনে রাখার ফর্মুলা:</strong> D2 block + AChE block = বেশি Acetylcholine = ভালো GI
            motility = উন্নত Gastric emptying। পাশাপাশি এটি Chemoreceptor Trigger Zone (CTZ)-এ D2
            ব্লক করে বমির সংকেত কমায়। মনে রাখবেন: গ্যাপ্রিটো একটি <strong>motility agent</strong>,
            এটি পাকস্থলীর অ্যাসিড কমায় না (acid suppressant নয়)। আণবিক গঠনের ৩টি অংশ:{' '}
            <span className="font-mono text-xs">
              3,4-dimethoxybenzamide core + benzyl/phenyl linker + dimethylaminoethoxy chain
            </span>
            ।
          </p>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                <th className="py-3 px-4">Feature (বৈশিষ্ট্য)</th>
                <th className="py-3 px-4">Advantage (সুবিধা)</th>
                <th className="py-3 px-4">Clinical Benefit (রোগীর উপকারিতা)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              {FAB_ROWS.map((row) => (
                <tr key={row.feature}>
                  <td className="py-3 px-4 font-semibold text-slate-900">{row.feature}</td>
                  <td className="py-3 px-4">{row.advantage}</td>
                  <td className="py-3 px-4">{row.benefit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Section 03: Clinical Indications, Dosing & Trial Evidence */}
      <section className="space-y-5 pt-8 border-t border-slate-200">
        <h3 className="text-lg font-bold text-slate-900">
          ০৩. ক্লিনিক্যাল ইন্ডিকেশন, সেবনবিধি ও তুলনামূলক ক্লিনিক্যাল এভিডেন্স
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm text-slate-700 leading-relaxed">
          <div className="space-y-2">
            <h4 className="font-semibold text-slate-900">
              ফংশনাল ডিসপেপসিয়া (FD) ও অনুমোদিত উপসর্গসমূহ
            </h4>
            <p>
              রুটিন পরীক্ষায় কোনো অর্গানিক কারণ ছাড়াই গ্যাস্ট্রোডিওডেনাল উপসর্গ থাকলে তাকে FD বলে।
              এর দুটি সাবটাইপ: <strong>Postprandial Distress Syndrome (PDS)</strong> (খাবার পরের ভরা
              ভাব ও early satiety—স্বাভাবিক খাবার শেষ করার আগেই পেট ভরে যাওয়া) এবং{' '}
              <strong>Epigastric Pain Syndrome (EPS)</strong> (উপরের পেটে ব্যথা বা জ্বালা)।
            </p>
            <p>
              <strong>অনুমোদিত উপসর্গ:</strong> ফংশনাল ডিসপেপসিয়া, পেট ভরা ভাব (gastric fullness),
              পেট ফাঁপা (bloating), অরুচি (anorexia), হার্টবার্ন এবং বমিভাব ও বমি।
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-slate-900">মাত্রা ও ব্যবহারবিধি (Dosage Rules)</h4>
            <p>
              <strong>প্রাপ্তবয়স্ক মাত্রা:</strong> ৫০ মি.গ্রা. (১টি ট্যাবলেট) দিনে ৩ বার (দৈনিক মোট
              ১৫০ মি.গ্রা.), <strong>খাবারের প্রায় ৩০ মিনিট আগে</strong>।
            </p>
            <p>
              বয়স ও উপসর্গ ভেদে চিকিৎসক মাত্রা কমাতে পারেন। ক্লিনিক্যাল স্টাডিতে{' '}
              <strong>৫২ সপ্তাহ পর্যন্ত</strong> ভালো সহনশীলতা দেখা গেছে; তবে উন্নতি না হলে অযথা
              চালিয়ে যাওয়া উচিত নয়। ডোজ বাদ পড়লে রোগীকে চিকিৎসক বা ফার্মাসিস্টকে জিজ্ঞাসা করতে বলুন।
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 text-xs font-semibold text-slate-800">
              এভিডেন্স ১: Itopride 50 mg TID বনাম Domperidone 10 mg TID
            </div>
            <table className="w-full text-sm text-left border-collapse tabular-nums">
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="py-2.5 px-4 text-slate-600">কাজ শুরু হওয়ার সময় (Onset)</td>
                  <td className="py-2.5 px-4 font-bold text-teal-800">৪৮ মিনিট (Itopride)</td>
                  <td className="py-2.5 px-4 text-slate-500">৭২ মিনিট (Domperidone)</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 text-slate-600">২ সপ্তাহে উপসর্গ উপশম</td>
                  <td className="py-2.5 px-4 font-bold text-teal-800">৮১% রোগী (Itopride)</td>
                  <td className="py-2.5 px-4 text-slate-500">৭০% রোগী (Domperidone)</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 text-xs font-semibold text-slate-800">
              এভিডেন্স ২: GERD উপসর্গে শুধু PPI বনাম Itopride + PPI (উপসর্গ থাকা হার)
            </div>
            <table className="w-full text-sm text-left border-collapse tabular-nums">
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="py-2 px-4 text-slate-600">Heartburn (বুক জ্বালা)</td>
                  <td className="py-2 px-4 text-slate-500">PPI একক: ৮০%</td>
                  <td className="py-2 px-4 font-bold text-teal-800">Itopride + PPI: ১০%</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 text-slate-600">Regurgitation (উঠে আসা)</td>
                  <td className="py-2 px-4 text-slate-500">PPI একক: ৫০%</td>
                  <td className="py-2 px-4 font-bold text-teal-800">Itopride + PPI: ৩%</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 text-slate-600">Burning in Esophagus</td>
                  <td className="py-2 px-4 text-slate-500">PPI একক: ৩১%</td>
                  <td className="py-2 px-4 font-bold text-teal-800">Itopride + PPI: ৪%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Section 04: Safety, Contraindications & Promotional Compliance */}
      <section className="space-y-4 pt-8 border-t border-slate-200 text-sm text-slate-700 leading-relaxed">
        <h3 className="text-lg font-bold text-slate-900">
          ০৪. সেফটি প্রোফাইল, প্রতিনির্দেশনা (Contraindications) ও প্রোমোশনাল সতর্কতা
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <p>
              <strong>• CNS ও Cardiac নিরাপত্তা:</strong> এটি Blood-Brain Barrier (BBB) অতিক্রম করে
              না বললেই চলে, তাই CNS পার্শ্বপ্রতিক্রিয়া অত্যন্ত কম। বড় placebo-controlled ট্রায়ালে
              QTc prolongation দেখা যায়নি।
            </p>
            <p>
              <strong>• বিপাক ও ওষুধের মিথস্ক্রিয়া:</strong> এটি CYP450 নয়, বরং{' '}
              <strong>Flavin-containing Monooxygenase (FMO)</strong> দিয়ে বিপাক হয়—ফলে CYP
              drug-drug interaction কম। তবে Anticholinergic ওষুধের (scopolamine, tiquizium,
              timepidium) সাথে সতর্কতা প্রয়োজন।
            </p>
            <p>
              <strong>• সাধারণ পার্শ্বপ্রতিক্রিয়া:</strong> পেটে ব্যথা, ডায়রিয়া, বমিভাব,
              কোষ্ঠকাঠিন্য, লালা বৃদ্ধি (salivary hypersecretion), মাথা ঘোরা ও মাথাব্যথা (অধিকাংশই
              মৃদু বা মাঝারি)।
            </p>
          </div>

          <div className="space-y-2">
            <p>
              <strong>• কারা খাবেন না (Contraindications):</strong> Itopride-এ অতিসংবেদনশীলতা এবং
              যেখানে GI motility বাড়ানো ক্ষতিকর—<strong>GI hemorrhage (রক্তক্ষরণ)</strong>,{' '}
              <strong>mechanical obstruction (প্রতিবন্ধকতা)</strong> বা{' '}
              <strong>perforation (ছিদ্র)</strong>।
            </p>
            <p>
              <strong>• বিশেষ জনগোষ্ঠী:</strong> ১৬ বছরের কম বয়সীদের ক্ষেত্রে নিরাপত্তা প্রতিষ্ঠিত
              হয়নি। স্তন্যদানকালে ব্যবহার করতে বলা হয় না; গর্ভাবস্থায় কেবল ঝুঁকির চেয়ে সুফল বেশি হলে
              বিবেচ্য। বয়স্ক ও যকৃতের রোগীদের (ALT/AST বৃদ্ধি বা জন্ডিস) সতর্ক পর্যবেক্ষণ প্রয়োজন।
            </p>
            <p className="text-amber-900 bg-amber-50 border border-amber-200 rounded-lg px-3.5 py-2.5 text-xs">
              <strong>প্রোমোশনাল কমপ্লায়েন্স নিয়ম:</strong> কখনোই &ldquo;side-effect free&rdquo;,
              &ldquo;কখনোই QTc বাড়ায় না&rdquo; বা &ldquo;prolactin-এ প্রভাব নেই&rdquo; বলবেন না। অন্য
              কোনো ব্র্যান্ডের সাথে নাম গুলিয়ে গেলে দ্রুত Brand Team-কে বিস্তারিত জানান।
            </p>
          </div>
        </div>
      </section>

      {/* Section 05: L-A-C-E Objection Handling */}
      <section className="space-y-4 pt-8 border-t border-slate-200">
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            ০৫. চিকিৎসকের আপত্তি মোকাবিলা: L-A-C-E কৌশল (শুনুন · স্বীকার করুন · স্পষ্ট করুন · প্রমাণ
            দিন)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            কখনোই চিকিৎসককে &ldquo;আপনি ভুল&rdquo; বলবেন না বা তর্কে জড়াবেন না—উপযুক্ত ১টি রোগীতে
            চেষ্টা করার বিনীত অনুরোধ করুন।
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {OBJECTION_QA.map((item) => (
            <div
              key={item.objection}
              className="border border-slate-200 rounded-lg p-4 space-y-1.5 text-sm"
            >
              <p className="font-semibold text-slate-900">{item.objection}</p>
              <p className="text-slate-600 leading-relaxed text-xs sm:text-sm">{item.response}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Section 06: Target Prescribers & Top 10 Competitor Brands */}
      <section className="space-y-4 pt-8 border-t border-slate-200 text-sm">
        <h3 className="text-lg font-bold text-slate-900">
          ০৬. টার্গেট প্রেসক্রাইবার ও বাজারের শীর্ষ প্রতিদ্বন্দ্বী ব্র্যান্ড
        </h3>
        <p className="text-slate-700 leading-relaxed">
          <strong>টার্গেট চিকিৎসক:</strong> Gastroenterologist, Internal Medicine Physician, Family
          Physician, General Practitioner (GP), Diabetologist, Endocrinologist, Cardiologist,
          Geriatric Specialist, Gynecologist, ENT Specialist, General Surgeon, PC, DMF ও SACMO।
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-slate-200 rounded-lg p-4 space-y-2">
            <p className="text-xs font-semibold text-slate-900">
              Itopride Hydrochloride 50 mg — Top 5 Brands
            </p>
            <p className="text-xs text-slate-600 leading-relaxed">
              1. Itokine (Everest) · 2. Peritop (Beacon) · 3. Itopa (Aristo) · 4. Itogut (ACI) · 5.
              Dizmo (Square)
            </p>
          </div>
          <div className="border border-slate-200 rounded-lg p-4 space-y-2">
            <p className="text-xs font-semibold text-slate-900">
              Domperidone Maleate 10 mg — Top 5 Brands
            </p>
            <p className="text-xs text-slate-600 leading-relaxed">
              1. Omidon (Incepta) · 2. Don-A (ACME) · 3. Deflux (Beximco) · 4. Motigut (Square) · 5.
              Efodio (Radiant)
            </p>
          </div>
        </div>
      </section>

      {/* Section 07: Official Visual Literature Plates Gallery */}
      <section className="space-y-4 pt-8 border-t border-slate-200 no-print">
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="text-lg font-bold text-slate-900">
            ০৭. অফিসিয়াল গ্যাপ্রিটো ভিজ্যুয়াল লিটারেচার প্লেটসমূহ (ক্লিক করে বড় করে দেখুন)
          </h3>
          <span className="text-xs text-slate-500">৫টি হাই-রেজোলিউশন শিট</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {LITERATURE_PLATES.map((plate) => (
            <button
              key={plate.key}
              type="button"
              onClick={() => setSelectedPlate(plate)}
              className="group text-left border border-slate-200 rounded-lg overflow-hidden hover:border-teal-700 transition-colors cursor-pointer bg-white flex flex-col justify-between"
            >
              <div className="aspect-[3/4] w-full bg-slate-100 relative overflow-hidden">
                <ResilientImage
                  srcKeyOrUrl={plate.key}
                  alt={plate.title}
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-2 right-2 p-1.5 rounded bg-slate-900/80 text-white opacity-90 group-hover:opacity-100">
                  <Maximize2 className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="p-3">
                <p className="text-xs font-semibold text-slate-900 line-clamp-2">{plate.title}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Lightbox Modal for Literature Plates */}
      {selectedPlate && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 flex items-center justify-center p-4 md:p-8 no-print">
          <div className="max-w-5xl w-full bg-white rounded-xl overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200">
              <p className="text-sm font-semibold text-slate-900 truncate">{selectedPlate.title}</p>
              <button
                type="button"
                onClick={() => setSelectedPlate(null)}
                className="p-1.5 text-slate-500 hover:text-slate-900 cursor-pointer"
                aria-label="Close plate preview"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 bg-slate-100 max-h-[78vh] overflow-auto flex items-center justify-center">
              <ResilientImage
                srcKeyOrUrl={selectedPlate.key}
                alt={selectedPlate.title}
                className="max-h-[72vh] w-auto object-contain"
              />
            </div>
            <div className="px-5 py-3 border-t border-slate-200 text-xs text-slate-600">
              {selectedPlate.caption}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
