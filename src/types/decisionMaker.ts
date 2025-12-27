export type DecisionMakerSource = 'AI_GUESS';

export interface DecisionMaker {
  name: string;
  title: string;
  email: string;
  linkedinUrl: string;
  confidence: number; // 0–100
  source: DecisionMakerSource;
}
