import { IRequest } from "./http.ts";

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
}