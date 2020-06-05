const Main = function (scok) {
  Object.defineProperty(this, "socket", {
    writable: false,
    enumerable: false,
    configurable: false,
    value: scok,
  });

  Object.defineProperty(this, "users", {
    writable: false,
    configurable: false,
    value: {},
  });
  Object.defineProperty(this, "rooms", {
    writable: false,
    configurable: false,
    value: [],
  });

  this.clientName = null;
  this.flg = false;
};

Main.prototype = new Object();

Main.prototype.constructor = Main;

Main.prototype.getSocket = function () {
  return this.socket;
};

Main.prototype.handleClient = function (msgPanel, activeNum) {
  //Handle client code

  const sock = this.getSocket();

  sock.on("roomChanged", (data) => {
    while (msgPanel.length > 0) {
      msgPanel.pop();
    }

    let room_Name = document.getElementById("room_Name");

    room_Name.innerText = `current Room::[${data.name}]`;
  });

  sock.on("_msg_", (msg_) => {
    if (this.flg) {
      this.flg = false;
      return;
    }

    var msg = document.createElement("div");

    msg.setAttribute("id", "msg-text-other");

    msg.append(document.createTextNode(msg_.data));

    msgPanel.append(msg);

    msgPanel.scrollTo(0, msgPanel.scrollHeight);
  });

  sock.on("onlineClients", (data) => {
    activeNum.innerText = "Active usres" + "[" + data.online + "]" + " ";
  });

  sock.on("nameResult", (data) => {
    var msg = document.createElement("div");

    this.clientName = data.userName;

    msg.setAttribute("class", "msg-text-client");

    msg.append(
      document.createTextNode(
        data.success
          ? "your USER NAME name is : " + data.userName
          : "Unable to create Name for you?"
      )
    );

    msgPanel.append(msg);

    msgPanel.scrollTo(0, msgPanel.scrollHeight);
  });

  sock.on("_sys_brodcast", (data) => {
    var msg = document.createElement("div");

    msg.setAttribute("class", "msg-text-client");

    msg.append(document.createTextNode(data.msg));

    msgPanel.append(msg);

    msgPanel.scrollTo(0, msgPanel.scrollHeight);
  });
};

Main.prototype.install = function () {
  const msgPanel = document.getElementById("messagePanel");
  const input_box = document.getElementById("input_msg");
  const btn = document.getElementById("btn");

  const activeNum = document.getElementById("active_users");

  /*

  const Msgs = [];

  msgPanel.addEventListener("scroll", () => {
    if (Msgs.length > 0) msgPanel.prepend(Msgs.pop());
  });
  */

  btn.addEventListener("click", (e) => {
    setTimeout((_) => {
      if (/^\/name/g.test(input_box.value)) {
        let name = new String(input_box.value);

        this.getSocket().emit("nameChange", { name: name.split(" ").pop() });
        return;
      }

      if (/^\/room/g.test(input_box.value)) {
        let room = new String(input_box.value);

        this.getSocket().emit("roomChange", {
          name: room.split(" ").pop(),
        });

        return;
      }

      if (/[A-Za-z-0-9]/g.test(input_box.value)) {
        
        btn.disabled = true;

        var msg = document.createElement("div");
        
        msg.setAttribute("class", "msg-text-client");
        msg.append(
          document.createTextNode(`[${this.clientName}]::` + input_box.value)
        );

        let prom = new Promise((resolve, reject) => {
          try {
            //code
            this.flg = true;
            this.getSocket().emit("message", {
              data: this.clientName + ":" + input_box.value,
            });

            resolve(msg);
          } catch (error) {
            reject(error);
          }
        })
          .then((msg_) => {
            msgPanel.append(msg_);

            setTimeout((_) => {
              msgPanel.scrollTo(0, msgPanel.scrollHeight);
              btn.disabled = false;
            }, 10);
          })
          .catch((err) => {
            throw new Error(err);
          })
          .finally((_) => {
            //Release any hold resources
          });
      } else {
        alert("Enter message!");
      }
    }, 100);
  });
  this.handleClient(msgPanel, activeNum);
};

function Start_() {
  const main = new Main(io("/chat_server"));
  main.install();
}
