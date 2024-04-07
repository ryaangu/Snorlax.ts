import { Context          } from "./context.ts";
import { Method, Response } from "./http.ts";

type ICallback = (context: Context) => Response;

interface IRoute
{
    /**
     * The path to the route.
     */
    path : string;

    /**
     * The callback that the router will call
     * if it matches the route path.
     * @param context The context of the request we've received.
     */
    callback: ICallback;
}

interface IRouter
{
    /**
     * Handles GET method.
     * @param uri The URI we got from the GET method.
     * @param callback The callback to handle the method.
     */
    get(uri: string, callback: ICallback): void;
}

export class Router implements IRouter
{
    /** Handles all the methods and routes. */
    private handlers: Map<string, Map<string, IRoute>>;

    constructor()
    {
        this.handlers = new Map<string, Map<string, IRoute>>();

        this.handlers.set(Method.GET, new Map<string, IRoute>());
    }

    get(uri: string, callback: ICallback) 
    {
        // TODO: handle URI's like (/:id)

        // Get GET handler.
        const getHandler: Map<string, IRoute> | undefined = this.handlers.get(Method.GET);

        // Add the URI route.
        const uriRoute: IRoute =
        {
            path     : uri,
            callback : callback,
        };

        getHandler?.set(uri, uriRoute);
    }

    /**
     * Try to handle the specified URI.
     */
    async handle(method: Method, uri: string, context: Context): Promise<boolean>
    {
        // Find the URI in routes.
        const methodHandler: Map<string, IRoute> | undefined = this.handlers.get(method);
        const    uriHandler: IRoute              | undefined = methodHandler?.get(uri);

        // Did we not find it?
        if (uriHandler == undefined)
        {
            // This router doesn't handle that specific URI.
            return false;
        }

        // Call the callback and write the response
        // to the connection.
        await context.connection.write(uriHandler.callback?.(context).encode().bytes);

        // We successfully handle the URI!
        return true;
    }
}