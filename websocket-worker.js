/**
 * (WebsocketThread) Client subscriptions and publishing
 * Author: Akhilesh Pal
 */

const { parentPort } = require('worker_threads');
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

// Object to store symbol and there subscribers
wss_symbol_map = {}
connection_count = 0;

wss.on('connection', function connection(ws) {
    console.log('connections:', ++connection_count)
    ws.on('message', function incoming(data) {
        data = data.trim();
        /**Store the subscriber */
        try {
            json_data = JSON.parse(data);
            console.log('json_data', json_data)
            if (json_data.event && json_data.event === 'subscribe' && json_data.symbol) {
                if (wss_symbol_map[json_data.symbol]) {
                    wss_symbol_map.push(ws);
                } else {
                    wss_symbol_map[json_data.symbol] = [ws];
                }
            }
        } catch (e) {
            console.log(e.message)
        }

        /** Need to use below if no of symbol is too high and client is less */
        // wss.clients.forEach(function each(client) {
        //     console.log('client')
        //     //   if (client !== ws && client.readyState === WebSocket.OPEN) {
        //     // if(client !== ws)
        //     //     console.log("Checking default condition")
        //     if (client !== ws && client.readyState === WebSocket.OPEN) {
        //         console.log("inside this")
        //         client.send(data);
        //     }
        // });
    });

    ws.on('close', function close() {
        --connection_count;
        for (var prop in wss_symbol_map) {
            // skip loop if the property is from prototype
            if (!wss_symbol_map.hasOwnProperty(prop)) continue;

            const index = wss_symbol_map[prop].indexOf(ws);
            if (index > -1) {
                wss_symbol_map[prop].splice(index, 1);
                /** In case if a user can subscribe to only 1 symbol. */
                // break;
            }
        }
    })
});

parentPort.on('message', function (msg) {
    publishOHLC(msg);
})

function publishOHLC(data) {
    let json_data = JSON.parse(data);
    if (json_data.symbol && wss_symbol_map[json_data.symbol] && wss_symbol_map[json_data.symbol].length > 0) {
        wss_symbol_map[json_data.symbol].forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
                client_data = {
                    "event": "ohlc_notify",
                    "symbol": json_data.symbol,
                    "bar_num": json_data.bar_num,
                    "o": json_data.o,
                    "h": json_data.h,
                    "l": json_data.l,
                    "c": json_data.c,
                    "volume": json_data.volume.toFixed(2)
                };
                // console.log(JSON.stringify(client_data));
                client.send(JSON.stringify(client_data));
            }
        });
    }
}