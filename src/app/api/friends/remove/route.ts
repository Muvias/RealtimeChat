import { z } from "zod"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { fetchRedis } from "@/helpers/redis"

export async function POST(req: Request) {
    try {
        const body = await req.json()

        const { idToRemove } = z.object({ idToRemove: z.string() }).parse(body)

        const session = await getServerSession(authOptions)

        if (!session) {
            return new Response('Unauthorized', { status: 401 })
        }

        // Verificar se os usuários ainda não são amigos
        const isAlreadyFriends = await fetchRedis('sismember', `user:${session.user.id}:friends`, idToRemove)

        if (!isAlreadyFriends) {
            return new Response('Vocês não são amigos.', { status: 400 })
        }

        await Promise.all([
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