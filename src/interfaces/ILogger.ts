
export interface ILogger {
	logRead(transactionId: number, storeId: number, key: string): void;
	logWrite(transactionId: number, storeId: number, key: string): void;
	logCommit(transactionId: number): void;
	logRollback(transactionId: number): void;
}
