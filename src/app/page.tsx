"use client";


import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

 

const Page  = ()=> { 
   const trpc = useTRPC(); 
   const invoke = useMutation(trpc.invoke.mutationOptions({
    onSuccess :() =>{ 
      toast.success("background job started");
    }
   })); 
   
 
//   const trpc = useTRPC(); 
//  const data = useQuery(trpc.CreateAi.queryOptions({text :"Piyush"})); 
  return (
<div className="p-4 max-w-7xl mx-auto">
 <Button disabled={invoke.isPending} onClick={()=> invoke.mutate({text : "Richa Yadav"})}>
  Invoke Background Job
 </Button>
</div>

  )
}


export default Page; 