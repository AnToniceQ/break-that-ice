import { IServerRuntimeMiddleware } from "../server-runtime.js";
import express from "express";

export function createJsonMiddleware(): IServerRuntimeMiddleware {
  return {
    async register(app) {
      app.use(express.json());
    },
  };
}
