import { Server as HTTPServer } from 'http';

import express, { Express } from 'express';

import { Middleware } from './pipeline/middleware.js';
import logger from './pipeline/logger.js';

/**
 * Server class that initializes and manages an Express application with error handling.
 */
export class Server {
  private app: Express;
  private middleware: Middleware;
  private httpServer: HTTPServer | null;
  private address: string;
  private port: number;

  /**
   * Creates an instance of the Server class.
   * @param address - Address to bind the server to
   * @param port - Port to bind the server to
   * @param initializeRoutes - Function to register routes
   */
  constructor(address: string, port: number, initializeRoutes: (app: Express) => void) {
    this.app = express();
    this.middleware = new Middleware();
    this.httpServer = null;
    this.address = address;
    this.port = port;
    this.initialize(initializeRoutes);
  }

  /**
   * Initializes the server with middlewares and routes.
   * @param initializeRoutes - Function to initialize the defined routes
   */
  private initialize(initializeRoutes: (app: Express) => void) {
    // Initialize core middleware, e.g., CORS, JSON parsing.
    this.middleware.initializeCoreMiddleware(this.app);

    // Initialize the defined routes
    initializeRoutes(this.app);

    // Initialize Sentry error handler for Expresss
    this.middleware.initializeSentryMiddleware(this.app);

    // Initialize error middleware after all routes are registered
    this.middleware.initializeErrorMiddleware(this.app);
  }

  /**
   * Starts the server and listens on the specified port.
   * @returns A promise that resolves to the port the server is listening on
   */
  public async listen(): Promise<number> {
    return new Promise((resolve, reject) => {
      this.httpServer = this.app.listen(this.port, this.address, () => {
        this.port = (this.httpServer?.address() as { port: number })?.port || this.port;
        logger.info(`Server listening at http://${this.address}:${this.port}`);
        resolve(this.port);
      });

      this.httpServer.on('error', (err: Error) => {
        reject(err);
      });
    });
  }

  /**
   * Closes the server connection.
   * @returns A promise that resolves when the server is closed
   */
  public async close(): Promise<void> {
    if (!this.httpServer) {
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      this.httpServer?.close((err?: Error) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}
