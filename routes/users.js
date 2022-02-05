// Import express router
const router = require("express").Router();

// Import Prisma Client for JavaScript
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Import checkToken middleware
const checkToken = require("../middlewares/checkToken");

// Public route, for all users, only user's name
router.get("/", async (req, res) => {
    const allUsers = await prisma.user.findMany({
        select: {
            id: false,
            email: false,
            name: true,
            password: false,
        },
        include: {
            post,
        },
    });

    res.json(allUsers);
});

// Public route, for getting a user specified by id
router.get("/:id", async (req, res) => {
    const { id } = req.params;

    const theUser = await prisma.user.findUnique({
        where: {
            id,
        },
    });

    if (!theUser) {
        res.json({ msg: "User not found" });
        return;
    }

    res.json(theUser);
});


// Protected route, update a user profile specified by id
router.patch("/:id", checkToken, async (req, res) => {});

// Protected route, delete a user specified by id
router.delete("/:id", checkToken, async (req, res) => {});

module.exports = router;
