import { Response } from "../source/http.ts";
import { Context  } from "../source/context.ts";
import { Manager  } from "../source/manager.ts";
import { Router   } from "../source/router.ts";

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