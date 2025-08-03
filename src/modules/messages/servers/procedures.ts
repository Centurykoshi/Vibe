import {createTRPCRouter, baseProcedure} from "@/trpc/init";
import {z} from "zod";
import {prisma} from "@/lib/db";
import { inngest } from "../../../inngest/client";
export const messagesRouter = createTRPCRouter({ 
    getMany : baseProcedure
    .query(async()=> { 
        const messages = await prisma.message.findMany({
            orderBy : { 
                updatedAt : "desc",
            }, 

            include : { 
            }

        }); 
        return messages;
    }), 


    create : baseProcedure
    .input(
        
        z.object({
            value: z.string().min(1, "Message cannot be empty"),
        }),
    )
    .mutation(async ({input}) => { 
        const newMessage = await prisma.message.create({ 
            data : { 
                content : input.value, 
                role : "USER", 
                type : "RESULT",
            }, 
        }); 

        await inngest.send({
            name : "Code-Agent/run", 
            data : { 
                value: input.value, 
            }
        });

        return newMessage;
    }), 
}); 