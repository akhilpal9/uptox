/**
 * Helper function in FSM - Computing OHLC packets. Sending data to publishing worker on bar closing.
 * Author: Akhilesh Pal
 */
const { parentPort } = require('worker_threads');

class OhlcObj {
    constructor(symbol) {
        this.symbol = symbol;
        this.o = 0;
        this.h = 0;
        this.l = 0;
        this.c = 0;
        this.volume = 0;
        this.lastPrice = 0;
        this.bar_num = 1;
        this.last_date = new Date();
    }
}
function barClosing(paramObjSym) {
    for (var prop in paramObjSym) {
        if (!paramObjSym.hasOwnProperty(prop)) continue;
        // if (paramObjSym[prop].symbol !== "XXBTZUSD")
        //     continue;

        /* Set closing. */
        paramObjSym[prop].c = paramObjSym[prop].lastPrice;

        broadCastSymbol(paramObjSym[prop]);

        /* Reset */
        ++paramObjSym[prop].bar_num;
        paramObjSym[prop].o = 0;
        paramObjSym[prop].h = 0;
        paramObjSym[prop].l = 0;
        paramObjSym[prop].c = 0;
        paramObjSym[prop].lastPrice = 0;

        // Resetting the volume
        paramObjSym[prop].volume = 0;
    }
}
function broadCast() {
    for (var prop in objSym) {
        if (!objSym.hasOwnProperty(prop)) continue;
        parentPort.postMessage(broadCast(objSym[sym]))
        console.log(JSON.stringify(objOneSym))
    }
}
function broadCastSymbol(objOneSym) {
    parentPort.postMessage(JSON.stringify(objOneSym))
}
function diffTime(tm1, tm2) {
    tm1 = new Date(parseInt(tm1));
    tm2 = new Date(parseInt(tm2));
    let diff = (tm2.getTime() - tm1.getTime()) / 1000;

    return diff;
}

module.exports = {
    OhlcObj: OhlcObj,
    broadCastSymbol: broadCastSymbo,
    broadCast: broadCast,
    barClosing: barClosing,
    diffTime: diffTime
}