import TelegramBot, { Message, CallbackQuery } from 'node-telegram-bot-api';

interface SecuritySettings {
  autoLock: boolean;
  autoLockMinutes: number;
  twoFactorEnabled: boolean;
  transactionAlerts: boolean;
  riskThreshold: number;
  whitelistedAddresses: string[];
}

export class SecurityHandler {
  private settings: Map<number, SecuritySettings> = new Map();
  private config: any;

  constructor(config: any) {
    this.config = config;
  }

  async handleSecuritySettings(msg: Message, bot: TelegramBot): Promise<void> {
    const chatId = msg.chat.id;
    const userId = msg.from?.id;

    if (!userId) return;

    const settings = this.getSettings(userId);

    const message = `
🔒 Security Settings

Current Configuration:
• Auto-lock: ${settings.autoLock ? `✅ Enabled (${settings.autoLockMinutes} min)` : '❌ Disabled'}
• 2FA: ${settings.twoFactorEnabled ? '✅ Enabled' : '❌ Disabled'}
• Transaction Alerts: ${settings.transactionAlerts ? '✅ Enabled' : '❌ Disabled'}
• Risk Threshold: ${settings.riskThreshold * 100}%
• Whitelisted Addresses: ${settings.whitelistedAddresses.length}

Security Score: ${this.calculateSecurityScore(settings)}/100
    `;

    const keyboard = {
      inline_keyboard: [
        [
          { text: '🔐 Auto-lock', callback_data: 'security_autolock' },
          { text: '🔑 2FA', callback_data: 'security_2fa' }
        ],
        [
          { text: '🔔 Alerts', callback_data: 'security_alerts' },
          { text: '⚠️ Risk Level', callback_data: 'security_risk' }
        ],
        [
          { text: '📋 Whitelist', callback_data: 'security_whitelist' },
          { text: '🔄 Reset', callback_data: 'security_reset' }
        ]
      ]
    };

    await bot.sendMessage(chatId, message, { reply_markup: keyboard });
  }

  async handleAlerts(msg: Message, bot: TelegramBot): Promise<void> {
    const chatId = msg.chat.id;
    const userId = msg.from?.id;

    if (!userId) return;

    const alerts = this.getRecentAlerts(userId);

    if (alerts.length === 0) {
      await bot.sendMessage(chatId, '✅ No security alerts');
      return;
    }

    let message = '🔔 Recent Security Alerts\n\n';

    alerts.forEach((alert, index) => {
      message += `${alert.emoji} ${alert.title}\n`;
      message += `${alert.description}\n`;
      message += `Time: ${new Date(alert.timestamp).toLocaleString()}\n\n`;
    });

    const keyboard = {
      inline_keyboard: [
        [
          { text: '✅ Mark All Read', callback_data: 'security_clear_alerts' },
          { text: '🔄 Refresh', callback_data: 'security_refresh_alerts' }
        ]
      ]
    };

    await bot.sendMessage(chatId, message, { reply_markup: keyboard });
  }

  async handleCallback(query: CallbackQuery, bot: TelegramBot): Promise<void> {
    const chatId = query.message?.chat.id;
    const userId = query.from.id;
    const data = query.data;

    if (!chatId || !data) return;

    if (data === 'security_autolock') {
      await this.toggleAutoLock(chatId, userId, bot);
    } else if (data === 'security_2fa') {
      await this.toggle2FA(chatId, userId, bot);
    } else if (data === 'security_alerts') {
      await this.toggleAlerts(chatId, userId, bot);
    } else if (data === 'security_risk') {
      await this.adjustRiskLevel(chatId, userId, bot);
    } else if (data === 'security_whitelist') {
      await this.manageWhitelist(chatId, userId, bot);
    } else if (data === 'security_reset') {
      await this.resetSettings(chatId, userId, bot);
    } else if (data === 'security_clear_alerts') {
      await this.clearAlerts(chatId, userId, bot);
    } else if (data === 'security_guide') {
      await this.showSecurityGuide(chatId, bot);
    }
  }

  private async toggleAutoLock(
    chatId: number,
    userId: number,
    bot: TelegramBot
  ): Promise<void> {
    const settings = this.getSettings(userId);
    settings.autoLock = !settings.autoLock;
    this.settings.set(userId, settings);

    await bot.sendMessage(
      chatId,
      `Auto-lock ${settings.autoLock ? 'enabled' : 'disabled'}`
    );
  }

  private async toggle2FA(
    chatId: number,
    userId: number,
    bot: TelegramBot
  ): Promise<void> {
    const settings = this.getSettings(userId);
    
    if (!settings.twoFactorEnabled) {
      const message = `
🔑 Enable Two-Factor Authentication

2FA adds an extra layer of security by requiring a code for sensitive operations.

Setup steps:
1. Install an authenticator app (Google Authenticator, Authy)
2. Scan the QR code below
3. Enter the 6-digit code to verify

[QR Code would be generated here]

Enter the code from your authenticator app:
      `;

      await bot.sendMessage(chatId, message);
    } else {
      settings.twoFactorEnabled = false;
      this.settings.set(userId, settings);
      await bot.sendMessage(chatId, '2FA disabled');
    }
  }

