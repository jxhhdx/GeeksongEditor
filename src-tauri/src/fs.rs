use serde::Serialize;
use std::fs;
use std::path::Path;

#[derive(Serialize)]
pub struct MdFile {
    pub name: String,
    pub path: String,
}

#[tauri::command]
pub fn read_file(path: String) -> Result<String, String> {
    fs::read_to_string(&path).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn write_file(path: String, content: String) -> Result<(), String> {
    fs::write(&path, content).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn list_md_files(dir: String) -> Result<Vec<MdFile>, String> {
    let path = Path::new(&dir);
    if !path.is_dir() {
        return Err("Not a directory".to_string());
    }

    let mut files = Vec::new();
    let entries = fs::read_dir(path).map_err(|e| e.to_string())?;

    for entry in entries {
        let entry = entry.map_err(|e| e.to_string())?;
        let name = entry.file_name().to_string_lossy().to_string();
        if name.ends_with(".md") || name.ends_with(".markdown") {
            let full_path = entry.path().to_string_lossy().to_string();
            files.push(MdFile { name, path: full_path });
        }
    }

    files.sort_by(|a, b| a.name.cmp(&b.name));
    Ok(files)
}
