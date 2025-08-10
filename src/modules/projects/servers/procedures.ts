import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { inngest } from "../../../inngest/client";
// import { generateSlug } from "random-word-slugs";
import { gemini, createAgent } from "@inngest/agent-kit";
import { FRAGMENT_TITLE_PROMPT } from "@/prompt";

// Set up the Gemini model and title generator agent
const model = gemini({ model: "gemini-2.5-pro" });
const FragmentTitleGenerator = createAgent({
  name: "Fragment-title-generator",
  system: FRAGMENT_TITLE_PROMPT,
  description: "An agent that generates titles for code fragments",
  model: model,
});

export const projectRouter = createTRPCRouter({
  getOne: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1, "Project ID cannot be empty"),
      })
    )
    .query(async ({ input, ctx }) => {
      const existingProject = await prisma.project.findUnique({
        where: {
          id: input.id,
          userId: ctx.auth.userId,
        },
      });

      if (!existingProject) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }
      return existingProject;
    }),

  getMany: protectedProcedure.query(async ({ ctx }) => {
    const projects = await prisma.project.findMany({
      where: {
        userId: ctx.auth.userId,
      },
      orderBy: { updatedAt: "desc" },
    });
    return projects;
  }),

  create: protectedProcedure
    .input(
      z.object({
        value: z
          .string()
          .min(1, "Value cannot be empty")
          .max(5000, "Value cannot exceed 5000 characters"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Generate a project name using the LLM agent
      let projectName = "Untitled Project";
      try {
        const titleResult = await FragmentTitleGenerator.run(input.value);
        if (
          Array.isArray(titleResult.output) &&
          titleResult.output[0]?.type === "text"
        ) {
          if (Array.isArray(titleResult.output[0].content)) {
            projectName = titleResult.output[0].content.join(", ");
          } else {
            projectName = titleResult.output[0].content;
          }
        }
      } catch {
        projectName = "Untitled Project";
      }

      const createdProject = await prisma.project.create({
        data: {
          userId: ctx.auth.userId,
          name: projectName,
          messages: {
            create: {
              content: input.value,
              role: "USER",
              type: "RESULT",
            },
          },
        },
      });

      await inngest.send({
        name: "Code-Agent/run",
        data: {
          value: input.value,
          projectId: createdProject.id,
        },
      });

      return createdProject;
    }),
});