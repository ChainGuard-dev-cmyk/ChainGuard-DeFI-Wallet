import { EncryptionService, EncryptedData } from './encryption';

export interface StoredKey {
  encryptedKey: EncryptedData;
  createdAt: number;
  lastAccessed: number;
  version: string;
}

export class KeyManager {
  private memoryStore: Map<string, Buffer> = new Map();
  private keyRotationInterval: number = 30 * 24 * 60 * 60 * 1000; // 30 days
  private version: string = '1.0.0';

  async storeKey(
    secretKey: Uint8Array,
    password: string,
    encryptionService: EncryptionService
  ): Promise<void> {
    const keyBuffer = Buffer.from(secretKey);
    const encryptedKey = await encryptionService.encrypt(keyBuffer, password);

    const storedKey: StoredKey = {
      encryptedKey,
      createdAt: Date.now(),
      lastAccessed: Date.now(),
      version: this.version
    };

    // Store in secure storage (would use platform-specific secure storage)
    await this.persistToSecureStorage('master_key', storedKey);
    
    // Keep in memory for quick access
    this.memoryStore.set('master_key', keyBuffer);
  }

  async retrieveKey(
    password: string,
    encryptionService: EncryptionService
  ): Promise<Uint8Array> {
    // Check memory first
    if (this.memoryStore.has('master_key')) {
      const key = this.memoryStore.get('master_key')!;
      return new Uint8Array(key);
    }

    // Retrieve from secure storage
    const storedKey = await this.loadFromSecureStorage('master_key');
    if (!storedKey) {
      throw new Error('No key found in storage');
    }

    const decryptedKey = await encryptionService.decrypt(
      storedKey.encryptedKey,
      password
    );

    // Update last accessed time
    storedKey.lastAccessed = Date.now();
    await this.persistToSecureStorage('master_key', storedKey);

    // Cache in memory
    this.memoryStore.set('master_key', decryptedKey);

    return new Uint8Array(decryptedKey);
  }

  async rotateKey(
    oldPassword: string,
    newPassword: string,
    encryptionService: EncryptionService
  ): Promise<void> {
    const secretKey = await this.retrieveKey(oldPassword, encryptionService);
    await this.clearMemory();
    await this.storeKey(secretKey, newPassword, encryptionService);
  }

  async shouldRotateKey(): Promise<boolean> {
    const storedKey = await this.loadFromSecureStorage('master_key');
    if (!storedKey) return false;

    const timeSinceCreation = Date.now() - storedKey.createdAt;
    return timeSinceCreation > this.keyRotationInterval;
  }

  async clearMemory(): Promise<void> {
    // Overwrite memory before clearing
    for (const [key, buffer] of this.memoryStore.entries()) {
      buffer.fill(0);
    }
    this.memoryStore.clear();
  }

  private async persistToSecureStorage(key: string, data: StoredKey): Promise<void> {
    // Platform-specific implementation
    // For browser: IndexedDB with encryption
    // For Node: OS keychain integration
    const serialized = JSON.stringify(data);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`chain_guard_${key}`, serialized);
    }
  }

  private async loadFromSecureStorage(key: string): Promise<StoredKey | null> {
    // Platform-specific implementation
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem(`chain_guard_${key}`);
      return data ? JSON.parse(data) : null;
    }
    return null;
  }

  async exportKey(password: string, encryptionService: EncryptionService): Promise<string> {
    const secretKey = await this.retrieveKey(password, encryptionService);
    return Buffer.from(secretKey).toString('base64');
  }

  async importKey(
    encodedKey: string,
    password: string,
    encryptionService: EncryptionService
  ): Promise<void> {
    const keyBuffer = Buffer.from(encodedKey, 'base64');
    await this.storeKey(new Uint8Array(keyBuffer), password, encryptionService);
  }
}
