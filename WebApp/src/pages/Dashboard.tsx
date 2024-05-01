import Grid from "@mui/material/Grid";
import { useEffect, useState } from "react";
import PlayerModal from "../components/UpdatePlayerModal";
import AppBar from "../components/AppBar";
import MQTTComponent from "../components/MQTT";
import EmptyPlayerCard from "../components/EmptyPlayerCard";
import AddPlayerModal from "../components/AddPlayerModal";
import PlayerCardRemodel from "../components/PlayerCardRemodel";
import axios from "axios";
import EndSession from "../components/FixedButton";
import Player from "../Interfaces/Player.interface";

export default function Dashboard() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [editPlayerModal, seteditPlayerModal] = useState<boolean>(false);
  const [addPlayerModal, setAddPlayerModal] = useState<boolean>(false);
  const [refresh, setRefresh] = useState<boolean>(false);

  const handleCardClick = (player: Player) => {
    setSelectedPlayer(player);
    seteditPlayerModal(true);
  };

  const handleCloseModal = () => {
    setSelectedPlayer(null);
    seteditPlayerModal(false);
  };

  useEffect(() => {
    fetch("/api/v1/players/all")
      .then((res) => {
        console.log(res);
        return res.json();
      })
      .then((data: Player[]) => setPlayers(data))
      .catch((err) => console.log(err));
  }, [refresh]);

  const updatePlayer = (updatedPlayer: Player) => {
    setPlayers((prevPlayers) => {
      return prevPlayers.map((player) => {
        if (player.pid === updatedPlayer.pid) {
          return {
            ...player,
            firstName: updatedPlayer.firstName,
            lastName: updatedPlayer.lastName,
          };
        }
        return player;
      });
    });
  };

  const handleAddPlayer = (newPlayer: Player) => {
    axios
      .post("/api/v1/players", newPlayer)
      .then((res) => {
        console.log(res);
        setRefresh(!refresh);
      })
      .catch((err) => console.log(err));
  };

  return (
    <Grid container>
      <Grid container sx={{ mb: 2, backgroundColor: "#e67e22" }}>
        <AppBar pageName={"Dashboard"} />
      </Grid>
      <MQTTComponent onPlayerUpdate={() => setRefresh(!refresh)} />
      <Grid
        container
        spacing={3}
        padding={1}
        sx={{
          justifyContent: "start", // "flex-start",
          alignItems: "flex-start", // flex-end
        }}
      >
        {players
          .slice()
          .sort((a, b) => {
            // Get the highest impact value for each player
            const highestImpactA = Math.max(
              ...a.impacts.map((impact) => impact.linearForce),
              0
            );
            const highestImpactB = Math.max(
              ...b.impacts.map((impact) => impact.linearForce),
              0
            );
            return highestImpactB - highestImpactA;
          })
          .map((player) => (
            <Grid item key={player.pid} xs={12} sm={6} md={6} lg={4}>
              <PlayerCardRemodel
                player={player}
                onClick={() => handleCardClick(player)}
                onDelete={() => setRefresh(!refresh)}
              />
            </Grid>
          ))}

        <Grid item xs={12} sm={6} md={6} lg={4} sx={{ mb: 7 }}>
          <EmptyPlayerCard onAddClick={() => setAddPlayerModal(true)} />
        </Grid>
      </Grid>
      {selectedPlayer && (
        <PlayerModal
          player={selectedPlayer}
          open={editPlayerModal}
          onClose={handleCloseModal}
          onUpdatePlayer={updatePlayer}
        />
      )}

      <AddPlayerModal
        open={addPlayerModal}
        onClose={() => setAddPlayerModal(false)}
        onAddPlayer={handleAddPlayer}
      />

      <EndSession onDeleteClick={() => setRefresh(!refresh)} />
    </Grid>
  );
}
