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
    // For browser: use chrome.storage.local (extension-sandboxed, not accessible to page JS)
    // For Node: OS keychain integration
    const serialized = JSON.stringify(data);
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      await chrome.storage.local.set({ [`chain_guard_${key}`]: serialized });
    } else if (typeof window !== 'undefined' && window.indexedDB) {
      // Fallback: IndexedDB is preferable to localStorage for sensitive data
      // as it is not synchronously accessible and supports structured cloning
      const request = window.indexedDB.open('chain_guard_keys', 1);
      await new Promise<void>((resolve, reject) => {
        request.onupgradeneeded = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains('keys')) {
            db.createObjectStore('keys');
          }
        };
        request.onsuccess = () => {
          const db = request.result;
          const tx = db.transaction('keys', 'readwrite');
          tx.objectStore('keys').put(serialized, key);
          tx.oncomplete = () => resolve();
          tx.onerror = () => reject(tx.error);
        };
        request.onerror = () => reject(request.error);
      });
    }
  }

  private async loadFromSecureStorage(key: string): Promise<StoredKey | null> {
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      const result = await chrome.storage.local.get(`chain_guard_${key}`);
      const data = result[`chain_guard_${key}`];
      return data ? JSON.parse(data) : null;
    } else if (typeof window !== 'undefined' && window.indexedDB) {
      return new Promise((resolve, reject) => {
        const request = window.indexedDB.open('chain_guard_keys', 1);
        request.onupgradeneeded = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains('keys')) {
            db.createObjectStore('keys');
          }
        };
        request.onsuccess = () => {
          const db = request.result;
          const tx = db.transaction('keys', 'readonly');
          const getReq = tx.objectStore('keys').get(key);
          getReq.onsuccess = () => {
            resolve(getReq.result ? JSON.parse(getReq.result) : null);
          };
          getReq.onerror = () => reject(getReq.error);
        };
        request.onerror = () => reject(request.error);
      });
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
