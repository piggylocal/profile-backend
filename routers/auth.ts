import express from "express";
import {OAuth2Client, UserRefreshClient} from "google-auth-library";
import StatusCodes from "http-status-codes";
import passport from "passport";

import {createOAuthState, verifyOAuthState} from "../managers/jwt";
import {jwtAdmin} from "../managers/passport";
import MongoManager from "../managers/mongo";

const router = express.Router();
const googleClient = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    "postmessage"
);

// Generate a state for OAuth2.0.
router.get(
    '/state',
    passport.authenticate(jwtAdmin, {session: false, failWithError: true}),
    (req, res) => {
        const username = (req.user as any).username as string;
        const {origin} = req.query as { origin?: string };
        res.json({state: createOAuthState(username, origin)});
    }
);

// Verify the state for OAuth2.0.
router.post(
    '/state',
    passport.authenticate(jwtAdmin, {session: false, failWithError: true}),
    (req, res) => {
        const {state} = req.body;
        const username = (req.user as any).username as string;
        const decoded = verifyOAuthState(state);
        if (!decoded || decoded.username !== username) {
            return res.status(StatusCodes.UNAUTHORIZED).json({message: "Unauthorized"});
        }
        res.status(StatusCodes.OK).json({message: "Authorized"});
    }
);

router.post('/google', async (req, res) => {
    const {tokens} = await googleClient.getToken(req.body.code);
    res.json(tokens);
});

router.post('/google/refresh-token', async (req, res) => {
    const {refreshToken} = req.body;
    if (!refreshToken) {
        return res.status(StatusCodes.BAD_REQUEST).json({message: "Refresh token is required"});
    }
    const user = new UserRefreshClient(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        req.body.refreshToken,
    );
    const {credentials} = await user.refreshAccessToken();
    res.json(credentials);
})

router.put(
    '/imgur/credentials',
    passport.authenticate(jwtAdmin, {session: false, failWithError: true}),
    async (req, res, next) => {
        const {access_token, expires_in, refresh_token} = req.body;
        let expiresInInt = parseInt(expires_in);
        console.log(access_token)
        console.log(refresh_token)
        console.log(typeof access_token);
        console.log(expiresInInt)
        if (
            Number.isNaN(expiresInInt) ||
            expiresInInt <= 0 ||
            (typeof access_token !== "string") ||
            (typeof refresh_token !== "string")
        ) {
            return res.status(StatusCodes.BAD_REQUEST).json({message: "Invalid credentials"});
        }
        // Set the expiration time to 30 days at most because Imgur API says the token expires in a month.
        expiresInInt = Math.min(expiresInInt, 60 * 60 * 24 * 30);
        const expiryDate = new Date(Date.now() + expiresInInt * 1000);
        try {
            const ok = await MongoManager.updateImgurCredentials({
                accessToken: access_token,
                refreshToken: refresh_token,
                expiryDate
            });
            if (!ok) {
                return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message: "Failed to update Imgur credentials"});
            }
            res.status(StatusCodes.OK).json({message: "Imgur credentials updated"});
        } catch (err) {
            next(err);
        }
    }
);

export default router;