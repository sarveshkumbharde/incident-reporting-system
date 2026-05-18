exports.socketHandler = (io) => {

  io.on("connection", (socket) => {

    socket.on("register", ({ userId, role }, ack) => {
      socket.join(userId.toString()); 
      console.log(`🧠 User ${userId} joined room ${userId}`);
    });

  });
};
