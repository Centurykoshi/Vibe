import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";
import { ProjectView } from "@/modules/projects/ui/views/project-view";

interface Props {
  params: { 
    projectId: string;
  };
}

const Page = async ({ params }: Props) => {
  const { projectId } = await params;

  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(trpc.messages.getMany.queryOptions({
    projectId,
  }));

  await queryClient.prefetchQuery(trpc.projects.getOne.queryOptions({
    id: projectId,
  }));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<p>Loading...</p>}>
        <ProjectView projectId={projectId} />
      </Suspense>
    </HydrationBoundary>
  );
};

export default Page;