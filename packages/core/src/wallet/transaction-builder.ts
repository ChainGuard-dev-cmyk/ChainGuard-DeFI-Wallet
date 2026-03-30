import {
  Transaction,
  SystemProgram,
  PublicKey,
  TransactionInstruction,
  LAMPORTS_PER_SOL
} from '@solana/web3.js';

export interface TransferParams {
  from: PublicKey;
  to: PublicKey;
  amount: number;
}

export interface TokenTransferParams {
  from: PublicKey;
  to: PublicKey;
  amount: number;
  mint: PublicKey;
  decimals: number;
}

export class TransactionBuilder {
  private transaction: Transaction;
  private instructions: TransactionInstruction[] = [];

  constructor() {
    this.transaction = new Transaction();
  }

  addTransfer(params: TransferParams): this {
    const instruction = SystemProgram.transfer({
      fromPubkey: params.from,
      toPubkey: params.to,
      lamports: params.amount * LAMPORTS_PER_SOL
    });

    this.instructions.push(instruction);
    return this;
  }

  addTokenTransfer(params: TokenTransferParams): this {
    // Token transfer instruction (simplified)
    const data = Buffer.alloc(9);
    data.writeUInt8(3, 0); // Transfer instruction
    data.writeBigUInt64LE(BigInt(params.amount * Math.pow(10, params.decimals)), 1);

    const instruction = new TransactionInstruction({
      keys: [
        { pubkey: params.from, isSigner: true, isWritable: true },
        { pubkey: params.to, isSigner: false, isWritable: true },
        { pubkey: params.from, isSigner: true, isWritable: false }
      ],
      programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
      data
    });

    this.instructions.push(instruction);
    return this;
  }

  addCustomInstruction(instruction: TransactionInstruction): this {
    this.instructions.push(instruction);
    return this;
  }

  setRecentBlockhash(blockhash: string): this {
    this.transaction.recentBlockhash = blockhash;
    return this;
  }

  setFeePayer(feePayer: PublicKey): this {
    this.transaction.feePayer = feePayer;
    return this;
  }

  build(): Transaction {
    this.instructions.forEach(ix => {
      this.transaction.add(ix);
    });

    return this.transaction;
  }

  reset(): void {
    this.transaction = new Transaction();
    this.instructions = [];
  }

  estimateFee(): number {
    const signatureCount = 1;
    const baseFee = 5000;
    return baseFee * signatureCount;
  }

  getInstructionCount(): number {
    return this.instructions.length;
  }

  addMemo(memo: string): this {
    const memoInstruction = new TransactionInstruction({
      keys: [],
      programId: new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'),
      data: Buffer.from(memo, 'utf8')
    });

    this.instructions.push(memoInstruction);
    return this;
  }

  setPriorityFee(microLamports: number): this {
    const priorityFeeInstruction = new TransactionInstruction({
      keys: [],
      programId: new PublicKey('ComputeBudget111111111111111111111111111111'),
      data: Buffer.from([3, ...new Uint8Array(new BigUint64Array([BigInt(microLamports)]).buffer)])
    });

    this.instructions.unshift(priorityFeeInstruction);
    return this;
  }

  setComputeUnitLimit(units: number): this {
    const computeUnitInstruction = new TransactionInstruction({
      keys: [],
      programId: new PublicKey('ComputeBudget111111111111111111111111111111'),
      data: Buffer.from([2, ...new Uint8Array(new Uint32Array([units]).buffer)])
    });

    this.instructions.unshift(computeUnitInstruction);
    return this;
  }
}
