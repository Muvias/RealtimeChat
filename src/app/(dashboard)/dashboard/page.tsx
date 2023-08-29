import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";

import Button from "@/components/ui/Button";

export default async function dashboard() {
    const session = await getServerSession(authOptions)

    return (
        <pre>{JSON.stringify(session)}</pre>
    )
}