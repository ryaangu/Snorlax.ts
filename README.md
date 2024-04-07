<img src="media/snorlax.gif" width="20%">

## Snorlax.ts
A **simple**, **lightweight** and **powerful** middleware for [**Deno**](https://deno.com/).\
\
The principles of this library is to:
- be simple and easy to use;
- be fast;
- be straight to the point; 

## Example
```ts
import { Manager, Router } from Snorlax;

/*
    Setup the website.
*/

const manager : Manager = new Manager();
const router  : Router  = new Router ();

// Tell the manager to use the main router.
manager.use(router);

// https://localhost:8080/
router.get('/', async (context: Context) =>
{
    await context.respond("Hello, World!"); // Send a plain-text 'Hello, World!' with
                                            // status code 200 (OK) to the client.
});

// We've setup everything we needed, start listening to port 8080!
manager.listen({ port: 8080 });
```