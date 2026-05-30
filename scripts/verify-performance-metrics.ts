/**
 * Verification script: runs ThreatDetector.analyzeTransaction and
 * confirms that performance metrics are recorded by the globalMonitor.
 */
import { ThreatDetector } from '../packages/core/src/ai/threat-detector';
import { globalMonitor } from '../packages/core/src/utils/performance';

async function main(): Promise<void> {
  const detector = new ThreatDetector();

  const mockTransaction = {
    instructions: [
      {
        programId: { toString: () => '11111111111111111111111111111111' },
        keys: [{ pubkey: { toString: () => 'SenderPubkey123' }, isSigner: true, isWritable: true }],
        data: Buffer.alloc(10),
      },
    ],
    recentBlockhash: 'GHtXQBsoZHVnNFa9YevAzFr17DJjgHXk3ycTKD5xD3Zi',
    feePayer: null,
  } as any;

  console.log('=== Performance Metrics Verification ===\n');
  console.log('Running ThreatDetector.analyzeTransaction...\n');

  const analysis = await detector.analyzeTransaction(mockTransaction);

  console.log('\n--- Analysis Result ---');
  console.log(`  Risk Score : ${analysis.riskScore.toFixed(4)}`);
  console.log(`  Threats    : ${analysis.threats.length > 0 ? analysis.threats.join(', ') : 'none'}`);
  console.log(`  Confidence : ${analysis.confidence.toFixed(4)}`);

  console.log('\n--- Global Monitor Metrics ---');
  const operationName = 'ThreatDetector.analyzeTransaction';
  const stats = globalMonitor.getStats(operationName);

  if (stats) {
    console.log(`  Operation : ${operationName}`);
    console.log(`  Count     : ${stats.count}`);
    console.log(`  Total     : ${stats.total.toFixed(2)}ms`);
    console.log(`  Average   : ${stats.average.toFixed(2)}ms`);
    console.log(`  Min       : ${stats.min.toFixed(2)}ms`);
    console.log(`  Max       : ${stats.max.toFixed(2)}ms`);
  } else {
    console.error('ERROR: No metrics found for', operationName);
    process.exit(1);
  }

  // Run a second time to show aggregation
  console.log('\nRunning a second invocation...\n');
  await detector.analyzeTransaction(mockTransaction);

  const updatedStats = globalMonitor.getStats(operationName);
  if (updatedStats && updatedStats.count === 2) {
    console.log('--- Updated Stats (2 invocations) ---');
    console.log(`  Count   : ${updatedStats.count}`);
    console.log(`  Average : ${updatedStats.average.toFixed(2)}ms`);
    console.log(`  Min     : ${updatedStats.min.toFixed(2)}ms`);
    console.log(`  Max     : ${updatedStats.max.toFixed(2)}ms`);
  } else {
    console.error('ERROR: Expected 2 metrics after second invocation');
    process.exit(1);
  }

  console.log('\n--- All Tracked Operations ---');
  const exported = globalMonitor.export();
  console.log(JSON.stringify(exported, null, 2));

  console.log('\n✓ Performance metrics verified successfully.');
}

main().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
