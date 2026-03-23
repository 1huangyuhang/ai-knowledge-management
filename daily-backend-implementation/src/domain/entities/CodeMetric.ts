export interface MetricThreshold {
  min?: number;
  max?: number;
  optimal: number;
  unit: string;
}

export class CodeMetric {
  constructor(
    private readonly name: string,
    private readonly value: number | string,
    private readonly unit: string,
    private readonly description: string,
    private readonly threshold: MetricThreshold
  ) {}

  public getName(): string {
    return this.name;
  }

  public getValue(): number | string {
    return this.value;
  }

  public getUnit(): string {
    return this.unit;
  }

  public getDescription(): string {
    return this.description;
  }

  public getThreshold(): MetricThreshold {
    return { ...this.threshold };
  }

  public isWithinThreshold(): boolean {
    if (typeof this.value !== 'number') {
      return true; // Only check numeric values
    }

    const { min, max } = this.threshold;
    if (min !== undefined && this.value < min) {
      return false;
    }
    if (max !== undefined && this.value > max) {
      return false;
    }
    return true;
  }
}
