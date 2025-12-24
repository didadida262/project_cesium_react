const WebSocket = require('ws')
const wss = new WebSocket.Server({ port: 4000 })

let clients = []

wss.on('connection', (ws) => {
  clients.push(ws)

  ws.on('message', (data) => {
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN && client !== ws) {
        client.send(data)
      }
    })
  })

  ws.on('close', () => {
    clients = clients.filter((c) => c !== ws)
  })
})

console.log('WebSocket server running at ws://localhost:4000')
