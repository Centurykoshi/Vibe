import { inngest } from "./client";
import {openai, gemini, createAgent } from "@inngest/agent-kit";
import { Sandbox } from '@e2b/code-interpreter'
import { getSandbox } from "./utils";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {

    const sandboxId = await step.run("get-sandbox-id", async()=>{ 
      const sandbox = await Sandbox.create("vibe-nextjs-codeai-100"); 
      return sandbox.sandboxId; 
    })
    const CodeAgent = createAgent({
  name: "CodeAgent",
  system: "You are an expert next.js developer, you write readble, maintable code. you write simple next.js & react snippets",
  model: gemini({ model: "gemini-1.5-flash"}),
});

const { output } = await CodeAgent.run(
  'Write the following snippit:' + event.data.value,
);

const sandboxUrl = await step.run("get-sandbox-url",async ()=>{ 
  const sandbox = await getSandbox(sandboxId); 
  const host =  sandbox.getHost(3000); 
  return "https://"+host; 
})
console.log(output);
    return { output, sandboxUrl};
  },
);
