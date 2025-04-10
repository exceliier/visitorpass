import React from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, Typography } from '@mui/material';

interface ConfirmationDialogProps {
  open: boolean;
  visitorData: any;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({ open, visitorData, onConfirm, onCancel }) => {
  return (
    <Dialog open={open} onClose={onCancel}>
      <DialogTitle>Confirm Visitor Data</DialogTitle>
      <DialogContent>
        <Typography>Name: {visitorData?.name}</Typography>
        <Typography>Mobile: {visitorData?.mobile}</Typography>
        <Typography>Adhaar: {visitorData?.adhaar}</Typography>
        <Typography>To Visit: {visitorData?.toVisit}</Typography>
        <Typography>Date: {visitorData?.date}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} color="secondary">
          Cancel
        </Button>
        <Button onClick={onConfirm} color="primary">
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationDialog;