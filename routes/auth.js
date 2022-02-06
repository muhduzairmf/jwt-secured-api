// Import express router
const router = require("express").Router();

// Import checking validation and get validation result from express validator
const { check, validationResult } = require("express-validator");

// Import Prisma Client for JavaScript
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Import crypto modules to hash and salt a password, used for signup and login
const { scryptSync, randomBytes, timingSafeEqual } = require("crypto");

// Import JWT library for sign and verify token
const jwt = require("jsonwebtoken");

// A route for signing up as a new user
router.post(
    "/signup",
    [
        // Use express-validator to validate email, name and password
        check("email", "Please provide a valid email.").isEmail(),
        check(
            "name",
            "Name must be more than one character and less than 50 characters"
        ).isLength({ min: 2, max: 50 }),
        check("password", "Password must be more than 5 characters.").isLength({
            min: 6,
        }),
    ],
    async (req, res) => {
        const { email, name, password } = req.body;

        // Receive errors from express-validator if any
        let errors = validationResult(req);

        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }

        const checkUserEmail = await prisma.user.findUnique({
            where: {
                email,
            },
        });

        if (checkUserEmail) {
            res.status(400).json({
                msg: "The email has been used. Please provide another email.",
            });
            return;
        }

        // Generate a salt, random bytes that will mix with hashed password
        const salt = randomBytes(16).toString("base64url");
        // Hash the password, and mix it with the salt
        const hashedPassword = scryptSync(password, salt, 64).toString(
            "base64url"
        );

        const newUser = await prisma.user.create({
            data: {
                email,
                name,
                // Store the password with the original salt and hashed password
                password: `${salt}:${hashedPassword}`,
            },
        });

        // Create an access token, it will use by user for authorization
        const accessToken = jwt.sign(newUser, process.env.ACCESS_TOKEN);

        res.status(200).json({ msg: "Successfully signed up.", accessToken });
    }
);

// A route for logging in as a existing user
router.post(
    "/login",
    // Use express-validator to validate email
    [check("email", "Please provide a valid email.").isEmail()],
    async (req, res) => {
        const { email, password } = req.body;

        // Receive errors from express-validator if any
        let errors = validationResult(req);

        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }

        const checkUser = await prisma.user.findUnique({
            where: {
                email,
            },
        });

        if (!checkUser) {
            res.status(400).json({
                msg: "Email not found. Please provide a valid email.",
            });
            return;
        }

        // Destructure salt and hashed password from database
        const [salt, key] = checkUser.password.split(":");
        // Hash the password from login with the original salt
        const hashedBuffer = scryptSync(password, salt, 64);

        // Convert the hashed password from database to base64url
        const keyBuffer = Buffer.from(key, "base64url");
        // Matching the hashed password from login and from database
        // timingSafeEqual function is a function for comparing two values,
        // but it will also prevent the timing attack from the hackers.
        const isMatch = timingSafeEqual(hashedBuffer, keyBuffer);

        if (!isMatch) {
            res.status(400).json({
                msg: "Invalid password. Please provide correct password.",
            });
            return;
        }

        // Create an access token, it will use by user for authorization
        const accessToken = jwt.sign(checkUser, process.env.ACCESS_TOKEN);

        res.status(200).json({ msg: "Successfully logged in.", accessToken });
    }
);

module.exports = router;
