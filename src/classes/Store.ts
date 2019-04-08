import {ITransaction} from "../interfaces/ITransaction";
import {IStore} from "../interfaces/IStore";
import {assert} from "../utils/assert";
import {ILogger} from "../interfaces/ILogger";
import {ITransactionPool} from "../interfaces/ITransactionPool";

import {DummyLogger} from "./Logger/DummyLogger";

interface IStoreData {
	[key: string]: any;
}

interface IStoreCommitted {
	[key: string]: number;
}

interface IStoreStashed {
	[key: string]: IStoreData;
}

export class Store implements IStore {
	public static lastId_: number = 0;

	private readonly id_: number = ++Store.lastId_;
	private readonly data_: IStoreData = {};
	private readonly committed_: IStoreCommitted = {};
	private readonly stashed_: IStoreStashed = {};

	constructor(
		private readonly transactionPool_: ITransactionPool,
		private readonly logger_: ILogger = DummyLogger.getInstance(),
	) {
	}

	public get(transaction: ITransaction, key: string): any {
		assert(
			(transaction && typeof transaction === "object") ||
			(transaction === undefined),
			"Expected transaction to be object or undefined",
		);

		this.logger_.logRead(transaction && transaction.id, this.id_, key);

		const dataKey = this.getDataKey_(transaction, key);
		return this.data_[dataKey];
	}

	public set(transaction: ITransaction, key: string, value: any) {
		assert(
			(transaction && typeof transaction === "object") ||
			(transaction === undefined),
			"Expected transaction to be object or undefined",
		);

		this.logger_.logWrite(transaction && transaction.id, this.id_, key);

		// Запись вне транзакции
		if (!transaction) {
			transaction = this.transactionPool_.start();
			this.set(transaction, key, value);
			transaction.commit();

			return;
		}

		// Отмечаем, что мы потрогали поле в транзакции
		transaction.touch(this, key);
		// Запомним, что мы записали в это поле в транзакции
		this.stashed_[transaction.id] = this.stashed_[transaction.id] || {};
		this.stashed_[transaction.id][key] = true;
		// Получим ключ для записи с учётом транзакции
		const dataKey = this.getDataKey_(transaction, key);
		// Запишем данные в стор транзакции
		this.data_[dataKey] = value;
	}

	public has(transaction: ITransaction, key: string): boolean {
		assert(
			(transaction && typeof transaction === "object") ||
			(transaction === undefined),
			"Expected transaction to be object or undefined",
		);

		// id транзакции, которая трогала стор последней
		const lastId = this.committed_[key];

		if (!transaction) {
			return lastId !== undefined;
		}

		const stashed = this.stashed_[lastId];

		return stashed ?
			(stashed[key] !== undefined) :
			(lastId !== undefined);
	}

	public commit(transaction: ITransaction, key: string) {
		assert(transaction, "Cannot commit an undefined transaction");

		// id транзакции, которая трогала стор последней
		const lastId = this.committed_[key];
		// id транзакции, в которой сейчас записываем
		const nextId = transaction.id;
		// Получим ключ, по которому можно найти значение, записанное в этой транзакции
		const dataKey = this.getDataKey_(transaction, key);
		// Убираем флажок, что мы записывали что-то в этой транзакции
		delete this.stashed_[transaction.id];

		if (
			(
				lastId === undefined ||
				lastId < nextId
			) && (key !== dataKey) // Проверяем, что мы действительно что-то записывали в этой транзакции
		) {
			// Записываем новое значение в основной стор
			this.data_[key] = this.data_[dataKey];
			// Удаляем данные транзакции
			delete this.data_[dataKey];
			// Сохраняем id транзакции, которую закоммитили
			this.committed_[key] = nextId;
		}
	}

	public rollback(transaction: ITransaction, key: string) {
		assert(transaction, "Cannot rollback an undefined transaction");

		const dataKey = this.getDataKey_(transaction, key);

		// Если в этой транзакции что-то записывали
		if (key !== dataKey) {
			// Убираем флажок, что мы записывали что-то в этой транзакции
			delete this.stashed_[transaction.id];
			// Удаляем данные транзакции
			delete this.data_[dataKey];
		}
	}

	public changeId(prevId: number, nextId: number) {
		// Переносим отметку потроганности
		this.stashed_[nextId] = this.stashed_[prevId];
		delete this.stashed_[prevId];

		let prevKey;
		let nextKey;

		// Переносим данные
		// tslint:disable-next-line:forin
		for (const key in this.stashed_[nextId]) {
			prevKey = prevId + "::" + key;
			nextKey = nextId + "::" + key;

			this.data_[nextKey] = this.data_[prevKey];
			delete this.data_[prevKey];
		}
	}

	private getDataKey_(transaction: {id: number}, key: string) {
		// Обращение к полу вне транзакции
		if (!transaction) {
			return key;
		}

		if (this.stashed_[transaction.id]) {
			return String(transaction.id) + "::" + key;
		}

		return key;
	}
}
