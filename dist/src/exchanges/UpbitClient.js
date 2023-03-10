"use strict";
/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpbitClient = void 0;
const BasicClient_1 = require("../BasicClient");
const Level2Point_1 = require("../Level2Point");
const Level2Snapshots_1 = require("../Level2Snapshots");
const NotImplementedFn_1 = require("../NotImplementedFn");
const Ticker_1 = require("../Ticker");
const Trade_1 = require("../Trade");
class UpbitClient extends BasicClient_1.BasicClient {
    constructor({ wssPath = "wss://api.upbit.com/websocket/v1", watcherMs } = {}) {
        super(wssPath, "Upbit", undefined, watcherMs);
        this._sendSubCandles = NotImplementedFn_1.NotImplementedFn;
        this._sendUnsubCandles = NotImplementedFn_1.NotImplementedFn;
        this._sendSubLevel2Updates = NotImplementedFn_1.NotImplementedFn;
        this._sendUnsubLevel2Updates = NotImplementedFn_1.NotImplementedFn;
        this._sendSubLevel3Snapshots = NotImplementedFn_1.NotImplementedFn;
        this._sendUnsubLevel3Snapshots = NotImplementedFn_1.NotImplementedFn;
        this._sendSubLevel3Updates = NotImplementedFn_1.NotImplementedFn;
        this._sendUnsubLevel3Updates = NotImplementedFn_1.NotImplementedFn;
        this.hasTickers = true;
        this.hasTrades = true;
        this.hasLevel2Snapshots = true;
        this.debouceTimeoutHandles = new Map();
        this.debounceWait = 200;
    }
    _sendSubTicker() {
        this._debounce("sub-ticker", () => {
            if (!this._wss)
                return;
            const codes = Array.from(this._tickerSubs.keys());
            this._wss.send(JSON.stringify([{ ticket: "tickers" }, { type: "ticker", codes: codes }]));
        });
    }
    _sendUnsubTicker() {
        this._debounce("unsub-ticker", () => {
            if (!this._wss)
                return;
            const codes = Array.from(this._tickerSubs.keys());
            this._wss.send(JSON.stringify([{ ticket: "tickers" }, { type: "ticker", codes: codes }]));
        });
    }
    _sendSubTrades() {
        this._debounce("sub-trades", () => {
            if (!this._wss)
                return;
            const codes = Array.from(this._tradeSubs.keys());
            this._wss.send(JSON.stringify([{ ticket: "trades" }, { type: "trade", codes: codes }]));
        });
    }
    _sendUnsubTrades() {
        this._debounce("unsub-trades", () => {
            if (!this._wss)
                return;
            const codes = Array.from(this._tradeSubs.keys());
            this._wss.send(JSON.stringify([{ ticket: "trades" }, { type: "trade", codes: codes }]));
        });
    }
    _sendSubLevel2Snapshots() {
        this._debounce("sub-l2snapshots", () => {
            if (!this._wss)
                return;
            const codes = Array.from(this._level2SnapshotSubs.keys());
            this._wss.send(JSON.stringify([{ ticket: "quotation" }, { type: "orderbook", codes: codes }]));
        });
    }
    _sendUnsubLevel2Snapshots() {
        this._debounce("unsub-l2snapshots", () => {
            if (!this._wss)
                return;
            const codes = Array.from(this._level2SnapshotSubs.keys());
            this._wss.send(JSON.stringify([{ ticket: "quotation" }, { type: "orderbook", codes: codes }]));
        });
    }
    _debounce(type, fn) {
        clearTimeout(this.debouceTimeoutHandles.get(type));
        this.debouceTimeoutHandles.set(type, setTimeout(fn, this.debounceWait));
    }
    _onMessage(raw) {
        const rawStr = raw.toString("utf8");
        const msgs = JSON.parse(rawStr.replace(/:(\d+\.{0,1}\d+)(,|\})/g, ':"$1"$2'));
        this._processsMessage(msgs);
    }
    _processsMessage(msg) {
        // console.log(msg);
        // trades
        if (msg.type === "trade") {
            const market = this._tradeSubs.get(msg.code);
            if (!market)
                return;
            const trade = this._constructTradesFromMessage(msg, market);
            this.emit("trade", trade, market);
            return;
        }
        // tickers
        if (msg.type === "ticker") {
            const market = this._tickerSubs.get(msg.code);
            if (!market)
                return;
            const ticker = this._constructTicker(msg, market);
            this.emit("ticker", ticker, market);
            return;
        }
        // l2 updates
        if (msg.type === "orderbook") {
            const market = this._level2SnapshotSubs.get(msg.code);
            if (!market)
                return;
            const snapshot = this._constructLevel2Snapshot(msg, market);
            this.emit("l2snapshot", snapshot, market);
            return;
        }
    }
    _constructTicker(msg, market) {
        /*
{ type: 'ticker',
  code: 'KRW-BTC',
  opening_price: '3980000.00000000',
  high_price: '4017000.00000000',
  low_price: '3967000.00000000',
  trade_price: '3982000.0',
  prev_closing_price: '3981000.00000000',
  acc_trade_price: '10534309614.237530000',
  change: 'RISE',
  change_price: '1000.00000000',
  signed_change_price: '1000.00000000',
  change_rate: '0.0002511932',
  signed_change_rate: '0.0002511932',
  ask_bid: 'ASK',
  trade_volume: '0.01562134',
  acc_trade_volume: '2641.03667958',
  trade_date: '20190213',
  trade_time: '132020',
  trade_timestamp: '1550064020000',
  acc_ask_volume: '1232.55205784',
  acc_bid_volume: '1408.48462174',
  highest_52_week_price: '14149000.00000000',
  highest_52_week_date: '2018-02-20',
  lowest_52_week_price: '3562000.00000000',
  lowest_52_week_date: '2018-12-15',
  trade_status: null,
  market_state: 'ACTIVE',
  market_state_for_ios: null,
  is_trading_suspended: false,
  delisting_date: null,
  market_warning: 'NONE',
  timestamp: '1550064020393',
  acc_trade_price_24h: null,
  acc_trade_volume_24h: null,
  stream_type: 'SNAPSHOT' }
     */
        const { opening_price, trade_price, acc_trade_volume, change_rate, change_price, low_price, high_price, timestamp, } = msg;
        return new Ticker_1.Ticker({
            exchange: this.name,
            base: market.base,
            quote: market.quote,
            timestamp: parseInt(timestamp),
            last: trade_price,
            open: opening_price,
            high: high_price,
            low: low_price,
            volume: acc_trade_volume,
            quoteVolume: (acc_trade_volume * trade_price).toFixed(8),
            change: change_price,
            changePercent: change_rate,
        });
    }
    _constructTradesFromMessage(datum, market) {
        /*
      {
       "type":"trade",
       "code":"KRW-BTC",
       "timestamp":1549443263262,
       "trade_date":"2019-02-06",
       "trade_time":"08:54:23",
       "trade_timestamp":1549443263000,
       "trade_price":3794000.0,
       "trade_volume":0.00833522,
       "ask_bid":"BID",
       "prev_closing_price":3835000.00000000,
       "change":"FALL","change_price":41000.00000000,
       "sequential_id":1549443263000001,
       "stream_type":"REALTIME"}
    */
        const { trade_timestamp, trade_price, trade_volume, ask_bid, sequential_id } = datum;
        const side = ask_bid === "BID" ? "buy" : "sell";
        return new Trade_1.Trade({
            exchange: this.name,
            base: market.base,
            quote: market.quote,
            tradeId: sequential_id,
            side: side,
            unix: parseInt(trade_timestamp),
            price: trade_price,
            amount: trade_volume,
        });
    }
    _constructLevel2Snapshot(msg, market) {
        /*
{ type: 'orderbook',
  code: 'KRW-BTT',
  timestamp: 1549465903782,
  total_ask_size: 1550925205.4196181,
  total_bid_size: 2900599205.9702206,
  orderbook_units:
   [ { ask_price: 1.04,
       bid_price: 1.03,
       ask_size: 185206052.57158336,
       bid_size: 354443748.7514278 },
...
     { ask_price: 1.13,
       bid_price: 0.94,
       ask_size: 198013382.3803366,
       bid_size: 267304509.61145836 } ],
  stream_type: 'SNAPSHOT' }
    */
        const asks = msg.orderbook_units.map(p => new Level2Point_1.Level2Point(s(p.ask_price), s(p.ask_size)));
        const bids = msg.orderbook_units.map(p => new Level2Point_1.Level2Point(s(p.bid_price), s(p.bid_size)));
        return new Level2Snapshots_1.Level2Snapshot({
            exchange: this.name,
            base: market.base,
            quote: market.quote,
            timestampMs: parseInt(msg.timestamp),
            asks,
            bids,
        });
    }
}
exports.UpbitClient = UpbitClient;
function s(v) {
    if (typeof v === "number") {
        return v.toFixed(8);
    }
    else {
        return v;
    }
}
//# sourceMappingURL=UpbitClient.js.map