use std::{collections::HashMap, fs};

// All routes should be found in this directory
const DEFAULT_DIRECTORY: &str = "public/sources";

pub struct Routes {
    route_map: HashMap<String, String>,
}

impl Routes {
    /// Load HTML files in the default directory
    pub fn load() -> Self {
        println!("Loading default routes...");

        // Read the files from the source directory
        let mut map = HashMap::new();
        let paths = fs::read_dir(DEFAULT_DIRECTORY).unwrap();

        // I should probably check the file extension, but I'm lazy. Don't put other stuff in the
        // public folder 😤
        for file_path in paths {
            let file = file_path.unwrap();
            let file_name = file
                .file_name()
                .into_string()
                .unwrap()
                .split('.')
                .collect::<Vec<&str>>()[0]
                .to_string();
            let file_contents = fs::read_to_string(file.path()).unwrap();
            println!("Loaded the {} route", file_name);

            map.insert(file_name, file_contents);
        }
        Routes { route_map: map }
    }

    /// Retrieve an HTML file by its file name
    pub fn get(&self, key: &str) -> Option<&String> {
        self.route_map.get(key)
    }
}
