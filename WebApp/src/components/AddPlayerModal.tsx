import React, { useState } from "react";
import Modal from "@mui/material/Modal";
import {
  Card,
  CardContent,
  TextField,
  Button,
  FormGroup,
  DialogActions,
  DialogTitle,
  Avatar,
} from "@mui/material";
import { blueGrey } from "@mui/material/colors";

interface AddPlayerModalProps {
  open: boolean;
  onClose: () => void;
  onAddPlayer: (newPlayer: any) => void;
}

const AddPlayerModal: React.FC<AddPlayerModalProps> = ({
  open,
  onClose,
  onAddPlayer,
}) => {
  const [pid, setPid] = useState(Number(0));
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const impacts: any[] = [];

  const handleSubmit = () => {
    // Create a new player object with the entered data
    const newPlayer = {
      pid,
      firstName,
      lastName,
      impacts,
    };

    // Call the onAddPlayer callback to handle adding the new player
    onAddPlayer(newPlayer);

    // Close the modal
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Card
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        <DialogTitle flexDirection={"row"} sx={{ display: "inline-flex" }}>
          <Avatar
            sx={{ mr: 2, width: 76, height: 76, bgcolor: blueGrey[300] }}
            aria-label="player"
            src=""
          />
          Add New Player
        </DialogTitle>
        <CardContent>
          <FormGroup
            sx={{
              "& .MuiTextField-root": { m: 1, width: "40ch" },
            }}
          >
            <TextField
              label="Jersey Number"
              variant="outlined"
              fullWidth
              onChange={(e) => setPid(parseInt(e.target.value, 10))}
            />
            <TextField
              label="First Name"
              variant="outlined"
              fullWidth
              onChange={(e) => setFirstName(e.target.value)}
            />
            <TextField
              label="Last Name"
              variant="outlined"
              fullWidth
              onChange={(e) => setLastName(e.target.value)}
            />
          </FormGroup>
          <DialogActions>
            <Button onClick={onClose} style={{ color: "#000" }}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} style={{ color: "#e67e22" }}>
              Create
            </Button>
          </DialogActions>
        </CardContent>
      </Card>
    </Modal>
  );
};

export default AddPlayerModal;
