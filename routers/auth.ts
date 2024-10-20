import express from "express";
import {OAuth2Client} from "google-auth-library";

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

export default router;