import { lastValueFrom } from 'rxjs';
import { QUEUES, USER_REGISTRATION_EVENTS } from '@demo-t3/models';
import * as amqp from 'amqplib';

import { createRmqClient } from '../utils/rmq-client';

const { NX_PUBLIC_RABBITMQ_URL } = process.env;

describe('Email Service RMQ integration', () => {
  const rmqUrl = NX_PUBLIC_RABBITMQ_URL;

  it('should publish USER_REGISTRATION_EVENTS.INITIATED to an isolated queue', async () => {
    const targetQueue = `${QUEUES.EMAIL_SERVICE}.e2e.${Date.now()}`;
    const client = createRmqClient(rmqUrl, targetQueue);
    await client.connect();

    // Connect directly to RabbitMQ to check queue state
    const connection = await amqp.connect(rmqUrl);
    const channel = await connection.createChannel();
    await channel.assertQueue(targetQueue, { durable: true });

    // Get initial queue state
    const queueStateBefore = await channel.checkQueue(targetQueue);
    const initialMessageCount = queueStateBefore.messageCount;

    const payload = {
      userId: `u_${Date.now()}`,
      email: 'test.user@example.com',
      name: 'Test User',
    };

    // Publish the event
    await lastValueFrom(
      client.emit(USER_REGISTRATION_EVENTS.INITIATED, payload)
    );

    // Wait briefly, then check if message is in queue
    await new Promise((r) => setTimeout(r, 200));

    const queueStateAfterPublish = await channel.checkQueue(targetQueue);
    const messageCountAfterPublish = queueStateAfterPublish.messageCount;

    // In isolated mode, no consumer should pick up the message; it must remain in the queue
    expect(messageCountAfterPublish).toBe(initialMessageCount + 1);

    // Wait for a bit to mimic processing window; message should still be present
    await new Promise((r) => setTimeout(r, 3000));

    // Check final state: still present in the isolated queue
    const queueStateAfterConsume = await channel.checkQueue(targetQueue);
    expect(queueStateAfterConsume.messageCount).toBe(initialMessageCount + 1);

    // Cleanup: purge the temporary queue so we don't leak messages
    await channel.purgeQueue(targetQueue);
    const queueStateAfterPurge = await channel.checkQueue(targetQueue);
    expect(queueStateAfterPurge.messageCount).toBe(initialMessageCount);

    await channel.close();
    await connection.close();
    await client.close();
  }, 6000);
});

describe('Email Service RMQ real delivery', () => {
  const rmqUrl = NX_PUBLIC_RABBITMQ_URL;

  it('should publish to the real queue and be consumed', async () => {
    const client = createRmqClient(rmqUrl, QUEUES.EMAIL_SERVICE);
    await client.connect();

    const connection = await amqp.connect(rmqUrl);
    const channel = await connection.createChannel();

    const before = await channel.checkQueue(QUEUES.EMAIL_SERVICE);
    const initialMessageCount = before.messageCount;

    const payload = {
      userId: `u_${Date.now()}`,
      email: `real.test+${Date.now()}@example.com`,
      name: 'Test User',
    };

    await lastValueFrom(
      client.emit(USER_REGISTRATION_EVENTS.INITIATED, payload)
    );

    // Give broker a moment to enqueue and consumer to start
    await new Promise((r) => setTimeout(r, 300));

    const mid = await channel.checkQueue(QUEUES.EMAIL_SERVICE);

    expect(mid.messageCount).toBeGreaterThanOrEqual(initialMessageCount);
    expect(mid.messageCount).toBeLessThanOrEqual(initialMessageCount + 1);

    await new Promise((r) => setTimeout(r, 3000));

    const after = await channel.checkQueue(QUEUES.EMAIL_SERVICE);

    expect(after.messageCount).toBe(initialMessageCount);

    await channel.close();
    await connection.close();
    await client.close();
  }, 6000);
});
