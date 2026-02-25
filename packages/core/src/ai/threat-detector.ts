import { Transaction, PublicKey } from '@solana/web3.js';
import { MLModel, PredictionResult } from './ml-model';

export interface ThreatAnalysis {
  riskScore: number;
  threats: ThreatType[];
  confidence: number;
  recommendations: string[];
  timestamp: number;
}

export enum ThreatType {
  PHISHING = 'PHISHING',
  MALICIOUS_CONTRACT = 'MALICIOUS_CONTRACT',
  SUSPICIOUS_AMOUNT = 'SUSPICIOUS_AMOUNT',
  UNKNOWN_RECIPIENT = 'UNKNOWN_RECIPIENT',
  HIGH_SLIPPAGE = 'HIGH_SLIPPAGE',
  HONEYPOT = 'HONEYPOT',
  RUG_PULL = 'RUG_PULL',
  FLASH_LOAN_ATTACK = 'FLASH_LOAN_ATTACK'
}

export interface TransactionFeatures {
  amount: number;
  recipientAge: number;
  programInteractions: number;
  gasPrice: number;
  complexity: number;
  knownAddress: boolean;
}

export class ThreatDetector {
  private mlModel: MLModel;
  private blacklistedAddresses: Set<string>;
  private whitelistedAddresses: Set<string>;
  private threatThreshold: number = 0.7;

  constructor() {
    this.mlModel = new MLModel();
    this.blacklistedAddresses = new Set();
    this.whitelistedAddresses = new Set();
    this.loadBlacklist();
  }

  async analyzeTransaction(transaction: Transaction): Promise<ThreatAnalysis> {
    const features = await this.extractFeatures(transaction);
    const mlPrediction = await this.mlModel.predict(features);
    
    const threats: ThreatType[] = [];
    let riskScore = mlPrediction.score;

    // Check blacklisted addresses
    if (this.containsBlacklistedAddress(transaction)) {
      threats.push(ThreatType.MALICIOUS_CONTRACT);
      riskScore = Math.max(riskScore, 0.95);
    }

    // Check for suspicious patterns
    if (features.amount > 1000000) {
      threats.push(ThreatType.SUSPICIOUS_AMOUNT);
      riskScore += 0.2;
    }

    if (!features.knownAddress && features.recipientAge < 7) {
      threats.push(ThreatType.UNKNOWN_RECIPIENT);
      riskScore += 0.15;
    }

    // Analyze program interactions
    if (features.programInteractions > 5) {
      threats.push(ThreatType.FLASH_LOAN_ATTACK);
      riskScore += 0.25;
    }

    // Check for honeypot patterns
    if (await this.detectHoneypot(transaction)) {
      threats.push(ThreatType.HONEYPOT);
      riskScore = Math.max(riskScore, 0.9);
    }

    riskScore = Math.min(riskScore, 1.0);

    const recommendations = this.generateRecommendations(threats, riskScore);

    return {
      riskScore,
      threats,
      confidence: mlPrediction.confidence,
      recommendations,
      timestamp: Date.now()
    };
  }

  private async extractFeatures(transaction: Transaction): Promise<TransactionFeatures> {
    // Extract relevant features from transaction
    const instructions = transaction.instructions;
    const programInteractions = instructions.length;

    // Simulate feature extraction
    return {
      amount: 0, // Would parse from instruction data
      recipientAge: 30, // Would query blockchain
      programInteractions,
      gasPrice: 5000,
      complexity: this.calculateComplexity(transaction),
      knownAddress: false
    };
  }

  private calculateComplexity(transaction: Transaction): number {
    const instructionCount = transaction.instructions.length;
    const accountCount = new Set(
      transaction.instructions.flatMap(ix => 
        ix.keys.map(k => k.pubkey.toString())
      )
    ).size;

    return instructionCount * 0.3 + accountCount * 0.7;
  }

  private containsBlacklistedAddress(transaction: Transaction): boolean {
    for (const instruction of transaction.instructions) {
      const programId = instruction.programId.toString();
      if (this.blacklistedAddresses.has(programId)) {
        return true;
      }

      for (const key of instruction.keys) {
        if (this.blacklistedAddresses.has(key.pubkey.toString())) {
          return true;
        }
      }
    }
    return false;
  }

  private async detectHoneypot(transaction: Transaction): Promise<boolean> {
    // Honeypot detection logic
    // Check for contracts that allow buying but not selling
    const instructions = transaction.instructions;
    
    // Simulate honeypot detection
    const suspiciousPatterns = instructions.filter(ix => {
      const data = ix.data;
      // Check for specific byte patterns that indicate honeypot
      return data.length > 100 && data[0] === 0xde && data[1] === 0xad;
    });

    return suspiciousPatterns.length > 0;
  }

  private generateRecommendations(threats: ThreatType[], riskScore: number): string[] {
    const recommendations: string[] = [];

    if (riskScore > 0.8) {
      recommendations.push('CRITICAL: Do not proceed with this transaction');
      recommendations.push('Contact support if you believe this is an error');
    } else if (riskScore > 0.5) {
      recommendations.push('WARNING: High risk detected, proceed with caution');
      recommendations.push('Verify recipient address manually');
    }

    if (threats.includes(ThreatType.MALICIOUS_CONTRACT)) {
      recommendations.push('Interacting with known malicious contract');
    }

    if (threats.includes(ThreatType.HONEYPOT)) {
      recommendations.push('Potential honeypot detected - tokens may not be sellable');
    }

    if (threats.includes(ThreatType.FLASH_LOAN_ATTACK)) {
      recommendations.push('Complex transaction pattern detected');
      recommendations.push('Ensure you understand all program interactions');
    }

    if (recommendations.length === 0) {
      recommendations.push('Transaction appears safe');
    }

    return recommendations;
  }

  private async loadBlacklist(): Promise<void> {
    // Load from API or local database
    const knownMalicious = [
      '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
      '9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin',
      'HEvSKofvBgfaexv23kMabbYqxasxU3mQ4ibBMEmJWHny'
    ];

    knownMalicious.forEach(addr => this.blacklistedAddresses.add(addr));
  }

  async addToBlacklist(address: string): Promise<void> {
    this.blacklistedAddresses.add(address);
  }

  async addToWhitelist(address: string): Promise<void> {
    this.whitelistedAddresses.add(address);
  }

  async updateThreatDatabase(): Promise<void> {
    // Fetch latest threat intelligence
    // Update ML model with new patterns
    await this.mlModel.update();
  }
}
