import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { LineChart } from "@mui/x-charts/LineChart";

const FocusPlayerModal = () => {
  return (
    <Dialog open={true}>
      <DialogTitle>Player Name</DialogTitle>
      <DialogContent>
        <LineChart
          xAxis={[{ data: [1, 2, 3, 4, 5] }]}
          series={[{ data: [1, 2, 3, 4, 5] }]}
          width={500}
          height={500}
        />
        Focus Player Content
      </DialogContent>
    </Dialog>
  );
};

export default FocusPlayerModal;
