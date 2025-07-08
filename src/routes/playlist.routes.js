import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import { addVideoToPlayList, createPlayList, deletePlayList, getPlaylistById, getUserPlayLists, removeVideoFromPlayList, updatePlayList } from "../controllers/playList.controller";

const router = Router()
router.use(verifyJWT)// will apply the verifyJWT to every route

router.route("/").post(createPlayList)
router
    .route("/:playListId")
    .get(getPlaylistById)
    .patch(updatePlayList)
    .delete(deletePlayList)

router.route("/add/:videoId/:playListId").patch(addVideoToPlayList)
router.route("/remove/:videoId/:playListId").patch(removeVideoFromPlayList)

router.route("/user/:userId").get(getUserPlayLists)

export default router
