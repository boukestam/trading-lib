class ConsoleLogger {
  verbose: boolean;
  logs: string[];

  constructor (verbose: boolean) {
    this.verbose = verbose;
    this.logs = [];
  }

  log (message: string): void {
    if (this.verbose) {
      this.logs.push(`${new Date()}: ${message}`);
      this.logs = this.logs.splice(-1000);
      console.log(`${new Date()}: ${message}`);
    }
  }

  error (message: string): void {
    this.logs.push(`${new Date()}: ${message}`);
    this.logs = this.logs.splice(-1000);
    console.error(`${new Date()}: ${message}`)
  }

  obj (obj: any): void {
    if (this.verbose) {
      this.logs.push(typeof obj === 'object' ? JSON.parse(JSON.stringify(obj)) : obj);
      this.logs = this.logs.splice(-1000);
      console.log(obj);
    }
  }
};

export const Logger = new ConsoleLogger(false);