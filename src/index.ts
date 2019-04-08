import {ILogger} from "./interfaces/ILogger";
import {TransactionPool} from "./classes/TransactionPool";
import {DummyLogger} from "./classes/Logger/DummyLogger";

export {Store} from "./classes/Store";
export {ILogger} from "./interfaces/ILogger";
export {DummyLogger} from "./classes/Logger/DummyLogger";
export {ConsoleLogger} from "./classes/Logger/ConsoleLogger";

export function createTransactionPool(logger: ILogger = DummyLogger.getInstance()) {
	return new TransactionPool(logger);
}
