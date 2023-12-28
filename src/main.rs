#[macro_use]
extern crate rouille;

mod routes;
mod save;

use std::{
    io::{ErrorKind, Read},
    sync::{mpsc::Receiver, Mutex},
};

use rouille::{websocket, Response};

fn main() {
    let routes = routes::Routes::load();

    // Store references to our socket list and save data
    let save_data = Mutex::new(save::load_save());
    let socket: Mutex<Vec<Receiver<websocket::Websocket>>> = Mutex::new(Vec::new());

    println!("Overlay is found on localhost:3000");
    println!("Controller is found on localhost:3000/controller");
    println!("Use the controller to update your challenge progress. The overlay will automatically reflect it!");
    println!("Make sure not to close this window until you're done!");

    rouille::start_server("localhost:3000", move |request| {
        // Handle static file serving
        {
            let response = rouille::match_assets(&request, "public");

            if response.is_success() {
                return response;
            }
        }

        router!(request,

            // Routes
            (GET) (/) => {
                Response::html(routes.get("index").unwrap())
            },

            (GET) (/controller) => {
                Response::html(routes.get("controller").unwrap())
            },

            // API
            (GET) (/api/save-data) => {
                // Send back the save data as a JSON string
                let sd: save::SaveData = save_data.lock().unwrap().clone();
                let txt = serde_json::to_string(&sd).unwrap();
                Response::text(txt)
            },

            (POST) (/api/save-data) => {
                // Read request body
                let mut data = "".to_string();
                match request.data().unwrap().read_to_string(&mut data) {
                    Ok(_) => (),
                    Err(e) => {
                        println!("Error reading payload: {}", e);
                        Response::empty_400();
                    }
                }

                // Write the save data
                *save_data.lock().unwrap() = serde_json::from_str::<save::SaveData>(&data).unwrap().into();
                save::write_save(&save_data.lock().unwrap());

                // If there's no sockets to send data to, we're done here
                let mut sockets = socket.lock().unwrap();
                if sockets.len() == 0 {
                    println!("No sockets to send messages to, overlay is probably not updating properly.");
                    println!("Try to refresh your browser capture.");
                    return Response::empty_204();
                }

                // Go through our sockets and send the new save data to each
                let mut to_remove = Vec::new();
                for (idx, socket) in sockets.iter().enumerate() {
                    match socket.recv() {
                        Ok(ref mut s) => {
                            match s.send_text(&data) {
                                Ok(_) => (),
                                Err(e) => {
                                    println!("Error sending socket data: {:?}", e);
                                    match e {
                                        rouille::websocket::SendError::IoError(err) => if let ErrorKind::ConnectionAborted = err.kind() {
                                            println!("This code means that it was probably OBS being finicky. Don't worry about it.")
                                        }
                                        _ => ()
                                    }

                                },
                            }
                        }
                        Err(_) => {
                            // Socket could be expired, remove it if it is
                            to_remove.push(idx);
                        },
                    }
                }

                // If a socket has expired, remove it
                for idx in to_remove.iter().rev() {
                    sockets.swap_remove(*idx);
                }
                Response::empty_204()
            },

            // Handles incoming websocket requests
            (GET) (/ws) => {
                let (response, websocket) = try_or_400!(websocket::start(&request, Some("tater")));

                // Add the socket to our running list of active sockets
                socket.lock().unwrap().push(websocket);
                response
            },

            // 404 if the request hasn't matched
            _ => rouille::Response::empty_404()
        )
    });
}
