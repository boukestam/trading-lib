import { Pair } from "./Pair";
export interface Trade {
    pair: Pair;
    direction: 'long' | 'short';
    filled: boolean;
    buy?: number;
    buyDate?: Date;
    amount: number;
    cost: number;
    stop: number;
    limit: number;
    profit?: number;
    buyOrderDate?: Date;
    buyOrderId?: string;
    closed?: boolean;
    sell?: number;
    sellDate?: Date;
    profits?: number;
    leverage?: number;
    stopOrders?: {
        orderId: number;
        amount: number;
        limit: number;
    }[];
    meta: {
        [key: string]: any;
    };
}
