import { useState } from "react";

import { Fragment } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { CopyCheckIcon, RefreshCcwIcon, TicketCheckIcon } from "lucide-react";
import { ExternalLinkIcon } from "lucide-react";
import { set } from "date-fns";
import { Hint } from "@/components/hint";

interface Props { 
    data: Fragment;
}; 

export const FragmentWeb = ({ data }: Props) => { 

    const [fragment, setFragment] = useState(0);
    const [copied, setCopied] = useState(false);

    const onRefresh = () => { 
        setFragment((prev) => prev + 1);
    }

    const HandleCopy = () => { 
        navigator.clipboard.writeText(data.sandboxUrl || "");
        setCopied(true);
        setTimeout(() => {
            setCopied(false);
        }, 2000);
    }

    return ( 
        <div className="flex flex-col w-full h-full">
            <div className="p-2 border-b bg-sidebar flex items-center gap-x-2 ">
                <Button size={"sm"} variant={"outline"} onClick={onRefresh}>
                    <RefreshCcwIcon/>
                </Button>
                <Button size={"sm"} variant={"outline"} onClick={HandleCopy} disabled={!data.sandboxUrl || copied} className="flex-1 justify-start text-start font-normal">
                    <span className="truncate"> {data.sandboxUrl}</span>
                </Button>
                <Hint text="Open in new tab" side="bottom" align="start" >
                <Button size={"sm"} disabled={!data.sandboxUrl} variant={"outline"} onClick={() => {
                    if(!data.sandboxUrl) return;
                    window.open(data.sandboxUrl, "_blank");
                }}>
                    <ExternalLinkIcon/>
                   

                </Button>
                </Hint>
                <Hint text="Copy URL to clipboard" side="bottom" align="start">
                <Button size={"sm"} onClick={HandleCopy} className="transition-opacity duration-200" variant={"outline"} disabled={!data.sandboxUrl || copied}>
                    {copied ? <TicketCheckIcon /> : <CopyCheckIcon />}
                </Button>
                </Hint>
            </div>
            <iframe 
            key={fragment}
            className="h-full w-full"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            loading="lazy"
            src={data.sandboxUrl}
            />

        </div>
    )

}