import { IRequest, decode } from "./http.ts";
import { Context          } from "./context.ts";

interface IOptions
{
    /** The port the manager is going to listen to. */
    port: number;
}

interface IManager
{
    /**
     * The listener of the manager.
     */
    listener?: Deno.Listener;

    /**
     * Starts listening to the specified options.
     * @param options The manager options.
     */
    listen(options: IOptions): Promise<void>;
}

/**
 * The manager manages everything in the
 * application.
 * 
 * It handles all the requests, handles all the routes
 * and everything else.
 */
export class Manager implements IManager
{
    listener?: Deno.Listener;

    private async handleContext(context: Context): Promise<void>
    {
        await console.log(context.request.head);
    }

    private async handleConnection(connection: Deno.Conn): Promise<void>
    {
        // Read the bytes we've received from the client.
        const receivedBytes: Uint8Array = new Uint8Array(2048);
        await connection.read(receivedBytes);

        // Make sure the received bytes are not empty.
        if (receivedBytes[0] == 0)
        {
            // Close the connection.
            connection.close();
            return;
        }

        // Decode the bytes into a string.
        const decodedBytes: string = new TextDecoder().decode(receivedBytes);

        // Parse the decoded bytes into a Request interface.
        const request: IRequest = decode(decodedBytes);

        // Build the context.
        const context: Context = new Context(connection, request);

        // Handle the context.
        this.handleContext(context);

        // Close the connection.
        connection.close();
    }

    async listen(options: IOptions): Promise<void>
    {
        // Start listening to the specified port.
        this.listener = Deno.listen({ port: options.port });

        // Handle the connections.
        // NOTE: every connection is a request, we respond to them
        // and then close it.
        let connection: Deno.Conn;

        for await (connection of this.listener)
        {
            this.handleConnection(connection);
        }
    }
}