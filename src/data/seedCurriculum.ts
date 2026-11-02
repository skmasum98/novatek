import type {
  ExamQuestion,
  LearningResource,
  ProductModule,
} from '../types/models';
import { GAPRITO_SEED_BUNDLE } from './gapritoCurriculum';

export interface SeedModuleBundle {
  product: Omit<ProductModule, 'authorId' | 'createdAt' | 'updatedAt'>;
  resources: Omit<LearningResource, 'authorId' | 'createdAt' | 'updatedAt'>[];
  questions: Omit<ExamQuestion, 'authorId' | 'createdAt' | 'updatedAt'>[];
}

export const NOVATEK_FLAGSHIP_CURRICULUM: SeedModuleBundle[] = [
  GAPRITO_SEED_BUNDLE,
  {
    product: {
      id: 'prod_cardionova_xr',
      brandName: 'CardioNova XR',
      genericComposition: 'Telmisartan 40 mg + Cilnidipine 10 mg Bilayer Tablet',
      therapeuticClass: 'Cardiovascular',
      summary:
        'Once-daily bilayer antihypertensive combining sustained 24-hour AT1 receptor blockade with dual L/N-type calcium channel inhibition to control morning blood pressure surges with markedly lower ankle edema.',
      indications:
        'Essential hypertension not adequately controlled on monotherapy; hypertensive patients with metabolic syndrome, diabetic microalbuminuria, or amlodipine-induced pedal edema.',
      dosageGuidance:
        'One tablet once daily in the morning, with or without food. Swallow whole; do not crush or split the controlled-release bilayer tablet. Contraindicated in pregnancy and bilateral renal artery stenosis.',
      keySellingPoints:
        '1. Cilnidipine blocks sympathetic N-type Ca2+ channels alongside vascular L-type channels, preventing reflex tachycardia and reducing pedal edema incidence compared to amlodipine.\n2. Telmisartan provides a 24-hour terminal half-life, protecting against early-morning cardiovascular events.\n3. Renoprotective reduction in intraglomerular pressure and urinary albumin excretion.',
      coverImageKey: 'cardionova',
      passingPercentage: 75,
      examDurationMinutes: 12,
      resourceCount: 3,
      questionCount: 4,
      status: 'published',
    },
    resources: [
      {
        id: 'res_cardio_1',
        productId: 'prod_cardionova_xr',
        productStatus: 'published',
        orderIndex: 0,
        resourceType: 'text',
        title: 'Clinical Monograph: Dual L/N-Type Channel Synergy & Renoprotection',
        estimatedMinutes: 5,
        bodyText:
          'Hypertension management frequently stalls when conventional L-type calcium channel blockers (such as amlodipine) trigger precapillary arteriolar dilation without balanced postcapillary venular dilation, leading to hydrostatic capillary leakage and dose-limiting ankle edema.\n\nCardioNova XR pairs Telmisartan 40 mg—the longest-acting angiotensin II receptor blocker (half-life ~24 hours) with selective PPAR-gamma partial agonism—with Cilnidipine 10 mg, a fourth-generation dihydropyridine CCB that inhibits both vascular L-type and sympathetic nerve-ending N-type calcium channels.\n\nBy suppressing norepinephrine release from sympathetic nerve terminals, Cilnidipine attenuates reflex heart-rate elevation, dilates both afferent and efferent glomerular arterioles, and lowers hydrostatic capillary pressure.\n\nClinical Detailing Protocol:\n• Target Specialists: Cardiologists, Internal Medicine Consultants, Diabetologists, and Nephrologists.\n• Core Patient Profile: Uncontrolled Stage 2 hypertensives, patients discontinuing amlodipine due to ankle swelling, and hypertensive Type 2 diabetics with early proteinuria.\n• Safety Reminder: Monitor serum potassium and creatinine in impaired renal function; strictly contraindicated across all trimesters of pregnancy.',
        mediaUrl: '',
        mediaCaption: '',
        clinicalTakeaway:
          'Position CardioNova XR for hypertensive patients experiencing ankle edema on amlodipine or requiring reliable early-morning surge protection without reflex tachycardia.',
      },
      {
        id: 'res_cardio_2',
        productId: 'prod_cardionova_xr',
        productStatus: 'published',
        orderIndex: 1,
        resourceType: 'video',
        title: 'Video Briefing: 24-Hour Ambulatory BP Curve & Sympathetic Modulation',
        estimatedMinutes: 4,
        bodyText:
          'Interactive clinical briefing walking field colleagues through the 24-hour trough-to-peak blood pressure profile of CardioNova XR, comparing sympathetic N-type channel blockade against standard CCB therapy during the 06:00–10:00 morning surge window.',
        mediaUrl: 'novatek-briefing://cardionova-pk',
        mediaCaption:
          'Novatek Medical Affairs Briefing — 24-Hour Trough-to-Peak Ratio & Capillary Hydrostatic Balance (03:40)',
        clinicalTakeaway:
          'Telmisartan’s ~24-hour half-life maintains smooth blood pressure control right through the high-risk morning hours before the next scheduled dose.',
      },
      {
        id: 'res_cardio_3',
        productId: 'prod_cardionova_xr',
        productStatus: 'published',
        orderIndex: 2,
        resourceType: 'image',
        title: 'Visual Aid: Bilayer Controlled Dissolution & AT1 Receptor Binding',
        estimatedMinutes: 3,
        bodyText:
          'Review this visual detailing plate prior to physician calls. The upper schematic illustrates selective AT1 receptor antagonism on vascular smooth muscle, while the lower cross-section demonstrates Novatek’s moisture-shielded bilayer matrix engineered to release Telmisartan and Cilnidipine predictably across physiological pH gradients.',
        mediaUrl: 'diagram_pharmacokinetics',
        mediaCaption:
          'Figure 1.1 — Selective vascular receptor binding and controlled bilayer tablet dissolution profile.',
        clinicalTakeaway:
          'Instruct physicians and pharmacists that CardioNova XR tablets should be swallowed whole and kept in aluminum-aluminum blister pockets until administration.',
      },
    ],
    questions: [
      {
        id: 'q_cardio_1',
        productId: 'prod_cardionova_xr',
        productStatus: 'published',
        orderIndex: 0,
        questionType: 'mcq',
        prompt:
          'Which pharmacological mechanism of Cilnidipine in CardioNova XR directly reduces the incidence of reflex tachycardia and ankle edema compared with conventional amlodipine?',
        points: 25,
        options: [
          'Dual blockade of vascular L-type and sympathetic nerve N-type calcium channels',
          'Irreversible inhibition of angiotensin-converting enzyme in pulmonary endothelium',
          'Direct beta-1 adrenergic receptor antagonism in sinoatrial nodal tissue',
          'Loop diuretic natriuresis in the thick ascending limb of Henle',
        ],
        correctOptionIndex: 0,
        rubricKeywords: [],
        modelAnswer:
          'Cilnidipine blocks both vascular L-type and sympathetic nerve-ending N-type Ca2+ channels, blunting norepinephrine release, preventing reflex tachycardia, and balancing pre- and post-capillary tone.',
      },
      {
        id: 'q_cardio_2',
        productId: 'prod_cardionova_xr',
        productStatus: 'published',
        orderIndex: 1,
        questionType: 'mcq',
        prompt:
          'What approximate elimination half-life of Telmisartan supports CardioNova XR’s protection against early-morning blood pressure surges?',
        points: 25,
        options: [
          '4 to 6 hours, requiring three-times-daily dosing',
          'Approximately 24 hours, sustaining trough AT1 blockade',
          '90 minutes, relying exclusively on active renal metabolites',
          '7 days, permitting once-weekly administration',
        ],
        correctOptionIndex: 1,
        rubricKeywords: [],
        modelAnswer:
          'Telmisartan has the longest plasma elimination half-life among ARBs (~24 hours), providing sustained trough-to-peak blood pressure control across the morning surge window.',
      },
      {
        id: 'q_cardio_3',
        productId: 'prod_cardionova_xr',
        productStatus: 'published',
        orderIndex: 2,
        questionType: 'mcq',
        prompt:
          'In which of the following patient populations is CardioNova XR strictly contraindicated?',
        points: 20,
        options: [
          'Adult Stage 2 hypertensive patients with mild ankle swelling on amlodipine',
          'Hypertensive patients across any trimester of pregnancy',
          'Patients aged 55 years with controlled dyslipidemia',
          'Patients taking once-daily low-dose statin therapy at bedtime',
        ],
        correctOptionIndex: 1,
        rubricKeywords: [],
        modelAnswer:
          'Drugs acting directly on the renin-angiotensin system (including Telmisartan) cause fetal renal and developmental toxicity and are strictly contraindicated in pregnancy.',
      },
      {
        id: 'q_cardio_4',
        productId: 'prod_cardionova_xr',
        productStatus: 'published',
        orderIndex: 3,
        questionType: 'text',
        prompt:
          'Clinical Detailing Scenario (Written): A physician asks why they should switch a hypertensive diabetic patient with ankle swelling from Telmisartan + Amlodipine to CardioNova XR. Write your concise 2–3 sentence clinical response.',
        points: 30,
        options: [],
        correctOptionIndex: -1,
        rubricKeywords: ['cilnidipine', 'n-type', 'edema', 'sympathetic', 'proteinuria'],
        modelAnswer:
          'CardioNova XR replaces amlodipine with Cilnidipine, which inhibits sympathetic N-type as well as vascular L-type calcium channels to balance pre- and post-capillary pressure and resolve ankle edema. Additionally, dual N-type blockade suppresses sympathetic norepinephrine surge and offers superior reduction of diabetic proteinuria without reflex tachycardia.',
      },
    ],
  },
  {
    product: {
      id: 'prod_glucotide_duo',
      brandName: 'GlucoTide Duo',
      genericComposition: 'Empagliflozin 10 mg + Linagliptin 5 mg Film-Coated Tablet',
      therapeuticClass: 'Metabolic & Endocrine',
      summary:
        'Complementary single-pill Type 2 diabetes therapy uniting insulin-independent renal SGLT2 glucose excretion with non-renally cleared DPP-4 incretin enhancement and intrinsically low hypoglycemia risk.',
      indications:
        'Adjunct to diet and exercise to improve glycemic control in adults with Type 2 diabetes mellitus when metformin plus one component does not provide adequate HbA1c control, or when dual cardiorenal-metabolic protection is prioritized.',
      dosageGuidance:
        'One tablet (10 mg / 5 mg) once daily in the morning with or without food. Assess renal function (eGFR) prior to initiation; Linagliptin requires zero hepatic or renal dose titration, while Empagliflozin glycemic initiation follows eGFR thresholds.',
      keySellingPoints:
        '1. Dual complementary mechanisms addressing both fasting and postprandial hyperglycemia without beta-cell exhaustion.\n2. Linagliptin is predominantly excreted via the enterohepatic biliary route (>80%), avoiding renal accumulation.\n3. Empagliflozin promotes osmotic diuresis, modest weight reduction, and proven heart-failure hospitalization risk reduction.',
      coverImageKey: 'glucotide',
      passingPercentage: 75,
      examDurationMinutes: 12,
      resourceCount: 3,
      questionCount: 4,
      status: 'published',
    },
    resources: [
      {
        id: 'res_gluco_1',
        productId: 'prod_glucotide_duo',
        productStatus: 'published',
        orderIndex: 0,
        resourceType: 'text',
        title: 'Clinical Monograph: Complementary SGLT2 & DPP-4 Glycemic Physiology',
        estimatedMinutes: 5,
        bodyText:
          'When SGLT2 inhibition with Empagliflozin lowers plasma glucose via urinary glucose excretion (~70–80 g/day), a compensatory rise in endogenous glucagon and hepatic glucose production can partially offset HbA1c reduction. Co-administering Linagliptin 5 mg inhibits DPP-4, preserving active GLP-1 and GIP to stimulate glucose-dependent insulin secretion and suppress inappropriate glucagon release.\n\nWhy Linagliptin + Empagliflozin Stands Out in Novatek’s Portfolio:\n• Weight & Hypoglycemia Neutrality/Benefit: Unlike sulfonylureas, neither component triggers glucose-independent insulin release, maintaining near-zero intrinsic hypoglycemia risk while supporting 2–3 kg caloric weight loss.\n• Biliary Elimination Advantage: Over 80% of Linagliptin is eliminated unchanged via bile and gut rather than glomerular filtration.\n• Patient Counseling Checklist: Advise adequate daily hydration, genital hygiene counseling to minimize mycotic infections, and temporary "sick-day" holding prior to major fasting surgery.',
        mediaUrl: '',
        mediaCaption: '',
        clinicalTakeaway:
          'Linagliptin blunts the compensatory glucagon rise triggered by SGLT2 glucosuria, delivering synergistic HbA1c lowering with minimal hypoglycemia risk.',
      },
      {
        id: 'res_gluco_2',
        productId: 'prod_glucotide_duo',
        productStatus: 'published',
        orderIndex: 1,
        resourceType: 'video',
        title: 'Video Briefing: GlucoTide Duo Patient Selection & eGFR Counseling',
        estimatedMinutes: 4,
        bodyText:
          'Guided clinical briefing covering fasting and post-meal glucose curves, biliary clearance of Linagliptin vs renally cleared DPP-4 inhibitors, and practical hygiene/hydration tips physicians share with newly initiated patients.',
        mediaUrl: 'novatek-briefing://glucotide-synergy',
        mediaCaption:
          'Novatek Metabolic Division Briefing — Dual Incretin & Renal Glucosuria Synergy (03:25)',
        clinicalTakeaway:
          'Emphasize single-tablet morning convenience to improve adherence in polypharmacy T2DM patients.',
      },
      {
        id: 'res_gluco_3',
        productId: 'prod_glucotide_duo',
        productStatus: 'published',
        orderIndex: 2,
        resourceType: 'image',
        title: 'Visual Aid:GlucoTide Duo Packaging & Film-Coated Tablet Profile',
        estimatedMinutes: 3,
        bodyText:
          'Familiarize yourself with the commercial presentation of GlucoTide Duo (10s Alu-Alu blister strip) and its moisture-resistant film coating designed for tropical Zone IVb stability across all regional depots.',
        mediaUrl: 'glucotide',
        mediaCaption:
          'Figure 2.1 — GlucoTide Duo commercial blister pack engineered for high-humidity Zone IVb stability.',
        clinicalTakeaway:
          'Highlight single-pill simplicity and Zone IVb blister integrity when detailing to both endocrinologists and retail hospital pharmacies.',
      },
    ],
    questions: [
      {
        id: 'q_gluco_1',
        productId: 'prod_glucotide_duo',
        productStatus: 'published',
        orderIndex: 0,
        questionType: 'mcq',
        prompt:
          'How does Linagliptin physiologically complement Empagliflozin inside GlucoTide Duo?',
        points: 25,
        options: [
          'It preserves active GLP-1 to suppress compensatory glucagon secretion while stimulating glucose-dependent insulin release',
          'It blocks intestinal brush-border alpha-glucosidase enzymes in the jejunum',
          'It directly stimulates pancreatic ATP-sensitive potassium channels regardless of blood glucose',
          'It inhibits proximal tubular carbonic anhydrase to alkalinize urine',
        ],
        correctOptionIndex: 0,
        rubricKeywords: [],
        modelAnswer:
          'Linagliptin inhibits DPP-4, raising active GLP-1 and GIP levels, which suppresses the compensatory glucagon elevation seen with SGLT2-induced glucosuria.',
      },
      {
        id: 'q_gluco_2',
        productId: 'prod_glucotide_duo',
        productStatus: 'published',
        orderIndex: 1,
        questionType: 'mcq',
        prompt:
          'What is the primary elimination pathway of Linagliptin that differentiates it from sitagliptin and vildagliptin?',
        points: 25,
        options: [
          '100% glomerular filtration requiring dose halving at eGFR 55 mL/min',
          'Predominantly non-renal enterohepatic biliary excretion (>80%)',
          'Pulmonary exhalation as volatile metabolites',
          'Rapid plasma pseudocholinesterase hydrolysis within 3 minutes',
        ],
        correctOptionIndex: 1,
        rubricKeywords: [],
        modelAnswer:
          'More than 80% of Linagliptin is excreted unchanged via the enterohepatic/biliary fecal route, avoiding renal drug accumulation.',
      },
      {
        id: 'q_gluco_3',
        productId: 'prod_glucotide_duo',
        productStatus: 'published',
        orderIndex: 2,
        questionType: 'mcq',
        prompt:
          'Which routine preventive counseling point should physicians give patients starting an Empagliflozin-containing regimen like GlucoTide Duo?',
        points: 20,
        options: [
          'Consume a high-sodium snack before bedtime to prevent nocturnal hypoglycemia',
          'Maintain adequate daily hydration and routine genital hygiene to lower mycotic infection risk',
          'Take the tablet strictly 30 minutes after a high-fat evening meal',
          'Avoid all dairy products due to chelation in the stomach',
        ],
        correctOptionIndex: 1,
        rubricKeywords: [],
        modelAnswer:
          'Because SGLT2 inhibition increases urinary glucose excretion and mild osmotic diuresis, hydration and routine personal hygiene minimize volume depletion and genital mycotic infections.',
      },
      {
        id: 'q_gluco_4',
        productId: 'prod_glucotide_duo',
        productStatus: 'published',
        orderIndex: 3,
        questionType: 'text',
        prompt:
          'Clinical Detailing Scenario (Written): Explain why GlucoTide Duo carries a much lower intrinsic risk of hypoglycemia and weight gain compared to adding a sulfonylurea to metformin.',
        points: 30,
        options: [],
        correctOptionIndex: -1,
        rubricKeywords: ['glucose-dependent', 'glucosuria', 'weight', 'insulin', 'glucagon'],
        modelAnswer:
          'Empagliflozin lowers glucose via insulin-independent urinary glucose excretion (promoting modest caloric weight loss), while Linagliptin enhances GLP-1 in a strictly glucose-dependent manner rather than forcing continuous beta-cell insulin release like sulfonylureas.',
      },
    ],
  },
  {
    product: {
      id: 'prod_respiraclear_dpi',
      brandName: 'RespiraClear DPI',
      genericComposition: 'Budesonide 200 mcg + Formoterol Fumarate 6 mcg Dry Powder Inhaler',
      therapeuticClass: 'Respiratory',
      summary:
        'Precision breath-actuated dry powder inhaler delivering anti-inflammatory airway control alongside rapid-onset (1–3 minute) 12-hour bronchodilation for Maintenance and Reliever Therapy (MART) in asthma and COPD.',
      indications:
        'Regular maintenance treatment of persistent asthma (both maintenance and as-needed symptom relief under MART guidance) and symptomatic moderate-to-severe COPD with recurrent exacerbations.',
      dosageGuidance:
        'Asthma MART: 1–2 inhalations daily as maintenance plus additional inhalations as needed for acute symptoms (up to guideline daily maximum). Rinse mouth with water and spit out after maintenance inhalations to prevent oral candidiasis.',
      keySellingPoints:
        '1. Formoterol achieves rapid bronchodilator onset within 1–3 minutes—comparable to salbutamol—while sustaining 12-hour LABA duration.\n2. Every reliever actuation co-delivers Budesonide to treat underlying eosinophilic airway inflammation early during flare-ups.\n3. Integrated front-facing dose window prevents unexpected empty-inhaler emergencies.',
      coverImageKey: 'respiraclear',
      passingPercentage: 80,
      examDurationMinutes: 10,
      resourceCount: 3,
      questionCount: 4,
      status: 'published',
    },
    resources: [
      {
        id: 'res_resp_1',
        productId: 'prod_respiraclear_dpi',
        productStatus: 'published',
        orderIndex: 0,
        resourceType: 'text',
        title: 'Clinical Monograph: Single-Inhaler MART Strategy & Airway Pharmacology',
        estimatedMinutes: 5,
        bodyText:
          'International asthma guidelines strongly favor ICS-Formoterol single-inhaler Maintenance and Reliever Therapy (MART) over SABA-only reliance because patients experiencing worsening bronchoconstriction naturally reach for their reliever—and when that reliever contains Budesonide + Formoterol, they automatically titrate anti-inflammatory corticosteroid exposure right when exacerbation cascades begin.\n\nPharmacological Advantage of Formoterol vs Salmeterol:\n• Formoterol is moderately lipophilic with high intrinsic beta-2 agonism: a water-soluble fraction reaches smooth muscle beta-2 receptors within 1–3 minutes for rapid relief, while a lipid-depot fraction maintains bronchodilation for 12 hours.\n• Salmeterol has a delayed onset (15–20 minutes) and must never be used as an acute reliever.\n\nFour-Step Patient Technique Coaching:\n1. Uncap upright and verify the front dose counter.\n2. Exhale gently away from the mouthpiece.\n3. Seal lips firmly and inhale forcefully and deeply through the mouth.\n4. Hold breath for up to 10 seconds, recap cleanly, and rinse mouth with water after maintenance doses.',
        mediaUrl: '',
        mediaCaption: '',
        clinicalTakeaway:
          'Unlike salmeterol combinations, RespiraClear DPI’s Formoterol component acts within 1–3 minutes, enabling unified single-inhaler MART protection.',
      },
      {
        id: 'res_resp_2',
        productId: 'prod_respiraclear_dpi',
        productStatus: 'published',
        orderIndex: 1,
        resourceType: 'video',
        title: 'Video Briefing: Inspiratory Flow Coaching & Oropharyngeal Care',
        estimatedMinutes: 4,
        bodyText:
          'Step-by-step clinical video briefing demonstrating forceful deep inhalation technique for dry powder de-agglomeration, fine-particle fraction deposition (<5 microns) into small airways, and post-dose mouth rinsing.',
        mediaUrl: 'novatek-briefing://respiraclear-mart',
        mediaCaption:
          'Novatek Respiratory Care Briefing — Fine-Particle Lung Deposition & MART Protocol (03:15)',
        clinicalTakeaway:
          'Remind every clinician and pharmacist that rinsing the mouth and spitting out water after maintenance doses eliminates local dysphonia and oral thrush risk.',
      },
      {
        id: 'res_resp_3',
        productId: 'prod_respiraclear_dpi',
        productStatus: 'published',
        orderIndex: 2,
        resourceType: 'image',
        title: 'Visual Aid: RespiraClear Ergonomic Device & Dose-Tracking Window',
        estimatedMinutes: 3,
        bodyText:
          'Inspect the RespiraClear DPI industrial design: low-resistance airflow channel suitable even during mild-to-moderate airflow limitation, tactile emerald grip cap, and clear numerical dose counter window.',
        mediaUrl: 'respiraclear',
        mediaCaption:
          'Figure 3.1 — RespiraClear DPI featuring integrated front dose indicator window and low-resistance mouthpiece.',
        clinicalTakeaway:
          'Show physicians the integrated front dose window—eliminating the guesswork common with uncounted pressurized canisters.',
      },
    ],
    questions: [
      {
        id: 'q_resp_1',
        productId: 'prod_respiraclear_dpi',
        productStatus: 'published',
        orderIndex: 0,
        questionType: 'mcq',
        prompt:
          'Why can Budesonide + Formoterol (RespiraClear DPI) be prescribed as both maintenance and reliever therapy (MART), whereas Fluticasone + Salmeterol cannot?',
        points: 25,
        options: [
          'Formoterol has a rapid 1–3 minute bronchodilator onset alongside 12-hour duration, whereas Salmeterol has a delayed onset',
          'Salmeterol is an inhaled antimuscarinic with only 2-hour duration',
          'Budesonide is an oral leukotriene antagonist',
          'Formoterol permanently desensitizes muscarinic M3 receptors',
        ],
        correctOptionIndex: 0,
        rubricKeywords: [],
        modelAnswer:
          'Formoterol combines rapid 1–3 minute onset of bronchodilation with 12-hour LABA duration, enabling immediate symptom relief while co-delivering anti-inflammatory Budesonide.',
      },
      {
        id: 'q_resp_2',
        productId: 'prod_respiraclear_dpi',
        productStatus: 'published',
        orderIndex: 1,
        questionType: 'mcq',
        prompt:
          'What essential post-inhalation instruction reduces the risk of oral candidiasis (thrush) and hoarseness with RespiraClear DPI?',
        points: 25,
        options: [
          'Drink hot citrus juice immediately before inhaling',
          'Rinse the mouth with water and spit out without swallowing after maintenance doses',
          'Exhale forcefully directly into the dry powder mouthpiece before inhaling',
          'Wash the internal powder reservoir under running tap water weekly',
        ],
        correctOptionIndex: 1,
        rubricKeywords: [],
        modelAnswer:
          'Rinsing the mouth with water and spitting it out clears residual oropharyngeal corticosteroid particles, preventing oral thrush and dysphonia.',
      },
      {
        id: 'q_resp_3',
        productId: 'prod_respiraclear_dpi',
        productStatus: 'published',
        orderIndex: 2,
        questionType: 'mcq',
        prompt:
          'What inhalation maneuver is required for optimal fine-particle lung deposition from a breath-actuated Dry Powder Inhaler (DPI) like RespiraClear?',
        points: 20,
        options: [
          'A forceful, deep inhalation through the mouth followed by a breath-hold up to 10 seconds',
          'Shallow rapid panting through the nose without holding breath',
          'Simultaneous shaking and propellant actuation during exhalation',
          'Breathing slowly over 30 seconds through a face mask only',
        ],
        correctOptionIndex: 0,
        rubricKeywords: [],
        modelAnswer:
          'Breath-actuated DPIs rely on a forceful, deep inspiratory flow to de-agglomerate micronized drug particles from lactose carriers, followed by a ~10-second breath-hold for airway sedimentation.',
      },
      {
        id: 'q_resp_4',
        productId: 'prod_respiraclear_dpi',
        productStatus: 'published',
        orderIndex: 3,
        questionType: 'text',
        prompt:
          'Clinical Detailing Scenario (Written): Describe how a patient should prepare, inhale, and complete a maintenance dose of RespiraClear DPI so you can coach clinic nurses accurately.',
        points: 30,
        options: [],
        correctOptionIndex: -1,
        rubricKeywords: ['exhale', 'forceful', 'deep', 'hold', 'rinse'],
        modelAnswer:
          'Check the dose counter, exhale gently away from the mouthpiece, seal lips and take a forceful deep inhalation through the mouth, hold breath for up to 10 seconds, recap the inhaler dry, and rinse the mouth with water and spit out.',
      },
    ],
  },
];
