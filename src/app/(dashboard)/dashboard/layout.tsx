import { ReactNode } from "react";

import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { fetchRedis } from "@/helpers/redis";

import { Icon, Icons } from "@/components/icons/Icons";
import SignOutButton from "@/components/SignOutButton";
import FriendRequestsSidebarOptions from "@/components/FriendRequestsSidebarOptions";

interface SidebarOption {
    id: number
    name: string
    href: string
    Icon: Icon
}

const siderbarOptions: SidebarOption[] = [
    {
        id: 1,
        name: 'Adicionar amigo',
        href: '/dashboard/add',
        Icon: 'UserPlus'
    }
]

export default async function DashboardLayout({ children }: { children: ReactNode }) {
    const session = await getServerSession(authOptions)

    if (!session) notFound()

    const unseenRequestCount = (await fetchRedis('smembers', `user:${session.user.id}:incoming_friend_requests`) as User[]).length

    return (
        <div className="w-full flex h-screen">
            <div className="flex flex-col grow max-w-xs w-full h-full px-6 gap-y-5 overflow-y-auto border-r border-gray-200 bg-white">
                <Link href='/dashboard' className="flex items-center h-16 shrink-0">
                    <Icons.Logo className="h-8 w-auto text-indigo-600" />
                </Link>

                <div className="text-xs font-semibold leading-6 text-gray-400">Seus chats</div>

                <nav className="flex flex-1 flex-col">
                    <ul role="list" className="flex flex-1 flex-col gap-y-7">
                        <li>
                            chats
                        </li>
                        <li>
                            <div className="text-xs font-semibold leading-6 text-gray-400">
                                Visão geral
                            </div>

                            <ul role="list" className="-mx-2 mt-2 space-y-1">
                                {siderbarOptions.map((option) => {
                                    const Icon = Icons[option.Icon]

                                    return (
                                        <li key={option.id}>
                                            <Link href={option.href} className="flex py-2 gap-3 rounded-md text-sm leading-6 font-semibold text-gray-700 hover:text-indigo-600 hover:bg-gray-50 group">
                                                <span className="flex items-center justify-center h-6 w-6 shrink-0 rounded-lg border text-[0.625rem] font-medium text-gray-400 bg-white border-gray-200 group-hover:border-indigo-600 group-hover:text-indigo-600 transition-colors">
                                                    <Icon className="h-4 w-4" />
                                                </span>

                                                <span className="truncate">{option.name}</span>
                                            </Link>
                                        </li>
                                    )
                                })}
                            </ul>
                        </li>

                        <li>
                            <FriendRequestsSidebarOptions
                                sessionId={session.user.id}
                                initialUnseenRequestCount={unseenRequestCount}
                            />
                        </li>

                        <li className="flex items-center -mx-6 mt-auto">
                            <div className="flex flex-1 items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-gray-900">
                                <div className="relative h-8 w-8 bg-gray-50">
                                    <Image
                                        src={session.user.image || ''}
                                        alt="Sua foto de perfil"
                                        fill
                                        referrerPolicy="no-referrer"
                                        className="rounded-full"
                                    />
                                </div>

                                <span className="sr-only">
                                    Seu perfil
                                </span>

                                <div className="flex flex-col">
                                    <span aria-hidden='true'>
                                        {session.user.name}
                                    </span>

                                    <span className="text-xs text-zinc-400" aria-hidden='true'>
                                        {session.user.email}
                                    </span>
                                </div>
                            </div>

                            <SignOutButton className='h-full aspect-square' />
                        </li>
                    </ul>
                </nav>
            </div>

            {children}
        </div>
    )
}