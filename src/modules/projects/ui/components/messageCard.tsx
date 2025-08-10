import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {MessageRole, Fragment, MessageType} from "@prisma/client";
import Image from "next/image";
import { ChevronRightIcon, Code2Icon } from "lucide-react";


// import { Fragment, MessageType } from "@prisma/client";

interface UserMessageProps { 
    content: string;
}

interface FragmentProps { 
    fragment: Fragment;
    isActiveFragment: boolean;
    onFragmentClick: (fragmentId: Fragment) => void;
}

interface AssistantMessageProps { 
    content: string;
    fragment?: Fragment | null;
    createdAt: Date;
    isActiveFragment: boolean;
    onFragmentClick: (fragmentId: Fragment) => void;
    type?: MessageType; // Optional, can be used for additional message types
};

const AssistantMessage = ({ content, fragment, createdAt, isActiveFragment, onFragmentClick, type }: AssistantMessageProps) => { 
    return (
        <>
        <div className={cn("flex flex-col group px-2 pb-4", 
            type ==="ERROR" && "text-red-500", 
        )}>

            <div className="flex items-center gap-2 pl-2 mb-2">
           <Image unoptimized
           src="/wired-outline-478-computer-display-hover-angle.gif"
           alt="Vibe"
           width={40}
           height={42}
           className="shrink-0"
           />
                <span className="text-sm font-medium">Vibe</span>
                 <span className="text-xs text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">{format(createdAt, "HH:mm 'on' MMM dd, yyyy")}</span>
            </div>
            <div className="pl-8.5 flex flex-col gap-y-">
                <span>{content}</span>
                {fragment && type === "RESULT" && (
                    <FragmentCard
                        fragment={fragment}
                        isActiveFragment={isActiveFragment}
                        onFragmentClick={onFragmentClick}
                        
                    />
                    
                )}
            </div>
           
        </div>
        </>
    )
}

const FragmentCard = ({ fragment, isActiveFragment, onFragmentClick }: FragmentProps) => { 
    return (
        <button className={cn("flex items-start text-start gap-2 border rounded-lg bg-muted w-fit mt-3 p-3 hover:bg-secondary transition-colors", 
            isActiveFragment && "bg-primary text-primary-foreground border-primary hover:bg-secondary hover:text-secondary-foreground transition-colors", 
        )}
        onClick={() => onFragmentClick(fragment)}
        >
            <Code2Icon className="size-4 mt-0.5 " />
            <div className="flex flex-col flex-1">
                <span className="text-sm font-medium line-clamp-1">{fragment.title}</span>
                <span className="text-sm">Preview</span>
            </div>
            <div className="flex items-center justify-center mt-0.5">
                <ChevronRightIcon className="size-4" />
            </div>
        </button>
    )
}

const UserMessage = ({ content }: UserMessageProps) => { 
    return (
        <div className="flex justify-end pb-4 pr-2 pl-10">
            <Card className="rounded-lg bg-muted p-3 shadow-none border-none max-w-[80%] break-words">
            {content}

            </Card>
        </div>
    )

    ;
}

interface MessageCardProps { 
    content: string;
    role: MessageRole;
    fragment?: Fragment | null;
    createdAt: Date;
    isActiveFragment: boolean;
   onFragmentClick: (fragmentId: Fragment) => void;
    type?: MessageType; // Optional, can be used for additional message types
}



export const MessageCard = ({ content, role, fragment, createdAt, isActiveFragment, onFragmentClick, type }: MessageCardProps) => {
    if(role === MessageRole.ASSISTANT) {
        return (
           <AssistantMessage content={content} 
           fragment={fragment} 
           createdAt={createdAt} 
           isActiveFragment={isActiveFragment} 
           onFragmentClick={onFragmentClick}
           type={type} />
        )
    }

    return ( 
        <div> 
            <UserMessage content={content} />
             </div>
        
    ); 
}