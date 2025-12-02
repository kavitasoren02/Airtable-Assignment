import crypto from "crypto"

export const hashPassword = (password) => {
    return crypto.pbkdf2Sync(password, "salt", 1000, 64, "sha512").toString("hex")
}

export const verifyPassword = (password, hash) => {
    return hashPassword(password) === hash
}
