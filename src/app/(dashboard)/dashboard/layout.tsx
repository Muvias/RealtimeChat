import { ReactNode } from "react";

import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { fetchRedis } from "@/helpers/redis";

import SignOutButton from "@/components/SignOutButton";
import FriendRequestsSidebarOptions from "@/components/FriendRequestsSidebarOptions";
import getFriendsByUserId from "@/helpers/get-friends-by-user-id";
import SidebarChatList from "@/components/SidebarChatList";
import MobileChatLayout from "@/components/MobileChatLayout";

import logo from '@/../public/logo.png'
import { Icons } from "@/components/icons/Icons";
import { SidebarOption } from "@/types/typings";

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

    const friends = await getFriendsByUserId(session.user.id)

    const unseenRequestCount = (await fetchRedis('smembers', `user:${session.user.id}:incoming_friend_requests`) as User[]).length

    return (
        <div className="w-full flex h-screen">
            <div className="md:hidden">
                <MobileChatLayout
                    session={session}
                    friends={friends}
                    unseenRequestCount={unseenRequestCount}
                    sidebarOptions={siderbarOptions}
                />
            </div>
            <div className="hidden md:flex flex-col grow max-w-xs w-full h-full px-6 gap-y-5 overflow-y-auto border-r border-gray-200 bg-white">
                <Link href='/dashboard' className="flex h-16 mt-2 shrink-0">
                    <Image src={logo} alt='Real Time Chat logo' className="h-16 w-auto text-indigo-600 hover:scale-105 transition-all" />
                </Link>

                {friends.length > 0 ? (
                    <div className="text-xs font-semibold leading-6 text-gray-400">
                        Seus chats
                    </div>
                ) : null}

                <nav className="flex flex-1 flex-col">
                    <ul role="list" className="flex flex-1 flex-col gap-y-7">
                        <li>
                            <SidebarChatList
                                sessionId={session.user.id}
                                friends={friends}
                            />
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
                                            <Link href={option.href} className="flex p-2 gap-3 rounded-md text-sm leading-6 font-semibold text-gray-700 hover:text-indigo-600 hover:bg-gray-50 group">
                                                <span className="flex items-center justify-center h-6 w-6 shrink-0 rounded-lg border text-[0.625rem] font-medium text-gray-400 bg-white border-gray-200 group-hover:border-indigo-600 group-hover:text-indigo-600 transition-colors">
                                                    <Icon className="h-4 w-4" />
                                                </span>

                                                <span className="truncate">{option.name}</span>
                                            </Link>
                                        </li>
                                    )
                                })}

                                <li>
                                    <FriendRequestsSidebarOptions
                                        sessionId={session.user.id}
                                        initialUnseenRequestCount={unseenRequestCount}
                                    />
                                </li>
                            </ul>
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

            <aside className="max-h-screen container py-16 md:py-12 w-full">
                {children}
            </aside>
        </div>
    )
}