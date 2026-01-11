import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { recieveMessageRoute, sendMessageRoute } from "../utils/APIRoutes";

export const useChatMessages = (activeTarget, currentUser, socket, viewState) => {
    const [messages, setMessages] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const scrollRef = useRef();

    // 1. Charger les messages (Inchangé)
    useEffect(() => {
        const fetchMsgs = async () => {
            if (!activeTarget?._id || !currentUser?._id) {
                setMessages([]);
                return;
            }
            try {
                const payload = viewState === "DM"
                    ? { from: currentUser._id, to: activeTarget._id }
                    : { from: currentUser._id, roomId: activeTarget._id };

                const response = await axios.post(recieveMessageRoute, payload);
                setMessages(response.data);
            } catch (error) {
                console.error("Erreur chargement messages :", error);
            }
        };
        fetchMsgs();
    }, [activeTarget?._id, currentUser?._id, viewState]);

    // 2. Gestion Unique des Sockets (FIXÉ)
    useEffect(() => {
        const currentSocket = socket.current;
        if (!currentSocket || !activeTarget?._id) return;

        if (viewState === "ROOM") {
            currentSocket.emit("join-channel", activeTarget._id);
        }

        const handleMessageReceive = (data) => {
            // CAS 1 : On est en vue DM
            if (viewState === "DM") {
                // On n'accepte le message que si :
                // 1. Il vient de la personne sélectionnée (data.from)
                // 2. Ce n'est PAS un message de channel (!data.channelId)
                if (data.from === activeTarget._id && !data.channelId) {
                    setMessages((prev) => [...prev, { fromSelf: false, message: data.message }]);
                }
            }
            // CAS 2 : On est en vue ROOM (Channel)
            else if (viewState === "ROOM") {
                // On n'accepte le message que si :
                // 1. Il appartient au channel qu'on regarde actuellement
                // 2. Il ne vient pas de nous-même (optionnel car géré par l'optimistic UI)
                if (data.channelId === activeTarget._id) {
                    if (data.from !== currentUser._id) {
                        setMessages((prev) => [...prev, {
                            fromSelf: false,
                            message: data.message,
                            senderName: data.senderName
                        }]);
                    }
                }
            }
        };
        
        currentSocket.on("msg-recieve", handleMessageReceive);

        return () => {
            if (currentSocket) {
                currentSocket.off("msg-recieve");
            }
        };
    }, [activeTarget?._id, viewState, socket, currentUser?._id]);

    // 3. Envoyer un message (Inchangé)
    const handleSendMsg = async (msg) => {
        if (!msg.trim() || !activeTarget || !socket.current) return;

        setMessages((prev) => [...prev, { fromSelf: true, message: msg }]);

        try {
            const payload = {
                from: currentUser._id,
                message: msg,
            };

            if (viewState === "DM") {
                payload.to = activeTarget._id;
            } else {
                payload.channelId = activeTarget._id;
                payload.senderName = currentUser.username;
            }

            await axios.post(sendMessageRoute, payload);

            socket.current.emit("send-msg", {
                ...payload,
                to: activeTarget._id,
                isRoom: viewState === "ROOM"
            });

        } catch (error) {
            console.error(error);
            setMessages((prev) => prev.slice(0, -1));
        }
    };

    return { messages, setMessages, notifications, setNotifications, handleSendMsg, scrollRef };
};