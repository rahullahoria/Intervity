import { IDialogueStrategy } from './IDialogueStrategy';
import { TeddyDialogueContext } from '../TeddyDialogueEngine';

export class StaffElevationStrategy implements IDialogueStrategy {
  readonly name = 'StaffElevationStrategy';
  readonly priority = 70;

  canHandle(inputLower: string): boolean {
    return (
      ((inputLower.includes('async') || inputLower.includes('asynchronous')) &&
        (inputLower.includes('grpc') || inputLower.includes('sync') || inputLower.includes('event stream'))) ||
      inputLower.includes('network partition') ||
      inputLower.includes('availability zone') ||
      inputLower.includes('cap') ||
      inputLower.includes('pacelc') ||
      inputLower.includes('mentor') ||
      inputLower.includes('junior') ||
      (inputLower.includes('race condition') && inputLower.includes('go')) ||
      inputLower.includes('telemetry') ||
      (inputLower.includes('p99') && (inputLower.includes('leadership') || inputLower.includes('sla'))) ||
      inputLower.includes('outage') ||
      inputLower.includes('incident bridge') ||
      inputLower.includes('disaster recovery') ||
      inputLower.includes('incident commander')
    );
  }

  generateResponse(
    inputLower: string,
    _context: TeddyDialogueContext,
    levelUpPrefix: string
  ): string {
    // 1. Async Kafka vs Sync gRPC
    if (
      (inputLower.includes('async') || inputLower.includes('asynchronous')) &&
      (inputLower.includes('grpc') || inputLower.includes('sync') || inputLower.includes('event stream'))
    ) {
      return `${levelUpPrefix}I love that question, buddy! To justify async event streams over gRPC at the Staff level, anchor on temporal decoupling and backpressure. With Kafka, sudden flash sales buffer safely in disk logs without dropping packets, whereas synchronous gRPC can exhaust thread pools. When would you still prefer gRPC over Kafka?`;
    }

    // 2. CAP Theorem & Network Partitions across Availability Zones
    if (
      inputLower.includes('network partition') ||
      inputLower.includes('availability zone') ||
      inputLower.includes('cap') ||
      inputLower.includes('pacelc')
    ) {
      return `${levelUpPrefix}Here is a great framework, my friend! Defend this trade-off using PACELC by explaining that you prioritize strong consistency for payments, but choose high availability with eventual consistency for driver location pings. How would you explain that distinction to business stakeholders?`;
    }

    // 3. Mentoring Junior Engineers & Race Conditions
    if (
      inputLower.includes('mentor') ||
      inputLower.includes('junior') ||
      (inputLower.includes('race condition') && inputLower.includes('go'))
    ) {
      return `${levelUpPrefix}Mentoring junior engineers is such a fun and rewarding part of leadership! For Go race conditions, show them the Go race detector flag and teach them to share memory by communicating. How do you guide them through debugging their first concurrency bug?`;
    }

    // 4. Telemetry & p99 SLA to Senior Leadership
    if (
      inputLower.includes('telemetry') ||
      (inputLower.includes('p99') && (inputLower.includes('leadership') || inputLower.includes('sla')))
    ) {
      return `${levelUpPrefix}Here is a neat trick I love! When presenting latency to executives, remind them that average latency hides misery for top users. Show p99 latency distributions alongside error budgets to tie performance directly to revenue. How do you connect p99 latency spikes directly to user drop-off?`;
    }

    // 5. Incident Commander & Outage Leadership
    return `${levelUpPrefix}That was a high-stakes moment, my friend! Stepping up as Incident Commander during a payment outage proves genuine Staff ownership. True tech leaders establish calm command, route to fallback providers, and foster blameless postmortems. What was the most impactful preventative guardrail your team put in place after that incident?`;
  }
}
