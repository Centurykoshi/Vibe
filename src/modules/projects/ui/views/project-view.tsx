"use client";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { MessagesContainer } from "@/modules/projects/ui/components/messages-container";
import { useState } from "react";


interface Props {
    projectId: string;
};


import { Suspense } from "react";
import { Fragment } from "@prisma/client";
import { ProjectHeader } from "@/modules/projects/ui/components/project-header";
import { FragmentWeb } from "../components/fragmentweb";

export const ProjectView = ({ projectId }: Props) => {
    const trpc = useTRPC();
    const [activefragment, setActiveFragment] = useState<Fragment | null>(null);

    const { data: messages } = useSuspenseQuery(trpc.messages.getMany.queryOptions({
        projectId,
    }))

    return (
        <div className=" h-screen">
            <ResizablePanelGroup direction="horizontal">
                <ResizablePanel defaultSize={25} minSize={20} className="flex flex-col min-h-0">
                    <Suspense fallback={<p>Loading Project ...</p>}>
                    <ProjectHeader projectId={projectId} />
                    </Suspense>
                    <Suspense fallback={<p>Loading Messages...</p>}>
                        <MessagesContainer
                            projectId={projectId}
                            activeFragment={activefragment}
                            setActiveFragment={setActiveFragment}
                        />
                    </Suspense>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={35} minSize={40} className="flex flex-col min-h-0">
                    {/* {JSON.stringify(messages, null, 2)} */}
                 {activefragment && <FragmentWeb data={activefragment} />}
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    ); 
}