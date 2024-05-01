import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Grid from "@mui/material/Grid";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShirt } from "@fortawesome/free-solid-svg-icons";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import axios from "axios";

interface PlayerCardProps {
  player: Player;
  onClick: () => void;
  onDelete: () => void;
}

interface Player {
  pid: number;
  firstName: string;
  lastName: string;
  impacts: any[];
}

const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  onClick,
  onDelete,
}) => {
  const handleDelete = () => {
    // Make an HTTP DELETE request to the server
    axios
      .delete("/api/v1/players?pid=" + player.pid)
      .then(() => {
        console.log(`Deleted player ${player.firstName} ${player.lastName}`);
        onDelete();
      })
      .catch((err) => {
        console.error("Error deleting player:", err);
      });
  };

  const linearForces = player.impacts.map((impact: any) => impact.linearForce);
  const rotationalForces = player.impacts.map(
    (impact: any) => impact.rotationalForce
  );

  const maxLinearForce = Math.max(...linearForces);
  const maxRotationalForce = Math.max(...rotationalForces);

  // Create new variables to hold the adjusted values
  let adjustedMaxLinearForce = maxLinearForce;
  let adjustedMaxRotationalForce = maxRotationalForce;

  // Apply the check to ensure they are not negative when both are zero
  if (maxLinearForce === -Infinity && maxRotationalForce === -Infinity) {
    adjustedMaxLinearForce = 0;
    adjustedMaxRotationalForce = 0;
  }

  return (
    <div>
      <Card elevation={7}>
        <CardHeader
          avatar={
            <Avatar
              sx={{ bgcolor: "#e67e22" }}
              aria-label="recipe"
              src="https://avatars.githubusercontent.com/u/135670874?s=200&v=4"
            />
          }
          action={
            <div>
              <IconButton aria-label="edit player" onClick={onClick}>
                <EditIcon />
              </IconButton>
              <IconButton aria-label="delete player" onClick={handleDelete}>
                <DeleteIcon />
              </IconButton>
            </div>
          }
          title={player.firstName + " " + player.lastName}
          subheader={
            <Typography variant="subtitle1">
              <FontAwesomeIcon icon={faShirt} style={{ color: "#000000" }} />
              {player.pid}
            </Typography>
          }
        />
        <CardContent>
          <Grid container sx={{ justifyContent: "space-between" }}>
            <Grid item> Linear Force: {adjustedMaxLinearForce}g</Grid>
            <Grid item> Rotational Force: {adjustedMaxRotationalForce}g</Grid>
          </Grid>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlayerCard;
