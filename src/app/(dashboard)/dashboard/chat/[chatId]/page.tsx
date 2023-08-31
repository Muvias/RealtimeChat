import { fetchRedis } from "@/helpers/redis"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { messageArrayValidator } from "@/lib/validations/message"
import { getServerSession } from "next-auth"
import { notFound } from "next/navigation"

interface ChatProps {
    params: {
        chatId: string
    }
}

async function getChatMessages(chatId: string) {
    try {
        const results: string[] = await fetchRedis('zrange', `chat:${chatId}:messages`, 0, -1)

        const dbMessages = results.map((message) => JSON.parse(message) as Message)
        const reverseDbMessages = dbMessages.reverse()

        const messages = messageArrayValidator.parse(reverseDbMessages)

        return messages
    } catch (error) {
        return notFound()
    }
}

export default async function chat({ params }: ChatProps) {
    const { chatId } = params

    const session = await getServerSession(authOptions)
    if (!session) notFound()

    const { user } = session

    const [userId1, userId2] = chatId.split('--')

    if (user.id !== userId1 && user.id !== userId2) notFound()

    const chatPartnerId = user.id === userId1 ? userId2 : userId1
    const chatPartner = (await db.get(`user:${chatPartnerId}`)) as User

    // const initialMessages = await getChatMessages(chatId)

    return (
        <div>{params.chatId}</div>
    )
}