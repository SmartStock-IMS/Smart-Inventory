const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'thee_kade';

const authMiddleware = (allowedRoles = []) => {
    return async (req, res, next) => {
        try {
            const authHeader = req.headers['authorization'];
            const token = authHeader && authHeader.split(' ')[1];

            if (!token) {
                return res.status(401).json({ message: 'No token provided' });
            }

            const decodedToken = jwt.verify(token, JWT_SECRET);

            let userRoles = decodedToken.role || decodedToken.roles || [];
            if (!Array.isArray(userRoles)) userRoles = [userRoles];

            const requiredRoles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
            if (requiredRoles.length > 0) {
                const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));
                if (!hasRequiredRole) {
                    return res.status(403).json({
                        message: 'Insufficient permissions. Required roles: ' + requiredRoles.join(', ')
                    });
                }
            }

            req.user = {
                username: decodedToken.username,
                roles: userRoles
            };

            next();
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Token expired' });
            }
            if (error.name === 'JsonWebTokenError') {
                return res.status(403).json({ message: 'Invalid token' });
            }
            return res.status(500).json({ message: 'Internal server error' });
        }
    };
};

module.exports = authMiddleware;
