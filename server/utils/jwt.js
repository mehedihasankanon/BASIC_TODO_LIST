
{ /**
    this file contains utility functions for generating and verifying JWT tokens.
*/ }

import dotenv from 'dotenv';
dotenv.config();

const jwt_key = process.env.JWT_SECRET_KEY;
const jwt_expiration = process.env.JWT_EXPIRATION_TIME || '6h';

const jwt = require('jsonwebtoken');

const generateJwtToken = (userId, email) => {
    return (
        jwt.sign(
            {
                userId: userId,
                email: email
            },
            jwt_key,
            { expiresIn: jwt_expiration }
        )
    );
}


const verifyJwtToken = (token) => {
    try {
        const decoded = jwt.verify(token, jwt_key);
        return decoded;
    } catch (err) {
        console.error("JWT verification failed:", err);
        return null;
    }
}

const generateRefreshToken = (userId, email) => {
    return jwt.sign (
        { userId: userId, email: email },
        jwt_key,
        { expiresIn: '7d' }
    );
}


const verifyRefreshToken = (token) => {
    try {
        const decoded = jwt.verify(token, jwt_key);
        return decoded;
    } catch (err) {
        console.error("Refresh token verification failed:", err);
        return null;
    }
}



export { generateJwtToken, verifyJwtToken, generateRefreshToken, verifyRefreshToken };

