import { inngest } from "./client";
import { openai, createAgent, createTool, createNetwork } from "@inngest/agent-kit";
import { Sandbox } from "@e2b/code-interpreter";
import { getSandbox } from "./utils";
import { PROMPT } from "@/prompt";
import { lastAssistantTextMessageContent } from "./utils";
import { z } from "zod";
import "dotenv/config";

// ✅ DeepSeek V3 0324 (free) from OpenRouter
const deepseekModel = openai({
  apiKey: process.env.OPENROUTER_API_KEY, // put your OpenRouter key in .env
  baseUrl: "https://openrouter.ai/api/v1",
  defaultParameters: {
    model: "qwen/qwen3-coder:free", // DeepSeek V3 0324 free
    temperature: 0
  }
});

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    // Create sandbox
    const sandboxId = await step.run("get-sandbox-id", async () => {
      const sandbox = await Sandbox.create("vibe-nextjs-codeai-100");
      return sandbox.sandboxId;
    });

    // Create CodeAgent
    const CodeAgent = createAgent({
      name: "CodeAgent",
      system: PROMPT,
      description: "An agent that can write code and run it in a sandbox",
      model: deepseekModel, // ✅ now using DeepSeek V3
      tools: [
        createTool({
          name: "terminal",
          description: "Use the terminal to run commands",
          parameters: z.object({
            command: z.string(),
          }),
          handler: async ({ command }, context) => {
            return await context.step?.run("terminal", async () => {
              const buffers = { stdout: "", stderr: "" };
              try {
                const sandbox = await getSandbox(sandboxId);
                const result = await sandbox.commands.run(command, {
                  onStdout: (data: string) => {
                    buffers.stdout += data;
                  },
                  onStderr: (data: string) => {
                    buffers.stderr += data;
                  },
                });
                return result.stdout;
              } catch (e) {
                return (
                  "Command failed " +
                  e +
                  "\nstdout :" +
                  buffers.stdout +
                  "stderror: " +
                  buffers.stderr
                );
              }
            });
          },
        }),

        createTool({
          name: "createOrUpdateFiles",
          description: "Create or update files in the sandbox",
          parameters: z.object({
            files: z.array(
              z.object({
                path: z.string(),
                content: z.string(),
              })
            ),
          }),
          handler: async ({ files }, context) => {
            const newFiles = await context.step?.run("createOrUpdateFiles", async () => {
              try {
                const updatedFiles = context.network?.state?.data?.files || {};
                const sandbox = await getSandbox(sandboxId);
                for (const file of files) {
                  await sandbox.files.write(file.path, file.content);
                  updatedFiles[file.path] = file.content;
                }
                return updatedFiles;
              } catch (e) {
                return "Error: " + e;
              }
            });

            if (typeof newFiles === "object" && context.network) {
              context.network.state.data.files = newFiles;
            }
          },
        }),

        createTool({
          name: "readFiles",
          description: "Read files from the sandbox",
          parameters: z.object({
            files: z.array(z.string()),
          }),
          handler: async ({ files }, context) => {
            return await context.step?.run("readFiles", async () => {
              try {
                const sandbox = await getSandbox(sandboxId);
                const contents = [];
                for (const file of files) {
                  const content = await sandbox.files.read(file);
                  contents.push({ path: file, content });
                }
                return JSON.stringify(contents);
              } catch (e) {
                return "Error: " + e;
              }
            });
          },
        }),
      ],
      lifecycle: { 
        onResponse: async ({ result, network }) => { 
          const lastAssistantTextMessageText = lastAssistantTextMessageContent(result); 
          if (lastAssistantTextMessageText && network) { 
            if (lastAssistantTextMessageText.includes("<task_summary>")) { 
              network.state.data.summary = lastAssistantTextMessageText;
            }
          }
          return result; 
        },
      }
    });

    const network = createNetwork({
      name: "coding-agent-network", 
      agents: [CodeAgent], 
      maxIter: 15, 
      router: async ({ network }) => { 
        const summary = network.state.data.summary; 
        if (summary) return;
        return CodeAgent; 
      }
    });

    const result = await network.run(event.data.value); 

    // Get sandbox URL
    const sandboxUrl = await step.run("get-sandbox-url", async () => {
      const sandbox = await getSandbox(sandboxId);
      const host = await sandbox.getHost(3000);
      return "https://" + host; 
    });

    return { 
      sandboxUrl, 
      title: "Fragment", 
      files: result.state.data.files, 
      summary: result.state.data.summary, 
    };
  }
);
