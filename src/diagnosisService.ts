
import { SYMPTOMS, DISEASES, Disease } from './data';

export interface DiagnosisResult {
  predictedDisease: Disease;
  confidence: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  allPredictions: { name: string; score: number }[];
}

/**
 * A simple Naive Bayes-inspired classifier for diagnosis.
 */
export function diagnose(selectedSymptomIds: string[]): DiagnosisResult | null {
  if (selectedSymptomIds.length === 0) return null;

  const scores = DISEASES.map((disease) => {
    // Calculate how many of the disease's symptoms are present in the user's selection
    const matchingSymptoms = disease.symptoms.filter((s) => selectedSymptomIds.includes(s));
    
    // Calculate how many of the user's symptoms are NOT in this disease (penalty)
    const extraSymptoms = selectedSymptomIds.filter((s) => !disease.symptoms.includes(s));

    // Score = (Matches / Total Disease Symptoms) - (Extras / Total Symptoms)
    // This is a very basic heuristic for demonstration
    const matchScore = matchingSymptoms.length / disease.symptoms.length;
    const penalty = extraSymptoms.length * 0.1;
    
    const finalScore = Math.max(0, matchScore - penalty);

    return {
      disease,
      score: finalScore,
    };
  });

  // Sort by score descending
  scores.sort((a, b) => b.score - a.score);

  const topResult = scores[0];
  
  // Calculate overall risk based on symptoms
  const selectedSymptoms = SYMPTOMS.filter(s => selectedSymptomIds.includes(s.id));
  const hasHighSeverity = selectedSymptoms.some(s => s.severity === 'high');
  const hasMediumSeverity = selectedSymptoms.some(s => s.severity === 'medium');
  
  let calculatedRisk: 'Low' | 'Medium' | 'High' = 'Low';
  if (hasHighSeverity || selectedSymptomIds.length > 6) {
    calculatedRisk = 'High';
  } else if (hasMediumSeverity || selectedSymptomIds.length > 3) {
    calculatedRisk = 'Medium';
  }

  return {
    predictedDisease: topResult.disease,
    confidence: Math.round(topResult.score * 100),
    riskLevel: calculatedRisk,
    allPredictions: scores.slice(0, 3).map(s => ({ name: s.disease.name, score: Math.round(s.score * 100) })),
  };
}
