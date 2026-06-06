exports.socketHandler = (io) => {

  io.on("connection", (socket) => {

    socket.on("register", ({ userId, role }, ack) => {
      socket.join(userId.toString()); 
      console.log(`🧠 User ${userId} joined room ${userId}`);
    });

    socket.on("join_incident", (incidentId) => {
      socket.join(`incident:${incidentId}`);
      console.log(`🧠 User ${socket.id} joined incident room incident:${incidentId}`);
    });

    socket.on("leave_incident", (incidentId) => {
      socket.leave(`incident:${incidentId}`);
      console.log(`🧠 User ${socket.id} left incident room incident:${incidentId}`);
    });

  });
};
