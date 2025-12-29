import { Hono } from "hono";
import pluginsRoutes from "./plugins/index.js";
import eventsRoutes from "./events/index.js";
import identitiesRoutes from "./identities/index.js";
import keywordsRoutes from "./keywords/index.js";
import jobsRoutes from "./jobs/index.js";

const api = new Hono();

api.route("/plugins", pluginsRoutes);
api.route("/events", eventsRoutes);
api.route("/identities", identitiesRoutes);
api.route("/keywords", keywordsRoutes);
api.route("/jobs", jobsRoutes);

export default api;
