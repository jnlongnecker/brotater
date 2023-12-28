#[macro_use]
extern crate rouille;

mod routes;
mod save;

use std::{io::Read, sync::Mutex};

use rouille::Response;

fn main() {
    let routes = routes::Routes::load();
    let save_data = Mutex::new(save::load_save());

    println!("Overlay is found on localhost:3000");
    println!("Controller is found on localhost:3000/controller");
    println!("Use the controller to update your challenge progress. The overlay will automatically reflect it!");

    rouille::start_server("localhost:3000", move |request| {
        {
            let response = rouille::match_assets(&request, "public");

            if response.is_success() {
                return response;
            }
        }

        router!(request,
            (GET) (/) => {
                Response::html(routes.get("index").unwrap())
            },

            (GET) (/controller) => {
                Response::html(routes.get("controller").unwrap())
            },

            (GET) (/api/save-data) => {
                let sd: save::SaveData = save_data.lock().unwrap().clone();
                let txt = serde_json::to_string(&sd).unwrap();
                Response::text(txt)
            },

            (POST) (/api/save-data) => {
                let mut data = "".to_string();
                match request.data().unwrap().read_to_string(&mut data) {
                    Ok(_) => (),
                    Err(e) => {
                        println!("{}", e);
                    }
                }
                *save_data.lock().unwrap() = serde_json::from_str::<save::SaveData>(&data).unwrap().into();
                save::write_save(&save_data.lock().unwrap());
                Response::empty_204()
            },

            // Default 404 route as with all examples.
            _ => rouille::Response::empty_404()
        )
    });
}
