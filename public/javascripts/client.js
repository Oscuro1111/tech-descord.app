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
};

Main.prototype = new Object();

Main.prototype.constructor = Main;

Main.prototype.getSocket = function () {
  return this.socket;
};

Main.prototype.install = function () {
  const msgPanel = document.getElementById("messagePanel");
  const input_box = document.getElementById("input_msg");
  const btn = document.getElementById("btn");

  const Msgs = [];

  msgPanel.addEventListener("scroll", () => {
    if (Msgs.length > 0) msgPanel.prepend(Msgs.pop());
  });

  btn.addEventListener("click", (e) => {
    setTimeout((_) => {
      if (/^\//g.test(input_box.value)) {
        alert("Command not message");
        return;
      }

      if (/[A-Za-z-0-9]/g.test(input_box.value)) {
        btn.disabled = true;
        var msg = document.createElement("div");

        msg.setAttribute("class", "msg-text-client");

        msg.append(document.createTextNode(input_box.value));

        let prom = new Promise((resolve, reject) => {
          try {
            //code

            resolve(msg);
          } catch (error) {
            reject(error);
          }

          resolve(msg);
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
};

function Start_() {
  const main = new Main(io());
  main.install();
}
