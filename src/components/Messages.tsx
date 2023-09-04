'use client'

import { useEffect, useRef, useState } from "react"

import { format } from 'date-fns'

import { Message } from "@/lib/validations/message"
import { cn, toPusherKey } from "@/lib/utils"
import Image from "next/image"
import { pusherClient } from "@/lib/pusher"

interface MessagesProps {
    initialMessages: Message[]
    sessionId: string
    sessionImg: string | null | undefined
    chatId: string
    chatPartner: User
}

export default function Messages({ initialMessages, sessionId, sessionImg, chatId, chatPartner }: MessagesProps) {
    const [messages, setMessages] = useState(initialMessages)

    const scrollDownRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        pusherClient.subscribe(
            toPusherKey(`chat:${chatId}`)
        )

        function messageHandler(message: Message) {
            setMessages((prev) => [message, ...prev])
        }

        pusherClient.bind('incoming-message', messageHandler)

        return () => {
            pusherClient.unsubscribe(toPusherKey(`chat:${chatId}`))
            pusherClient.unbind('incoming-message', messageHandler)
        }
    }, [])

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
                    <div
                        key={`${message.id}-${message.timestamp}`}
                        className="chat-message"
                    >
                        <div
                            className={cn('flex items-end', {
                                'justify-end': isCurrentUser,
                            })}
                        >
                            <div
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
                            </div>

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
                )
            })}
        </div>
    )
}