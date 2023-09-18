'use client'

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as AlertDialog from '@radix-ui/react-alert-dialog'

import { MoreVertical } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface ChatOptionsProps {
    chatId: string
}

export default function ChatOptions({ chatId }: ChatOptionsProps) {
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const router = useRouter()

    async function clearChat() {
        setIsLoading(true)

        try {
            await axios.post('/api/message/clear', { chatId })

            router.push('/dashboard')
            
            toast.success('Mensagens apagadas com sucesso')

            router.refresh()
        } catch (error) {
            toast.error('Algo deu errado. Por favor tente novamente mais tarde.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <DropdownMenu.Root>
            <DropdownMenu.Trigger className='py-1 mr-2 text-zinc-600 hover:text-zinc-900 transition-colors'>
                <MoreVertical />
            </DropdownMenu.Trigger>
            <DropdownMenu.Content className='p-2 mr-1 border rounded-md shadow-lg bg-white'>
                <AlertDialog.Root>
                    <AlertDialog.Trigger asChild>
                        <button className="px-4 py-2 font-medium leading-4 rounded-sm text-red-500 hover:bg-red-100 shadow-zinc-400 focus:shadow-red-200 focus:shadow-[0_0_0_2px] outline-none transition-colors">
                            Excluir
                        </button>
                    </AlertDialog.Trigger>
                    <AlertDialog.Portal>
                        <AlertDialog.Overlay className="bg-black bg-opacity-20 fixed inset-0" />
                        <AlertDialog.Content className="fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[500px] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none">
                            <AlertDialog.Title className="text-zinc-800 m-0 text-[17px] font-medium">
                                Você tem certeza?
                            </AlertDialog.Title>
                            <AlertDialog.Description className="text-zinc-600 mt-4 mb-5 text-[15px] leading-normal">
                                Essa ação não pode ser desfeita e ocorrerá para ambos os participantes da conversa.
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
                                        onClick={() => clearChat()}
                                        aria-label='Deletar amigo'
                                        disabled={isLoading}
                                        className="inline-flex h-[35px] items-center justify-center rounded-[4px] px-[15px] font-medium leading-none outline-none text-red-600 bg-red-100 hover:bg-red-200 focus:shadow-red-400 focus:shadow-[0_0_0_2px] transition-colors">
                                        Apagar conversa
                                    </button>
                                </AlertDialog.Action>
                            </div>
                        </AlertDialog.Content>
                    </AlertDialog.Portal>
                </AlertDialog.Root>
            </DropdownMenu.Content>
        </DropdownMenu.Root>
    )
}