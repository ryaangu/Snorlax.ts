import { IRequest, decode } from "./http.ts";
import { Context          } from "./context.ts";
import { Router           } from "./router.ts";

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
     * All the routers the manager has.
     */
    routes: Array<Router>;

    /**
     * Use a specific router.
     * @param router The router to use.
     */
    use(router: Router): void;

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
    listener ?: Deno.Listener;
    routes    : Array<Router>;

    constructor()
    {
        this.routes = new Array<Router>();
    }

    use(router: Router): void
    {
        // Add the router to routes.
        this.routes?.push(router);
    }

    private async handleContext(context: Context): Promise<void>
    {
        // Get URI from context.
        const uri: string = context.request.head.uri;

        // Try to handle that URI.
        let router: Router;
        
        for (router of this.routes)
        {
            if (await router.handle(context.request.head.method, uri, context))
                return;
        }

        console.log(`Failed to handle route: ${context.request.head.uri}`);
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