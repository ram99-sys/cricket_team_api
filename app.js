const express = require("express");
const app = express();
app.use(express.json());
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const dbPath = path.join(__dirname, "cricketTeam.db");
let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      //console.log(`Server running at http://localhost:3000/`);
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

const dbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};
app.get("/players/", async (request, response) => {
  const playerDetailsQuery = `SELECT * FROM cricket_team`;
  const playersArray = await db.all(playerDetailsQuery);
  //response.send(playersArray);
  response.send(
    playersArray.map((eachPlayer) => dbObjectToResponseObject(eachPlayer))
  );
});

app.post("/players/", async (request, response) => {
  let no_of_rows = `SELECT player_id FROM cricket_team ORDER BY player_id DESC LIMIT 1`;
  const rowId = await db.get(no_of_rows);
  const { player_id } = rowId;
  let next_player_id = player_id + 1;
  //console.log(next_player_id);
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  //console.log(`${playerName},${jerseyNumber},${role}`);

  const addPlayerDetails = `INSERT INTO cricket_team (player_id,player_name,jersey_number,role) 
  VALUES(
      ${next_player_id},'${playerName}',${jerseyNumber},'${role}'
  ); `;
  const playersArray = await db.run(addPlayerDetails);
  response.send("Player Added to Team");
});

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  //console.log(playerId);
  const getPlayerQuery = `SELECT * FROM cricket_team WHERE
  player_id = ${playerId}`;
  const dbResponse = await db.get(getPlayerQuery);
  //console.log(dbResponse);
  //response.send(dbResponse);
  response.send(dbObjectToResponseObject(dbResponse));
});

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  //console.log(playerId);
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  //console.log(`${playerName},${jerseyNumber},${role}`);
  const updatePlayerQuery = `UPDATE cricket_team SET 
  player_id = ${playerId},
  player_name = '${playerName}',
  jersey_number = ${jerseyNumber},
  role = '${role}'
  WHERE 
    player_id = ${playerId};`;
  await db.run(updatePlayerQuery);
  response.send(`Player Details Updated`);
});

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  //console.log(playerId);
  const deletePlayerQuery = `DELETE FROM cricket_team WHERE player_id = ${playerId}`;
  await db.run(deletePlayerQuery);
  response.send(`Player Removed`);
});

module.exports = app;
