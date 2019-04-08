import {ITransaction} from "../interfaces/ITransaction";
import {ITransactionPool} from "../interfaces/ITransactionPool";
import {ILogger} from "../interfaces/ILogger";

import {Transaction} from "./Transaction";
import {DummyLogger} from "./Logger/DummyLogger";

export class TransactionPool implements ITransactionPool {
	private nextId_: number = 0;
	private active_: ITransaction;

	constructor(private readonly logger_: ILogger = DummyLogger.getInstance()) {}

	public get nextId(): number {
		return ++this.nextId_;
	}

	public get current(): ITransaction {
		return this.active_;
	}

	public start(): ITransaction {
		return new Transaction(this, this.logger_);
	}

	public setCurrent(transaction: ITransaction) {
		this.active_ = transaction;
	}

	public clearCurrent() {
		this.active_ = undefined;
	}

}
