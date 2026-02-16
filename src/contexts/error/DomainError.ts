export type DomainErrorFields = Record<string, string[]>;

export abstract class DomainError extends Error {
    public readonly code: string;
    public readonly statusCode: number;
    public readonly fields?: DomainErrorFields;
    public readonly details?: Record<string, any>;

    constructor(params: {
        message: string;
        code: string;
        statusCode?: number;
        fields?: DomainErrorFields;
        details?: Record<string, any>;
    }) {
        super(params.message);
        this.name = this.constructor.name;
        this.code = params.code;
        this.statusCode = params.statusCode || 400;
        this.fields = params.fields;
        this.details = params.details;
        Error.captureStackTrace(this, this.constructor);
    }
}
