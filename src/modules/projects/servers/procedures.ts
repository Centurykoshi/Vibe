import {createTRPCRouter, protectedProcedure} from "@/trpc/init";
import {TRPCError} from "@trpc/server";
import {z} from "zod";
import {prisma} from "@/lib/db";
import { inngest } from "../../../inngest/client";
import { generateSlug } from "random-word-slugs";
export const projectRouter = createTRPCRouter({ 
    getOne : protectedProcedure
    .input(z.object({ 
        id : z.string().min(1, "Project ID cannot be empty"),
    }))
    .query(async({input, ctx})=> { 
        const existingProject = await prisma.project.findUnique({
            where : { 
                id : input.id,
                userId: ctx.auth.userId,
            },
        }); 

        if (!existingProject) { 
           throw new TRPCError({
            code: "NOT_FOUND",
            message: "Project not found",
           })
        }
        return existingProject;
    }),
    getMany:protectedProcedure
    .query(async ({ctx}) => {
      const projects = await prisma.project.findMany({
        where : { 
            userId: ctx.auth.userId,
        }, 
        orderBy: { updatedAt: "desc" },
      });
      return projects;
    }),

    create : protectedProcedure
    .input(
        
        z.object({
            value: z.string().min(1, "Value cannot be empty")
            .max(5000, "Value cannot exceed 5000 characters"),
        }),
    )
    .mutation(async ({input, ctx}) => { 

        const createdProject = await prisma.project.create({ 
            data : { 
                userId: ctx.auth.userId,
                name : generateSlug(2, { 
                    format : "kebab"
                }), 
                messages : { 
                    create : { 
                        content : input.value, 
                        role : "USER", 
                        type : "RESULT",
                    }
                }

            }
        })

        await inngest.send({
            name : "Code-Agent/run", 
            data : { 
                value: input.value, 
                projectId: createdProject.id,
            }
        });

        return createdProject;
    }), 
}); 
