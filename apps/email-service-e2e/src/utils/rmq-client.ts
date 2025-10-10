import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';

export function createRmqClient(rmqUrl: string, queue: string): ClientProxy {
  return ClientProxyFactory.create({
    transport: Transport.RMQ,
    options: {
      urls: [rmqUrl],
      queue,
      queueOptions: {
        durable: true,
      },
      prefetchCount: 1,
    },
  });
}
