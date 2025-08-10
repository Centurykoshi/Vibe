"use client";
import { Button } from "@/components/ui/button"
import { UserControl } from "@/components/user_control"
import { SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs"
import { useTheme } from "next-themes";
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioItem, DropdownMenuRadioGroup, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";


import Image from "next/image"
import Link from "next/link"
import { MoonIcon, SunIcon } from "lucide-react";
import { useEffect, useState } from "react";

export const Navbar = () => {
    const { setTheme, theme, systemTheme } = useTheme();

    const [mounted, setMounted] = useState(false);

    // Ensure this only runs after hydration to avoid SSR mismatch
    useEffect(() => setMounted(true), []);

        const currenttheme = theme === "system" ? systemTheme : theme;
    const isDark = currenttheme === "dark";

    return (
        <nav className="p-4 bg-transparent fixed top-0 left-0 right-0 z-50 transition-all duration-200 border-b border-transparent">
            <div className="max-w-5xl mx-auto w-full flex justify-between items-center">
                <Link href="/" className="flex items-center gap-2">
                    <Image src="/wired-outline-478-computer-display-hover-angle.gif" alt="Logo" width={32} height={32} />
                    <span className="font-semibold text-lg">Centuries</span>
                </Link>
                <SignedOut>
                    <div className="flex gap-2 ">
                        <SignUpButton>
                            <Button variant="outline" size="sm" >
                                <span>Sign Up</span>
                            </Button>
                        </SignUpButton>
                        <SignInButton>
                            <Button size="sm" >
                                <span>Sign In</span>
                            </Button>
                        </SignInButton>
                    </div>
                </SignedOut>

               {mounted &&( <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                            <span>{isDark ? <MoonIcon /> : <SunIcon />}</span>
                        </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent>


                        <DropdownMenuRadioGroup value={theme} onValueChange={(theme) => { setTheme(theme); }}>
                            <DropdownMenuRadioItem value="light">
                                <span> Light </span>
                            </DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="dark">
                                <span> Dark </span>
                            </DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="system">
                                <span> System </span>
                            </DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>


                    </DropdownMenuContent>

                </DropdownMenu>)}

                <SignedIn>
                    <UserControl showName={true} />
                </SignedIn>

            </div>
        </nav>
    )
}
