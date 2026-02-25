import { Connection, ConnectionConfig, Commitment } from '@solana/web3.js';

export interface RPCEndpoint {
  url: string;
  weight: number;
  latency: number;
  healthy: boolean;
}

export interface RPCClientConfig {
  endpoints: string[];
  commitment?: Commitment;
  maxRetries?: number;
  timeout?: number;
}

export class RPCClient {
  private connections: Map<string, Connection> = new Map();
  private endpoints: RPCEndpoint[] = [];
  private currentEndpointIndex: number = 0;
  private maxRetries: number;
  private timeout: number;
  private commitment: Commitment;
  private healthCheckInterval: NodeJS.Timeout | null = null;

  constructor(config: RPCClientConfig) {
    this.maxRetries = config.maxRetries || 3;
    this.timeout = config.timeout || 30000;
    this.commitment = config.commitment || 'confirmed';

    config.endpoints.forEach((url, index) => {
      this.endpoints.push({
        url,
        weight: 1.0,
        latency: 0,
        healthy: true
      });

      const connectionConfig: ConnectionConfig = {
        commitment: this.commitment,
        confirmTransactionInitialTimeout: this.timeout
      };

      this.connections.set(url, new Connection(url, connectionConfig));
    });

    this.startHealthCheck();
  }

  getConnection(): Connection {
    const endpoint = this.selectEndpoint();
    const connection = this.connections.get(endpoint.url);
    
    if (!connection) {
      throw new Error('No healthy RPC endpoints available');
    }

    return connection;
  }

  private selectEndpoint(): RPCEndpoint {
    // Weighted round-robin selection
    const healthyEndpoints = this.endpoints.filter(e => e.healthy);
    
    if (healthyEndpoints.length === 0) {
      // Fallback to any endpoint if all are unhealthy
      return this.endpoints[0];
    }

    // Sort by latency and weight
    healthyEndpoints.sort((a, b) => {
      const scoreA = a.latency / a.weight;
      const scoreB = b.latency / b.weight;
      return scoreA - scoreB;
    });

    this.currentEndpointIndex = (this.currentEndpointIndex + 1) % healthyEndpoints.length;
    return healthyEndpoints[this.currentEndpointIndex];
  }

  private startHealthCheck(): void {
    this.healthCheckInterval = setInterval(async () => {
      await this.checkEndpointHealth();
    }, 30000); // Check every 30 seconds
  }

  private async checkEndpointHealth(): Promise<void> {
    const healthChecks = this.endpoints.map(async (endpoint) => {
      const connection = this.connections.get(endpoint.url);
      if (!connection) return;

      try {
        const startTime = Date.now();
        await connection.getSlot();
        const latency = Date.now() - startTime;

        endpoint.latency = latency;
        endpoint.healthy = true;
        
        // Adjust weight based on performance
        if (latency < 100) {
          endpoint.weight = 1.5;
        } else if (latency < 300) {
          endpoint.weight = 1.0;
        } else {
          endpoint.weight = 0.5;
        }
      } catch (error) {
        endpoint.healthy = false;
        endpoint.weight = 0.1;
      }
    });

    await Promise.all(healthChecks);
  }

  async executeWithRetry<T>(
    operation: (connection: Connection) => Promise<T>
  ): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const connection = this.getConnection();
        return await operation(connection);
      } catch (error) {
        lastError = error as Error;
        
        // Mark current endpoint as potentially unhealthy
        const currentEndpoint = this.endpoints[this.currentEndpointIndex];
        if (currentEndpoint) {
          currentEndpoint.weight *= 0.8;
        }

        // Wait before retry with exponential backoff
        if (attempt < this.maxRetries - 1) {
          await this.sleep(Math.pow(2, attempt) * 1000);
        }
      }
    }

    throw lastError || new Error('Operation failed after retries');
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getEndpointStats(): RPCEndpoint[] {
    return this.endpoints.map(e => ({ ...e }));
  }

  async addEndpoint(url: string): Promise<void> {
    if (this.connections.has(url)) {
      return;
    }

    const connectionConfig: ConnectionConfig = {
      commitment: this.commitment,
      confirmTransactionInitialTimeout: this.timeout
    };

    this.connections.set(url, new Connection(url, connectionConfig));
    this.endpoints.push({
      url,
      weight: 1.0,
      latency: 0,
      healthy: true
    });
  }

  removeEndpoint(url: string): void {
    this.connections.delete(url);
    this.endpoints = this.endpoints.filter(e => e.url !== url);
  }

  destroy(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    this.connections.clear();
  }
}
