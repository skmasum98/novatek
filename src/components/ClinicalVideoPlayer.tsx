import React, { useEffect, useMemo, useState } from 'react';
import { Pause, Play, RotateCcw, Volume2 } from 'lucide-react';

interface BriefingChapter {
  timeRange: [number, number];
  heading: string;
  keyMetricLabel: string;
  keyMetricValue: string;
  narration: string;
  curvePoints: number[];
  comparisonPoints: number[];
}

const BRIEFING_DECKS: Record<string, BriefingChapter[]> = {
  'novatek-briefing://gaprito-bangla': [
    {
      timeRange: [0, 15],
      heading: '০১. ডুয়াল মেকানিজম (D2 Block + AChE Inhibition)',
      keyMetricLabel: 'Dual Prokinetic Action',
      keyMetricValue: 'D2 + AChE Block',
      narration:
        'গ্যাপ্রিটো (Itopride HCl 50 mg) পেরিফেরাল ডোপামিন D2 রিসেপ্টর ব্লক করে এবং অ্যাসিটাইলকোলিনএস্টারেজ (AChE) এনজাইম ইনহিবিট করে—ফলে অ্যাসিটাইলকোলিন বৃদ্ধি পায় এবং পাকস্থলীর সঞ্চালন (GI motility) ও খালি হওয়া দ্রুত হয়।',
      curvePoints: [52, 74, 86, 91, 92, 90, 89],
      comparisonPoints: [46, 56, 65, 70, 69, 66, 63],
    },
    {
      timeRange: [15, 30],
      heading: '০২. দ্রুত কার্যকারিতা (৪৮ মিনিট) ও PPI Add-On সুফল',
      keyMetricLabel: 'Onset ও উপসর্গ উপশম',
      keyMetricValue: '৪৮ মিনিট · ৮১%',
      narration:
        'ডমপেরিডোনের (৭২ মিনিট, ৭০% উপশম) তুলনায় গ্যাপ্রিটো মাত্র ৪৮ মিনিটে কাজ শুরু করে এবং ৮১% রোগীতে কার্যকর উপশম দেয়। PPI-এর সাথে যুক্ত করলে হার্টবার্ন ৮০% থেকে ১০%-এ এবং রিজার্জিটেশন ৫০% থেকে ৩%-এ নেমে আসে।',
      curvePoints: [68, 84, 90, 92, 91, 90, 89],
      comparisonPoints: [50, 62, 69, 70, 68, 65, 62],
    },
    {
      timeRange: [30, 45],
      heading: '০৩. অনুকূল নিরাপত্তা, সেবনবিধি ও চেম্বার কল (5D)',
      keyMetricLabel: 'অনুমোদিত মাত্রা ও সহনশীলতা',
      keyMetricValue: '৫০ মি.গ্রা. দিনে ৩ বার',
      narration:
        'খাবারের ৩০ মিনিট আগে ১টি ট্যাবলেট দিনে ৩ বার। এটি BBB অতিক্রম করে না, স্টাডিতে QTc প্রলংগেশন দেখা যায়নি এবং FMO পথে বিপাক হওয়ায় ওষুধের মিথস্ক্রিয়া কম—৫২ সপ্তাহ পর্যন্ত প্রমাণিত সহনশীলতা।',
      curvePoints: [80, 88, 92, 93, 92, 91, 90],
      comparisonPoints: [58, 61, 60, 58, 55, 52, 50],
    },
  ],
  'novatek-briefing://cardionova-pk': [
    {
      timeRange: [0, 15],
      heading: '01. Morning Surge Risk & Trough Coverage',
      keyMetricLabel: 'Telmisartan Elimination Half-Life',
      keyMetricValue: '~24.0 hrs',
      narration:
        'Between 06:00 and 10:00 AM, sympathetic activation triggers a sharp rise in systolic blood pressure. Shorter-acting antihypertensives lose receptor occupancy overnight, whereas Telmisartan 40 mg sustains AT1 blockade across the full 24-hour dosing interval.',
      curvePoints: [88, 92, 90, 87, 85, 83, 80],
      comparisonPoints: [86, 89, 76, 62, 48, 38, 30],
    },
    {
      timeRange: [15, 30],
      heading: '02. Dual L/N-Type Calcium Channel Inhibition',
      keyMetricLabel: 'Sympathetic Norepinephrine Suppression',
      keyMetricValue: 'N-Type + L-Type',
      narration:
        'Conventional amlodipine blocks only vascular L-type Ca2+ channels, causing selective precapillary arteriolar dilation and ankle edema. Cilnidipine 10 mg simultaneously inhibits sympathetic N-type channels, balancing postcapillary tone.',
      curvePoints: [78, 84, 86, 85, 84, 82, 81],
      comparisonPoints: [75, 58, 49, 44, 42, 40, 39],
    },
    {
      timeRange: [30, 45],
      heading: '03. Clinical Detailing Summary for Physicians',
      keyMetricLabel: 'Recommended Regimen',
      keyMetricValue: '1 Tablet Daily AM',
      narration:
        'Position CardioNova XR for uncontrolled Stage 2 hypertension, patients switching off amlodipine due to ankle edema, and hypertensive diabetics needing renoprotective proteinuria reduction.',
      curvePoints: [82, 88, 91, 90, 89, 87, 86],
      comparisonPoints: [70, 68, 59, 51, 45, 41, 38],
    },
  ],
  'novatek-briefing://glucotide-synergy': [
    {
      timeRange: [0, 15],
      heading: '01. Complementary SGLT2 + DPP-4 Glycemic Action',
      keyMetricLabel: 'Renal Glucose Excretion',
      keyMetricValue: '~70–80 g/day',
      narration:
        'Empagliflozin 10 mg clears excess plasma glucose directly via proximal renal tubules independent of beta-cell reserve, while Linagliptin 5 mg preserves active GLP-1 to suppress compensatory hepatic glucagon output.',
      curvePoints: [85, 88, 90, 89, 87, 86, 85],
      comparisonPoints: [65, 68, 62, 55, 50, 46, 44],
    },
    {
      timeRange: [15, 30],
      heading: '02. Enterohepatic Clearance of Linagliptin',
      keyMetricLabel: 'Non-Renal Biliary Excretion',
      keyMetricValue: '>80% Unchanged',
      narration:
        'Unlike sitagliptin or vildagliptin, Linagliptin is predominantly eliminated via bile and gut, requiring zero dose adjustment across hepatic or renal impairment stages while Empagliflozin follows standard eGFR initiation criteria.',
      curvePoints: [84, 86, 88, 88, 87, 86, 86],
      comparisonPoints: [72, 60, 48, 39, 34, 30, 28],
    },
    {
      timeRange: [30, 45],
      heading: '03. Patient Counseling & Adherence',
      keyMetricLabel: 'Intrinsic Hypoglycemia Profile',
      keyMetricValue: 'Glucose-Dependent',
      narration:
        'Counsel physicians to remind patients about routine daily water intake and personal hygiene. Single-tablet morning dosing simplifies multi-drug diabetes regimens.',
      curvePoints: [86, 90, 92, 91, 90, 89, 88],
      comparisonPoints: [64, 62, 57, 52, 48, 45, 43],
    },
  ],
  'novatek-briefing://respiraclear-mart': [
    {
      timeRange: [0, 15],
      heading: '01. Rapid 1–3 Minute Bronchodilator Onset',
      keyMetricLabel: 'Formoterol Airway Onset',
      keyMetricValue: '1–3 Minutes',
      narration:
        'Formoterol combines water-soluble rapid beta-2 receptor engagement within 1 to 3 minutes alongside a 12-hour lipophilic smooth-muscle depot—matching reliever speed while maintaining long-acting control.',
      curvePoints: [40, 82, 90, 91, 89, 87, 84],
      comparisonPoints: [35, 48, 63, 74, 76, 73, 68],
    },
    {
      timeRange: [15, 30],
      heading: '02. Anti-Inflammatory Protection Under MART',
      keyMetricLabel: 'Co-Delivered Corticosteroid',
      keyMetricValue: 'Budesonide 200 mcg',
      narration:
        'Every as-needed inhalation under Maintenance and Reliever Therapy (MART) delivers Budesonide directly to inflamed airways early during flare-ups, curbing severe asthma exacerbations.',
      curvePoints: [78, 86, 90, 91, 90, 89, 88],
      comparisonPoints: [68, 60, 52, 45, 40, 36, 33],
    },
    {
      timeRange: [30, 45],
      heading: '03. Four-Step DPI Technique & Mouth Rinse',
      keyMetricLabel: 'Post-Maintenance Step',
      keyMetricValue: 'Rinse & Spit',
      narration:
        'Coach patients to exhale away from the device, inhale forcefully and deeply through the mouth, hold breath for up to 10 seconds, and rinse mouth with water after maintenance doses.',
      curvePoints: [82, 88, 92, 92, 91, 90, 89],
      comparisonPoints: [55, 58, 54, 50, 47, 45, 42],
    },
  ],
};

