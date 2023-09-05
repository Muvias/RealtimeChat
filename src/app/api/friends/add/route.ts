import { getServerSession } from "next-auth"

import { z } from "zod"

import { fetchRedis } from "@/helpers/redis"

import { db } from "@/lib/db"
import { authOptions } from "@/lib/auth"
import { addFriendValidator } from "@/lib/validations/add-friend"
import { pusherServer } from "@/lib/pusher"
import { toPusherKey } from "@/lib/utils"

export async function POST(req: Request) {
    try {
        const body = await req.json()

        const { email: emailToAdd } = addFriendValidator.parse(body.email)

        const idToAdd = await fetchRedis('get', `user:email:${emailToAdd}`) as string

        if (!idToAdd) {
            return new Response('Esta pessoa não existe.', { status: 400 })
        }

        const session = await getServerSession(authOptions)

        if (!session) {
            return new Response('Unauthorized', { status: 401 })
        }

        if (idToAdd === session.user.id) {
            return new Response('Você não pode adicionar você mesmo', { status: 400 })
        }

        // Checar se já foi enviada a solicitação de amizade
        const isAlreadyAdded = (await fetchRedis('sismember', `user:${idToAdd}:incoming_friend_requests`, session.user.id)) as 0 | 1
        const PendingRequest = (await fetchRedis('sismember', `user:${session.user.id}:incoming_friend_requests`, idToAdd)) as 0 | 1

        if (isAlreadyAdded) {
            return new Response('A solicitação já foi enviada para este usuário.', { status: 400 })
        }

        if (PendingRequest) {
            return new Response('Você tem uma solicitação de amizade pendente deste usuário.', { status: 400 })
        }

        // Checar se o usuário já está adicionado
        const isAlreadyFriends = (await fetchRedis('sismember', `user:${session.user.id}:friends`, idToAdd)) as 0 | 1

        if (isAlreadyFriends) {
            return new Response('Este usuário já está adicionado.', { status: 400 })
        }

        await pusherServer.trigger(
            toPusherKey(`user:${idToAdd}:incoming_friend_requests`),
            'incoming_friend_requests',
            {
                senderId: session.user.id,
                senderEmail: session.user.email,
            }
        )

        // Envia a solicitação de amizade
        db.sadd(`user:${idToAdd}:incoming_friend_requests`, session.user.id)

        return new Response('OK')
    } catch (error) {
        if(error instanceof z.ZodError) {
            throw new Response('Invalid Request payload', { status: 422 })
        }

        return new Response('Invalid Request', { status: 400 })
    }
}