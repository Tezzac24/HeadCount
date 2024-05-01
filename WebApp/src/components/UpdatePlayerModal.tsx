import React, { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import {
  Avatar,
  Button,
  DialogActions,
  FormGroup,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import orange from "@mui/material/colors/orange";
import { faShirt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";

interface PlayerModalProps {
  player: any;
  open: boolean;
  onClose: () => void;
  onUpdatePlayer: (updatedPlayer: any) => void;
}

const PlayerModal: React.FC<PlayerModalProps> = ({
  player,
  open,
  onClose,
  onUpdatePlayer,
}) => {
  const [firstName, setFirstName] = useState(player.firstName);
  const [lastName, setLastName] = useState(player.lastName);

  const handleSubmit = () => {
    axios
      .patch("/api/v1/players", { pid: player.pid, firstName, lastName })
      .then((res) => {
        console.log(res);
        const updatedPlayerData = {
          ...player,
          firstName,
          lastName,
        };
        onUpdatePlayer(updatedPlayerData); // Update the player data in the Dashboard component
        onClose(); // Close the modal
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>
        <Grid container direction={"row"}>
          {/* Display player name, jersey number, and avatar */}
          <Grid item>
            <Avatar
              sx={{ mr: 2, width: 76, height: 76, bgcolor: orange[500] }}
              aria-label="player"
              src=""
            />
          </Grid>
          <Grid item xs={12} sm container>
            <Grid item xs container direction="column" spacing={2}>
              <Grid item>
                {player.firstName} {player.lastName}
              </Grid>
              <Grid item>
                <Typography variant="subtitle1">
                  <FontAwesomeIcon
                    icon={faShirt}
                    style={{ color: "#000000" }}
                  />
                  {player.pid}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </DialogTitle>

      <DialogContent>
        <FormGroup
          sx={{
            "& .MuiTextField-root": { m: 1, width: "40ch" },
          }}
        >
          <TextField
            label="First Name"
            variant="outlined"
            onChange={(e) => setFirstName(e.target.value)}
          />
          <TextField
            label="Last Name"
            variant="outlined"
            onChange={(e) => setLastName(e.target.value)}
          />
        </FormGroup>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} style={{ color: "#000" }}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} style={{ color: "#e67e22" }}>
          Update
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PlayerModal;
