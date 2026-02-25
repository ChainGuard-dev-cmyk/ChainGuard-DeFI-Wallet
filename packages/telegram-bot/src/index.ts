import TelegramBot from 'node-telegram-bot-api';
import { WalletHandler } from './handlers/wallet.handler';
import { AIHandler } from './handlers/ai.handler';
import { TransactionHandler } from './handlers/transaction.handler';
import { SecurityHandler } from './handlers/security.handler';

interface BotConfig {
  token: string;
  rpcEndpoint: string;
  encryptionKey: string;
}

class ChainGuardBot {
  private bot: TelegramBot;
  private walletHandler: WalletHandler;
  private aiHandler: AIHandler;
  private transactionHandler: TransactionHandler;
  private securityHandler: SecurityHandler;
  private userSessions: Map<number, any> = new Map();

  constructor(config: BotConfig) {
    this.bot = new TelegramBot(config.token, { polling: true });
    
    this.walletHandler = new WalletHandler(config);
    this.aiHandler = new AIHandler(config);
    this.transactionHandler = new TransactionHandler(config);
    this.securityHandler = new SecurityHandler(config);

    this.setupCommands();
    this.setupCallbacks();
    this.setupMiddleware();
  }

  private setupCommands(): void {
    // Start command
    this.bot.onText(/\/start/, async (msg) => {
      const chatId = msg.chat.id;
      await this.handleStart(chatId, msg.from);
    });

    // Wallet commands
    this.bot.onText(/\/wallet/, async (msg) => {
      await this.walletHandler.handleWalletInfo(msg, this.bot);
    });

    this.bot.onText(/\/balance/, async (msg) => {
      await this.walletHandler.handleBalance(msg, this.bot);
    });

    this.bot.onText(/\/create/, async (msg) => {
      await this.walletHandler.handleCreateWallet(msg, this.bot);
    });

    this.bot.onText(/\/import/, async (msg) => {
      await this.walletHandler.handleImportWallet(msg, this.bot);
    });

    // Transaction commands
    this.bot.onText(/\/send (.+)/, async (msg, match) => {
      await this.transactionHandler.handleSend(msg, match, this.bot);
    });

    this.bot.onText(/\/history/, async (msg) => {
      await this.transactionHandler.handleHistory(msg, this.bot);
    });

    // Security commands
    this.bot.onText(/\/security/, async (msg) => {
      await this.securityHandler.handleSecuritySettings(msg, this.bot);
    });

    this.bot.onText(/\/alerts/, async (msg) => {
      await this.securityHandler.handleAlerts(msg, this.bot);
    });

    // AI commands
    this.bot.onText(/\/analyze/, async (msg) => {
      await this.aiHandler.handleAnalyze(msg, this.bot);
    });

    this.bot.onText(/\/risk (.+)/, async (msg, match) => {
      await this.aiHandler.handleRiskCheck(msg, match, this.bot);
    });

    // Help command
    this.bot.onText(/\/help/, async (msg) => {
      await this.handleHelp(msg.chat.id);
    });
  }

  private setupCallbacks(): void {
    this.bot.on('callback_query', async (query) => {
      const chatId = query.message?.chat.id;
      if (!chatId) return;

      const data = query.data;
      
      if (data?.startsWith('wallet_')) {
        await this.walletHandler.handleCallback(query, this.bot);
      } else if (data?.startsWith('tx_')) {
        await this.transactionHandler.handleCallback(query, this.bot);
      } else if (data?.startsWith('security_')) {
        await this.securityHandler.handleCallback(query, this.bot);
      } else if (data?.startsWith('ai_')) {
        await this.aiHandler.handleCallback(query, this.bot);
      }

      await this.bot.answerCallbackQuery(query.id);
    });
  }

  private setupMiddleware(): void {
    this.bot.on('message', async (msg) => {
      // Rate limiting
      if (!this.checkRateLimit(msg.from?.id)) {
        await this.bot.sendMessage(
          msg.chat.id,
          'Too many requests. Please wait a moment.'
        );
        return;
      }

      // Session management
      this.updateSession(msg.from?.id, msg);

      // Logging
      this.logMessage(msg);
    });
  }

  private async handleStart(chatId: number, user: any): Promise<void> {
    const welcomeMessage = `
Welcome to Chain Guard! 🛡️

Your AI-powered Solana wallet security assistant.

Available commands:
/wallet - View wallet information
/balance - Check your balance
/create - Create a new wallet
/import - Import existing wallet
/send - Send SOL or tokens
/history - Transaction history
/security - Security settings
/analyze - Analyze a transaction
/help - Show all commands

Get started by creating or importing a wallet!
    `;

    const keyboard = {
      inline_keyboard: [
        [
          { text: 'Create Wallet', callback_data: 'wallet_create' },
          { text: 'Import Wallet', callback_data: 'wallet_import' }
        ],
        [
          { text: 'Security Guide', callback_data: 'security_guide' }
        ]
      ]
    };

    await this.bot.sendMessage(chatId, welcomeMessage, {
      reply_markup: keyboard
    });

    // Initialize user session
    this.userSessions.set(user.id, {
      userId: user.id,
      username: user.username,
      startedAt: Date.now(),
      lastActivity: Date.now()
    });
  }

  private async handleHelp(chatId: number): Promise<void> {
    const helpMessage = `
Chain Guard Commands:

WALLET MANAGEMENT:
/wallet - View wallet details
/balance - Check SOL balance
/create - Create new wallet
/import - Import from seed phrase

TRANSACTIONS:
/send <address> <amount> - Send SOL
/history - View transaction history

SECURITY:
/security - Security settings
/alerts - Configure alerts
/analyze - Analyze transaction

AI FEATURES:
/risk <address> - Check address risk
/analyze - AI transaction analysis

Need help? Contact @chainguard_support
    `;

    await this.bot.sendMessage(chatId, helpMessage);
  }

  private checkRateLimit(userId?: number): boolean {
    if (!userId) return false;
    
    const session = this.userSessions.get(userId);
    if (!session) return true;

    const now = Date.now();
    const timeSinceLastActivity = now - session.lastActivity;

    // Allow 1 request per second
    return timeSinceLastActivity > 1000;
  }

  private updateSession(userId?: number, msg?: any): void {
    if (!userId) return;

    const session = this.userSessions.get(userId) || {};
    session.lastActivity = Date.now();
    session.lastMessage = msg;
    this.userSessions.set(userId, session);
  }

  private logMessage(msg: any): void {
    console.log(`[${new Date().toISOString()}] User ${msg.from?.id}: ${msg.text}`);
  }

  public start(): void {
    console.log('Chain Guard Bot started successfully');
    console.log('Listening for commands...');
  }

  public stop(): void {
    this.bot.stopPolling();
    console.log('Chain Guard Bot stopped');
  }
}

// Initialize and start bot
const config: BotConfig = {
  token: process.env.TELEGRAM_BOT_TOKEN || '',
  rpcEndpoint: process.env.RPC_ENDPOINT || 'https://api.mainnet-beta.solana.com',
  encryptionKey: process.env.ENCRYPTION_KEY || ''
};

if (!config.token) {
  console.error('TELEGRAM_BOT_TOKEN environment variable is required');
  process.exit(1);
}

const bot = new ChainGuardBot(config);
bot.start();

// Graceful shutdown
process.on('SIGINT', () => {
  bot.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  bot.stop();
  process.exit(0);
});

export default ChainGuardBot;
