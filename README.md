# uptox
# Upstox_Assignment_-_Trades

---
## Requirements

For development, you will only need Node.js and a node global package, Yarn, installed in your environement.
    $ node --version
    v10.19.0

    $ npm --version
    6.14.2

To Run script on linux
    $npm install
    $npm start

Copy trades-data in trades-data/trades.json.

---
To Run Client side websocket on linux
    $sudo apt install node-ws
    $sudo npm install commander -g
    $sudo npm install ws -g
    $wscat -c ws://localhost:8080
    ${"event": "subscribe", "symbol": "XXBTZUSD", "interval": 15}


---
Problem approach
1. Read trades line by line in JSON
2. Get stock symbol, price, quantity, and time(TS2).
3. (Assumption)Bar chart data is created wrt given timestamp(TS2) in the trade data.
4. Bar closing is done considering TS2 in data.
5. As soon as 15s TS2 is processed, bar closing is sent to publisher
6. Publisher maintains a map of subscriber's subscribed to given symbol.
7. As soon as publisher receives a closing bar data, it is sent to subscriber.

---
Workers
1. Worker1 Reads json data line by line and passes to channel 1. Channel is communicating with Worker2.
2. Worker2 receives data on channel1 and sends for OHLC calculations. Once bar is closed is sends data to publisher on channel2.
3. Worker3 is websocket to subscribers. Subscribers sends subscribe event with symbol. Once Worker2 gets data on channel2 for a particular symbol, it sends message to all subscriber's subscribed to the given symbol.