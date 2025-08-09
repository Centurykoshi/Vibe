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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code2Icon, CrownIcon, EyeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CodeView } from "@/components/code-view";
import { FileExplorer } from "@/components/file-explorer";

export const ProjectView = ({ projectId }: Props) => {
    const trpc = useTRPC();
    const [activefragment, setActiveFragment] = useState<Fragment | null>(null);
    const [tabsstate, setTabsState] = useState<"preview" | "code">("preview");

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
                <ResizablePanel defaultSize={35} minSize={40} >
                    <Tabs className="h-full gap-y-0"
                        defaultValue="preview"
                        value={tabsstate}
                        onValueChange={(value) => setTabsState(value as "preview" | "code")} >
                        <div className="w-full flex items-center p-2 border-b gap-x-2">
                            <TabsList className="h-8 p-0 border rounded-md">
                                <TabsTrigger value="preview" className="rounded-md">
                                    <EyeIcon /> <span>Demo</span>
                                </TabsTrigger>
                                <TabsTrigger value="code" className="rounded-md">
                                    <Code2Icon /> <span>Code</span>
                                </TabsTrigger>
                             

                            </TabsList>
                               <div className="ml-auto flex items-center gap-x-2">
                                    <Button asChild size={"sm"} variant={"default"}>
                                        <Link href={"/pricing"}><CrownIcon /> Upgrade </Link>
                                    </Button>
                                </div>

                        </div>
                        <TabsContent value="preview">
                            {activefragment && <FragmentWeb data={activefragment} />}
                        </TabsContent>
                        <TabsContent value="code" className="min-h-0">
                            {!!activefragment?.files && (
                              <FileExplorer files={activefragment.files as {[path: string]: string}} />
                            )}
                        </TabsContent>

                    </Tabs>
                    {/* {JSON.stringify(messages, null, 2)} */}

                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    );
}