const onlineUsers = new Map();

exports.socketHandler = (io) => {

  io.on("connection", (socket) => {

    socket.on("register", ({ userId, role }, ack) => {
      onlineUsers.set(userId.toString(), socket.id);
      socket.join(userId.toString()); 
      console.log("🧠 onlineUsers:", [...onlineUsers.entries()]);

    });

    socket.on("disconnect", () => {
      for (let [userId, sockId] of onlineUsers) {
        if (sockId === socket.id) {
          onlineUsers.delete(userId);
          break;
        }
      }
    });
  });
};


exports.getUserSocket = (userId) => onlineUsers.get(userId.toString());
