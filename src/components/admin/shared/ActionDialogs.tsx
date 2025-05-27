import React from "react";
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField, Button } from "@mui/material";

interface ActionDialogsProps {
  openDialog: boolean;
  setOpenDialog: React.Dispatch<React.SetStateAction<boolean>>;
  confirmationText: string;
  setConfirmationText: React.Dispatch<React.SetStateAction<string>>;
  handleDeleteEntities: () => void;
}

const ActionDialogs: React.FC<ActionDialogsProps> = ({
  openDialog,
  setOpenDialog,
  confirmationText,
  setConfirmationText,
  handleDeleteEntities
}) => {
  return (
    <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
      <DialogTitle>Confirm Delete</DialogTitle>
      <DialogContent>
        <DialogContentText>
          To confirm deletion, please type the word DELETE in the box below:
        </DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          fullWidth
          variant="standard"
          value={confirmationText}
          onChange={(e) => setConfirmationText(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
        <Button onClick={handleDeleteEntities} color="error" disabled={confirmationText !== "DELETE"}>
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ActionDialogs;
