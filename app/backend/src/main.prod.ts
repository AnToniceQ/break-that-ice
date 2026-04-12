import {
  createServerBootstrap,
  TCreateEnvironmentSetup,
} from "./server-bootstrap.js";
import { createProdFrontendMiddleware } from "./middleware/frontend-adapter/prod-frontend-middleware.js";

const createProdSetup: TCreateEnvironmentSetup = async () => {
  return {
    middlewares: [createProdFrontendMiddleware()],
  };
};

await createServerBootstrap(createProdSetup);
