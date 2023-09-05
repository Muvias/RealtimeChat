import { Toast, toast } from "react-hot-toast"
import { chatHrefConstructor, cn } from "@/lib/utils"
import Image from "next/image"

interface UnseenChatToastProps {
    t: Toast
    sessionId: string
    senderId: string
    senderImg: string
    senderName: string
    senderMessage: string
}

export default function UnseenChatToast({ t, sessionId, senderId, senderImg, senderName, senderMessage }: UnseenChatToastProps) {
    return (
        <div className={cn('max-w-md w-full flex shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 bg-white hover:bg-zinc-50 transition-colors', {
            'animate-enter': t.visible,
            'animate-leave': !t.visible,
        })}>
            <a
                href={`/dashboard/chat/${chatHrefConstructor(sessionId, senderId)}`}
                onClick={() => { toast.dismiss(t.id) }}
                className="flex-1 w-0 p-4"
            >
                <div className="flex items-start">
                    <div className="flex-shrink-0 pt-0.5">
                        <div className="relative h-10 w-10">
                            <Image
                                fill
                                referrerPolicy="no-referrer"
                                src={senderImg}
                                alt={`Foto de perfil de ${senderName}`}
                                className="rounded-full"
                            />
                        </div>
                    </div>

                    <div className="ml-3 flex-1">
                        <p className="text-sm font-medium text-gray-900">
                            {senderName}
                        </p>

                        <p className="text-sm mt-1 text-gray-500">
                            {senderMessage}
                        </p>
                    </div>
                </div>
            </a>

            <div className="flex border-l border-gray-200">
                <button
                    onClick={() => toast.dismiss(t.id)}
                    className="flex items-center justify-center w-full p-4 border border-transparent rounded-none rounded-r-lg text-sm font-medium text-indigo-600 hover:text-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                >
                    Close
                </button>
            </div>
        </div>
    )
}