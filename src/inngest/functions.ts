import { inngest } from "./client";
import {openai, gemini, createAgent } from "@inngest/agent-kit";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    const CodeAgent = createAgent({
  name: "CodeAgent",
  system: "You are an expert next.js developer, you write readble, maintable code. you write simple next.js & react snippets",
  model: gemini({ model: "gemini-1.5-flash"}),
});

const { output } = await CodeAgent.run(
  'Write the following snippit:' + event.data.value,
);
console.log(output);
    return { output};
  },
);
