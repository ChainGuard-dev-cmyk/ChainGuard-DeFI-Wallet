import { ThreatDetector, ThreatType } from '../src/ai/threat-detector';
import { MLModel } from '../src/ai/ml-model';

describe('ThreatDetector', () => {
  let detector: ThreatDetector;

  beforeEach(() => {
    detector = new ThreatDetector();
  });

  describe('analyzeTransaction', () => {
    it('should analyze transaction and return risk score', async () => {
      const mockTransaction = {
        instructions: [],
        recentBlockhash: 'test-blockhash',
        feePayer: null
      };

      const analysis = await detector.analyzeTransaction(mockTransaction as any);

      expect(analysis).toBeDefined();
      expect(analysis.riskScore).toBeGreaterThanOrEqual(0);
      expect(analysis.riskScore).toBeLessThanOrEqual(1);
      expect(Array.isArray(analysis.threats)).toBe(true);
      expect(Array.isArray(analysis.recommendations)).toBe(true);
    });

    it('should detect high risk transactions', async () => {
      const mockTransaction = {
        instructions: Array(10).fill({}),
        recentBlockhash: 'test-blockhash',
        feePayer: null
      };

      const analysis = await detector.analyzeTransaction(mockTransaction as any);

      if (analysis.riskScore > 0.7) {
        expect(analysis.threats.length).toBeGreaterThan(0);
      }
    });
  });

  describe('addToBlacklist', () => {
    it('should add address to blacklist', async () => {
      const address = '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU';
      
      await expect(
        detector.addToBlacklist(address)
      ).resolves.not.toThrow();
    });
  });

  describe('updateThreatDatabase', () => {
    it('should update threat database', async () => {
      await expect(
        detector.updateThreatDatabase()
      ).resolves.not.toThrow();
    });
  });
});

describe('MLModel', () => {
  let model: MLModel;

  beforeEach(() => {
    model = new MLModel();
  });

  describe('predict', () => {
    it('should predict risk score from features', async () => {
      const features = {
        amount: 1000000,
        recipientAge: 30,
        programInteractions: 2,
        gasPrice: 5000,
        complexity: 50,
        knownAddress: false
      };

      const prediction = await model.predict(features);

      expect(prediction).toBeDefined();
      expect(prediction.score).toBeGreaterThanOrEqual(0);
      expect(prediction.score).toBeLessThanOrEqual(1);
      expect(prediction.confidence).toBeGreaterThanOrEqual(0);
      expect(prediction.confidence).toBeLessThanOrEqual(1);
      expect(Array.isArray(prediction.features)).toBe(true);
    });

    it('should return consistent predictions for same input', async () => {
      const features = {
        amount: 1000000,
        recipientAge: 30,
        programInteractions: 2,
        gasPrice: 5000,
        complexity: 50,
        knownAddress: false
      };

      const prediction1 = await model.predict(features);
      const prediction2 = await model.predict(features);

      // Predictions should be similar (allowing for small variations)
      expect(Math.abs(prediction1.score - prediction2.score)).toBeLessThan(0.1);
    });
  });

  describe('getModelInfo', () => {
    it('should return model information', () => {
      const info = model.getModelInfo();

      expect(info).toBeDefined();
      expect(info.version).toBeDefined();
      expect(info.architecture).toBeDefined();
      expect(typeof info.version).toBe('string');
      expect(typeof info.architecture).toBe('string');
    });
  });

  describe('update', () => {
    it('should update model weights', async () => {
      await expect(model.update()).resolves.not.toThrow();
    });
  });

  describe('batch prediction', () => {
    it('should handle batch predictions efficiently', async () => {
      const features = [
        {
          amount: 1000000,
          recipientAge: 30,
          programInteractions: 2,
          gasPrice: 5000,
          complexity: 50,
          knownAddress: false
        },
        {
          amount: 500000,
          recipientAge: 60,
          programInteractions: 1,
          gasPrice: 3000,
          complexity: 25,
          knownAddress: true
        }
      ];

      const predictions = await Promise.all(
        features.map(f => model.predict(f))
      );

      expect(predictions).toHaveLength(2);
      predictions.forEach(prediction => {
        expect(prediction.score).toBeGreaterThanOrEqual(0);
        expect(prediction.score).toBeLessThanOrEqual(1);
      });
    });
  });

  describe('edge cases', () => {
    it('should handle zero amount transactions', async () => {
      const features = {
        amount: 0,
        recipientAge: 30,
        programInteractions: 1,
        gasPrice: 5000,
        complexity: 10,
        knownAddress: true
      };

      const prediction = await model.predict(features);
      expect(prediction.score).toBeGreaterThanOrEqual(0);
    });

    it('should handle very large amounts', async () => {
      const features = {
        amount: Number.MAX_SAFE_INTEGER,
        recipientAge: 1,
        programInteractions: 20,
        gasPrice: 100000,
        complexity: 1000,
        knownAddress: false
      };

      const prediction = await model.predict(features);
      expect(prediction.score).toBeGreaterThan(0.5);
    });
  });
});

describe('ThreatDetector Advanced Features', () => {
  let detector: ThreatDetector;

  beforeEach(() => {
    detector = new ThreatDetector();
  });

  describe('batch analysis', () => {
    it('should analyze multiple transactions efficiently', async () => {
      const transactions = Array(5).fill({
        instructions: [],
        recentBlockhash: 'test-blockhash',
        feePayer: null
      });

      const analyses = await detector.batchAnalyze(transactions as any);

      expect(analyses).toHaveLength(5);
      analyses.forEach(analysis => {
        expect(analysis.riskScore).toBeGreaterThanOrEqual(0);
        expect(analysis.riskScore).toBeLessThanOrEqual(1);
      });
    });
  });

  describe('threshold management', () => {
    it('should allow setting custom threat threshold', () => {
      detector.setThreatThreshold(0.8);
      expect(detector.getThreatThreshold()).toBe(0.8);
    });

    it('should reject invalid threshold values', () => {
      const originalThreshold = detector.getThreatThreshold();
      
      detector.setThreatThreshold(-0.1);
      expect(detector.getThreatThreshold()).toBe(originalThreshold);
      
      detector.setThreatThreshold(1.5);
      expect(detector.getThreatThreshold()).toBe(originalThreshold);
    });
  });

  describe('blacklist and whitelist management', () => {
    it('should track blacklist size', async () => {
      const initialSize = detector.getBlacklistSize();
      
      await detector.addToBlacklist('test-address-1');
      expect(detector.getBlacklistSize()).toBe(initialSize + 1);
      
      await detector.addToBlacklist('test-address-2');
      expect(detector.getBlacklistSize()).toBe(initialSize + 2);
    });

    it('should check if address is blacklisted', async () => {
      const testAddress = 'test-blacklisted-address';
      
      expect(detector.isBlacklisted(testAddress)).toBe(false);
      
      await detector.addToBlacklist(testAddress);
      expect(detector.isBlacklisted(testAddress)).toBe(true);
    });

    it('should manage whitelist correctly', async () => {
      const testAddress = 'test-whitelisted-address';
      
      expect(detector.isWhitelisted(testAddress)).toBe(false);
      
      await detector.addToWhitelist(testAddress);
      expect(detector.isWhitelisted(testAddress)).toBe(true);
      expect(detector.getWhitelistSize()).toBeGreaterThan(0);
    });
  });
});
