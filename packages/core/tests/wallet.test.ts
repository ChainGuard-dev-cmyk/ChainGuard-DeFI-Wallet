import { SolanaWallet } from '../src/wallet/solana-wallet';
import { TransactionBuilder } from '../src/wallet/transaction-builder';

describe('SolanaWallet', () => {
  let wallet: SolanaWallet;

  beforeEach(() => {
    wallet = new SolanaWallet({
      network: 'devnet',
      commitment: 'confirmed'
    });
  });

  describe('generateMnemonic', () => {
    it('should generate a valid 24-word mnemonic', async () => {
      const mnemonic = await wallet.generateMnemonic();
      const words = mnemonic.split(' ');
      
      expect(words.length).toBe(24);
      expect(typeof mnemonic).toBe('string');
    });

    it('should generate different mnemonics each time', async () => {
      const mnemonic1 = await wallet.generateMnemonic();
      const mnemonic2 = await wallet.generateMnemonic();
      
      expect(mnemonic1).not.toBe(mnemonic2);
    });
  });

  describe('importFromMnemonic', () => {
    it('should import wallet from valid mnemonic', async () => {
      const mnemonic = await wallet.generateMnemonic();
      const password = 'test-password-123';
      
      await expect(
        wallet.importFromMnemonic(mnemonic, password)
      ).resolves.not.toThrow();
    });

    it('should reject invalid mnemonic', async () => {
      const invalidMnemonic = 'invalid mnemonic phrase';
      const password = 'test-password-123';
      
      await expect(
        wallet.importFromMnemonic(invalidMnemonic, password)
      ).rejects.toThrow('Invalid mnemonic phrase');
    });
  });

  describe('getPublicKey', () => {
    it('should return public key after import', async () => {
      const mnemonic = await wallet.generateMnemonic();
      await wallet.importFromMnemonic(mnemonic, 'password');
      
      const publicKey = await wallet.getPublicKey();
      
      expect(publicKey).toBeDefined();
      expect(publicKey.toString().length).toBeGreaterThan(0);
    });

    it('should throw error if wallet not initialized', async () => {
      await expect(wallet.getPublicKey()).rejects.toThrow('Wallet not initialized');
    });
  });

  describe('lock and unlock', () => {
    it('should lock and unlock wallet', async () => {
      const mnemonic = await wallet.generateMnemonic();
      const password = 'test-password-123';
      
      await wallet.importFromMnemonic(mnemonic, password);
      await wallet.lock();
      
      await expect(wallet.getPublicKey()).rejects.toThrow();
      
      await wallet.unlock(password);
      const publicKey = await wallet.getPublicKey();
      
      expect(publicKey).toBeDefined();
    });
  });
});

describe('TransactionBuilder', () => {
  let builder: TransactionBuilder;

  beforeEach(() => {
    builder = new TransactionBuilder();
  });

  describe('addTransfer', () => {
    it('should add transfer instruction', () => {
      const from = '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU';
      const to = '9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin';
      
      expect(() => {
        builder.addTransfer({
          from: from as any,
          to: to as any,
          amount: 1.5
        });
      }).not.toThrow();
    });
  });

  describe('build', () => {
    it('should build transaction with instructions', () => {
      const transaction = builder.build();
      
      expect(transaction).toBeDefined();
      expect(transaction.instructions).toBeDefined();
    });
  });

  describe('estimateFee', () => {
    it('should estimate transaction fee', () => {
      const fee = builder.estimateFee();
      
      expect(fee).toBeGreaterThan(0);
      expect(typeof fee).toBe('number');
    });
  });
});
