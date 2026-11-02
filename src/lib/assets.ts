import heroLabImg from '../assets/images/novatek_hero_lab_1793514787758.jpg';
import cardioNovaImg from '../assets/images/product_cardionova_1793514789525.jpg';
import glucoTideImg from '../assets/images/product_glucotide_1793514790815.jpg';
import respiraClearImg from '../assets/images/product_respiraclear_1793514792902.jpg';
import pharmacokineticsDiagramImg from '../assets/images/diagram_pharmacokinetics_1793514792777.jpg';

export const GAPRITO_REFERENCE_PDFS = {
  faqSheet: '/assets/aistudio/1_._Gaprito_FAQ_e144a7de.pdf',
  detailTalk: '/assets/aistudio/2._Detail_Talk_f1bfad54.pdf',
} as const;

export const GENERATED_ASSETS: Record<string, string> = {
  hero_lab: heroLabImg,
  cardionova: cardioNovaImg,
  glucotide: glucoTideImg,
  respiraclear: respiraClearImg,
  diagram_pharmacokinetics: pharmacokineticsDiagramImg,
  gaprito_sheet: '/assets/aistudio/1_845d42f9.jpeg',
  gaprito_molecule: '/assets/aistudio/2_058375a5.jpeg',
  gaprito_pack: '/assets/aistudio/3_a8037a96.jpeg',
  gaprito_evidence: '/assets/aistudio/4_890116fa.jpeg',
  gaprito_pi: '/assets/aistudio/5_722eed49.jpeg',
};

export function resolveAssetUrl(keyOrUrl: string): string {
  if (!keyOrUrl) return cardioNovaImg;
  if (GENERATED_ASSETS[keyOrUrl]) {
    return GENERATED_ASSETS[keyOrUrl];
  }
  return keyOrUrl;
}
