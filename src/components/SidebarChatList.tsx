'use client'

import { chatHrefConstructor } from "@/lib/utils"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface SidebarChatList {
    friends: User[]
    sessionId: string
}

export default function SidebarChatList({ sessionId, friends }: SidebarChatList) {
    const router = useRouter()
    const pathname = usePathname()

    const [unseenMessages, setUnseenMessages] = useState<Message[]>([])

    useEffect(() => {
        if (pathname?.includes('chat')) {
            setUnseenMessages((prev) => {
                return prev.filter((msg) => !pathname.includes(msg.senderId))
            })
        }
    }, [pathname])

    return (
        <ul role="list" className="max-h-[25rem] overflow-y-auto -mx-2 space-y-1">
            {friends.sort().map((friend) => {
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