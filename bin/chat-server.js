const state = {
  users: [],
  activeUsers: 0,
  totalUsers: 0,
  room: [],
};

module.exports = () => {
  const Server = function (socket) {
    Object.defineProperty(this, "socket", {
      writable: false,
      enumerable: false,
      configurable: false,
      value: socket,
    });

    this.guestNumber = 0;
  };
  Server.prototype = new Object();

  Server.prototype.getSocket = function () {
    return this.socket;
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

      chat_server.on("disconnect", (sock) => {
        state.activeUsers--;
        var num = state.activeUsers;

        chat_server.emit("onlineClients", {
          online: num,
        });
      });

      this.handleClient(socket);
    });
  };

  Server.prototype.handleClient = function (client_socket) {
    this.guestNumber = this.assignGuestNumber(client_socket);

    // this.joinRoom("lobby", client_socket);

    this.handleMessageBroadcast(client_socket);

    // this.handleNameChangeAttempts(client_socket);

    //this.handleRoomJoining(client_socket);
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
    state.room[sock.id] = "Default";

    return this.guestNumber + 1;
  };

  Server.prototype.handleMessageBroadcast = function (sock) {
    var io = this.getSocket();
    sock.on("message", (msg) => {
      io.emit("_msg_", {
        data: msg.data,
      });
    });
  };

  return Server;
};
