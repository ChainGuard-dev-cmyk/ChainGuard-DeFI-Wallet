import TelegramBot, { Message, CallbackQuery } from 'node-telegram-bot-api';
import { SolanaWallet } from '@chain-guard/core/wallet/solana-wallet';
import { TransactionBuilder } from '@chain-guard/core/wallet/transaction-builder';
import { ThreatDetector } from '@chain-guard/core/ai/threat-detector';
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';

interface TransactionSession {
  step: 'recipient' | 'amount' | 'confirm';
  recipient?: string;
  amount?: number;
  createdAt: number;
}

export class TransactionHandler {
  private sessions: Map<number, TransactionSession> = new Map();
  private wallets: Map<number, SolanaWallet> = new Map();
  private threatDetector: ThreatDetector;
  private config: any;

  constructor(config: any) {
    this.config = config;
    this.threatDetector = new ThreatDetector();
  }

  async handleSend(
    msg: Message,
    match: RegExpExecArray | null,
    bot: TelegramBot
  ): Promise<void> {
    const chatId = msg.chat.id;
    const userId = msg.from?.id;

    if (!userId) return;

    const wallet = this.wallets.get(userId);
    
    if (!wallet) {
      await bot.sendMessage(chatId, 'No wallet found. Create one first with /create');
      return;
    }

    // Parse command arguments
    const args = match?.[1]?.split(' ');
    
    if (!args || args.length < 2) {
      // Start interactive flow
      await this.startSendFlow(chatId, userId, bot);
      return;
    }

    const [recipient, amountStr] = args;
    const amount = parseFloat(amountStr);

    if (isNaN(amount) || amount <= 0) {
      await bot.sendMessage(chatId, 'Invalid amount. Please provide a valid number.');
      return;
    }

    await this.processSend(chatId, userId, recipient, amount, bot);
  }

  private async startSendFlow(
    chatId: number,
    userId: number,
    bot: TelegramBot
  ): Promise<void> {
    this.sessions.set(userId, {
      step: 'recipient',
      createdAt: Date.now()
    });

    await bot.sendMessage(
      chatId,
      '💸 Send SOL\n\nPlease enter the recipient address:',
      {
        reply_markup: {
          force_reply: true
        }
      }
    );
  }