  private async toggleAlerts(
    chatId: number,
    userId: number,
    bot: TelegramBot
  ): Promise<void> {
    const settings = this.getSettings(userId);
    settings.transactionAlerts = !settings.transactionAlerts;
    this.settings.set(userId, settings);

    await bot.sendMessage(
      chatId,
      `Transaction alerts ${settings.transactionAlerts ? 'enabled' : 'disabled'}`
    );
  }

  private async adjustRiskLevel(
    chatId: number,
    userId: number,
    bot: TelegramBot
  ): Promise<void> {
    const message = `
⚠️ Risk Threshold Settings

Choose your risk tolerance level:

• Low (20%) - Block most suspicious transactions
• Medium (50%) - Balanced security
• High (80%) - Only block obvious threats
• Custom - Set your own threshold
    `;

    const keyboard = {
      inline_keyboard: [
        [
          { text: 'Low (20%)', callback_data: 'risk_low' },
          { text: 'Medium (50%)', callback_data: 'risk_medium' }
        ],
        [
          { text: 'High (80%)', callback_data: 'risk_high' },
          { text: 'Custom', callback_data: 'risk_custom' }
        ]
      ]
    };

    await bot.sendMessage(chatId, message, { reply_markup: keyboard });
  }

  private async manageWhitelist(
    chatId: number,
    userId: number,
    bot: TelegramBot
  ): Promise<void> {
    const settings = this.getSettings(userId);

    let message = '📋 Whitelisted Addresses\n\n';

    if (settings.whitelistedAddresses.length === 0) {
      message += 'No addresses whitelisted yet.\n\n';
    } else {
      settings.whitelistedAddresses.forEach((addr, index) => {
        message += `${index + 1}. \`${addr.slice(0, 8)}...${addr.slice(-8)}\`\n`;
      });
      message += '\n';
    }

    message += 'Whitelisted addresses bypass security checks.';

    const keyboard = {
      inline_keyboard: [
        [
          { text: '➕ Add Address', callback_data: 'whitelist_add' },
          { text: '➖ Remove Address', callback_data: 'whitelist_remove' }
        ]
      ]
    };

    await bot.sendMessage(chatId, message, {
      parse_mode: 'Markdown',
      reply_markup: keyboard
    });
  }

  private async resetSettings(
    chatId: number,
    userId: number,
    bot: TelegramBot
  ): Promise<void> {
    const message = '⚠️ Are you sure you want to reset all security settings to default?';

    const keyboard = {
      inline_keyboard: [
        [
          { text: '✅ Yes, Reset', callback_data: 'security_reset_confirm' },
          { text: '❌ Cancel', callback_data: 'security_cancel' }
        ]
      ]
    };

    await bot.sendMessage(chatId, message, { reply_markup: keyboard });
  }

  private async clearAlerts(
    chatId: number,
    userId: number,
    bot: TelegramBot
  ): Promise<void> {
    await bot.sendMessage(chatId, '✅ All alerts cleared');
  }

  private async showSecurityGuide(chatId: number, bot: TelegramBot): Promise<void> {
    const guide = `
🛡️ Security Best Practices

1. Never Share Your Seed Phrase
   • Store it offline in a secure location
   • Never enter it on websites
   • Don't share it with anyone

2. Enable 2FA
   • Adds extra protection
   • Required for large transactions

3. Verify Addresses
   • Always double-check recipient addresses
   • Use the whitelist for frequent recipients

4. Monitor Transactions
   • Enable transaction alerts
   • Review your history regularly

5. Keep Software Updated
   • Update Chain Guard regularly
   • Keep your device secure

6. Be Cautious of Phishing
   • Verify URLs before connecting
   • Don't click suspicious links
   • Report suspicious activity

Need help? Contact @chainguard_support
    `;

    await bot.sendMessage(chatId, guide);
  }

  private getSettings(userId: number): SecuritySettings {
    if (!this.settings.has(userId)) {
      this.settings.set(userId, {
        autoLock: true,
        autoLockMinutes: 5,
        twoFactorEnabled: false,
        transactionAlerts: true,
        riskThreshold: 0.5,
        whitelistedAddresses: []
      });
    }

    return this.settings.get(userId)!;
  }

  private calculateSecurityScore(settings: SecuritySettings): number {
    let score = 0;

    if (settings.autoLock) score += 20;
    if (settings.twoFactorEnabled) score += 30;
    if (settings.transactionAlerts) score += 20;
    if (settings.riskThreshold <= 0.5) score += 20;
    if (settings.whitelistedAddresses.length > 0) score += 10;

    return score;
  }

  private getRecentAlerts(userId: number): any[] {
    // Mock alerts
    return [
      {
        emoji: '🔴',
        title: 'High Risk Transaction Blocked',
        description: 'Attempted transaction to suspicious address',
        timestamp: Date.now() - 3600000
      },
      {
        emoji: '🟡',
        title: 'Unusual Activity Detected',
        description: 'Multiple failed login attempts',
        timestamp: Date.now() - 7200000
      }
    ];
  }
}
