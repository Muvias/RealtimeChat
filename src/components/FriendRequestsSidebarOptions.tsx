'use client'

import Link from "next/link";

import { useState } from "react";

import { User } from "lucide-react";

interface FriendRequestsSidebarOptionsProps {
    sessionId: string
    initialUnseenRequestCount: number
}

export default function FriendRequestsSidebarOptions({ sessionId, initialUnseenRequestCount }: FriendRequestsSidebarOptionsProps) {
    const [unseenRequestCount, setUnseenRequestCount] = useState<number>(initialUnseenRequestCount)

    return (
        <Link href='/dashboard/requests' className="flex items-center py-2 gap-x-3 rounded-md text-sm font-semibold leading-6 text-gray-700 hover:text-indigo-600 hover:bg-gray-50 group">
            <div className="flex items-center justify-center h-6 w-6 border rounded-lg shrink-0 text-[0.625rem] font-medium text-gray-400 bg-white border-gray-200 group-hover:border-indigo-600 group-hover:text-indigo-600">
                <User className="h-4 w-4" />
            </div>

            <p className="truncate">Solicitações de amizade</p>

            {unseenRequestCount > 0 ? (
                <div className="flex justify-center items-center rounded-full w-5 h-5 text-xs text-white bg-indigo-600">
                    {unseenRequestCount}
                </div>
            ) : null}
        </Link>
    )
}