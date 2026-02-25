import { ThreatDetector } from '@chain-guard/core/ai/threat-detector';
import { SolanaWallet } from '@chain-guard/core/wallet/solana-wallet';
import { RateLimiter } from '@chain-guard/core/utils/rate-limiter';
import { Logger } from '@chain-guard/core/utils/logger';

/**
 * Advanced Security Example
 * 
 * Demonstrates advanced security features including:
 * - Custom threat rules
 * - Rate limiting
 * - Logging and monitoring
 * - Whitelist management
 */

async function main() {
  console.log('Chain Guard - Advanced Security Example\n');

  // Initialize components
  const detector = new ThreatDetector();
  const logger = Logger.getInstance();
  const rateLimiter = new RateLimiter({
    maxRequests: 10,
    windowMs: 60000 // 10 requests per minute
  });

  // Configure logging
  logger.setLogLevel(0); // DEBUG level
  logger.addListener((entry) => {
    console.log(`[${new Date(entry.timestamp).toISOString()}] ${entry.message}`);
  });

  // Add custom blacklisted addresses
  console.log('1. Adding addresses to blacklist...');
  await detector.addToBlacklist('HEvSKofvBgfaexv23kMabbYqxasxU3mQ4ibBMEmJWHny');
  await detector.addToBlacklist('7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU');
  logger.info('Blacklist updated', { count: 2 });

  // Add whitelisted addresses
  console.log('2. Adding trusted addresses to whitelist...');
  await detector.addToWhitelist('9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin');
  logger.info('Whitelist updated', { count: 1 });

  // Demonstrate rate limiting
  console.log('\n3. Testing rate limiter...');
  const userId = 'user123';
  
  for (let i = 0; i < 12; i++) {
    const allowed = rateLimiter.check(userId);
    const remaining = rateLimiter.getRemainingRequests(userId);
    
    if (allowed) {
      console.log(`Request ${i + 1}: ✅ Allowed (${remaining} remaining)`);
    } else {
      const resetTime = rateLimiter.getResetTime(userId);
      console.log(`Request ${i + 1}: ❌ Rate limited (reset in ${Math.ceil(resetTime / 1000)}s)`);
    }
  }

  // Update threat database
  console.log('\n4. Updating threat intelligence database...');
  await detector.updateThreatDatabase();
  logger.info('Threat database updated');

  // Export logs
  console.log('\n5. Exporting security logs...');
  const logs = logger.exportLogs();
  console.log('Logs exported:', logs.length, 'characters');

  // Security recommendations
  console.log('\n6. Security Recommendations:');
  console.log('✅ Enable 2FA for all transactions');
  console.log('✅ Regularly update threat database');
  console.log('✅ Monitor rate limit violations');
  console.log('✅ Review security logs daily');
  console.log('✅ Keep whitelist/blacklist updated');

  console.log('\nAdvanced security example completed!');
}

main().catch(console.error);
