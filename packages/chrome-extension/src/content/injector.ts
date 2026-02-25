// Content script injector for Chain Guard
// Intercepts wallet provider requests and adds security layer

interface ProviderRequest {
  method: string;
  params?: any[];
  id: number;
}

interface ProviderResponse {
  id: number;
  result?: any;
  error?: any;
}

class ChainGuardInjector {
  private originalProvider: any = null;
  private requestQueue: Map<number, any> = new Map();
  private requestId: number = 0;

  constructor() {
    this.injectProvider();
    this.setupMessageListener();
  }

  private injectProvider(): void {
    // Save original provider if exists
    if ((window as any).solana) {
      this.originalProvider = (window as any).solana;
    }

    // Create proxy provider
    const proxyProvider = new Proxy(this.createProvider(), {
      get: (target, prop) => {
        if (prop === 'isChainGuard') return true;
        if (typeof target[prop] === 'function') {
          return target[prop].bind(target);
        }
        return target[prop];
      }
    });

    // Inject into window
    Object.defineProperty(window, 'solana', {
      value: proxyProvider,
      writable: false,
      configurable: false
    });

    // Dispatch event to notify dApp
    window.dispatchEvent(new Event('solana#initialized'));
  }

  private createProvider(): any {
    return {
      isPhantom: true,
      isChainGuard: true,
      publicKey: null,
      isConnected: false,

      connect: async (options?: any) => {
        return this.handleRequest('connect', [options]);
      },

      disconnect: async () => {
        return this.handleRequest('disconnect', []);
      },

      signTransaction: async (transaction: any) => {
        return this.handleRequest('signTransaction', [transaction]);
      },

      signAllTransactions: async (transactions: any[]) => {
        return this.handleRequest('signAllTransactions', [transactions]);
      },

      signMessage: async (message: Uint8Array, display?: string) => {
        return this.handleRequest('signMessage', [message, display]);
      },

      signAndSendTransaction: async (transaction: any, options?: any) => {
        return this.handleRequest('signAndSendTransaction', [transaction, options]);
      },

      request: async (args: ProviderRequest) => {
        return this.handleRequest('request', [args]);
      },

      on: (event: string, callback: Function) => {
        window.addEventListener(`chainGuard:${event}`, (e: any) => {
          callback(e.detail);
        });
      },

      off: (event: string, callback: Function) => {
        window.removeEventListener(`chainGuard:${event}`, callback as any);
      }
    };
  }

  private async handleRequest(method: string, params: any[]): Promise<any> {
    const requestId = this.requestId++;

    return new Promise((resolve, reject) => {
      this.requestQueue.set(requestId, { resolve, reject });

      // Send to background script for processing
      window.postMessage({
        type: 'CHAIN_GUARD_REQUEST',
        data: {
          id: requestId,
          method,
          params,
          origin: window.location.origin
        }
      }, '*');

      // Timeout after 60 seconds
      setTimeout(() => {
        if (this.requestQueue.has(requestId)) {
          this.requestQueue.delete(requestId);
          reject(new Error('Request timeout'));
        }
      }, 60000);
    });
  }

  private setupMessageListener(): void {
    window.addEventListener('message', (event) => {
      if (event.source !== window) return;

      const message = event.data;

      if (message.type === 'CHAIN_GUARD_RESPONSE') {
        const { id, result, error } = message.data;
        const pending = this.requestQueue.get(id);

        if (pending) {
          this.requestQueue.delete(id);
          
          if (error) {
            pending.reject(new Error(error));
          } else {
            pending.resolve(result);
          }
        }
      }

      if (message.type === 'CHAIN_GUARD_EVENT') {
        const { event: eventName, data } = message.data;
        window.dispatchEvent(new CustomEvent(`chainGuard:${eventName}`, {
          detail: data
        }));
      }
    });
  }

  private emitEvent(event: string, data: any): void {
    window.dispatchEvent(new CustomEvent(`chainGuard:${event}`, {
      detail: data
    }));
  }
}

// Initialize injector
const injector = new ChainGuardInjector();

// Inject security indicator
const createSecurityIndicator = () => {
  const indicator = document.createElement('div');
  indicator.id = 'chain-guard-indicator';
  indicator.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 8px 16px;
    border-radius: 20px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 12px;
    font-weight: 600;
    z-index: 999999;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    cursor: pointer;
    transition: all 0.3s ease;
  `;
  indicator.textContent = '🛡️ Chain Guard Active';
  
  indicator.addEventListener('mouseenter', () => {
    indicator.style.transform = 'scale(1.05)';
  });
  
  indicator.addEventListener('mouseleave', () => {
    indicator.style.transform = 'scale(1)';
  });

  indicator.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'OPEN_POPUP' });
  });

  document.body.appendChild(indicator);

  // Auto-hide after 5 seconds
  setTimeout(() => {
    indicator.style.opacity = '0.3';
    indicator.style.transform = 'scale(0.9)';
  }, 5000);

  indicator.addEventListener('mouseenter', () => {
    indicator.style.opacity = '1';
    indicator.style.transform = 'scale(1.05)';
  });
};

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', createSecurityIndicator);
} else {
  createSecurityIndicator();
}

// Monitor for suspicious activity
const monitorPageActivity = () => {
  // Monitor clipboard access
  document.addEventListener('copy', (e) => {
    const selection = window.getSelection()?.toString();
    if (selection && selection.length > 30) {
      chrome.runtime.sendMessage({
        type: 'CLIPBOARD_ACTIVITY',
        data: { length: selection.length, origin: window.location.origin }
      });
    }
  });

  // Monitor form submissions
  document.addEventListener('submit', (e) => {
    const form = e.target as HTMLFormElement;
    const inputs = form.querySelectorAll('input[type="password"], input[type="text"]');
    
    if (inputs.length > 0) {
      chrome.runtime.sendMessage({
        type: 'FORM_SUBMISSION',
        data: { origin: window.location.origin, inputCount: inputs.length }
      });
    }
  });

  // Monitor for phishing indicators
  const checkForPhishing = () => {
    const suspiciousKeywords = ['seed phrase', 'private key', 'recovery phrase', 'mnemonic'];
    const pageText = document.body.innerText.toLowerCase();
    
    for (const keyword of suspiciousKeywords) {
      if (pageText.includes(keyword)) {
        chrome.runtime.sendMessage({
          type: 'PHISHING_INDICATOR',
          data: { keyword, origin: window.location.origin }
        });
        break;
      }
    }
  };

  setTimeout(checkForPhishing, 2000);
};

monitorPageActivity();

console.log('[Chain Guard] Security layer initialized');

export default ChainGuardInjector;
