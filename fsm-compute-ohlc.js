/**
 * FSM - Computing OHLC packets. Sending data to publishing worker on bar closing.
 * Author: Akhilesh Pal
 */

 const { worker, parentPort } = require('worker_threads');


const { diffTime, OhlcObj, broadCastSymbol, broadCast, barClosing } = require('./helper')

let objSym = {}
let old_t = new_t = new_bar_t = last_t = 0;

let count = 0;
let tIntBase = 1000000; // To convert uint64 timestamp to milliseconds timestamp

function computeOHLC(line) {
    data = JSON.parse(line);
    symbol = data['sym']
    p = data['P']
    q = data['Q']

    if (old_t == 0) {
        old_t = data['TS2'] / tIntBase;
        new_bar_t = old_t + (15 * 1000)
    }

    new_t = data['TS2'] / tIntBase;
    date = new Date(parseInt(new_t))

    last_t = new_t;
    /* Bar closing */
    if (new_bar_t <= new_t) {
        barClosing(objSym);
    }

    if (symbol in objSym) {
        let ohcl = objSym[symbol];
        if (ohcl.o == 0) {
            ohcl.o = p;
            ohcl.h = p;
            ohcl.c = 0;
            ohcl.l = p;
        } else {
            if (ohcl.h < p)
                ohcl.h = p;
            if (ohcl.l > p)
                ohcl.l = p;
        }
        ohcl.volume += q;
        ohcl.lastPrice = p;
        ohcl.last_date = date;
        // ohcl.volume = parseFloat(ohcl.volume).toFixed(2);
    } else {
        let ohcl = new OhlcObj(symbol);
        ohcl.o = p;
        ohcl.h = p;
        ohcl.c = 0;
        ohcl.l = p;
        ohcl.volume = q;
        ohcl.lastPrice = p;
        objSym[symbol] = ohcl;
        ohcl.last_date = date;
    }

    // if (symbol == 'XXBTZUSD') {
    //     ++count;
    //     console.log(JSON.stringify(objSym[symbol]), diffTime(old_t, new_t))
    // }
    // if (count >= 9 && count <= 10 && symbol == 'XXBTZUSD') {
    //     if (count > 9)
    //         process.exit(0);
    // }
}

parentPort.on('message', function (msg) {
    computeOHLC(msg);
})

/** Bar closing after 15 seconds */
// setInterval(barClosing, 15 * 1000, objSym);