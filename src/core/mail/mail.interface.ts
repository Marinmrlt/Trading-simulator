export interface ISmtpConfig {
    host: string;
    port: number;
    secure: boolean;
    auth: {
        user: string;
        pass: string;
    };
    from: string;
}

export interface IMailOptions {
    to: string | string[];
    subject: string;
    text?: string;
    html?: string;
    from?: string; // Optional override
}
