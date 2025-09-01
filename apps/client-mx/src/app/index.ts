import 'reflect-metadata';
import { bootstrap } from './bootstrap';

bootstrap().catch((error) => {
  console.debug('STARTUP EXCEPTION!!');
  console.debug(error);

  throw error;
});
