"use client";
import { z } from "zod";
import { Form, FormProvider, useForm } from "react-hook-form";
import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import TextareaAutosize from 'react-textarea-autosize';

import { FormField } from "@/components/ui/form";
import { ArrowUpIcon, Loader2Icon, Router } from "lucide-react";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { PROJECT_TEMPLATES } from "../../constants";
import { Button } from "@/components/ui/button";
import { useClerk } from "@clerk/nextjs";

const formSchema = z.object({
    value: z.string().min(1, "Message cannot be empty")
        .max(500, "Message cannot exceed 500 characters"),
});





export const ProjectForm = () => {
    const router = useRouter();
    const trpc = useTRPC();
    const queryClient = useQueryClient();
    const clerk = useClerk();  
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { value: "" },
    });

    const onSelect = (value : string)=> { 
        form.setValue(`value`, value, { 
            shouldDirty: true,
            shouldValidate : true, 
            shouldTouch: true,
        });

    }

    const createProject = useMutation(trpc.projects.create.mutationOptions({
        onSuccess: (data) => {
            queryClient.invalidateQueries(trpc.projects.getMany.queryOptions(),
            );
            router.push(`/projects/${data.id}`);
        },
        onError: (error) => {
            toast.error(error.message);
            if(error.data?.code ==="UNAUTHORIZED"){ 
                clerk.openSignIn();
            }
    
        },
    }));


    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        await createProject.mutateAsync({
            value: values.value,
        })

    };
    const [isFocused, setIsFocused] = useState(false);
    const isPending = createProject.isPending;
    const isDisabled = isPending || !form.formState.isValid;

    return (
        <FormProvider {...form}>
            <section className="space-y-6">
                <form onSubmit={form.handleSubmit(onSubmit)}
                    className={cn("relative border p-4 pt-3 rounded-xl bg-sidebar dark:bg-sidebar transition-all",
                        isFocused && "shadow-xs",
                    )}>   <FormField control={form.control} name="value" render={({ field }) => (
                        <TextareaAutosize {...field}
                            disabled={isPending}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            minRows={2}
                            maxRows={8}
                            className="pt-4 resize-none border-none w-full outline-none bg-transparent"
                            placeholder="what would you like to build"
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    form.handleSubmit(onSubmit)(e);
                                }
                            }}

                        />
                    )} />
                    <div className="flex gap-x-2 items-end justify-between pt-2">
                        <div className="text-[10px] text-muted-foreground font-mono"><kbd className="ml-auto pointer-events-none inline-flex h-5
                select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                            <span> &#8984; </span> Enter  </kbd>
                            &nbsp;to Submit
                        </div>
                        <button disabled={isDisabled} className={cn("size-8 rounded-full flex items-center justify-center bg-primary text-primary-foreground hover:bg-primary transition all",
                            isDisabled && "bg-muted-foreground border",

                        )}>
                            {isPending ? (<Loader2Icon className=" size-4 animate-spin" />) : <ArrowUpIcon />}
                        </button>
                    </div>
                </form>

                <div className="flex-wrap mt-4 justify-center gap-2 hidden md:flex max-w-3xl md:mt-2">
                    {PROJECT_TEMPLATES.map((template) => (
                        <Button key={template.title}
                            variant={"outline"}
                            size={"sm"}
                            className="bg-white dark:bg-sidebar"
                            onClick={() => { onSelect(template.prompt) }}>
                            {template.emoji} {template.title}
                        </Button>
                    ))}
                </div>
            </section>

        </FormProvider>
    );

}
