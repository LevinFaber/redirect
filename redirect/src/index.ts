import { handleRequest } from './handler';

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

/*
SAMPLE PAYLOAD
{"url": "https://google.com", "key":"test1abc"}

*/