import {
  createServerBootstrap,
  TCreateEnvironmentSetup,
} from "./server-bootstrap.js";
import { createDevFrontendMiddleware } from "./middleware/frontend-adapter/dev-frontend-middleware.js";

const createDevSetup: TCreateEnvironmentSetup = async ({ httpServer }) => {
  return {
    middlewares: [createDevFrontendMiddleware(httpServer)],
  };
};

await createServerBootstrap(createDevSetup);
