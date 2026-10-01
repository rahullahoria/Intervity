import { IDialogueStrategy } from './IDialogueStrategy';
import { TeddyDialogueContext } from '../TeddyDialogueEngine';

export class HighScaleValidationStrategy implements IDialogueStrategy {
  readonly name = 'HighScaleValidationStrategy';
  readonly priority = 60;

  canHandle(inputLower: string): boolean {
    return (
      inputLower.includes('sentinel') ||
      (inputLower.includes('redis') &&
        (inputLower.includes('crash') || inputLower.includes('failover') || inputLower.includes('mutation'))) ||
      inputLower.includes('redis') ||
      (inputLower.includes('cache') && !inputLower.includes('stampede')) ||
      inputLower.includes('sharding') ||
      inputLower.includes('partitioned by') ||
      (inputLower.includes('postgres') && inputLower.includes('shard')) ||
      inputLower.includes('consumer lag') ||
      inputLower.includes('rebalancing') ||
      (inputLower.includes('kafka') && inputLower.includes('consumer')) ||
      (inputLower.includes('kafka') &&
        (inputLower.includes('event stream') || inputLower.includes('decouple') || inputLower.includes('order'))) ||
      inputLower.includes('50,000') ||
      inputLower.includes('50000') ||
      (inputLower.includes('order dispatch') && inputLower.includes('throughput')) ||
      ((inputLower.includes('swiggy') || inputLower.includes('bengaluru')) &&
        (inputLower.includes('staff') || inputLower.includes('architect')))
    );
  }

  generateResponse(
    inputLower: string,
    context: TeddyDialogueContext,
    levelUpPrefix: string
  ): string {
    const targetRole = context.targetRole || 'Staff Software Architect';

    // 1. Redis Failover, Sentinel & Fallback to PostgreSQL
    if (
      inputLower.includes('sentinel') ||
      (inputLower.includes('redis') &&
        (inputLower.includes('crash') || inputLower.includes('failover') || inputLower.includes('mutation')))
    ) {
      if (context.currentPhase === 'IMPROVEMENT') {
        return `${levelUpPrefix}Stepping into ${targetRole} requires defending systemic trade-offs under scale! When failing over with Sentinel and falling back to PostgreSQL, how did you handle data consistency and telemetry when traffic spiked unexpectedly?`;
      }
      return `${levelUpPrefix}Falling back to PostgreSQL with row-level locks ensures rock-solid data integrity during Sentinel failover! However, a stampede of fallbacks can overwhelm the database. How do you protect PostgreSQL connection pools from exhausting when Redis is recovering?`;
    }

    // 2. Distributed Redis Caching & Cluster Sharding
    if (inputLower.includes('redis') || (inputLower.includes('cache') && !inputLower.includes('stampede'))) {
      return `${levelUpPrefix}A distributed Redis cluster is awesome for low-latency active caching and sub-millisecond lookups! But in-memory caches have sharp edges. What happens in your system if the Redis primary crashes or fails over right before replication finishes, risking stale route reads?`;
    }

    // 3. Database Sharding & PostgreSQL Partitioning
    if (
      inputLower.includes('sharding') ||
      inputLower.includes('partitioned by') ||
      (inputLower.includes('postgres') && inputLower.includes('shard'))
    ) {
      return `${levelUpPrefix}Oh, I love that approach! Sharding PostgreSQL by city ID is brilliant for spatial isolation and eliminating hotspots. But mega-cities like Bengaluru generate vastly more orders than smaller towns. How do you handle hot partition skew when a city grows ten times faster than others?`;
    }

    // 4. Kafka Consumer Lag & Partition Key Rebalancing
    if (
      inputLower.includes('consumer lag') ||
      inputLower.includes('rebalancing') ||
      (inputLower.includes('kafka') && inputLower.includes('consumer'))
    ) {
      return `${levelUpPrefix}Scaling consumer pods and rebalancing partition keys is textbook distributed design, my friend! But partition rebalancing can cause brief stop-the-world pauses. How do you tune your rebalance protocol or buffer incoming events so deliveries stay uninterrupted?`;
    }

    // 5. Kafka Event Streams Decoupling
    if (
      inputLower.includes('kafka') &&
      (inputLower.includes('event stream') || inputLower.includes('decouple') || inputLower.includes('order'))
    ) {
      return `${levelUpPrefix}Kafka is a powerhouse for decoupling asynchronous workloads, and I love that architecture! But during lunch rush surges, consumer lag can quickly balloon. What is your strategy to keep consumer lag under control and prevent cascading delays across the fleet?`;
    }

    // 6. High-Throughput Order Dispatch (50k orders/min)
    if (
      inputLower.includes('50,000') ||
      inputLower.includes('50000') ||
      (inputLower.includes('order dispatch') && inputLower.includes('throughput'))
    ) {
      return `${levelUpPrefix}Fifty thousand orders per minute is extraordinary scale, buddy! That kind of throughput leaves zero room for synchronous bottlenecks. When designing that dispatch service, how did you decouple order ingestion from delivery partner assignment?`;
    }

    // 7. Swiggy Bengaluru & Staff Architect Ambition
    return `${levelUpPrefix}Swiggy in Bengaluru is premier engineering scale! Stepping up to Staff Software Architect is a massive milestone, and I know we can get you there together. At the Staff level, you have to defend massive distributed trade-offs. What is one core project you have led recently that showcases that architectural muscle?`;
  }
}
