import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";

import { authOptions } from "@/lib/auth";
import getFriendsByUserId from "@/helpers/get-friends-by-user-id";
import { fetchRedis } from "@/helpers/redis";
import { chatHrefConstructor } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default async function dashboard() {
    const session = await getServerSession(authOptions)

    if (!session) notFound()

    const friends = await getFriendsByUserId(session.user.id)
    const friendsWithLastMessage = await Promise.all(
        friends.map(async (friend) => {
            const [lastMessageRaw] = (await fetchRedis('zrange', `chat:${chatHrefConstructor(session.user.id, friend.id)}:messages`, -1, -1)) as string[]
            const lastMessage = JSON.parse(lastMessageRaw) as Message

            return {
                ...friend,
                lastMessage
            }
        })
    )

    return (
        <div className="container py-12">
            <h1 className="font-bold text-5xl mb-8">Chats recentes</h1>

            {friendsWithLastMessage.length === 0 ? (
                <p className="text-sm text-zinc-500">Nada para ver aqui...</p>
            ) : friendsWithLastMessage.map((friend) => (
                <div
                    key={friend.id}
                    className="relative p-3 rounded-md bg-zinc-50 border-zinc-200 hover:bg-zinc-100 transition-colors"
                >
                    <div className="absolute flex items-center right-4 inset-y-0">
                        <ChevronRight className="h-7 w-7 text-zinc-400" />
                    </div>

                    <Link
                        href={`/dashboard/chat/${chatHrefConstructor(session.user.id, friend.id)}`}
                        className="relative sm:flex"
                    >
                        <div className="mb-4 sm:mb-0 sm:mr-4 flex-shrink-0">
                            <div className="relative h-6 w-6">
                                <Image
                                    referrerPolicy="no-referrer"
                                    className="rounded-full"
                                    src={friend.image}
                                    alt={`Foto de perfil de ${friend.name}`}
                                    fill
                                />
                            </div>
                        </div>

                        <div>
                            <h4 className="text-lg font-semibold">
                                {friend.name}
                            </h4>

                            <p className="mt-1 max-w-md">
                                <span className="text-zinc-400">
                                    {friend.lastMessage.senderId === session.user.id ? 'Você: ' : ''}
                                </span>

                                {friend.lastMessage.text}
                            </p>

                        </div>
                    </Link>
                </div>
            ))
            }
        </div>
    )
}