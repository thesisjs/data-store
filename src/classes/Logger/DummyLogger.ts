import {ILogger} from "../../interfaces/ILogger";

export class DummyLogger implements ILogger {
	public static getInstance(): ILogger {
		if (!DummyLogger.instance_) {
			DummyLogger.instance_ = new DummyLogger();
		}

		return DummyLogger.instance_;
	}
	private static instance_: ILogger;

	// tslint:disable-next-line:no-empty
	public logRead(transactionId: number, storeId: number, key: string): void {
	}

	// tslint:disable-next-line:no-empty
	public logWrite(transactionId: number, storeId: number, key: string): void {
	}

	// tslint:disable-next-line:no-empty
	public logCommit(transactionId: number): void {
	}

	// tslint:disable-next-line:no-empty
	public logRollback(transactionId: number): void {
	}
}
