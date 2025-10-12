import { Snackbar, Alert } from "@mui/material";
import { useBoardStore } from "../store/useBoardStore";

const GlobalNotification = () => {
  const { notification, clearNotification } = useBoardStore();

  return (
    <Snackbar
      open={!!notification.message}
      autoHideDuration={4000}
      onClose={clearNotification}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
    >
      <Alert
        onClose={clearNotification}
        severity={notification.severity}
        variant="filled"
        sx={{ width: "100%" }}
      >
        {notification.message}
      </Alert>
    </Snackbar>
  );
};

export default GlobalNotification;
