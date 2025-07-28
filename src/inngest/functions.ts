import { inngest } from "./client";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    //anaylzing stuff 
    await step.sleep("wait-a-moment", "30s");
//thinking step
     await step.sleep("wait-a-moment", "10s");
//summary staghe
      await step.sleep("wait-a-moment", "5s");
    return { message: `Hello ${event.data.name}!` };
  },
);