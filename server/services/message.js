function sendMessage(toid, message) {
    return {
        type: 'message',
        message
    }
}