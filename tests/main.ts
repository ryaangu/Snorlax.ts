import { Manager } from "../source/manager.ts";

const manager: Manager = new Manager();
manager.listen({ port: 8080 });

console.log("Listening to http://localhost:8080");