/**
 * Performance monitoring utilities
 * Provides metrics collection and performance tracking
 */

interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

interface PerformanceStats {
  count: number;
  total: number;
  average: number;
  min: number;
  max: number;
}

/**
 * Performance monitor for tracking operation metrics
 */
export class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric[]> = new Map();
  private timers: Map<string, number> = new Map();

  /**
   * Start timing an operation
   * @param name - Operation name
   */
  start(name: string): void {
    this.timers.set(name, performance.now());
  }

  /**
   * End timing and record metric
   * @param name - Operation name
   * @param metadata - Additional metadata
   */
  end(name: string, metadata?: Record<string, unknown>): number {
    const startTime = this.timers.get(name);
    if (!startTime) {
      throw new Error(`Timer not started for: ${name}`);
    }

    const duration = performance.now() - startTime;
    this.timers.delete(name);

    const metric: PerformanceMetric = {
      name,
      duration,
      timestamp: Date.now(),
      metadata,
    };

    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(metric);

    return duration;
  }

  /**
   * Get statistics for an operation
   * @param name - Operation name
   */
  getStats(name: string): PerformanceStats | null {
    const metrics = this.metrics.get(name);
    if (!metrics || metrics.length === 0) {
      return null;
    }

    const durations = metrics.map((m) => m.duration);
    return {
      count: durations.length,
      total: durations.reduce((sum, d) => sum + d, 0),
      average: durations.reduce((sum, d) => sum + d, 0) / durations.length,
      min: Math.min(...durations),
      max: Math.max(...durations),
    };
  }

  /**
   * Get all metrics for an operation
   * @param name - Operation name
   */
  getMetrics(name: string): PerformanceMetric[] {
    return this.metrics.get(name) || [];
  }

  /**
   * Clear metrics for an operation
   * @param name - Operation name
   */
  clear(name?: string): void {
    if (name) {
      this.metrics.delete(name);
    } else {
      this.metrics.clear();
    }
  }

  /**
   * Get all operation names
   */
  getOperations(): string[] {
    return Array.from(this.metrics.keys());
  }

  /**
   * Export all metrics
   */
  export(): Record<string, PerformanceStats | null> {
    const result: Record<string, PerformanceStats | null> = {};
    for (const name of this.getOperations()) {
      result[name] = this.getStats(name);
    }
    return result;
  }
}

/**
 * Decorator for measuring function execution time
 */
export function measure(target: unknown, propertyKey: string, descriptor: PropertyDescriptor): PropertyDescriptor {
  const originalMethod = descriptor.value;

  descriptor.value = async function (...args: unknown[]) {
    const monitor = new PerformanceMonitor();
    const operationName = `${target.constructor.name}.${propertyKey}`;
    
    monitor.start(operationName);
    try {
      const result = await originalMethod.apply(this, args);
      const duration = monitor.end(operationName);
      console.log(`[Performance] ${operationName}: ${duration.toFixed(2)}ms`);
      return result;
    } catch (error) {
      monitor.end(operationName);
      throw error;
    }
  };

  return descriptor;
}

/**
 * Global performance monitor instance
 */
export const globalMonitor = new PerformanceMonitor();
