"use client";
import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";

import { formatDistanceToNow } from "date-fns";
import Image from "next/image";
import Link from "next/link";

 


export const ProjectList = () => { 
    const trpc = useTRPC(); 

  const {data: projects} = useQuery(trpc.projects.getMany.queryOptions());

    return(
        <div className="w-full bg-white dark:bg-sidebar rounded-xl p-8 border flex flex-col gap-y-6 sm:gap-y-4">
            <h2 className="text-2xl font-semibold">
                Saved Vibes 
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {!projects?.length && (
                <div className="col-span-full text-center">
                  <p className="text-sm text-muted-foreground">
                    No saved vibes found.
                  </p>
                </div>
            )}
            {projects?.map((project)=>(
                <Button 
                key={project.id}
                variant={"outline"}
                className="font-normal h-auto justify-start w-full text-start p-4"
                asChild><Link href={`/projects/${project.id}`}>
                    <div className="flex items-center gap-x-4">
                        <Image
                            src={"/wired-outline-478-computer-display-hover-angle.gif"}
                            alt={project.name}
                            width={40}
                            height={40}
                            className="object-contain"
                        />
                        <div className="flex flex-col">
                            <h3 className="truncate font-medium">
                                {project.name}
                            </h3>
                            <p>
                                {formatDistanceToNow(new Date(project.updatedAt), { 
                                    addSuffix: true,
            
                                })}
                            </p>
                        </div>

                    </div>
                </Link></Button>
            ))}

            </div>

        </div>
    )
}