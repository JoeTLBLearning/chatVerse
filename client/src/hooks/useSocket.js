import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { host } from "../utils/APIRoutes";

export const useSocket = (currentUser) => {
  const socket = useRef();

  useEffect(() => {
    if (currentUser && !socket.current) {
      socket.current = io(host, {
        transports: ["websocket"], // Ajoute ceci pour éviter les erreurs CORS sur Render
      });
      socket.current.emit("add-user", currentUser._id);
    }

    return () => {
      if (socket.current) {
        socket.current.close();
        socket.current = null;
      }
    };
  }, [currentUser]);

  return socket;
};