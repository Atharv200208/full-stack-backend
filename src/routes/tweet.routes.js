import { Router } from "express";
import { verifyJWT }from "../middlewares/auth.middleware.js"
import { 
    createTweet, 
    deleteUserTweet, 
    getUserTweet, 
    updateUserTweet 
} from "../controllers/tweet.controller.js";

const router = Router()
router.use(verifyJWT)

router.route("/").post(createTweet)
router.route("/user/:userId").get(getUserTweet)
router.route("/:tweetId")
    .patch(updateUserTweet)
    .delete(deleteUserTweet)

export default router