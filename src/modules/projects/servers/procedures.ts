import {createTRPCRouter, baseProcedure} from "@/trpc/init";
import {z} from "zod";
import {prisma} from "@/lib/db";
import { inngest } from "../../../inngest/client";
import { generateSlug } from "random-word-slugs";
export const projectRouter = createTRPCRouter({ 
    getMany : baseProcedure
    .query(async()=> { 
        const projects = await prisma.project.findMany({
            orderBy : { 
                updatedAt : "desc",
            }, 

            include : { 
            }

        }); 
        return projects;
    }), 


    create : baseProcedure
    .input(
        
        z.object({
            value: z.string().min(1, "Value cannot be empty")
            .max(5000, "Value cannot exceed 5000 characters"),
        }),
    )
    .mutation(async ({input}) => { 

        const createdProject = await prisma.project.create({ 
            data : { 
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