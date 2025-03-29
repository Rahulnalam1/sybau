import { NextApiRequest, NextApiResponse } from "next";
import { NextHandler } from "next-connect";
import { getServerSession } from "next-auth";
import { authOptions } from "../../app/api/auth/[...nextauth]/route";

export async function authMiddleware(
    req: NextApiRequest,
    res: NextApiResponse,
    next: NextHandler
) {
    const session = await getServerSession(req, res, authOptions);

    if (!session) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    // Add user to request for use in controllers
    (req as any).user = session.user;
    next();
}
