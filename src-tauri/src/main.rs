#![cfg_attr(
all(not(debug_assertions), target_os = "windows"),
windows_subsystem = "windows"
)]

use std::fs;
use tauri::api::dialog::FileDialogBuilder;
use tauri::{CustomMenuItem, Menu, MenuItem, Submenu};

#[derive(Clone, serde::Serialize)]
struct Payload {
    file_name: String,
    value: String,
}

fn main() {
    let app_menu = Submenu::new(
        "App",
        Menu::new()
            .add_native_item(MenuItem::Quit)
            .add_native_item(MenuItem::Minimize),
    );

    let new_file = CustomMenuItem::new("new_file".to_string(), "New File");
    let new_folder = CustomMenuItem::new("new_folder".to_string(), "New Folder");   
    let file_menu = Submenu::new("File", Menu::new().add_item(new_file).add_item(new_folder));

    let menu = Menu::new().add_submenu(app_menu).add_submenu(file_menu);
    tauri::Builder::default()
        .menu(menu)
        .on_menu_event(|event| match event.menu_item_id() {
            "new_file" => FileDialogBuilder::new().pick_file(move |file_path| {
                let file_name = file_path.unwrap().as_path().display().to_string();
                let name = &file_name;
                let file_value = fs::read_to_string(name).unwrap();

                event
                    .window()
                    .emit(
                        "file_open",
                        Payload {
                            file_name: file_name.into(),
                            value: file_value.to_string(),
                        },
                    )
                    .unwrap();
            }),
            "new_folder" => FileDialogBuilder::new().pick_folder(move |folder_path| {
                let folder_name = folder_path.unwrap().as_path().display().to_string();

                let files = fs::read_dir(folder_name).unwrap();
                for file in files {
                    println!("Name: {}", file.unwrap().path().display())
                }
            }),
            _ => {}
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
