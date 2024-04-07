import { Response } from "../mod.ts";
import { Context  } from "../mod.ts";
import { Manager  } from "../mod.ts";
import { Router   } from "../mod.ts";

const manager : Manager = new Manager();
const  router : Router  = new Router ();

router.use("./views");

const app: Router = new Router();

app.get("/app", (_) => new Response());

manager.use(router);
manager.use(app);

manager.listen({ port: 8080 });

console.log("Listening to http://localhost:8080");