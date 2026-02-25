import { ThreatDetector } from '../packages/core/src/ai/threat-detector';
import { TransactionBuilder } from '../packages/core/src/wallet/transaction-builder';
import { PublicKey } from '@solana/web3.js';

/**
 * Transaction Analysis Benchmark
 * 
 * Measures performance of transaction analysis
 */

async function benchmark() {
  console.log('Transaction Analysis Benchmark\n');
  console.log('================================\n');

  const detector = new ThreatDetector();
  const iterations = 1000;
  const times: number[] = [];

  // Warm up
  console.log('Warming up...');
  for (let i = 0; i < 10; i++) {
    const builder = new TransactionBuilder();
    builder.addTransfer({
      from: new PublicKey('7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU'),
      to: new PublicKey('9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin'),
      amount: 1.0
    });
    const tx = builder.build();
    await detector.analyzeTransaction(tx);
  }

  // Run benchmark
  console.log(`Running ${iterations} iterations...\n`);
  
  for (let i = 0; i < iterations; i++) {
    const builder = new TransactionBuilder();
    builder.addTransfer({
      from: new PublicKey('7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU'),
      to: new PublicKey('9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin'),
      amount: Math.random() * 10
    });
    const tx = builder.build();

    const start = performance.now();
    await detector.analyzeTransaction(tx);
    const end = performance.now();

    times.push(end - start);

    if ((i + 1) % 100 === 0) {
      process.stdout.write(`Progress: ${i + 1}/${iterations}\r`);
    }
  }

  // Calculate statistics
  times.sort((a, b) => a - b);
  
  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  const min = times[0];
  const max = times[times.length - 1];
  const p50 = times[Math.floor(times.length * 0.5)];
  const p95 = times[Math.floor(times.length * 0.95)];
  const p99 = times[Math.floor(times.length * 0.99)];

  // Display results
  console.log('\n\nResults:');
  console.log('--------');
  console.log(`Iterations: ${iterations}`);
  console.log(`Average: ${avg.toFixed(2)}ms`);
  console.log(`Min: ${min.toFixed(2)}ms`);
  console.log(`Max: ${max.toFixed(2)}ms`);
  console.log(`Median (p50): ${p50.toFixed(2)}ms`);
  console.log(`95th percentile: ${p95.toFixed(2)}ms`);
  console.log(`99th percentile: ${p99.toFixed(2)}ms`);
  console.log(`Throughput: ${(1000 / avg).toFixed(0)} tx/sec`);
}

benchmark().catch(console.error);
