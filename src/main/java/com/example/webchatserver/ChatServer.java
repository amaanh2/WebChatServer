package com.example.webchatserver;


import jakarta.websocket.*;
import jakarta.websocket.server.PathParam;
import jakarta.websocket.server.ServerEndpoint;
import org.json.JSONObject;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;


/**
 * This class represents a web socket server, a new connection is created and it receives a roomID as a parameter
 * **/
@ServerEndpoint(value="/ws/{roomID}")
public class ChatServer {

    // contains a static List of ChatRoom used to control the existing rooms and their users

    // you may add other attributes as you see fit

    // a hashmap for recording the client name
    private Map<String, String> usernames = new HashMap<String, String>();

    @OnOpen
    public void open(@PathParam("roomID") String roomID, Session session) throws IOException, EncodeException {
        String time = getTime();
        session.getBasicRemote().sendText("{\"type\": \"chat\", \"message\":\"[" + time + "] (Server): Welcome to the chat room: "+roomID+". Please state your username to begin.\"}");
    }

    @OnClose
    public void close(Session session) throws IOException, EncodeException {
        String userId = session.getId();
        String time = getTime();
        // do things for when the connection close

        if (usernames.containsKey(userId)) {
            String username = usernames.get(userId);
            usernames.remove(userId);
            //broadcast this person left the server
            for (Session peer : session.getOpenSessions()){
                peer.getBasicRemote().sendText("{\"type\": \"chat\", \"message\":\"[" + time + "] (Server): " + username + " left the chat room.\"}");
            }
        }

    }

    @OnMessage
    public void handleMessage(String comm, Session session) throws IOException, EncodeException {
//        example getting unique userID that sent this message
        String userId = session.getId();
        String time = getTime();
        String currentDate = LocalDate.now().toString();


//        Example conversion of json messages from the client
        JSONObject jsonmsg = new JSONObject(comm);
        //String val1 = (String) jsonmsg.get("attribute1");
        //String val2 = (String) jsonmsg.get("attribute2");
        String type = (String) jsonmsg.get("type");
        String message = (String) jsonmsg.get("msg");

        // handle the messages

        if(usernames.containsKey(userId)){
            String username = usernames.get(userId);


            System.out.println(username);
            for(Session peer: session.getOpenSessions()){
                peer.getBasicRemote().sendText("{\"type\": \"chat\", \"message\":\"(" + username + ")[" + time +"]:" + message+"\"}");
            }
        }else{ //first message is their username
            String userInfo = currentDate + " " + message;
            usernames.put(userId,userInfo);

            session.getBasicRemote().sendText("{\"type\": \"chat\", \"message\":\"[" + time + "] (Server): Welcome, " + message + "!\"}");
            //broadcast this person joined the server to the rest
            for(Session peer: session.getOpenSessions()){
                if(!peer.getId().equals(userId)){
                    peer.getBasicRemote().sendText("{\"type\": \"chat\", \"message\":\"[" + time + "] (Server): " + message + " joined the chat room.\"}");
                }
            }
        }
    }
    public static String getTime() {
        // get time
        LocalTime currentTime = LocalTime.now();

        // format to hour:minute:second
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm:ss");

        // turn into string
        String formattedTime = currentTime.format(formatter);
        return formattedTime;
    }


}