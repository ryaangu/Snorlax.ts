/** HTTP Methods */
export enum Method
{
    GET = "GET",
}

/** HTTP Versions */
export enum Version
{
    Default = "HTTP/1.1",
}

/** Status Code */
export enum StatusCode
{
    OK = "200 OK",
}

// <HTTP version> <status code>
// HTTP/1.1 200 OK
interface IResponseHead
{
    version : Version;
    status  : StatusCode;
}

// <method> <URI> <HTTP version>
// GET / HTTP/1.1
interface IHead
{
    method  : Method;
    uri     : string;
    version : Version;
}

// <key>: <value>
// Content-Type: text/html
interface IHeader
{
    key   : string;
    value : string;
}

/*
    <method> <URI> <HTTP version>
    <key>: <value>

    <body>

    ---

    GET / HTTP/1.1
    ...
*/
export interface IRequest
{
    head    : IHead;
    headers : Array<IHeader>;
    body    : string;
}

interface IEncodeResult
{
    /**
     * The encoded HTTP's response as text.
     */
    text  : string;

    /**
     * The encoded HTTP's response as bytes.
     */
    bytes : Uint8Array;
}

/**
 * Decodes HTTP request.
 */
export function decode(content: string): IRequest
{
    // Split content into lines.
    const data = content.split('\n');

    // Parse HTTP's head.
    // (0: method, 1: uri, 2: http version)
    const head: string[] = data[0].split(" ");
    
    // TODO: Parse HTTP's headers.

    // TODO: Parse HTTPS's body.

    return {
        head: {
            method  : head[0] as Method,
            uri     : head[1],
            version : head[2] as Version,    
        },

        headers: new Array<IHeader>,

        body: '',
    };
}

/**
 * Encodes HTTP response.
 */
export class Response
{
    private head    : IResponseHead;
    private headers : Array<IHeader>;  
    private body_   : Uint8Array;

    constructor()
    {
        this.head    = { version: Version.Default, status: StatusCode.OK };
        this.headers = new Array<IHeader>();
        this.body_   = new Uint8Array();
    }

    /**
     * Set http version.
     */
    version(version: Version): Response
    {
        this.head.version = version;
        return this;
    }

    /**
     * Set status code.
     */
    status(code: StatusCode): Response
    {
        this.head.status = code;
        return this;
    }

    /**
     * Add header.
     * @param key The header key.
     * @param value The header value.
     */
    header(key: string, value: string): Response
    {
        this.headers.push({ key: key, value: value as string });
        return this;
    }

    /**
     * Set body.
     */
    body(content: Uint8Array): Response
    {
        this.body_ = content;
        return this;
    }

    /** Encode the HTTP's response. */
    encode(): IEncodeResult
    {
        let text : string = "";

        // Encode the head.
        text += `${this.head.version} ${this.head.status}\r\n`;

        // Encode the headers.
        for (let i: number = 0; i < this.headers.length; ++i)
        {
            const header: IHeader = this.headers[i];
            text += `${header.key}: ${header.value}\r\n`;
        }

        text += "\r\n";

        // Encode.
        const encodedText: Uint8Array = new TextEncoder().encode(text);

        // Encode body.
        const result: Uint8Array = new Uint8Array(encodedText.length + this.body_.length);
        result.set(encodedText);
        result.set(this.body_, encodedText.length);

        return {
            text  : text,
            bytes : result,
        };
    }
}