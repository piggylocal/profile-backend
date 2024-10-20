import express from "express";
import {OAuth2Client, UserRefreshClient} from "google-auth-library";
import StatusCodes from "http-status-codes";

const router = express.Router();
const googleClient = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    "postmessage"
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

export default router;