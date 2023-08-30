'use client'

import { ButtonHTMLAttributes, useState } from "react";

import Button from "./ui/Button";
import { signOut } from "next-auth/react";
import { toast } from "react-hot-toast";
import { Loader2, LogOut } from "lucide-react";

interface SignOutButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> { }

export default function SignOutButton({ ...props }: SignOutButtonProps) {
    const [isSigningOut, setIsSigningOut] = useState<boolean>(false)

    async function onClickButton() {
        setIsSigningOut(true)

        try {
            await signOut()
        } catch (error) {
            toast.error('Houve um problema ao sair.')
        } finally {
            setIsSigningOut(false)
        }
    }

    return (
        <Button {...props} variant='ghost' onClick={onClickButton}>
            {isSigningOut ? (
                <Loader2 className="animate-spin h-4 w-4" />
            ) : (
                <LogOut className="w-4 h-4" />
            )}
        </Button>
    )
}