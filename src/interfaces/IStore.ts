import {ITransaction} from "./ITransaction";

export interface IStore {
	get(transaction: ITransaction, key: string): any;
	set(transaction: ITransaction, key: string, value: any): void;
	has(transaction: ITransaction, key: string): boolean;
	commit(transaction: ITransaction, key: string): void;
	rollback(transaction: ITransaction, key: string): void;
	changeId(prevTransactionId: number, nextTransactionId: number): void;
}
