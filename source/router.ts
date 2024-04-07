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
     * Use a directory path to access routes.
     * @param path The path to use.
     */
    use(path: string): void;

    /**
     * Handles GET method.
     * @param uri The URI we got from the GET method.
     * @param callback The callback to handle the method.
     */
    get(uri: string, callback: ICallback): void;
}

interface IFile
{
    /** The path to the file. */
    path: string;

    /** The content of the file. */
    content: Uint8Array;
}

export class Router implements IRouter
{
    /** Handles all the methods and routes. */
    private handlers: Map<string, Map<string, IRoute>>;

    /** All the files in the directory */
    private files: Array<IFile>;

    constructor()
    {
        this.files    = new Array<IFile>();
        this.handlers = new Map<string, Map<string, IRoute>>();

        this.handlers.set(Method.GET, new Map<string, IRoute>());
    }

    /**
     * Read files inside directories recursively.
     * @param path The part to start.
     */
    private async read(path: string)
    {
        for await (const entry of Deno.readDir(path))
        {
            const entryPath: string = `${path}/${entry.name}`;

            if (entry.isDirectory)
                await this.read(entryPath);
            else
            {
                // Remove dot at the start of the path (if there's one).
                let fileURI: string = (entryPath.startsWith("./")) ? entryPath.substring(2, entryPath.length)
                                                                   : entryPath;

                // Remove first directory.
                fileURI = fileURI.substring(fileURI.indexOf('/'), fileURI.length);

                this.files.push({ path: fileURI, content: await Deno.readFile(entryPath) });
            }
        }
    }

    async use(path: string)
    {
        // Read the directories.
        try {
            await this.read(path);
        } catch (_) {
            console.log(`Failed to use path: ${path}`);
            return;
        }

        // Make routes to the files.
        for (const file of this.files)
        {
            // Get the content type of the file.
            let contentType: string;

            if (file.path.endsWith(".html"))
                contentType = "text/html";
            else if (file.path.endsWith(".ico") || file.path.endsWith(".png"))
                contentType = "image/png";
            else
                contentType = "text/plain";

            // Build the response.
            const response: Response = new Response().header("Content-Type", contentType)
                                                     .body  (file.content);

            // Is the current file an index.html?
            // If yes, make it so that the directory
            // route redirects to the HTML file.
            if (file.path.includes("index.html"))
            {
                // Get the path without the index.html
                const filePath = file.path.replace("index.html", '');

                // Add a GET handler for the directory.
                this.get(filePath, (_) => response);
            }

            // Add a GET handler for the file.
            this.get(file.path, (_) => response);
        }
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
        let      uriHandler: IRoute              | undefined = methodHandler?.get(uri);

        // Did we not find it?
        if (uriHandler == undefined)
        {
            // Try finding without a '/' at the end.
            if (uri.endsWith('/'))
                uriHandler = methodHandler?.get(uri.substring(0, uri.length - 1));
            else
            {
                // Try finding with a '/' at the end.
                uriHandler = methodHandler?.get(uri + '/');

                if (uriHandler == undefined)
                {
                    // This router doesn't handle that specific URI.
                    return false;
                }
            }
        }

        // Call the callback and write the response
        // to the connection.
        if (uriHandler != undefined) // the editor is complaining?!
            await context.connection.write(uriHandler.callback?.(context).encode().bytes);

        // We successfully handle the URI!
        return true;
    }
}