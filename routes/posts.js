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

    res.json(allPosts);
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
        res.json({ msg: "Post not found." });
        return;
    }

    res.json(thePost);
});

// Protected route, for creating a new post
router.post("/", checkToken, async (req, res) => {});

// Protected route, for updating a post specified by id
router.patch("/:id", checkToken, async (req, res) => {});

// Protected route, for deleting a post specified by id
router.delete("/:id", checkToken, async (req, res) => {});

module.exports = router;
