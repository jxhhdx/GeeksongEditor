// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            markdown::render_markdown,
            fs::read_file,
            fs::write_file,
            fs::list_md_files,
            config::load_config,
            config::save_config,
            export::export_html,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

mod markdown;
mod fs;
mod config;
mod export;
