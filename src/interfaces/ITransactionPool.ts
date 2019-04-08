import {ITransaction} from "./ITransaction";

export interface ITransactionPool {
	readonly nextId: number;
	readonly current: ITransaction;

	start(): ITransaction;
	setCurrent(transaction: ITransaction): void;
	clearCurrent(): void;
}
