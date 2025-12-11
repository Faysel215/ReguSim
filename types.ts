export enum MarketStressLevel {
  LOW = 'Low',
  MODERATE = 'Moderate',
  HIGH = 'High',
  EXTREME = 'Extreme',
}

export enum SimulationStatus {
  IDLE = 'IDLE',
  RUNNING = 'RUNNING',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
}

export interface SimulationConfig {
  tangibilityRatio: number; // e.g., 33, 51
  marketLiquidity: number; // 0-100
  investorPanicSensitivity: number; // 0-100
  shockType: string;
}

export interface TimeStepData {
  time: number;
  sukukIndex: number; // Price index
  systemicRisk: number; // 0-100
  liquidity: number; // 0-100
  defaults: number; // Count of defaults
}

export interface NodeEntity {
  id: string;
  type: 'BANK' | 'SUKUK_ISSUER' | 'MARKET_MAKER';
  health: number; // 0-100
  exposure: number; // 0-100
  x: number;
  y: number;
}

export interface LinkEntity {
  source: string;
  target: string;
  strength: number;
}

export interface AIAnalysisResult {
  summary: string;
  recommendations: string[];
  riskAssessment: string;
}