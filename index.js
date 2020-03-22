/**
 * Entry point. Initiates three workers.
 * 1. Parsing JSON file
 * 2. FSM - Computing OHLC packets
 * 3. (WebsocketThread) Client subscriptions and publishing
 * Author: Akhilesh Pal
 */

const { Worker, MessageChannel } = require('worker_threads')
const channel1 = new MessageChannel();
const channel2 = new MessageChannel();


const worker1 = new Worker('./read-data-worker.js');
worker1.on('message', (message) => {
    channel1.port1.postMessage(message);
});
worker1.on('error', (error) => {
    console.log('worker1 error', error)
});

worker1.on('exit', (code) => {
    if (code !== 0)
        // reject(new Error(`Worker stopped with exit code ${code}`));
        console.log("Worker1 exit")
})

const worker2 = new Worker('./fsm-compute-ohlc.js');

channel1.port2.on('message', (message) => {
    worker2.postMessage(message);
});
worker2.on('message', (message) => {
    channel2.port1.postMessage(message);
});
worker2.on('error', (error) => {
    console.log('worker2 error', error)
});
worker2.on('exit', (code) => {
    if (code !== 0)
        // reject(new Error(`Worker stopped with exit code ${code}`));
        console.log("worker2 exit")
})

const worker3 = new Worker('./websocket-worker.js');

channel2.port2.on('message', (message) => {
    if (worker3 !== null)
        worker3.postMessage(message);
});
worker3.on('message', (message) => {
    console.log('worker3 message', message)
});
worker3.on('error', (error) => {
    console.log('worker3 error', error)
});
worker3.on('exit', (code) => {
    if (code !== 0)
        // reject(new Error(`Worker stopped with exit code ${code}`));
        console.log("worker3 exit")
})