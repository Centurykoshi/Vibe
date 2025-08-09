import { TreeItem } from "@/types";

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarProvider,
    SidebarRail,

} from "./ui/sidebar";
import { ChevronRightIcon, FileIcon, FolderIcon } from "lucide-react";
import { Collapsible, CollapsibleTrigger } from "./ui/collapsible";
import { CollapsibleContent } from "@radix-ui/react-collapsible";
import { sub } from "date-fns";
interface TreeViewProps {
    data: TreeItem[];
    value: string | null;
    onSelect: (filePath: string) => void;
};


export const TreeView = ({ data, value, onSelect }: TreeViewProps) => {
    return (
        <SidebarProvider>
            <Sidebar collapsible="none" className="w-full">
                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupContent>
                            <SidebarMenu>
                            {data.map((item, index) => (
                                <Tree
                                    key={index}
                                    item={item}
                                    selectedValue={value}
                                    onSelect={onSelect}
                                    parentPath=""
                                />
                            ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
                <SidebarRail/>
            </Sidebar>
        </SidebarProvider>
    )
};

interface TreeNodeProps {
    item: TreeItem;
    selectedValue?: string | null;
    onSelect?: (filePath: string) => void;
    parentPath?: string;
}

const Tree = ({ item, selectedValue, onSelect, parentPath }: TreeNodeProps) => {

    const [name, ...items] = Array.isArray(item) ? item : [item];
    const currentpath = parentPath ? `${parentPath}/${name}` : name;

    if (!items.length) {
        const isSelected = selectedValue === currentpath;


        return (
            <SidebarMenuButton
                isActive={isSelected}
                className="data-[active=true]:bg-transparent"
                onClick={() => onSelect?.(currentpath)}
            >
                <FileIcon />
                <span className="truncate">{name}</span>
            </SidebarMenuButton>
        )
    }

    return (
        <SidebarMenuItem>
            <Collapsible className="group/collapsible [&[data-state=open]>button>svg:first-child]:rotate-90" defaultOpen>
                <CollapsibleTrigger asChild>
                    <SidebarMenuButton>
                        <ChevronRightIcon className="transition-transform" />
                        <FolderIcon />
                        <span className="truncate">{name}</span>
                    </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <SidebarMenuSub>
                        {items.map((subItem, index) => (
                            <Tree
                                key={index}
                                item={subItem}
                                selectedValue={selectedValue}
                                onSelect={onSelect}
                                parentPath={currentpath}
                            />
                        ))}
                    </SidebarMenuSub>
                </CollapsibleContent>
            </Collapsible>
        </SidebarMenuItem>
    );

};
