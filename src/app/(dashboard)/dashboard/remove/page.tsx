import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { notFound } from "next/navigation"
import getFriendsByUserId from "@/helpers/get-friends-by-user-id"
import RemoveFriendButton from "@/components/RemoveFriendButton"
import Image from "next/image"

export default async function remove() {
    const session = await getServerSession(authOptions)

    if (!session) notFound()

    const friends = await getFriendsByUserId(session.user.id)

    return (
        <main className="pt-8">
            <h2 className="font-bold text-5xl mb-8">Remover amigo</h2>

            <div className="flex flex-col gap-4">
                {friends.map((friend) => (
                    <div
                        key={friend.id}
                        className="flex justify-between max-w-xs p-2 rounded-md bg-zinc-50"
                    >
                        <div className="flex gap-2">
                            <div className="relative h-6 w-6">
                                <Image
                                    referrerPolicy="no-referrer"
                                    className="rounded-full"
                                    src={friend.image}
                                    alt={`Foto de perfil de ${friend.name}`}
                                    fill
                                />
                            </div>

                            <span className="font-semibold text-zinc-700">{friend.name}</span>
                        </div>

                        <RemoveFriendButton idToRemove={friend.id} />
                    </div>
                ))}
            </div>
        </main>
    )
}