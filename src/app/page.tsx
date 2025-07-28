// "use client"; 
import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";
import { caller, getQueryClient , trpc} from "@/trpc/server";
import { dehydrate, HydrationBoundary, useQuery } from "@tanstack/react-query";
import { Client } from "./Client";
import { Suspense } from "react";;

const Page  = async()=> { 
  const data = await caller.CreateAi({text:"Piyush's Server"}); 
  const queryClient = getQueryClient(); 
  void queryClient.prefetchQuery(trpc.CreateAi.queryOptions({text : "Piyush's Prefetch"}))
 
//   const trpc = useTRPC(); 
//  const data = useQuery(trpc.CreateAi.queryOptions({text :"Piyush"})); 
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<p>Loading...</p>}>
      <Client/>
      </Suspense>
    </HydrationBoundary>

  )
}


export default Page; 