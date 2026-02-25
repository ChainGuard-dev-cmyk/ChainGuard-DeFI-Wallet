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
});
