"use client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { MessagesContainer } from "@/modules/projects/ui/components/messages-container";


interface Props {
    projectId: string;
};

import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Suspense } from "react";


export const ProjectView = ({ projectId }: Props) => {
    const trpc = useTRPC();


    const { data: messages } = useSuspenseQuery(trpc.messages.getMany.queryOptions({
        projectId: projectId,
    }))

    return (
        <div className=" h-screen">
            <ResizablePanelGroup direction="horizontal">
                <ResizablePanel defaultSize={25} minSize={20}>
                    <Suspense fallback={<p>Loading Messages...</p>}>
                        <MessagesContainer projectId={projectId} />
                    </Suspense>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={35} minSize={40} className="flex flex-col min-h-0">
                    {/* {JSON.stringify(messages, null, 2)} */}
                    To do : Preview 
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    ); 
}