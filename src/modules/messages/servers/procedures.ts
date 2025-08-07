import {createTRPCRouter, baseProcedure} from "@/trpc/init";
import {z} from "zod";
import {prisma} from "@/lib/db";
import { inngest } from "../../../inngest/client";
export const messagesRouter = createTRPCRouter({ 
    getMany : baseProcedure
        .input(
        
       z.object({
            projectId : z.string().min(1, "Project ID cannot be empty"),
        }),
    )
    .query(async({input})=> { 
        const messages = await prisma.message.findMany({
            where : { 
                projectId : input.projectId,
            },
            include : { 
                fragment: true,
            }, 
            orderBy : { 
                updatedAt : "asc",
                
            }, 

       });
        return messages;
    }), 


    create : baseProcedure
    .input(
        
       z.object({
            value: z.string().min(1, "Value cannot be empty")
            .max(5000, "Value cannot exceed 5000 characters"),
            projectId : z.string().min(1, "Project ID cannot be empty"),
        }),
    )
    .mutation(async ({input}) => { 
        const newMessage = await prisma.message.create({ 
            data : { 
                projectId: input.projectId,
                content : input.value, 
                role : "USER", 
                type : "RESULT",
            }, 
        }); 

        await inngest.send({
            name : "Code-Agent/run", 
            data : { 
                value: input.value, 
                projectId: input.projectId,
                
            }
        });

        return newMessage;
    }), 
}); 