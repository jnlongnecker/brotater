use std::{collections::HashMap, fs};

use serde::{Deserialize, Serialize};

// Paths for save files
const SAVE_PATH: &str = "public/save.json";
const BLANK_SAVE: &str = "public/blank-save.json";

#[derive(Serialize, Deserialize, Clone)]
pub struct Statistics {
    pub img: String,
    pub wins: u32,
    pub losses: u32,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct SaveData {
    pub master_list: Vec<String>,
    pub completed: Vec<String>,
    pub current: String,
    pub stats: HashMap<String, Statistics>,
}

/// Loads the save.json from disk or the blank-save.json if the save doesn't exist
pub fn load_save() -> SaveData {
    println!("Loading saved stats...");

    let data = match fs::read_to_string(SAVE_PATH) {
        Ok(raw_file) => serde_json::from_str::<SaveData>(&raw_file).unwrap(),
        // Save file could potentially not exist, so load the blank save as a backup
        Err(_) => {
            let raw_file = fs::read_to_string(BLANK_SAVE).unwrap();
            serde_json::from_str::<SaveData>(&raw_file).unwrap()
        }
    };

    println!("Save data loaded!");

    data
}

/// Write to disk the supplied data as a save
pub fn write_save(data: &SaveData) {
    match fs::write(SAVE_PATH, serde_json::to_string_pretty(data).unwrap()) {
        Ok(_) => (),
        Err(msg) => {
            println!("Error writing save file: {}", msg);
        }
    }
}
