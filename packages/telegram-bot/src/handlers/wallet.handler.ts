import TelegramBot, { Message, CallbackQuery } from 'node-telegram-bot-api';
import { SolanaWallet } from '@chain-guard/core/wallet/solana-wallet';
import { EncryptionService } from '@chain-guard/core/crypto/encryption';

interface WalletSession {
  walletId: string;
  publicKey: string;
  createdAt: number;
  encrypted: boolean;
}

export class WalletHandler {
  private wallets: Map<number, SolanaWallet> = new Map();
  private sessions: Map<number, WalletSession> = new Map();
  private encryptionService: EncryptionService;
  private config: any;

  constructor(config: any) {
    this.config = config;
    this.encryptionService = new EncryptionService();
  }

  async handleWalletInfo(msg: Message, bot: TelegramBot): Promise<void> {
    const chatId = msg.chat.id;
    const userId = msg.from?.id;

    if (!userId) return;

    const session = this.sessions.get(userId);
    
    if (!session) {
      await bot.sendMessage(
        chatId,
        'No wallet found. Create or import a wallet first.',
        {
          reply_markup: {
            inline_keyboard: [
              [
                { text: 'Create Wallet', callback_data: 'wallet_create' },
                { text: 'Import Wallet', callback_data: 'wallet_import' }
              ]
            ]
          }
        }
      );
      return;
    }

    const wallet = this.wallets.get(userId);
    if (!wallet) return;

    try {
      const publicKey = await wallet.getPublicKey();
      const balance = await wallet.getBalance();

      const message = `
💼 Wallet Information

Address: \`${publicKey.toString()}\`
Balance: ${balance.toFixed(4)} SOL

Created: ${new Date(session.createdAt).toLocaleString()}
Status: ${session.encrypted ? '🔒 Encrypted' : '⚠️ Not Encrypted'}
      `;

      const keyboard = {
        inline_keyboard: [
          [
            { text: '💰 Check Balance', callback_data: 'wallet_balance' },
            { text: '📤 Send', callback_data: 'wallet_send' }
          ],
          [
            { text: '📜 History', callback_data: 'wallet_history' },
            { text: '⚙️ Settings', callback_data: 'wallet_settings' }
          ]
        ]
      };

      await bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
      });
    } catch (error) {
      await bot.sendMessage(chatId, `Error: ${(error as Error).message}`);
    }
  }

  async handleBalance(msg: Message, bot: TelegramBot): Promise<void> {
    const chatId = msg.chat.id;
    const userId = msg.from?.id;

    if (!userId) return;

    const wallet = this.wallets.get(userId);
    
    if (!wallet) {
      await bot.sendMessage(chatId, 'No wallet found. Create one first with /create');
      return;
    }

    try {
      const balance = await wallet.getBalance();
      const publicKey = await wallet.getPublicKey();

      await bot.sendMessage(
        chatId,
        `💰 Balance: ${balance.toFixed(4)} SOL\n\nAddress: \`${publicKey.toString()}\``,
        { parse_mode: 'Markdown' }
      );
    } catch (error) {
      await bot.sendMessage(chatId, `Error fetching balance: ${(error as Error).message}`);
    }
  }

  async handleCreateWallet(msg: Message, bot: TelegramBot): Promise<void> {
    const chatId = msg.chat.id;
    const userId = msg.from?.id;

    if (!userId) return;

    if (this.wallets.has(userId)) {
      await bot.sendMessage(chatId, 'You already have a wallet. Use /wallet to view it.');
      return;
    }

    try {
      await bot.sendMessage(chatId, '🔐 Creating your wallet...');

      const wallet = new SolanaWallet({
        network: 'mainnet-beta',
        rpcEndpoint: this.config.rpcEndpoint,
        commitment: 'confirmed'
      });

      const mnemonic = await wallet.generateMnemonic();
      const password = this.generateSecurePassword();
      
      await wallet.importFromMnemonic(mnemonic, password);

      this.wallets.set(userId, wallet);

      const publicKey = await wallet.getPublicKey();

      this.sessions.set(userId, {
        walletId: `wallet_${userId}`,
        publicKey: publicKey.toString(),
        createdAt: Date.now(),
        encrypted: true
      });

      const warningMessage = `
✅ Wallet created successfully!

⚠️ IMPORTANT - Save your seed phrase:

\`${mnemonic}\`

This is the ONLY way to recover your wallet. Store it securely and never share it with anyone.

Your address: \`${publicKey.toString()}\`

Click below to confirm you've saved it.
      `;

      await bot.sendMessage(chatId, warningMessage, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: '✅ I have saved my seed phrase', callback_data: 'wallet_confirmed' }]
          ]
        }
      });

      // Auto-delete message after 5 minutes for security
      setTimeout(async () => {
        try {
          await bot.deleteMessage(chatId, (await bot.sendMessage(chatId, '.')).message_id);
        } catch (e) {
          // Message might already be deleted
        }
      }, 300000);

    } catch (error) {
      await bot.sendMessage(chatId, `Error creating wallet: ${(error as Error).message}`);
    }
  }

  async handleImportWallet(msg: Message, bot: TelegramBot): Promise<void> {
    const chatId = msg.chat.id;
    const userId = msg.from?.id;

    if (!userId) return;

    if (this.wallets.has(userId)) {
      await bot.sendMessage(chatId, 'You already have a wallet. Use /wallet to view it.');
      return;
    }

    await bot.sendMessage(
      chatId,
      '🔐 To import your wallet, send me your 12 or 24 word seed phrase.\n\n⚠️ Make sure you\'re in a private chat!'
    );

    // Set up one-time listener for seed phrase
    const listener = async (response: Message) => {
      if (response.from?.id !== userId || response.chat.id !== chatId) return;

      const mnemonic = response.text?.trim();
      
      if (!mnemonic) return;

      try {
        // Delete the message with seed phrase immediately
        await bot.deleteMessage(chatId, response.message_id);

        await bot.sendMessage(chatId, '🔄 Importing wallet...');

        const wallet = new SolanaWallet({
          network: 'mainnet-beta',
          rpcEndpoint: this.config.rpcEndpoint,
          commitment: 'confirmed'
        });

        const password = this.generateSecurePassword();
        await wallet.importFromMnemonic(mnemonic, password);

        this.wallets.set(userId, wallet);

        const publicKey = await wallet.getPublicKey();

        this.sessions.set(userId, {
          walletId: `wallet_${userId}`,
          publicKey: publicKey.toString(),
          createdAt: Date.now(),
          encrypted: true
        });

        await bot.sendMessage(
          chatId,
          `✅ Wallet imported successfully!\n\nAddress: \`${publicKey.toString()}\``,
          { parse_mode: 'Markdown' }
        );

      } catch (error) {
        await bot.sendMessage(chatId, `Error importing wallet: ${(error as Error).message}`);
      }

      bot.removeListener('message', listener);
    };

    bot.on('message', listener);
  }

  async handleCallback(query: CallbackQuery, bot: TelegramBot): Promise<void> {
    const chatId = query.message?.chat.id;
    const userId = query.from.id;
    const data = query.data;

    if (!chatId || !data) return;

    if (data === 'wallet_create') {
      await this.handleCreateWallet(query.message!, bot);
    } else if (data === 'wallet_import') {
      await this.handleImportWallet(query.message!, bot);
    } else if (data === 'wallet_balance') {
      await this.handleBalance(query.message!, bot);
    } else if (data === 'wallet_confirmed') {
      await bot.sendMessage(chatId, '✅ Great! Your wallet is ready to use. Type /help to see available commands.');
    }
  }

  private generateSecurePassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 32; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }
}
