import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Grid from "@mui/material/Grid";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShirt } from "@fortawesome/free-solid-svg-icons";
// import IconButton from "@mui/material/IconButton";
// import MoreVertIcon from "@mui/icons-material/MoreVert";
// import DeleteIcon from "@mui/icons-material/Delete";
// import EditIcon from "@mui/icons-material/Edit";
import axios from "axios";
import Box from "@mui/material/Box";
import Player from "../Interfaces/Player.interface";
import { CardActionArea } from "@mui/material";

interface PlayerCardProps {
  player: Player;
  onClick: () => void;
  onDelete: () => void;
}

const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  //@ts-expect-error
  onClick,
  onDelete,
}) => {
  // @ts-expect-error
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

  const isCritImpact =
    adjustedMaxLinearForce > 40 || adjustedMaxRotationalForce > 4000;

  return (
    <div>
      <Card
        elevation={7}
        style={{ backgroundColor: isCritImpact ? "#7EBFC8" : "white" }}
      >
        <CardActionArea>
          {/* <CardHeader
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
        /> */}
          <CardContent>
            <Grid
              container
              direction={"row"}
              sx={{ alignContent: "center", justifyContent: "space-between" }}
            >
              <Grid item>
                <Box flexDirection={"row"} sx={{ display: "flex" }}>
                  <Avatar
                    sx={{ bgcolor: "#7EBFC8" }}
                    aria-label="recipe"
                    src={player.firstName + player.lastName + ".jpg"}
                  />
                  <Typography
                    variant="subtitle1"
                    sx={{ ml: 1, alignSelf: "center" }}
                  >
                    <FontAwesomeIcon
                      icon={faShirt}
                      style={{ color: "#000000" }}
                    />
                    {player.pid}
                  </Typography>
                </Box>
                <Grid item container direction={"column"}>
                  <Grid item sx={{ fontSize: 20, fontWeight: "medium" }}>
                    {player.firstName + " " + player.lastName}{" "}
                  </Grid>
                </Grid>
              </Grid>
              <Grid
                item
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                  fontSize: 25,
                }}
              >
                <Box flexDirection={"column"} sx={{ display: "flex" }}>
                  <Box sx={{ alignSelf: "center" }}>
                    {adjustedMaxLinearForce}
                  </Box>
                  <Box sx={{ alignSelf: "center", fontSize: 20 }}>G</Box>
                </Box>
                <Box flexDirection={"column"} sx={{ display: "flex" }}>
                  <Box sx={{ alignSelf: "center" }}>
                    {adjustedMaxRotationalForce}
                  </Box>
                  <Box sx={{ alignSelf: "center", fontSize: 20 }}>deg/s</Box>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </CardActionArea>
      </Card>
    </div>
  );
};

export default PlayerCard;