function getYouTubeEmbedUrl(url: string): string | null {
  try {
    if (url.includes('youtube.com/watch')) {
      const parsed = new URL(url);
      const v = parsed.searchParams.get('v');
      return v ? `https://www.youtube.com/embed/${v}` : null;
    }
    if (url.includes('youtu.be/')) {
      const id = url.split('youtu.be/')[1]?.split(/[?&]/)[0];
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (url.includes('youtube.com/embed/')) {
      return url;
    }
  } catch {
    return null;
  }
  return null;
}

interface ClinicalVideoPlayerProps {
  mediaUrl: string;
  title: string;
  caption?: string;
  fallbackSummary: string;
}

export const ClinicalVideoPlayer: React.FC<ClinicalVideoPlayerProps> = ({
  mediaUrl,
  title,
  caption,
  fallbackSummary,
}) => {
  const youtubeEmbed = useMemo(() => getYouTubeEmbedUrl(mediaUrl), [mediaUrl]);
  const isDirectVideoFile = useMemo(
    () => /\.(mp4|webm|ogg)(\?.*)?$/i.test(mediaUrl.trim()),
    [mediaUrl]
  );

  const deck = useMemo<BriefingChapter[]>(() => {
    if (BRIEFING_DECKS[mediaUrl]) return BRIEFING_DECKS[mediaUrl];
    return [
      {
        timeRange: [0, 20],
        heading: `01. ${title}`,
        keyMetricLabel: 'Clinical Briefing Mode',
        keyMetricValue: 'Guided Module',
        narration: fallbackSummary,
        curvePoints: [75, 84, 89, 90, 88, 86, 85],
        comparisonPoints: [65, 62, 58, 54, 50, 47, 45],
      },
      {
        timeRange: [20, 45],
        heading: '02. Field Detailing & Safety Checklist',
        keyMetricLabel: 'Physician Communication',
        keyMetricValue: 'Evidence-Led',
        narration:
          'Review approved indications, dosage schedule, and contraindications thoroughly before sitting for the certification exam.',
        curvePoints: [80, 87, 91, 91, 90, 89, 88],
        comparisonPoints: [60, 59, 55, 52, 49, 46, 44],
      },
    ];
  }, [mediaUrl, title, fallbackSummary]);

  const totalSeconds = 45;
  const [elapsed, setElapsed] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<1 | 1.25 | 1.5>(1);

  useEffect(() => {
    setElapsed(0);
    setIsPlaying(false);
  }, [mediaUrl]);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = window.setInterval(() => {
      setElapsed((prev) => {
        const next = prev + 0.25 * speed;
        if (next >= totalSeconds) {
          setIsPlaying(false);
          return totalSeconds;
        }
        return next;
      });
    }, 250);
    return () => window.clearInterval(interval);
  }, [isPlaying, speed]);

  if (youtubeEmbed) {
    return (
      <div className="space-y-2">
        <div className="aspect-video w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-900">
          <iframe
            src={youtubeEmbed}
            title={title}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        {caption && <p className="text-xs text-slate-500">{caption}</p>}
      </div>
    );
  }

  if (isDirectVideoFile) {
    return (
      <div className="space-y-2">
        <div className="aspect-video w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-950">
          <video src={mediaUrl} controls className="w-full h-full object-contain">
            Your browser does not support embedded clinical video playback.
          </video>
        </div>
        {caption && <p className="text-xs text-slate-500">{caption}</p>}
      </div>
    );
  }

  const activeChapter =
    deck.find((c) => elapsed >= c.timeRange[0] && elapsed < c.timeRange[1]) ||
    deck[deck.length - 1];

  const progressRatio = Math.min(1, elapsed / totalSeconds);
  const formatTime = (sec: number) => {
    const whole = Math.floor(sec);
    const m = Math.floor(whole / 60);
    const s = whole % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const buildPolyline = (pts: number[]) =>
    pts
      .map((val, idx) => {
        const x = 36 + (idx / (pts.length - 1)) * 420;
        const y = 156 - (val / 100) * 120;
        return `${x},${y}`;
      })
      .join(' ');

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-950 text-slate-100">
      {/* Visual Briefing Stage */}
      <div className="p-6 md:p-8 bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950/60">
        <div className="flex flex-wrap items-baseline justify-between gap-4 mb-6">
          <div>
            <p className="text-xs text-teal-300/90 mb-1">
              Novatek Medical Affairs · Interactive Video Briefing
            </p>
            <h4 className="text-lg md:text-xl font-semibold text-white tracking-wide">
              {activeChapter.heading}
            </h4>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400">{activeChapter.keyMetricLabel}</p>
            <p className="text-base font-mono font-semibold text-teal-300 tabular-nums">
              {activeChapter.keyMetricValue}
            </p>
          </div>
        </div>

        {/* Animated Pharmacokinetic / Clinical Response Curve */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-4 mb-5">
          <svg
            viewBox="0 0 480 180"
            className="w-full h-40 overflow-visible"
            aria-label="Clinical response profile chart"
          >
            {[40, 80, 120, 156].map((y) => (
              <line
                key={y}
                x1="36"
                y1={y}
                x2="456"
                y2={y}
                stroke="#1e293b"
                strokeWidth="1"
              />
            ))}
            <text x="8" y="44" fill="#94a3b8" fontSize="10" fontFamily="JetBrains Mono">
              100%
            </text>
            <text x="14" y="100" fill="#94a3b8" fontSize="10" fontFamily="JetBrains Mono">
              50%
            </text>
            <text x="36" y="173" fill="#94a3b8" fontSize="10" fontFamily="JetBrains Mono">
              0h
            </text>
            <text x="235" y="173" fill="#94a3b8" fontSize="10" fontFamily="JetBrains Mono">
              12h
            </text>
            <text x="438" y="173" fill="#94a3b8" fontSize="10" fontFamily="JetBrains Mono">
              24h
            </text>

            {/* Comparator Reference Line */}
            <polyline
              fill="none"
              stroke="#64748b"
              strokeWidth="2"
              strokeDasharray="5 4"
              points={buildPolyline(activeChapter.comparisonPoints)}
            />

            {/* Novatek Formulation Curve */}
            <polyline
              fill="none"
              stroke="#2dd4bf"
              strokeWidth="3"
              points={buildPolyline(activeChapter.curvePoints)}
            />

            {/* Live Playhead Indicator */}
            <line
              x1={36 + progressRatio * 420}
              y1="28"
              x2={36 + progressRatio * 420}
              y2="156"
              stroke="#f8fafc"
              strokeOpacity="0.45"
              strokeWidth="1.5"
            />
          </svg>
          <div className="flex items-center justify-between text-xs text-slate-400 mt-1">
            <span>Solid Teal: Novatek Formulation Therapeutic Coverage</span>
            <span>Dashed Slate: Standard Monotherapy Reference</span>
          </div>
        </div>

        {/* Synchronized Narration Subtitles */}
        <div className="flex items-start gap-3 bg-slate-900/70 border border-slate-800/90 rounded-lg p-4">
          <Volume2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
          <p className="text-sm text-slate-200 leading-relaxed">{activeChapter.narration}</p>
        </div>
      </div>

      {/* Playback Controls Bar */}
      <div className="px-6 py-3.5 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={() => {
            if (elapsed >= totalSeconds) setElapsed(0);
            setIsPlaying((p) => !p);
          }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium bg-teal-600 text-white rounded-md hover:bg-teal-500 transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          {isPlaying ? 'Pause' : elapsed >= totalSeconds ? 'Replay' : 'Play Briefing'}
        </button>

        <button
          type="button"
          onClick={() => {
            setElapsed(0);
            setIsPlaying(false);
          }}
          aria-label="Reset video briefing"
          className="p-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <div className="flex-1 min-w-[160px] flex items-center gap-3">
          <input
            type="range"
            min={0}
            max={totalSeconds}
            step={0.5}
            value={elapsed}
            aria-label="Video timeline scrubber"
            onChange={(e) => setElapsed(Number(e.target.value))}
            className="w-full accent-teal-500 cursor-pointer"
          />
          <span className="text-xs font-mono text-slate-300 tabular-nums whitespace-nowrap shrink-0">
            {formatTime(elapsed)} / {formatTime(totalSeconds)}
          </span>
        </div>

        <div className="flex items-center gap-1 bg-slate-800 p-0.5 rounded-md shrink-0">
          {([1, 1.25, 1.5] as const).map((rate) => (
            <button
              key={rate}
              type="button"
              onClick={() => setSpeed(rate)}
              className={`px-2 py-1 text-xs font-mono rounded transition-colors cursor-pointer ${
                speed === rate
                  ? 'bg-slate-700 text-white font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {rate}x
            </button>
          ))}
        </div>
      </div>

      {/* Chapter Jump Bar */}
      <div className="px-6 py-2.5 bg-slate-950 border-t border-slate-800/80 flex flex-wrap items-center gap-4 text-xs">
        <span className="text-slate-500">Chapters:</span>
        {deck.map((ch) => {
          const isActive = activeChapter.heading === ch.heading;
          return (
            <button
              key={ch.heading}
              type="button"
              onClick={() => setElapsed(ch.timeRange[0])}
              className={`transition-colors cursor-pointer text-left ${
                isActive ? 'text-teal-300 font-medium underline underline-offset-4' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {ch.heading}
            </button>
          );
        })}
      </div>
    </div>
  );
};
