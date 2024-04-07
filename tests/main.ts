import { Response } from "../mod.ts";
import { Context  } from "../mod.ts";
import { Manager  } from "../mod.ts";
import { Router   } from "../mod.ts";

const manager : Manager = new Manager();
const  router : Router  = new Router ();

router.get('/', (context: Context) =>
{
    return context.respond("Hello, this is the main path.");
});

router.get('/user', (_context: Context) =>
{
    return new Response().header("Content-Type", "text/html").body("<h1>Ryan</h1>");
});

manager.use(router);
manager.listen({ port: 8080 });

console.log("Listening to http://localhost:8080");