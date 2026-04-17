import { POSTGRES_HOST, POSTGRES_PORT } from "./env.js";
import { getSecret } from "./secret.js";

export function createPostgresConnectionUrl() {
  const connectionUrl = new URL("postgres://");

  connectionUrl.hostname = POSTGRES_HOST;
  connectionUrl.port = String(POSTGRES_PORT);
  connectionUrl.username = getSecret("postgres_user");
  connectionUrl.password = getSecret("postgres_password");
  connectionUrl.pathname = `/${getSecret("postgres_db")}`;

  return connectionUrl;
}
