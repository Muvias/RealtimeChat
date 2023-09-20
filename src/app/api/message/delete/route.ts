import { getServerSession } from "next-auth"

import { db } from "@/lib/db"
import { authOptions } from "@/lib/auth"
import { z } from "zod"
import { fetchRedis } from "@/helpers/redis"
import { pusherServer } from "@/lib/pusher"
import { toPusherKey } from "@/lib/utils"

export async function POST(req: Request) {
    try {
        const body = await req.json()

        const { chatId, messageId } = z.object({ chatId: z.string(), messageId: z.string() }).parse(body)

        const session = await getServerSession(authOptions)

        if (!session) return new Response('Unauthorized', { status: 401 })

        const [userId1, userId2] = chatId.split('--')

        if (session.user.id !== userId1 && session.user.id !== userId2) {
            return new Response('Unauthorized', { status: 401 })
        }

        const messages: string[] = await fetchRedis('zrange', `chat:${chatId}:messages`, 0, -1)

        const messageToRemove = messages.find((message) => {
            const messageContent: Message = JSON.parse(message)

            return messageContent.id === messageId
        })

        if (!messageToRemove) {
            return new Response('Mensagem não encontrada', { status: 404 })
        }

        await pusherServer.trigger(toPusherKey(`chat:${chatId}`), 'message-removal', messageId)

        await db.zrem(`chat:${chatId}:messages`, messageToRemove);

        return new Response('OK')
    } catch (error) {
        if (error instanceof Error) {
            return new Response(error.message, { status: 500 })
        }

        return new Response('Internal Server Error', { status: 500 })
    }
}