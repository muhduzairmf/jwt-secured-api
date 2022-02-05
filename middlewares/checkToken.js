// checkToken.js is a middleware for validating access token from users
module.exports = (req, res, next) => {
    // Get the Authorization value from header
    const authHeader = req.header("Authorization");
    // Sperate type and token
    const [type, token] = authHeader.split(" ");

    if (type !== "Bearer" || !token) {
        res.status(401).json({ msg: "Token not found. Please provide a token." });
        return;
    }

    // Verify the given token in try catch
    try {
        jwt.verify(token, process.env.ACCESS_TOKEN);
    } catch (error) {
        res.status(403).json({ msg: "Invalid or expired token." });
        return;
    }

    // Continue to next step
    next();
};