const express = require("express");
const cors = require("cors");
const cookieSession = require("cookie-session");
const http = require("http"); // Importiere das http-Modul

const dbConfig = require("./app/config/db.config");

const app = express();
const server = http.createServer(app); // Erstelle einen HTTP-Server und verknüpfe ihn mit Express

const mongoose = require('mongoose');
const socketIo = require("socket.io"); // Füge die Socket.IO-Bibliothek hinzu


mongoose.set('strictQuery', false);

const corsOptions = {
  origin: "http://localhost:4200",
  credentials: false,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cookieSession({
    name: "bezkoder-session",
    keys: ["COOKIE_SECRET"],
    httpOnly: true
  })
);

const db = require("./app/models");
const Role = db.role;

db.mongoose
  .connect(`mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("Successfully connect to MongoDB.");
    initial();
  })
  .catch(err => {
    console.error("Connection error", err);
    process.exit();
  });

app.get("/", (req, res) => {
  res.json({ message: "Welcome to bezkoder application." });
});

require("./app/routes/auth.routes")(app);
require("./app/routes/user.routes")(app);

const PORT = process.env.PORT || 8080;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

const io = socketIo(server, {
  cors: {
    origin: "http://localhost:4200",
    methods: ["GET", "POST"]
  }
});
// Erstelle eine Socket.IO-Instanz, die denselben Server verwendet

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });

  // Event-Handler für "movePlayer"
  socket.on("movePlayer", (data) => {
    // Hier können Sie die Logik für die Bewegung des Spielers verarbeiten
    console.log("Received movePlayer message:", data);
    // Führen Sie die entsprechende Aktion aus und senden Sie Ergebnisse an andere Clients
  });

  // Event-Handler für "shoot"
  socket.on("shoot", (data) => {
    // Hier können Sie die Logik für das Schießen des Spielers verarbeiten
    console.log("Received shoot message:", data);

    // Führen Sie die gewünschte Aktion aus, z. B. eine Antwort vorbereiten
    const response = `Typ "${data}" abgefeuert`;

    // Senden Sie die Antwort an den Client zurück
    socket.emit("shootResponse", response);
  });
});

function initial() {
  Role.estimatedDocumentCount((err, count) => {
    if (!err && count === 0) {
      new Role({
        name: "user"
      }).save(err => {
        if (err) {
          console.log("error", err);
        }

        console.log("added 'user' to roles collection");
      });

      new Role({
        name: "moderator"
      }).save(err => {
        if (err) {
          console.log("error", err);
        }

        console.log("added 'moderator' to roles collection");
      });

      new Role({
        name: "admin"
      }).save(err => {
        if (err) {
          console.log("error", err);
        }

        console.log("added 'admin' to roles collection");
      });
    }
  });
}
