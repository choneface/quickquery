export interface HeadlessConfig {
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
    query: string;
}
export declare function runHeadless(config: HeadlessConfig): Promise<void>;
