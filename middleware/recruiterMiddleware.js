const recruiterMiddleware = (req, res, next) => {

    if (req.user.role !== "recruiter") {
        return res.status(403).json({
            message: "Access denied. Recruiters only."
        });
    }

    next();
};

module.exports = recruiterMiddleware;