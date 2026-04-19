use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct EditorConfig {
    #[serde(default)]
    pub theme: String,
    #[serde(default = "default_font_size")]
    pub font_size: u32,
    #[serde(default = "default_true")]
    pub word_wrap: bool,
    #[serde(default)]
    pub recent_folders: Vec<String>,
}

fn default_font_size() -> u32 {
    14
}
fn default_true() -> bool {
    true
}

impl Default for EditorConfig {
    fn default() -> Self {
        Self {
            theme: "light".to_string(),
            font_size: 14,
            word_wrap: true,
            recent_folders: Vec::new(),
        }
    }
}

fn config_path() -> Result<PathBuf, String> {
    let dir = dirs::config_dir()
        .ok_or("Cannot find config dir")?
        .join("geeksong-editor");
    fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    Ok(dir.join("config.toml"))
}

#[tauri::command]
pub fn load_config() -> Result<EditorConfig, String> {
    let path = config_path()?;
    if !path.exists() {
        return Ok(EditorConfig::default());
    }
    let content = fs::read_to_string(&path).map_err(|e| e.to_string())?;
    let config: EditorConfig = toml::from_str(&content).map_err(|e| e.to_string())?;
    Ok(config)
}

#[tauri::command]
pub fn save_config(config: EditorConfig) -> Result<(), String> {
    let path = config_path()?;
    let content = toml::to_string_pretty(&config).map_err(|e| e.to_string())?;
    fs::write(&path, content).map_err(|e| e.to_string())
}
