'use client'

import { useEffect, useRef, useState } from "react"

import Image from "next/image"

import { format } from 'date-fns'

import { Message } from "@/lib/validations/message"
import { cn, toPusherKey } from "@/lib/utils"
import { pusherClient } from "@/lib/pusher"

import * as ContextMenu from '@radix-ui/react-context-menu';
import * as AlertDialog from '@radix-ui/react-alert-dialog'

import { Trash2 } from "lucide-react"
import axios from "axios"
import toast from "react-hot-toast"

interface MessagesProps {
    initialMessages: Message[]
    sessionId: string
    sessionImg: string | null | undefined
    chatId: string
    chatPartner: User
}

export default function Messages({ initialMessages, sessionId, sessionImg, chatId, chatPartner }: MessagesProps) {
    const [messages, setMessages] = useState(initialMessages)
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const scrollDownRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        pusherClient.subscribe(
            toPusherKey(`chat:${chatId}`)
        )

        function messageHandler(message: Message) {
            setMessages((prev) => [message, ...prev])
        }

        function removedMessageHandler(messageId: string) {
            setMessages((prevMessages) => prevMessages.filter((message) => message.id !== messageId))
        }

        function deleteChatHandler() {
            setMessages([])
        }

        pusherClient.bind('incoming-message', messageHandler)
        pusherClient.bind('message-removal', removedMessageHandler)
        pusherClient.bind('delete-chat', deleteChatHandler)

        return () => {
            pusherClient.unsubscribe(toPusherKey(`chat:${chatId}`))
            pusherClient.unbind('incoming-message', messageHandler)
            pusherClient.unbind('message-removal', removedMessageHandler)
            pusherClient.unbind('delete-chat', deleteChatHandler)
        }
    }, [chatId])

    async function clearAMessage(messageId: string) {
        setIsLoading(true)

        try {
            await axios.post('/api/message/delete', { chatId, messageId })

            toast.success('Mensagem apagada com sucesso.')
        } catch (error) {
            toast.error('Algo deu errado. Por favor tente novamente mais tarde.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div
            id="messages"
            className="flex flex-1 flex-col-reverse h-full gap-4 p-3 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch"
        >
            <div ref={scrollDownRef} />

            {messages.map((message, index) => {
                const isCurrentUser = message.senderId === sessionId

                const hasNextMessageFromSameUser = messages[index - 1]?.senderId === messages[index].senderId

                function formatTimestamp(timestamp: number) {
                    return format(timestamp, 'HH:mm')
                }

                return (
                    <ContextMenu.Root key={`${message.id}-${message.timestamp}`}>
                        <div
                            className="chat-message"
                        >
                            <div
                                className={cn('flex items-end', {
                                    'justify-end': isCurrentUser,
                                })}
                            >
                                <ContextMenu.Trigger
                                    className={cn('flex flex-col space-y-2 text-base max-w-xs mx-2', {
                                        'order-1 items-end': isCurrentUser,
                                        'order-2 items-start': !isCurrentUser,
                                    })}
                                >
                                    <span className={cn('px-4 py-2 rounded-lg inline-block', {
                                        'bg-indigo-600 text-white': isCurrentUser,
                                        'bg-gray-200 text-gray-900': !isCurrentUser,
                                        'rounded-br-none': !hasNextMessageFromSameUser && isCurrentUser,
                                        'rounded-bl-none': !hasNextMessageFromSameUser && !isCurrentUser,
                                    })}>
                                        {message.text}{' '}
                                        <span className="ml-2 text-xs text-gray-400">
                                            {formatTimestamp(message.timestamp)}
                                        </span>
                                    </span>
                                </ContextMenu.Trigger>

                                <div className={cn('relative w-6 h-6', {
                                    'order-2': isCurrentUser,
                                    'order-1': !isCurrentUser,
                                    'invisible': hasNextMessageFromSameUser,
                                })}>
                                    <Image
                                        fill
                                        src={isCurrentUser ? (sessionImg as string) : chatPartner.image}
                                        alt={`Imagem de perfil`}
                                        referrerPolicy="no-referrer"
                                        className="rounded-full"
                                    />
                                </div>
                            </div>
                        </div>

                        <ContextMenu.Portal className="relative">
                            <ContextMenu.Content
                                className="min-w-[120px] bg-white rounded-md overflow-hidden p-[5px] shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),_0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)]"
                            >
                                <AlertDialog.Root>
                                    <AlertDialog.Trigger disabled={isLoading} className="flex items-center relative pl-2 h-[25px] w-full px-[5px] leading-none rounded-[3px] select-none outline-none group text-[13px] text-red-600 data-[disabled]:text-zinc-400 data-[disabled]:pointer-events-none hover:bg-red-100">
                                        <Trash2 width={18} height={18} className="mr-2 text-red-400 group-data-[disabled]:text-zinc-400" />

                                        Apagar
                                    </AlertDialog.Trigger>
                                    <AlertDialog.Portal>
                                        <AlertDialog.Overlay className="bg-black bg-opacity-20 fixed inset-0" />
                                        <AlertDialog.Content className="fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[500px] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none">
                                            <AlertDialog.Title className="text-zinc-800 m-0 text-[17px] font-medium">
                                                Deseja apagar a mensagem?
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
                                                        onClick={() => clearAMessage(message.id)}
                                                        aria-label='Deletar amigo'
                                                        disabled={isLoading}
                                                        className="inline-flex h-[35px] items-center justify-center rounded-[4px] px-[15px] font-medium leading-none outline-none text-red-600 bg-red-100 hover:bg-red-200 focus:shadow-red-400 focus:shadow-[0_0_0_2px] transition-colors">
                                                        Apagar mensagem
                                                    </button>
                                                </AlertDialog.Action>
                                            </div>
                                        </AlertDialog.Content>
                                    </AlertDialog.Portal>
                                </AlertDialog.Root>
                            </ContextMenu.Content>
                        </ContextMenu.Portal>
                    </ContextMenu.Root>
                )
            })}
        </div>
    )
}