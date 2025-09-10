import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/authOptions";
import { prisma } from "../../lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return new Response(JSON.stringify({ user: null }), { status: 200 });
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true, email: true, name: true, stripeCustomerId: true,
      subscription: { select: { plan: true, status: true, currentPeriodEnd: true, stripeSubscriptionId: true } },
    },
  });
  return new Response(JSON.stringify({ user }), { status: 200, headers: { "Content-Type": "application/json" } });
}

