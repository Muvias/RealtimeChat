'use client'

import { pusherClient } from "@/lib/pusher"
import { chatHrefConstructor, toPusherKey } from "@/lib/utils"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"
import UnseenChatToast from "./UnseenChatToast"

interface SidebarChatList {
    friends: User[]
    sessionId: string
}

interface ExtendedMessage extends Message {
    senderImg: string,
    senderName: string
}

export default function SidebarChatList({ sessionId, friends }: SidebarChatList) {
    const router = useRouter()
    const pathname = usePathname()

    const [unseenMessages, setUnseenMessages] = useState<Message[]>([])
    const [activeChats, setActiveChats] = useState<User[]>(friends)


    useEffect(() => {
        pusherClient.subscribe(toPusherKey(`user:${sessionId}:chats`))
        pusherClient.subscribe(toPusherKey(`user:${sessionId}:friends`))

        function chatHandler(message: ExtendedMessage) {
            const shouldNotify = pathname !== `/dashboard/chat/${chatHrefConstructor(sessionId, message.senderId)}`

            if (!shouldNotify) return

            toast.custom((t) => (
                <UnseenChatToast
                    t={t}
                    sessionId={sessionId}
                    senderId={message.senderId}
                    senderImg={message.senderImg}
                    senderName={message.senderName}
                    senderMessage={message.text}
                />
            ))

            setUnseenMessages((prev) => [...prev, message])
        }

        function newFriendHandler(newFriend: User) {
            setActiveChats((prev) => [...prev, newFriend])
        }

        pusherClient.bind('new_message', chatHandler)
        pusherClient.bind('new_friend', newFriendHandler)

        return () => {
            pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:chats`))
            pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:friends`))

            pusherClient.unbind('new_message', chatHandler)
            pusherClient.unbind('new_friend', newFriendHandler)
        }
    }, [pathname, sessionId, router])

    useEffect(() => {
        if (pathname?.includes('chat')) {
            setUnseenMessages((prev) => {
                return prev.filter((msg) => !pathname.includes(msg.senderId))
            })
        }
    }, [pathname])

    return (
        <ul role="list" className="max-h-[25rem] overflow-y-auto -mx-2 space-y-1">
            {activeChats.sort().map((friend) => {
                const unseenMessagesCount = unseenMessages.filter((unseenMsg) => {
                    return unseenMsg.senderId === friend.id
                }).length

                return (
                    <li key={friend.id}>
                        <a
                            href={`/dashboard/chat/${chatHrefConstructor(sessionId, friend.id)}`}
                            className="flex items-center p-2 gap-x-3 rounded-md text-sm leading-6 font-semibold text-gray-700 hover:text-indigo-600 hover:bg-gray-50 group"
                        >
                            {friend.name}

                            {unseenMessagesCount > 0 ? (
                                <div className="flex justify-center items-center rounded-full w-4 h-4 font-medium text-xs text-white bg-indigo-600">
                                    {unseenMessagesCount}
                                </div>
                            ) : null}
                        </a>
                    </li>
                )
            })}
        </ul>
    )
}