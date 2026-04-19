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

#[cfg(test)]
mod tests {
    use super::*;
    use std::io::Write;

    #[test]
    fn test_read_write_file() {
        let dir = std::env::temp_dir().join("geeksong_test_fs");
        let _ = fs::create_dir_all(&dir);
        let path = dir.join("test.txt").to_string_lossy().to_string();

        write_file(path.clone(), "hello rust".to_string()).unwrap();
        let content = read_file(path).unwrap();
        assert_eq!(content, "hello rust");

        let _ = fs::remove_dir_all(&dir);
    }

    #[test]
    fn test_list_md_files() {
        let dir = std::env::temp_dir().join("geeksong_test_md");
        let _ = fs::remove_dir_all(&dir);
        fs::create_dir_all(&dir).unwrap();

        let mut f1 = fs::File::create(dir.join("a.md")).unwrap();
        writeln!(f1, "# A").unwrap();
        let mut f2 = fs::File::create(dir.join("b.md")).unwrap();
        writeln!(f2, "# B").unwrap();
        let mut f3 = fs::File::create(dir.join("c.txt")).unwrap();
        writeln!(f3, "not md").unwrap();

        let files = list_md_files(dir.to_string_lossy().to_string()).unwrap();
        assert_eq!(files.len(), 2);
        assert_eq!(files[0].name, "a.md");
        assert_eq!(files[1].name, "b.md");

        let _ = fs::remove_dir_all(&dir);
    }

    #[test]
    fn test_list_md_files_not_a_dir() {
        let result = list_md_files("/nonexistent/path/12345".to_string());
        assert!(result.is_err());
    }
}
