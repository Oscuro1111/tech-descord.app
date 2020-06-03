const state = {
  users: [],
  activeUsers: 0,
  totalUsers: 0,
  room: [],
};

module.exports = () => {
  const Server = function (socket, io) {
    Object.defineProperty(this, "socket", {
      writable: false,
      enumerable: false,
      configurable: false,
      value: socket,
    });

    Object.defineProperty(this, "IO", {
      writable: false,
      enumerable: false,
      configurable: false,
      value: io,
    });
    this.guestNumber = 0;
  };
  Server.prototype = new Object();

  Server.prototype.getSocket = function () {
    return this.socket;
  };

  Server.prototype.getIO = function () {
    return this.IO;
  };

  Server.prototype.install = function () {
    let chat_server = this.getSocket();

    chat_server.on("connection", (socket) => {
      state.users[socket.id] = { id: socket.id, user_sock: socket };

      state.activeUsers++;

      var num = state.activeUsers;

      chat_server.emit("onlineClients", {
        online: num,
      });

      socket.on("disconnect", () => {
        state.activeUsers--;
        var num = state.activeUsers;

        chat_server.emit("onlineClients", {
          online: num,
        });

        chat_server.emit("_sys_brodcast", {
          msg:
            "system>>" + state.users[socket.id][socket.id] + " Left the room",
        });
      });

      this.handleClient(socket);
    });
  };

  Server.prototype.handleClient = function (client_socket) {
    this.guestNumber = this.assignGuestNumber(client_socket);

    //this.joinRoom("lobby", client_socket);

    this.handleMessageBroadcast(client_socket);

    this.handleNameChangeAttempts(client_socket);

    this.handleRoomJoining(client_socket);
  };
  Server.prototype.assignGuestNumber = function (sock) {
    var name = "Guest" + this.guestNumber;

    (this.temp = state.users[sock.id]),
      (this.temp[sock.id] = name),
      (this.temp["room"] = "Default"),
      state.users.push(this.temp);

    sock.join("Default");

    sock.emit("nameResult", {
      success: true,
      userName: name,
    });

    this.getSocket().emit("_sys_brodcast", {
      msg: "SYSTEM>> " + name + " is joined the room!",
    });

    return this.guestNumber + 1;
  };

  Server.prototype.handleMessageBroadcast = function (sock) {
    var io = this.getSocket();
    sock.on("message", (msg) => {
      io.in(state.users[sock.id]["room"]).emit("_msg_", {
        data: msg.data,
      });
    });
  };

  Server.prototype.handleNameChangeAttempts = function (sock) {
    sock.on("nameChange", (data) => {
      this.getSocket().emit("_sys_brodcast", {
        msg: state.users[sock.id][sock.id] + " changed name to" + data.name,
      });

      state.users[sock.id][sock.id] = data.name;
      sock.emit("nameResult", { userName: data.name, success: true });
    });
  };

  //curently working
  Server.prototype.handleRoomJoining = function (sock) {
    const io = this.getSocket();

    var prevRoom;

    sock.on("roomChange", (data) => {
      (this.temp = state.users[sock.id]),
        ((prevRoom = this.temp["room"]),
        sock.leave(this.temp["room"]),
        (this.temp["room"] = data.name)),
        (state.users[sock.id] = this.temp);

      sock.join(data.name);
      if (prevRoom) {
        io.in(prevRoom).emit("_sys_brodcast", {
          msg: `${state.users[sock.id][sock.id]} left the room.`,
        });
      }

      io.in(data.name).emit("roomChanged", {
        name: data.name,
        user: state.users[sock.id][sock.id],
      });

      io.in(data.name).emit("_sys_brodcast", {
        msg: `${state.users[sock.id][sock.id]} joined the room ${data.name}.`,
      });
    });
  };

  return Server;
};
