declare module "oauth-1.0a" {
    export interface OAuthOptions {
        consumer: {
            key: string;
            secret: string;
        };
        signature_method: string;
        hash_function: (base_string: string, key: string) => string;
    }

    export interface RequestData {
        url: string;
        method: string;
        data?: any;
    }

    export interface Token {
        key: string;
        secret: string;
    }

    export default class OAuth {
        constructor(options: OAuthOptions);
        authorize(request: RequestData, token?: Token): Record<string, string>;
        toHeader(authorization: Record<string, string>): {
            Authorization: string;
        };
    }
}
