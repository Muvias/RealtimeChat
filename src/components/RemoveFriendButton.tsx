'use client'

import axios from 'axios'
import * as AlertDialog from '@radix-ui/react-alert-dialog'

import { X } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface RemoveFriendButtonProps {
    idToRemove: string
}

export default function RemoveFriendButton({ idToRemove }: RemoveFriendButtonProps) {
    const router = useRouter()

    async function removeFriend() {
        await axios.post('/api/friends/remove', { idToRemove })

        router.refresh()
    }

    return (
        <AlertDialog.Root>
            <AlertDialog.Trigger asChild>
                <button className="inline-flex h-6 w-6 items-center justify-center rounded-full font-medium leading-none text-white bg-red-700 bg-opacity-80 hover:bg-opacity-90 shadow-zinc-400 focus:shadow-red-800 shadow-[0_2px_10px] outline-none focus:shadow-[0_0_0_2px]">
                    <X className='w-3/4 h-3/4' />
                </button>
            </AlertDialog.Trigger>
            <AlertDialog.Portal>
                <AlertDialog.Overlay className="bg-black bg-opacity-20 fixed inset-0" />
                <AlertDialog.Content className="fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[500px] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none">
                    <AlertDialog.Title className="text-zinc-800 m-0 text-[17px] font-medium">
                        Você tem certeza?
                    </AlertDialog.Title>
                    <AlertDialog.Description className="text-zinc-600 mt-4 mb-5 text-[15px] leading-normal">
                        Essa ação não pode ser desfeita, caso se arrependa terá que enviar novamente uma solicitação de amizade ao usuário.
                    </AlertDialog.Description>
                    <div className="flex justify-end gap-[25px]">
                        <AlertDialog.Cancel asChild>
                            <button
                                aria-label='Cancelar exclusão'
                                className="inline-flex h-[35px] items-center justify-center rounded-[4px] px-[15px] font-medium leading-none outline-none text-zinc-600 bg-zinc-100 hover:bg-zinc-200 focus:shadow-zinc-300 focus:shadow-[0_0_0_2px] transition-colors">
                                Cancelar
                            </button>
                        </AlertDialog.Cancel>
                        <AlertDialog.Action asChild>
                            <button
                                onClick={() => removeFriend()}
                                aria-label='Deletar amigo'
                                className="inline-flex h-[35px] items-center justify-center rounded-[4px] px-[15px] font-medium leading-none outline-none text-red-600 bg-red-100 hover:bg-red-200 focus:shadow-red-400 focus:shadow-[0_0_0_2px] transition-colors">
                                Excluir amigo
                            </button>
                        </AlertDialog.Action>
                    </div>
                </AlertDialog.Content>
            </AlertDialog.Portal>
        </AlertDialog.Root>
    )
}