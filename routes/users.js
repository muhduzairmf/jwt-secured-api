// Import express router
const router = require("express").Router();

// Import Prisma Client for JavaScript
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Import checkToken middleware
const checkToken = require("../middlewares/checkToken");

// Import checking validation and get validation result from express validator
const { check, validationResult } = require("express-validator");

// Import crypto modules to hash and salt a password, used changing password
const { scryptSync, randomBytes, timingSafeEqual } = require("crypto");

// Public route, for all users, only user's name
router.get("/", async (req, res) => {
    const allUsers = await prisma.user.findMany({
        select: {
            id: false,
            email: true,
            name: true,
            password: false,
            post: true,
        },
    });

    res.status(200).json(allUsers);
});

// Public route, for getting a user specified by id
router.get("/:id", async (req, res) => {
    const { id } = req.params;

    const theUser = await prisma.user.findUnique({
        where: {
            id: parseInt(id),
        },
        select: {
            id: true,
            email: false,
            name: true,
            password: false,
            post: true,
        },
    });

    if (!theUser) {
        res.status(400).json({ msg: "User not found" });
        return;
    }

    res.status(200).json(theUser);
});

// Protected route, update user's email specified by id
router.patch(
    "/:id/email",
    checkToken,
    // Use express-validator to validate email
    [check("email", "Please provide a valid email.").isEmail()],
    async (req, res) => {
        // Receive errors from express-validator if any
        let errors = validationResult(req);

        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }

        const { id } = req.params;
        const { email } = req.body;

        // Get all users
        const allUsers = await prisma.user.findMany();
        // Get other users that not with this id from request body
        const otherUsers = allUsers.filter((user) => user.id !== parseInt(id));
        // Find the user with the same email from request body
        const validateEmail = otherUsers.find((user) => user.email === email);

        if (validateEmail) {
            res.status(400).json({
                msg: "The email has been used. Please provide another email.",
            });
        }

        const updatedUser = await prisma.user.update({
            where: {
                id: parseInt(id),
            },
            data: {
                email,
            },
        });

        res.status(200).json({
            msg: "Email successfully updated.",
            user: { email: updatedUser.email },
        });
    }
);

// Protected route, update user's name specified by id
router.patch(
    "/:id/name",
    checkToken,
    [
        // Use express-validator to validate name
        check(
            "name",
            "Name must be more than one character and less than 50 characters"
        ).isLength({ min: 2, max: 50 }),
    ],
    async (req, res) => {
        // Receive errors from express-validator if any
        let errors = validationResult(req);

        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }

        const { id } = req.params;
        const { name } = req.body;

        const updatedUser = await prisma.user.update({
            where: {
                id: parseInt(id),
            },
            data: {
                name,
            },
        });

        res.status(200).json({
            msg: "Name successfully updated.",
            user: { name: updatedUser.name },
        });
    }
);

// Protected route, update user's password specified by id
router.patch(
    "/:id/password",
    checkToken,
    [
        // Use express-validator to validate password
        check("password", "Password must be more than 5 characters.").isLength({
            min: 6,
        }),
    ],
    async (req, res) => {
        // Receive errors from express-validator if any
        let errors = validationResult(req);

        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }

        const { id } = req.params;
        const { currentPassword, newPassword } = req.body;

        const theUser = await prisma.user.findUnique({
            where: {
                id: parseInt(id),
            },
        });

        if (!theUser) {
            res.status(400).json({ msg: "User not found" });
            return;
        }

        // Destructure current salt and hashed password from database
        const [currentSalt, key] = theUser.password.split(":");
        // Hash the password from request body with the original salt
        const hashedBuffer = scryptSync(currentPassword, currentSalt, 64);

        // Convert the hashed password from database to base64url
        const keyBuffer = Buffer.from(key, "base64url");
        // Matching the hashed password from request body and from database
        // timingSafeEqual function is a function for comparing two values,
        // but it will also prevent the timing attack from the hackers.
        const isMatch = timingSafeEqual(hashedBuffer, keyBuffer);

        if (!isMatch) {
            res.status(400).json({
                msg: "Invalid password. Please provide correct password.",
            });
            return;
        }

        // Generate a new salt, random bytes that will mix with hashed password
        const newSalt = randomBytes(16).toString("base64url");
        // Hash the new password, and mix it with the new salt
        const hashedNewPassword = scryptSync(newPassword, newSalt, 64).toString(
            "base64url"
        );

        const updatedUser = await prisma.user.update({
            where: {
                id: parseInt(id),
            },
            data: {
                password: `${newSalt}:${hashedNewPassword}`,
            },
        });

        res.status(200).json({
            msg: "Password successfully updated",
            user: {
                id: updatedUser.id,
                email: updatedUser.email,
                name: updatedUser.name,
            },
        });
    }
);

// Protected route, delete a user specified by id
router.delete("/:id", checkToken, async (req, res) => {
    const { id } = req.params;

    const deletedUser = await prisma.user.delete({
        where: {
            id: parseInt(id),
        },
    });

    if (!deletedUser) {
        res.status(400).json({ msg: "User not found" });
        return;
    }

    const allUsers = await prisma.user.findMany({
        select: {
            id: false,
            email: true,
            name: true,
            password: false,
            post: true,
        },
    });

    res.status(200).json({ msg: "User successfully deleted", allUsers });
});

module.exports = router;
