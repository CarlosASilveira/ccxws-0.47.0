"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BinanceFuturesCoinmClient = void 0;
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
const Level2Point_1 = require("../Level2Point");
const Level2Snapshots_1 = require("../Level2Snapshots");
const Level2Update_1 = require("../Level2Update");
const BinanceBase_1 = require("./BinanceBase");
class BinanceFuturesCoinmClient extends BinanceBase_1.BinanceBase {
    constructor({ useAggTrades = true, requestSnapshot = true, socketBatchSize = 200, socketThrottleMs = 1000, restThrottleMs = 1000, l2snapshotSpeed = "100ms", l2updateSpeed = "100ms", watcherMs, } = {}) {
        super({
            name: "Binance Futures COIN-M",
            wssPath: "wss://dstream.binance.com/stream",
            restL2SnapshotPath: "https://dapi.binance.com/dapi/v1/depth",
            useAggTrades,
            requestSnapshot,
            socketBatchSize,
            socketThrottleMs,
            restThrottleMs,
            l2snapshotSpeed,
            l2updateSpeed,
            watcherMs,
        });
    }
    /**
   * Custom construction for a partial depth update. This deviates from
   * the spot market by including the `pu` property where updates may
   * not be sequential. The update message looks like:
    {
      "e": "depthUpdate",           // Event type
      "E": 1591270260907,           // Event time
      "T": 1591270260891,           // Transction time
      "s": "BTCUSD_200626",         // Symbol
      "ps": "BTCUSD",               // Pair
      "U": 17285681,                // First update ID in event
      "u": 17285702,                // Final update ID in event
      "pu": 17285675,               // Final update Id in last stream(ie `u` in last stream)
      "b": [                        // Bids to be updated
        [
          "9517.6",                 // Price level to be updated
          "10"                      // Quantity
        ]
      ],
      "a": [                        // Asks to be updated
        [
          "9518.5",                 // Price level to be updated
          "45"                      // Quantity
        ]
      ]
    }
   */
    _constructLevel2Update(msg, market) {
        const eventMs = msg.data.E;
        const timestampMs = msg.data.T;
        const sequenceId = msg.data.U;
        const lastSequenceId = msg.data.u;
        const previousLastSequenceId = msg.data.pu;
        const asks = msg.data.a.map(p => new Level2Point_1.Level2Point(p[0], p[1]));
        const bids = msg.data.b.map(p => new Level2Point_1.Level2Point(p[0], p[1]));
        return new Level2Update_1.Level2Update({
            exchange: this.name,
            base: market.base,
            quote: market.quote,
            sequenceId,
            lastSequenceId,
            previousLastSequenceId,
            timestampMs,
            eventMs,
            asks,
            bids,
        });
    }
    /**
   * Partial book snapshot that. This deviates from the spot market by
   * including a previous last update id, `pu`.
      {
        "e":"depthUpdate",        // Event type
        "E":1591269996801,        // Event time
        "T":1591269996646,        // Transaction time
        "s":"BTCUSD_200626",      // Symbol
        "ps":"BTCUSD",            // Pair
        "U":17276694,
        "u":17276701,
        "pu":17276678,
        "b":[                     // Bids to be updated
          [
            "9523.0",             // Price Level
            "5"                   // Quantity
          ],
          [
            "9522.8",
            "8"
          ]
        ],
        "a":[                     // Asks to be updated
          [
            "9524.6",             // Price level to be
            "2"                   // Quantity
          ],
          [
            "9524.7",
            "3"
          ]
        ]
      }
   */
    _constructLevel2Snapshot(msg, market) {
        const timestampMs = msg.data.E;
        const sequenceId = msg.data.U;
        const lastSequenceId = msg.data.u;
        const previousLastSequenceId = msg.data.pu;
        const asks = msg.data.a.map(p => new Level2Point_1.Level2Point(p[0], p[1]));
        const bids = msg.data.b.map(p => new Level2Point_1.Level2Point(p[0], p[1]));
        return new Level2Snapshots_1.Level2Snapshot({
            exchange: this.name,
            base: market.base,
            quote: market.quote,
            sequenceId,
            lastSequenceId,
            previousLastSequenceId,
            timestampMs,
            asks,
            bids,
        });
    }
}
exports.BinanceFuturesCoinmClient = BinanceFuturesCoinmClient;
//# sourceMappingURL=BinanceFuturesCoinmClient.js.map