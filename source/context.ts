import { IRequest, Response } from "./http.ts";

interface IContext
{
    /**
     * The connection of the request.
     */
    connection : Deno.Conn;

    /**
     * The request we've received.
     */
    request    : IRequest;

    /**
     * Respond to the request with a plain-text message.
     * @param message The message to respond with.
     */
    respond(message: string): Response;
}

/**
 * The context of the received request.
 */
export class Context implements IContext
{
    connection : Deno.Conn;
    request    : IRequest;

    constructor(connection: Deno.Conn, request: IRequest)
    {
        this.connection = connection;
        this.request    = request;
    }

    respond(message: string): Response
    {
        return new Response().header("Content-Type", "text/plain").body(message);
    }
}