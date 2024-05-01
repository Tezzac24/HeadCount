import { Card, CardContent, Typography, CardActionArea } from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

const EmptyPlayerCard = ({ onAddClick }: { onAddClick: () => void }) => {
  return (
    <Card>
      <CardActionArea onClick={onAddClick}>
        <CardContent sx={{ textAlign: "center", mt: 1, mb: 1 }}>
          <AddCircleOutlineIcon fontSize="large" />
          <Typography variant="body1" align="center">
            Add Player
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default EmptyPlayerCard;
