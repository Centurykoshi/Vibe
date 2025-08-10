import { inngest } from "./client";
import {gemini, createAgent, createTool, createNetwork ,type Tool, type Message, createState} from "@inngest/agent-kit";
import { Sandbox } from "@e2b/code-interpreter";
import { getSandbox } from "./utils";
import { PROMPT, FRAGMENT_TITLE_PROMPT,RESPONSE_PROMPT } from "@/prompt";
// import { PROMPT } from "@/prompt2";
import { lastAssistantTextMessageContent } from "./utils";
import { z } from "zod";
import {prisma} from "@/lib/db";

import "dotenv/config";


interface AgentState { 
  summary: string;
  files: { [path: string]: string };
}

  const model = gemini({
    model: "gemini-2.5-flash",
  });




// const model = openai({
//   apiKey: process.env.OPENROUTER_API_KEY, // put your OpenRouter key in .env
//   baseUrl: "https://openrouter.ai/api/v1",
//   defaultParameters: {
//     model: "gemini-2.5-flash-lite", // DeepSeek V3 0324 free
//   }
  
// });



export const CodeAgentFunction = inngest.createFunction(



  { id: "Code-Agent" },
  { event: "Code-Agent/run" },
  async ({ event, step }) => {
    // Create sandbox
    const sandboxId = await step.run("get-sandbox-id", async () => {
      const sandbox = await Sandbox.create("vibe-nextjs-codeai-100");
      return sandbox.sandboxId;
    });

    const previousMessage = await step.run("get-previous-message", async () => {
      const formattedMessages: Message[] = [];
      const messages = await prisma.message.findMany({
        where: { projectId: event.data.projectId },
        orderBy: { createdAt: "desc" },
        skip: 1,
        take: 2,
      });

      for(const message of messages){ 
        formattedMessages.push({ 
          type : "text", 
          role : message.role ==="ASSISTANT"? "assistant" : "user", 
          content : message.content, 
        })
      }
      return formattedMessages.reverse(); 
      
    });

    const state = createState<AgentState>({
      summary: "",
      files: {},
    }, 
    { messages: previousMessage }
  );

    // Create CodeAgent
    const CodeAgent = createAgent<AgentState>({
      name: "Code-Agent",
      system: PROMPT,
      description: "An agent that can write code and run it in a sandbox",
      model: model, // ✅ now using DeepSeek V3
      tools: [
        createTool({
          name: "terminal",
          description: "Use the terminal to run commands",
          parameters: z.object({
            command: z.string(),
          }),
          handler: async ({ command }, { step }) => {
            return await step?.run("terminal", async () => {
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
          handler: async ({ files }, { step, network }: Tool.Options<AgentState>) => {
            const newFiles = await step?.run("createOrUpdateFiles", async () => {
              try {
                const updatedFiles = (network?.state.data.files as { [path: string]: string }) || {};
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

            if (typeof newFiles === "object" && network) {
              network.state.data.files = newFiles;
            }
          },
        }),

        createTool({
          name: "readFiles",
          description: "Read files from the sandbox",
          parameters: z.object({
            files: z.array(z.string()),
          }),
          handler: async ({ files }, {step}) => {
            return await step?.run("readFiles", async () => {
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

    const network = createNetwork<AgentState>({
      name: "coding-agent-network", 
      agents: [CodeAgent], 
      maxIter: 15, 
      defaultState : state, 
      router: async ({ network }) => { 
        const summary = network.state.data.summary; 
        if (summary) return;
        return CodeAgent; 
      }
    });

    const result = await network.run(event.data.value, { state });

    const FragmentTitleGenerator = createAgent({ 
      name: "Fragment-title-generator",
      system: FRAGMENT_TITLE_PROMPT,
      description: "An agent that generates titles for code fragments",
      model: model,
    }); 


    const ResponseGenerator = createAgent({ 
      name: "Response-generator",
      system: RESPONSE_PROMPT,
      description: "An agent that generates responses based on the task summary",
      model: model,
    }); 

    const {output : FragmentTitleOutput
      } = await FragmentTitleGenerator.run(result.state.data.summary);
    const {output : ResponseOutput
    } = await ResponseGenerator.run(result.state.data.summary);

    const generateFragmentTitle = ()=> { 
      if(FragmentTitleOutput[0].type !== "text") {
        return "Fragment"; 
      }
      if(Array.isArray(FragmentTitleOutput[0].content)){ 
        return FragmentTitleOutput[0].content.map((txt) => txt).join(", ");
      }

      else {
        return FragmentTitleOutput[0].content;
      }; 

  
    }; 
        const generateResponse = ()=> { 
      if(ResponseOutput[0].type !== "text") {
        return "Response"; 
      }
      if(Array.isArray(ResponseOutput[0].content)){ 
        return ResponseOutput[0].content.map((txt) => txt).join(", ");
      }

      else {
        return ResponseOutput[0].content;
      }; 

  
    }; 


    const isError = !result.state.data.summary || Object.keys(result.state.data.files || {}).length === 0;

    // Get sandbox URL
    const sandboxUrl = await step.run("get-sandbox-url", async () => {
      const sandbox = await getSandbox(sandboxId);
      const host =  sandbox.getHost(3000);
      return "https://" + host; 
    });

  await step.run("save-result", async () => { 
    console.log("isError:", isError); // Log error state
    console.log("result:", result);  
    if (isError) { 
      return await prisma.message.create({ 
        data: { 
          projectId: event.data.projectId,
          content: " Something went wrong ", 
          role: "ASSISTANT",
          type: "ERROR",
        }
      });
    }
    return await prisma.message.create({ 
      data: { 
        projectId: event.data.projectId,
        content: generateResponse(),
        role: "ASSISTANT",
        type: "RESULT",
        fragment: { 
          create: { 
            sandboxUrl: sandboxUrl,
            title: generateFragmentTitle(),
            files: result.state.data.files,
          }
        }
      }
    });
  });

    return { 
      sandboxUrl, 
      title: "Fragment", 
      files: result.state.data.files, 
      summary: result.state.data.summary, 
    };
  }
);
