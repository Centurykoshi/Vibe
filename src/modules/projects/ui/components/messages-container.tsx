
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { MessageCard } from "@/modules/projects/ui/components/messageCard";
import { MessageForm } from "./message-from";
import React, { useEffect, useRef } from "react";
import { Fragment } from "@prisma/client";
import { MessageLoading } from "@/modules/projects/ui/components/messasge-loading";


interface Props {
    projectId: string;
    activeFragment: Fragment | null;
    setActiveFragment: (fragment: Fragment | null) => void;
}

export const MessagesContainer = ({ projectId, activeFragment, setActiveFragment }: Props) => {
    const bottomRef = React.useRef<HTMLDivElement>(null);
    const lastAssistantMessageIdRef = useRef<string | null>(null);


    const trpc = useTRPC();
    const { data: messages } = useSuspenseQuery(trpc.messages.getMany.queryOptions({
        projectId: projectId,
    }, { 
        refetchInterval : 5000, 
    }
));

    // const { data: project } = useSuspenseQuery(trpc.projects.getOne.queryOptions({
    //     id: projectId,
    // }));
    useEffect(() => { 
        const lastAssistantMessage = messages.findLast(
            (message) => message.role === "ASSISTANT"
        )

        if (lastAssistantMessage?.fragment && lastAssistantMessage.id !== lastAssistantMessageIdRef.current) {
           setActiveFragment(lastAssistantMessage.fragment);
           lastAssistantMessageIdRef.current = lastAssistantMessage.id;
        }
    }, [messages, setActiveFragment]); 

    useEffect(() => { 
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });

    }, [messages.length]); 

    const lastmessage = messages[messages.length - 1];
    const isLastMessageAssistant = lastmessage?.role === "USER";

    return (
        <div className="flex flex-col flex-1 h-screen">
            <div className="flex-1 min-h-0 overflow-y-auto">
                <div className="pt-2 pr-1">
                    {messages.map(message => (
                        <MessageCard key={message.id}
                            content={message.content}
                            role={message.role}
                            fragment={message.fragment}
                            createdAt={message.createdAt}
                            isActiveFragment={activeFragment?.id === message.fragment?.id}
                            onFragmentClick={() => setActiveFragment(message.fragment)}
                            type={message.type}
                        />
                    ))}
                    {isLastMessageAssistant && <MessageLoading />}
                    <div ref={bottomRef} />
                </div>

            
            </div>

                <div className="relative p-3 pt-1">
                    <div className="absolute -top-6 left-0 right-0 h-6 bg-gradient-to-b from-transparent to-background pointer-events-none"/>
                    <MessageForm projectId={projectId} />

                </div>
        </div>
    )

}
