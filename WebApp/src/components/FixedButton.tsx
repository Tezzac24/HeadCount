import { Icon } from "@mui/material";
import Button from "@mui/material/Button";
import axios from "axios";

const FixedButton = ({ onDeleteClick }: any) => {
  //on button press make delete request with axios
  const handleDelete = () => {
    axios
      .delete("/api/v1/impacts/all")
      .then((res) => {
        console.log(res);
        onDeleteClick();
      })
      .catch((err) => console.log(err));
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
      }}
    >
      <Button
        variant="contained"
        style={{ backgroundColor: "red" }}
        onClick={handleDelete}
      >
        End Session
        <Icon sx={{ ml: 1 }}>close</Icon>
      </Button>
    </div>
  );
};

export default FixedButton;
