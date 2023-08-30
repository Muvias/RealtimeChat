import { fetchRedis } from "@/helpers/redis"
import { authOptions } from "@/lib/auth"
import { getServerSession } from "next-auth"
import { notFound } from "next/navigation"

export default async function requests() {
    const session = await getServerSession(authOptions)

    if (!session) notFound()

    const incomingSenderIds = (await fetchRedis('smembers', `user:${session.user.email}:incoming_friend_requests`)) as string[]

    const incomingFriendRequests = await Promise.all(
        incomingSenderIds.map(async (senderId) => {
            const sender = await fetchRedis('get', `user:${senderId}`) as User
            return {
                senderId,
                senderEmaail: sender.email,
            }
        })
    )

    return (
        <main className="pt-8">
            <h2 className="font-bold text-5xl mb-8">Adicionar amigo</h2>

            <div className="flex flex-col gap-4">
                
            </div>
        </main>
    )
}