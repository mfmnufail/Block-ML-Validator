const socket = io();

socket.emit("message", "From client!")