  private async processSend(
    chatId: number,
    userId: number,
    recipient: string,
    amount: number,
    bot: TelegramBot
  ): Promise<void> {
    const wallet = this.wallets.get(userId);
    if (!wallet) return;

    try {
      // Validate recipient address
      const recipientPubkey = new PublicKey(recipient);

      // Check balance
      const balance = await wallet.getBalance();
      
      if (amount > balance) {
        await bot.sendMessage(
          chatId,
          `❌ Insufficient balance\n\nYou have: ${balance.toFixed(4)} SOL\nYou need: ${amount.toFixed(4)} SOL`
        );
        return;
      }

      // Build transaction
      const builder = new TransactionBuilder();
      const fromPubkey = await wallet.getPublicKey();

      builder.addTransfer({
        from: fromPubkey,
        to: recipientPubkey,
        amount
      });

      const transaction = builder.build();

      // Analyze transaction
      await bot.sendMessage(chatId, '🔍 Analyzing transaction security...');
      
      const analysis = await this.threatDetector.analyzeTransaction(transaction);

      // Show confirmation
      const confirmMessage = this.buildConfirmationMessage(
        recipient,
        amount,
        balance,
        analysis
      );

      const keyboard = {
        inline_keyboard: [
          [
            { text: '✅ Confirm', callback_data: `tx_confirm_${userId}` },
            { text: '❌ Cancel', callback_data: `tx_cancel_${userId}` }
          ]
        ]
      };

      await bot.sendMessage(chatId, confirmMessage, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
      });

      // Store transaction in session
      this.sessions.set(userId, {
        step: 'confirm',
        recipient,
        amount,
        createdAt: Date.now()
      });

    } catch (error) {
      await bot.sendMessage(
        chatId,
        `❌ Error: ${(error as Error).message}`
      );
    }
  }

  async handleHistory(msg: Message, bot: TelegramBot): Promise<void> {
    const chatId = msg.chat.id;
    const userId = msg.from?.id;

    if (!userId) return;

    const wallet = this.wallets.get(userId);
    
    if (!wallet) {
      await bot.sendMessage(chatId, 'No wallet found. Create one first with /create');
      return;
    }

    await bot.sendMessage(chatId, '📜 Loading transaction history...');

    try {
      // Simulate transaction history
      const transactions = this.generateMockHistory();

      if (transactions.length === 0) {
        await bot.sendMessage(chatId, '📭 No transactions yet');
        return;
      }

      const historyMessage = this.buildHistoryMessage(transactions);

      const keyboard = {
        inline_keyboard: [
          [
            { text: '🔄 Refresh', callback_data: 'tx_refresh_history' },
            { text: '📊 Export', callback_data: 'tx_export_history' }
          ]
        ]
      };

      await bot.sendMessage(chatId, historyMessage, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
      });

    } catch (error) {
      await bot.sendMessage(
        chatId,
        `Error loading history: ${(error as Error).message}`
      );
    }
  }

  async handleCallback(query: CallbackQuery, bot: TelegramBot): Promise<void> {
    const chatId = query.message?.chat.id;
    const userId = query.from.id;
    const data = query.data;

    if (!chatId || !data) return;

    if (data.startsWith('tx_confirm_')) {
      await this.confirmTransaction(chatId, userId, bot);
    } else if (data.startsWith('tx_cancel_')) {
      await this.cancelTransaction(chatId, userId, bot);
    } else if (data === 'tx_refresh_history') {
      await this.handleHistory(query.message!, bot);
    } else if (data === 'tx_export_history') {
      await this.exportHistory(chatId, userId, bot);
    }
  }

  private async confirmTransaction(
    chatId: number,
    userId: number,
    bot: TelegramBot
  ): Promise<void> {
    const session = this.sessions.get(userId);
    
    if (!session || session.step !== 'confirm') {
      await bot.sendMessage(chatId, '❌ Transaction session expired');
      return;
    }

    const wallet = this.wallets.get(userId);
    if (!wallet) return;

    await bot.sendMessage(chatId, '⏳ Processing transaction...');

    try {
      // Simulate transaction sending
      const signature = this.generateMockSignature();

      const successMessage = `
✅ Transaction Sent Successfully!

Signature: \`${signature}\`
Amount: ${session.amount} SOL
Recipient: \`${session.recipient?.slice(0, 8)}...${session.recipient?.slice(-8)}\`

View on Explorer:
https://solscan.io/tx/${signature}
      `;

      await bot.sendMessage(chatId, successMessage, {
        parse_mode: 'Markdown'
      });

      // Clear session
      this.sessions.delete(userId);

    } catch (error) {
      await bot.sendMessage(
        chatId,
        `❌ Transaction failed: ${(error as Error).message}`
      );
    }
  }

  private async cancelTransaction(
    chatId: number,
    userId: number,
    bot: TelegramBot
  ): Promise<void> {
    this.sessions.delete(userId);
    await bot.sendMessage(chatId, '❌ Transaction cancelled');
  }

  private async exportHistory(
    chatId: number,
    userId: number,
    bot: TelegramBot
  ): Promise<void> {
    const transactions = this.generateMockHistory();
    
    const csv = this.convertToCSV(transactions);
    const buffer = Buffer.from(csv, 'utf-8');

    await bot.sendDocument(chatId, buffer, {
      filename: `chain-guard-history-${Date.now()}.csv`
    });
  }

  private buildConfirmationMessage(
    recipient: string,
    amount: number,
    balance: number,
    analysis: any
  ): string {
    const riskEmoji = analysis.riskScore > 0.7 ? '🔴' : analysis.riskScore > 0.4 ? '🟡' : '🟢';
    
    return `
💸 Confirm Transaction

From: Your Wallet
To: \`${recipient.slice(0, 8)}...${recipient.slice(-8)}\`
Amount: ${amount.toFixed(4)} SOL
Fee: ~0.000005 SOL

Current Balance: ${balance.toFixed(4)} SOL
After Transaction: ${(balance - amount - 0.000005).toFixed(4)} SOL

${riskEmoji} Security Analysis:
Risk Score: ${(analysis.riskScore * 100).toFixed(1)}/100
${analysis.threats.length > 0 ? '⚠️ Warnings:\n' + analysis.threats.map((t: string) => `• ${t}`).join('\n') : '✅ No threats detected'}

Do you want to proceed?
    `;
  }

  private buildHistoryMessage(transactions: any[]): string {
    let message = '📜 Transaction History\n\n';

    transactions.forEach((tx, index) => {
      const emoji = tx.type === 'sent' ? '📤' : '📥';
      const sign = tx.type === 'sent' ? '-' : '+';
      
      message += `${emoji} ${tx.type.toUpperCase()}\n`;
      message += `Amount: ${sign}${tx.amount} SOL\n`;
      message += `Date: ${new Date(tx.timestamp).toLocaleDateString()}\n`;
      message += `Status: ${tx.status}\n`;
      message += `\`${tx.signature.slice(0, 16)}...\`\n\n`;
    });

    return message;
  }

  private generateMockHistory(): any[] {
    return [
      {
        signature: this.generateMockSignature(),
        type: 'sent',
        amount: 1.5,
        timestamp: Date.now() - 86400000,
        status: '✅ Confirmed'
      },
      {
        signature: this.generateMockSignature(),
        type: 'received',
        amount: 2.0,
        timestamp: Date.now() - 172800000,
        status: '✅ Confirmed'
      },
      {
        signature: this.generateMockSignature(),
        type: 'sent',
        amount: 0.5,
        timestamp: Date.now() - 259200000,
        status: '✅ Confirmed'
      }
    ];
  }

  private generateMockSignature(): string {
    const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    let signature = '';
    for (let i = 0; i < 88; i++) {
      signature += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return signature;
  }

  private convertToCSV(transactions: any[]): string {
    let csv = 'Date,Type,Amount,Status,Signature\n';
    
    transactions.forEach(tx => {
      csv += `${new Date(tx.timestamp).toISOString()},${tx.type},${tx.amount},${tx.status},${tx.signature}\n`;
    });

    return csv;
  }
}
