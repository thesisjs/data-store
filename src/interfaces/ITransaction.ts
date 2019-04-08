import {IStore} from "./IStore";

export interface ITransaction {
	readonly id: number;

	commit(): void;
	rollback(): void;
	wrap(callback: (...args: any) => any): (...args: any) => any;
	touch(store: IStore, key: string): void;
	update(id: number): void;
}
