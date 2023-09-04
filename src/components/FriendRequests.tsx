'use client'

import axios from "axios"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import { pusherClient } from "@/lib/pusher"
import { toPusherKey } from "@/lib/utils"

import { Check, UserPlus, X } from "lucide-react"

interface FriendRequestsProps {
    incomingFriendRequests: IncomingFriendRequest[]
    sessionId: string
}

export default function FriendRequests({ incomingFriendRequests, sessionId }: FriendRequestsProps) {
    const [FriendRequests, setFriendRequests] = useState<IncomingFriendRequest[]>(incomingFriendRequests)

    const router = useRouter()

    useEffect(() => {
        pusherClient.subscribe(
            toPusherKey(`user:${sessionId}:incoming_friend_requests`)
        )

        function FriendRequestHandler({ senderId, senderEmail }: IncomingFriendRequest) {
            setFriendRequests((prev) => [...prev, { senderId, senderEmail }])
        }

        pusherClient.bind('incoming_friend_requests', FriendRequestHandler)

        return () => {
            pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:incoming_friend_requests`))
            pusherClient.unbind('incoming_friend_requests', FriendRequestHandler)
        }
    }, [])

    async function acceptFriend(senderId: string) {
        await axios.post('/api/friends/accept', { id: senderId })

        setFriendRequests((prev) =>
            prev.filter((request) => request.senderId !== senderId)
        )

        router.refresh()
    }

    async function denyFriend(senderId: string) {
        await axios.post('/api/friends/deny', { id: senderId })

        setFriendRequests((prev) =>
            prev.filter((request) => request.senderId !== senderId)
        )

        router.refresh()
    }

    return (
        <>
            {FriendRequests.length === 0 ? (
                <p className="text-sm text-zinc-500">Nada para mostrar aqui...</p>
            ) : (
                FriendRequests.map((request) => (
                    <div
                        key={request.senderId}
                        className="flex items-center gap-4"
                    >
                        <UserPlus className="text-black" />

                        <p className="font-medium text-lg">
                            {request.senderEmail}
                        </p>

                        <button
                            onClick={() => acceptFriend(request.senderId)}
                            aria-label="aceitar amigo"
                            className="grid place-items-center rounded-full w-8 h-8 bg-indigo-600 hover:bg-indigo-700 hover:shadow-md transition"
                        >
                            <Check className="w-3/4 h-3/4 font-semibold text-white" />
                        </button>

                        <button
                            onClick={() => denyFriend(request.senderId)}
                            aria-label="rejeitar amigo"
                            className="grid place-items-center rounded-full w-8 h-8 bg-red-600 hover:bg-red-700 hover:shadow-md transition"
                        >
                            <X className="w-3/4 h-3/4 font-semibold text-white" />
                        </button>
                    </div>
                ))
            )}
        </>
    )
}