import { Fragment, useCallback, useState } from "react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "./ui/resizable";
import { Hint } from "./hint";
import { Button } from "./ui/button";
import { CopyCheckIcon, CopyIcon, TicketCheck } from "lucide-react";
import { CodeView } from "./code-view";
import { convertFilesToTreeItems } from "@/lib/utils";
import { TreeView } from "./tree-view";
import { max } from "date-fns";
import { Breadcrumb, BreadcrumbEllipsis, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "./ui/breadcrumb";

type FileCollectioni = { [path: string]: string };

function GetLanguageFormExtension(filename: string): string {
    const extension = filename.split('.').pop()?.toLowerCase();
    return extension || "text";
};

interface FileBreadcrumbProps {
    filePath: string;
}


const FileBreadcrumb = ({ filePath }: FileBreadcrumbProps) => {
    const parts = filePath.split("/");

    const maxSegments = 3;

    const renderBreadcrumbs = () => {
        if (parts.length <= maxSegments) {

            return parts.map((segment, index) => {
                const isLast = index === parts.length - 1;
                return (
                    <Fragment key={index}>
                        <BreadcrumbItem>
                            {isLast ? (<BreadcrumbPage className="font-medium">{segment}</BreadcrumbPage>) : (
                                <span className="text-muted-foreground">{segment}</span>
                            )}
                        </BreadcrumbItem>
                        {!isLast && <BreadcrumbSeparator />}
                    </Fragment>
                );
            });

        }
        else {
            const firstSegment = parts[0];
            const lastSegment = parts[parts.length - 1];

            return (
                <>
                    <BreadcrumbItem>
                        <span className="text-muted-foreground">{firstSegment}</span>

                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbEllipsis />
                        </BreadcrumbItem>
                        <BreadcrumbSeparator/>
                        <BreadcrumbItem>
                            <BreadcrumbPage className="font-medium">{lastSegment}</BreadcrumbPage>
                        </BreadcrumbItem>

                    </BreadcrumbItem>
                </>
            )
        }
    };
            return(
            <Breadcrumb>
                <BreadcrumbList>
                    {renderBreadcrumbs()}
                </BreadcrumbList>

            </Breadcrumb>
        )
    }; 


interface FileExplorerProps {
    files: FileCollectioni;
}


export const FileExplorer = ({ files }: FileExplorerProps) => {



    const [selectedFile, setSelectedFile] = useState<string | null>(() => {
        const filekeys = Object.keys(files);
        return filekeys.length > 0 ? filekeys[0] : null;
    })
    const [copied, setCopied] = useState(false);

    const treeData = convertFilesToTreeItems(files);

    const handleFileSelect = useCallback((
        filePath: string
    ) => {
        if (files[filePath]) {
            setSelectedFile(filePath);

        }
    }, [files]);

            const HandleCopy = useCallback(() => { 
        if (selectedFile) {
            navigator.clipboard.writeText(files[selectedFile]);
            setCopied(true);
            setTimeout(() => {
                setCopied(false);
            }, 2000);
        }
    }, [selectedFile, files]);



    return (

        <ResizablePanelGroup direction="horizontal">
            <ResizablePanel defaultSize={25} minSize={20} className="bg-sidebar">
                <TreeView
                    data={treeData}
                    value={selectedFile}
                    onSelect={handleFileSelect} />
            </ResizablePanel>
            <ResizableHandle className="hover:bg-primary transition-colors duration-200" />
            <ResizablePanel defaultSize={75} minSize={50} className="bg-editor">
                {selectedFile && files[selectedFile] ? (
                    <div className="h-full w-full flex flex-col">
                        <div className="border-b bg-sidebar px-4 py-2 flex justify-between items-center gap-x-2">
                            <FileBreadcrumb filePath={selectedFile} />
                            <Hint text="Copy to Clipboard" side="bottom">
                                <Button variant="outline"
                                    size="sm"
                                    className="ml-auto"
                                    onClick={HandleCopy}
                                    disabled={copied}>{copied ? <CopyCheckIcon /> : <CopyIcon />}</Button>

                            </Hint>
                        </div>
                        <div className="flex-1 overflow-auto">
                            <CodeView code={files[selectedFile]}
                                lang={GetLanguageFormExtension(selectedFile)} />
                        </div>
                    </div>
                ) : (<div className="flex h-full items-center justify-center text-muted-foreground">
                    Select a file to view it &apos;s content

                </div>)}
            </ResizablePanel>
        </ResizablePanelGroup>
    );
};