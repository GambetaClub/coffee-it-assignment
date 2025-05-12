import { Injectable } from '@nestjs/common';
import { Counter, Registry } from 'prom-client';

@Injectable()
export class MetricsService {
  private readonly registry: Registry;

  public readonly cacheInteractions: Counter<string>;

  constructor() {
    this.registry = new Registry();

    this.cacheInteractions = new Counter({
      name: 'app_cache_interactions_total',
      help: 'Total number of cache hits and misses',
      labelNames: ['cache_name', 'status'],
      registers: [this.registry],
    });

  }

  getMetrics(): Promise<string> {
    return this.registry.metrics();
  }

  getRegistry(): Registry {
    return this.registry;
  }
} 