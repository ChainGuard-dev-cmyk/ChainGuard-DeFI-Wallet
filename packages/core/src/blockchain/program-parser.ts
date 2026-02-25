import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import * as borsh from 'borsh';

export interface ParsedProgram {
  programId: string;
  programName: string;
  instructionName: string;
  accounts: AccountMeta[];
  data: any;
}

export interface AccountMeta {
  pubkey: string;
  isSigner: boolean;
  isWritable: boolean;
  name?: string;
}

export class ProgramParser {
  private knownPrograms: Map<string, ProgramDefinition> = new Map();
  private instructionLayouts: Map<string, any> = new Map();

  constructor() {
    this.initializeKnownPrograms();
  }

  private initializeKnownPrograms(): void {
    // System Program
    this.knownPrograms.set('11111111111111111111111111111111', {
      name: 'System Program',
      instructions: {
        0: 'CreateAccount',
        1: 'Assign',
        2: 'Transfer',
        3: 'CreateAccountWithSeed',
        4: 'AdvanceNonceAccount',
        5: 'WithdrawNonceAccount',
        6: 'InitializeNonceAccount',
        7: 'AuthorizeNonceAccount',
        8: 'Allocate',
        9: 'AllocateWithSeed',
        10: 'AssignWithSeed',
        11: 'TransferWithSeed'
      }
    });

    // Token Program
    this.knownPrograms.set('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA', {
      name: 'SPL Token',
      instructions: {
        0: 'InitializeMint',
        1: 'InitializeAccount',
        2: 'InitializeMultisig',
        3: 'Transfer',
        4: 'Approve',
        5: 'Revoke',
        6: 'SetAuthority',
        7: 'MintTo',
        8: 'Burn',
        9: 'CloseAccount',
        10: 'FreezeAccount',
        11: 'ThawAccount',
        12: 'TransferChecked',
        13: 'ApproveChecked',
        14: 'MintToChecked',
        15: 'BurnChecked'
      }
    });

    // Associated Token Program
    this.knownPrograms.set('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL', {
      name: 'Associated Token',
      instructions: {
        0: 'Create',
        1: 'CreateIdempotent'
      }
    });

    // Serum DEX
    this.knownPrograms.set('9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin', {
      name: 'Serum DEX v3',
      instructions: {
        0: 'InitializeMarket',
        1: 'NewOrder',
        2: 'MatchOrders',
        3: 'ConsumeEvents',
        4: 'CancelOrder',
        5: 'SettleFunds',
        6: 'CancelOrderByClientId',
        7: 'DisableMarket',
        8: 'SweepFees',
        9: 'NewOrderV2',
        10: 'NewOrderV3',
        11: 'CancelOrderV2',
        12: 'CancelOrderByClientIdV2'
      }
    });
  }

  parseInstruction(instruction: TransactionInstruction): ParsedProgram {
    const programId = instruction.programId.toString();
    const programDef = this.knownPrograms.get(programId);

    if (!programDef) {
      return this.parseUnknownProgram(instruction);
    }

    const instructionType = instruction.data[0];
    const instructionName = programDef.instructions[instructionType] || 'Unknown';

    const accounts = instruction.keys.map((key, index) => ({
      pubkey: key.pubkey.toString(),
      isSigner: key.isSigner,
      isWritable: key.isWritable,
      name: this.getAccountName(programId, instructionType, index)
    }));

    const parsedData = this.parseInstructionData(
      programId,
      instructionType,
      instruction.data
    );

    return {
      programId,
      programName: programDef.name,
      instructionName,
      accounts,
      data: parsedData
    };
  }

  private parseUnknownProgram(instruction: TransactionInstruction): ParsedProgram {
    return {
      programId: instruction.programId.toString(),
      programName: 'Unknown Program',
      instructionName: 'Unknown',
      accounts: instruction.keys.map(key => ({
        pubkey: key.pubkey.toString(),
        isSigner: key.isSigner,
        isWritable: key.isWritable
      })),
      data: {
        raw: instruction.data.toString('hex'),
        length: instruction.data.length
      }
    };
  }

  private parseInstructionData(
    programId: string,
    instructionType: number,
    data: Buffer
  ): any {
    // System Program Transfer
    if (programId === '11111111111111111111111111111111' && instructionType === 2) {
      return {
        lamports: data.readBigUInt64LE(4)
      };
    }

    // Token Transfer
    if (programId === 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' && instructionType === 3) {
      return {
        amount: data.readBigUInt64LE(1)
      };
    }

    // Token Transfer Checked
    if (programId === 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' && instructionType === 12) {
      return {
        amount: data.readBigUInt64LE(1),
        decimals: data.readUInt8(9)
      };
    }

    // Serum New Order
    if (programId === '9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin' && instructionType === 10) {
      return this.parseSerumNewOrder(data);
    }

    return {
      raw: data.toString('hex'),
      instructionType
    };
  }

  private parseSerumNewOrder(data: Buffer): any {
    try {
      return {
        side: data.readUInt32LE(1) === 0 ? 'Buy' : 'Sell',
        limitPrice: data.readBigUInt64LE(5),
        maxCoinQty: data.readBigUInt64LE(13),
        maxNativePcQtyIncludingFees: data.readBigUInt64LE(21),
        selfTradeBehavior: data.readUInt32LE(29),
        orderType: this.getOrderType(data.readUInt32LE(33)),
        clientOrderId: data.readBigUInt64LE(37),
        limit: data.readUInt16LE(45)
      };
    } catch (error) {
      return { error: 'Failed to parse Serum order' };
    }
  }

  private getOrderType(type: number): string {
    const types = ['Limit', 'ImmediateOrCancel', 'PostOnly'];
    return types[type] || 'Unknown';
  }

  private getAccountName(programId: string, instructionType: number, index: number): string {
    // System Transfer accounts
    if (programId === '11111111111111111111111111111111' && instructionType === 2) {
      return ['From', 'To'][index] || `Account ${index}`;
    }

    // Token Transfer accounts
    if (programId === 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' && instructionType === 3) {
      return ['Source', 'Destination', 'Authority'][index] || `Account ${index}`;
    }

    return `Account ${index}`;
  }

  parseMultipleInstructions(instructions: TransactionInstruction[]): ParsedProgram[] {
    return instructions.map(ix => this.parseInstruction(ix));
  }

  isKnownProgram(programId: string): boolean {
    return this.knownPrograms.has(programId);
  }

  getProgramName(programId: string): string {
    return this.knownPrograms.get(programId)?.name || 'Unknown Program';
  }

  addCustomProgram(programId: string, definition: ProgramDefinition): void {
    this.knownPrograms.set(programId, definition);
  }
}

interface ProgramDefinition {
  name: string;
  instructions: { [key: number]: string };
}

export default ProgramParser;
