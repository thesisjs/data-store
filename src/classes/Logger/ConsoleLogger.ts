import {ILogger} from "../../interfaces/ILogger";

export class ConsoleLogger implements ILogger {
	public logRead(transactionId: number, storeId: number, key: string): void {
		// tslint:disable-next-line:no-console
		console.warn(`[@thesis/data-source] [${transactionId}] READ ${storeId}.${key}`);
	}

	public logWrite(transactionId: number, storeId: number, key: string): void {
		// tslint:disable-next-line:no-console
		console.warn(`[@thesis/data-source] [${transactionId}] WRITE ${storeId}.${key}`);
	}

	public logCommit(transactionId: number): void {
		// tslint:disable-next-line:no-console
		console.warn(`[@thesis/data-source] [${transactionId}] COMMIT`);
	}

	public logRollback(transactionId: number): void {
		// tslint:disable-next-line:no-console
		console.warn(`[@thesis/data-source] [${transactionId}] ROLLBACK`);
	}
}
