import { ThreatDetector } from '@chain-guard/core/ai/threat-detector';
import { TransactionBuilder } from '@chain-guard/core/wallet/transaction-builder';
import { PublicKey } from '@solana/web3.js';

/**
 * Transaction Analysis Example
 * 
 * This example shows how to analyze transactions
 * for security threats before signing.
 */

async function main() {
  console.log('Chain Guard - Transaction Analysis Example\n');

  // Initialize threat detector
  const detector = new ThreatDetector();

  // Create a sample transaction
  const builder = new TransactionBuilder();
  
  const fromAddress = new PublicKey('7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU');
  const toAddress = new PublicKey('9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin');

  builder.addTransfer({
    from: fromAddress,
    to: toAddress,
    amount: 1.5
  });

  const transaction = builder.build();

  // Analyze transaction
  console.log('Analyzing transaction...\n');
  const analysis = await detector.analyzeTransaction(transaction);

  // Display results
  console.log('Risk Score:', (analysis.riskScore * 100).toFixed(1) + '%');
  console.log('Confidence:', (analysis.confidence * 100).toFixed(1) + '%');
  console.log('\nDetected Threats:');
  
  if (analysis.threats.length === 0) {
    console.log('✅ No threats detected');
  } else {
    analysis.threats.forEach(threat => {
      console.log('⚠️ ', threat);
    });
  }

  console.log('\nRecommendations:');
  analysis.recommendations.forEach(rec => {
    console.log('💡', rec);
  });

  // Decision
  if (analysis.riskScore < 0.5) {
    console.log('\n✅ Transaction appears safe to proceed');
  } else if (analysis.riskScore < 0.8) {
    console.log('\n⚠️  Proceed with caution');
  } else {
    console.log('\n🔴 High risk - do not proceed');
  }
}

main().catch(console.error);
