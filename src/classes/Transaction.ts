import {ITransaction} from "../interfaces/ITransaction";
import {ITransactionPool} from "../interfaces/ITransactionPool";
import {IStore} from "../interfaces/IStore";
import {assert} from "../utils/assert";
import {ILogger} from "../interfaces/ILogger";

import {DummyLogger} from "./Logger/DummyLogger";

interface ITouchedKey {
	store: IStore;
	key: string;
}

export class Transaction implements ITransaction {
	private id_: number;
	private readonly touched_: ITouchedKey[] = [];
	private resolved_: boolean = false;

	public get id(): number {
		return this.id_;
	}

	constructor(
		private readonly transactionPool_: ITransactionPool,
		private readonly logger_: ILogger = DummyLogger.getInstance(),
	) {
		this.id_ = transactionPool_.nextId;
	}

	public commit() {
		assert(!this.resolved_, "Trying to commit a resolved transaction");

		this.logger_.logCommit(this.id_);

		for (const touched of this.touched_) {
			touched.store.commit(this, touched.key);
		}

		this.resolved_ = true;
	}

	public rollback() {
		assert(!this.resolved_, "Trying to rollback a resolved transaction");

		this.logger_.logRollback(this.id_);

		for (const touched of this.touched_) {
			touched.store.rollback(this, touched.key);
		}

		this.resolved_ = true;
	}

	public wrap(callback: (...args: any) => any): (...args: any) => any {
		const transaction = this;
		const pool = this.transactionPool_;

		return function $inTransaction() {
			pool.setCurrent(transaction);

			let thrown = false;
			let returnValue;
			let error;

			try {
				returnValue = callback.apply(null, arguments);
			} catch (e) {
				thrown = true;
				error = e;
			}

			pool.clearCurrent();

			if (thrown) {
				throw error;
			} else {
				return returnValue;
			}
		};
	}

	public touch(store: IStore, key: string) {
		this.touched_.push({store, key});
	}

	public update(id: number) {
		for (const touched of this.touched_) {
			touched.store.changeId(this.id_, id);
		}

		this.id_ = id;
	}
}
