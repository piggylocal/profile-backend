import bcrypt from "bcrypt";

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS as string);
const hashPasswordSync = (password: string): string => {
    return bcrypt.hashSync(password, SALT_ROUNDS);
}

export {hashPasswordSync};