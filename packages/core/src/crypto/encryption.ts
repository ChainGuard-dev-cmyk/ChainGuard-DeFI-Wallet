import * as crypto from 'crypto';

export interface EncryptedData {
  ciphertext: string;
  iv: string;
  tag: string;
  salt: string;
}

export class EncryptionService {
  private algorithm: string = 'aes-256-gcm';
  private keyLength: number = 32;
  private ivLength: number = 16;
  private saltLength: number = 64;
  private tagLength: number = 16;

  async encrypt(data: Buffer, password: string): Promise<EncryptedData> {
    const salt = crypto.randomBytes(this.saltLength);
    const key = await this.deriveKey(password, salt);
    const iv = crypto.randomBytes(this.ivLength);

    const cipher = crypto.createCipheriv(this.algorithm, key, iv);
    
    let ciphertext = cipher.update(data);
    ciphertext = Buffer.concat([ciphertext, cipher.final()]);
    
    const tag = cipher.getAuthTag();

    return {
      ciphertext: ciphertext.toString('base64'),
      iv: iv.toString('base64'),
      tag: tag.toString('base64'),
      salt: salt.toString('base64')
    };
  }

  async decrypt(encryptedData: EncryptedData, password: string): Promise<Buffer> {
    const salt = Buffer.from(encryptedData.salt, 'base64');
    const key = await this.deriveKey(password, salt);
    const iv = Buffer.from(encryptedData.iv, 'base64');
    const tag = Buffer.from(encryptedData.tag, 'base64');
    const ciphertext = Buffer.from(encryptedData.ciphertext, 'base64');

    const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(ciphertext);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted;
  }

  private async deriveKey(password: string, salt: Buffer): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      crypto.pbkdf2(
        password,
        salt,
        100000,
        this.keyLength,
        'sha512',
        (err, derivedKey) => {
          if (err) reject(err);
          else resolve(derivedKey);
        }
      );
    });
  }

  async hash(data: string): Promise<string> {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  async hmac(data: string, key: string): Promise<string> {
    return crypto.createHmac('sha256', key).update(data).digest('hex');
  }

  generateRandomBytes(length: number): Buffer {
    return crypto.randomBytes(length);
  }
}
