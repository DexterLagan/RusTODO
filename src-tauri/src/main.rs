#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use rfd::FileDialog;

#[tauri::command]
fn save_file(content: String) -> Result<bool, String> {
    let path = FileDialog::new()
        .set_title("Save todo list")
        .set_file_name("totoist.txt")
        .save_file();
    match path {
        Some(p) => {
            std::fs::write(&p, content).map_err(|e| e.to_string())?;
            Ok(true)
        }
        None => Ok(false),
    }
}

#[tauri::command]
fn load_file() -> Result<Option<String>, String> {
    let path = FileDialog::new().set_title("Load todo list").pick_file();
    match path {
        Some(p) => std::fs::read_to_string(&p).map(Some).map_err(|e| e.to_string()),
        None => Ok(None),
    }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![save_file, load_file])
        .run(tauri::generate_context!())
        .expect("error while running totoist");
}
