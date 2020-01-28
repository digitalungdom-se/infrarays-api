declare module 'pdf-parse' {
    interface parseResult {
        numpages: number,
        numrender: number,
        text: string,
        info: object,
        metadata: object,
        version: string,
    }

    interface parseOptions {
        callback: Function
        max?: number,
        version?: string
    }

    function parse(buffer: Buffer, options?: parseOptions): Promise<parseResult>;
    export = parse;
}
