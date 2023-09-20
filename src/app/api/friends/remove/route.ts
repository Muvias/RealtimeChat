import { z } from "zod"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { fetchRedis } from "@/helpers/redis"
import { pusherServer } from "@/lib/pusher"
import { toPusherKey } from "@/lib/utils"

export async function POST(req: Request) {
    try {
        const body = await req.json()

        const { idToRemove } = z.object({ idToRemove: z.string() }).parse(body)

        const session = await getServerSession(authOptions)

        if (!session) {
            return new Response('Unauthorized', { status: 401 })
        }

        // Certificar que os usuários são amigos
        const isAlreadyFriends = await fetchRedis('sismember', `user:${session.user.id}:friends`, idToRemove)

        if (!isAlreadyFriends) {
            return new Response('Vocês não são amigos.', { status: 400 })
        }

        const [userRaw, friendRaw] = (await Promise.all([
            fetchRedis('get', `user:${session.user.id}`),
            fetchRedis('get', `user:${idToRemove}`)
        ])) as [string, string]

        const user = JSON.parse(userRaw) as User
        const friend = JSON.parse(friendRaw) as User

        await Promise.all([
            pusherServer.trigger(toPusherKey(`user:${idToRemove}:friends`), 'removed_friend', user),
            pusherServer.trigger(toPusherKey(`user:${session.user.id}:friends`), 'removed_friend', friend),
            db.srem(`user:${session.user.id}:friends`, idToRemove),
            db.srem(`user:${idToRemove}:friends`, session.user.id)
        ])

        return new Response('OK')
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new Response('Invalid request payload', { status: 422 })
        }

        return new Response('Invalid request', { status: 400 })
    }
}