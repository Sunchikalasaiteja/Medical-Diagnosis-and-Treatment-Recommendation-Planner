
export interface Symptom {
  id: string;
  label: string;
  severity: 'low' | 'medium' | 'high';
}

export interface Disease {
  name: string;
  symptoms: string[]; // IDs of symptoms
  description: string;
  riskLevel: 'Low' | 'Medium' | 'High';
}

export const SYMPTOMS: Symptom[] = [
  { id: 'fever', label: 'Fever', severity: 'medium' },
  { id: 'cough', label: 'Cough', severity: 'low' },
  { id: 'headache', label: 'Headache', severity: 'low' },
  { id: 'fatigue', label: 'Fatigue', severity: 'low' },
  { id: 'shortness_of_breath', label: 'Shortness of Breath', severity: 'high' },
  { id: 'chest_pain', label: 'Chest Pain', severity: 'high' },
  { id: 'sore_throat', label: 'Sore Throat', severity: 'low' },
  { id: 'runny_nose', label: 'Runny Nose', severity: 'low' },
  { id: 'nausea', label: 'Nausea', severity: 'medium' },
  { id: 'vomiting', label: 'Vomiting', severity: 'medium' },
  { id: 'diarrhea', label: 'Diarrhea', severity: 'medium' },
  { id: 'muscle_pain', label: 'Muscle Pain', severity: 'low' },
  { id: 'loss_of_taste', label: 'Loss of Taste/Smell', severity: 'medium' },
  { id: 'rash', label: 'Skin Rash', severity: 'medium' },
  { id: 'joint_pain', label: 'Joint Pain', severity: 'low' },
  { id: 'dizziness', label: 'Dizziness', severity: 'medium' },
];

export const DISEASES: Disease[] = [
  {
    name: 'Common Cold',
    symptoms: ['cough', 'runny_nose', 'sore_throat', 'fatigue'],
    description: 'A viral infection of your nose and throat.',
    riskLevel: 'Low',
  },
  {
    name: 'Influenza (Flu)',
    symptoms: ['fever', 'cough', 'headache', 'fatigue', 'muscle_pain'],
    description: 'A common viral infection that can be deadly, especially in high-risk groups.',
    riskLevel: 'Medium',
  },
  {
    name: 'COVID-19',
    symptoms: ['fever', 'cough', 'fatigue', 'loss_of_taste', 'shortness_of_breath'],
    description: 'An infectious disease caused by the SARS-CoV-2 virus.',
    riskLevel: 'High',
  },
  {
    name: 'Gastroenteritis',
    symptoms: ['nausea', 'vomiting', 'diarrhea', 'fever'],
    description: 'An intestinal infection marked by diarrhea, cramps, nausea, vomiting, and fever.',
    riskLevel: 'Medium',
  },
  {
    name: 'Migraine',
    symptoms: ['headache', 'nausea', 'dizziness'],
    description: 'A headache of varying intensity, often accompanied by nausea and sensitivity to light and sound.',
    riskLevel: 'Low',
  },
  {
    name: 'Pneumonia',
    symptoms: ['fever', 'cough', 'shortness_of_breath', 'chest_pain', 'fatigue'],
    description: 'Infection that inflames air sacs in one or both lungs, which may fill with fluid.',
    riskLevel: 'High',
  },
  {
    name: 'Allergic Rhinitis',
    symptoms: ['runny_nose', 'cough', 'fatigue'],
    description: 'An allergic response causing itchy, watery eyes, sneezing, and other similar symptoms.',
    riskLevel: 'Low',
  },
];
