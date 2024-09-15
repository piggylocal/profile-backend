type VisitorLog = {
    ip: string;
    pathname: string;
    time: Date;
};

type User = {
    username: string;
    ciphertext: string;
}

export type {VisitorLog};
export type {User};
