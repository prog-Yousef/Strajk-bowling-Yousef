import "@testing-library/jest-dom";
import {  beforeAll, afterEach, afterAll  } from "vitest";
import { cleanup } from "@testing-library/react";
import { server } from "./src/_mocks_/server";

beforeAll(() => {
    server.listen();
  });
  
  afterEach(() => {
    server.resetHandlers();
    cleanup();
  });
  
  afterAll(() => {
    server.close();
  });