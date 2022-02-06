// Import express router
const router = require("express").Router();

// Import Prisma Client for JavaScript
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Import checkToken middleware
const checkToken = require("../middlewares/checkToken");

// Public route, for getting all posts
router.get("/", async (req, res) => {
    const allPosts = await prisma.post.findMany();

    res.status(200).json(allPosts);
});

// Public route, for getting a post specified by id
router.get("/:id", async (req, res) => {
    const { id } = req.params;

    const thePost = await prisma.post.findUnique({
        where: {
            id,
        },
    });

    if (!thePost) {
        res.status(400).json({ msg: "Post not found." });
        return;
    }

    res.status(200).json(thePost);
});

// Protected route, for creating a new post
router.post("/", checkToken, async (req, res) => {
    const { title, content, authorId } = req.body;

    const newPost = await prisma.post.create({
        data: {
            title,
            content,
            authorId: parseInt(authorId),
        },
    });

    res.status(200).json({ msg: "Post successfully created.", newPost });
});

// Protected route, for updating title post specified by id
router.patch("/:id/title", checkToken, async (req, res) => {
    const { id } = req.params;
    const { title } = req.body;

    const updatedPost = await prisma.post.update({
        where: {
            id: parseInt(id),
        },
        data: {
            title,
        },
    });

    if (!updatedPost) {
        res.status(400).json({ msg: "Post not found." });
        return;
    }

    res.status(200).json({
        msg: "Title post successfully updated.",
        updatedPost,
    });
});

// Protected route, for updating content post specified by id
router.patch("/:id/content", checkToken, async (req, res) => {
    const { id } = req.params;
    const { content } = req.body;

    const updatedPost = await prisma.post.update({
        where: {
            id: parseInt(id),
        },
        data: {
            content,
        },
    });

    if (!updatedPost) {
        res.status(400).json({ msg: "Post not found." });
        return;
    }

    res.status(200).json({
        msg: "Content post successfully updated.",
        updatedPost,
    });
});

// Protected route, for deleting a post specified by id
router.delete("/:id", checkToken, async (req, res) => {
    const { id } = req.params;

    const deletedPost = await prisma.post.delete({
        where: {
            id: parseInt(id),
        },
    });

    if (!deletedPost) {
        res.status(400).json({ msg: "Post not found." });
        return;
    }

    const allPosts = await prisma.post.findMany();

    res.status(200).json({ msg: "Post successfully deleted.", allPosts });
});

module.exports = router;
