
import { messagesRouter } from '../../modules/messages/servers/procedures';
import { projectRouter } from '../../modules/projects/servers/procedures';
import { createTRPCRouter } from '../init';

export const appRouter = createTRPCRouter({
  messages : messagesRouter,
  projects : projectRouter,

});
// export type definition of API
export type AppRouter = typeof appRouter;
  