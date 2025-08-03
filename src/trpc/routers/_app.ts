
import { messagesRouter } from '../../modules/messages/servers/procedures';
import { createTRPCRouter } from '../init';
import { inngest } from '@/inngest/client';
export const appRouter = createTRPCRouter({
  messages : messagesRouter,

});
// export type definition of API
export type AppRouter = typeof appRouter;
  