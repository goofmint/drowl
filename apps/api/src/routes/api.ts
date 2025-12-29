import { Hono } from "hono";
import eventsRoutes from "./events.js";
import identitiesRoutes from "./identities.js";
import keywordsRoutes from "./keywords.js";
import jobsRoutes from "./jobs.js";
import pluginsRoutes from "./plugins.js";

const api = new Hono();

api.route("/events", eventsRoutes);
api.route("/identities", identitiesRoutes);
api.route("/keywords", keywordsRoutes);
api.route("/jobs", jobsRoutes);
api.route("/plugins", pluginsRoutes);

export default api;
