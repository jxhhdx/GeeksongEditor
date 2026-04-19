import { invoke } from '@tauri-apps/api/core'

export interface RenderResult {
  html: string
}

export interface MdFile {
  name: string
  path: string
}

export interface EditorConfig {
  theme: string
  font_size: number
  word_wrap: boolean
  recent_folders: string[]
}

export function renderMarkdown(text: string): Promise<RenderResult> {
  return invoke('render_markdown', { text })
}

export function readFile(path: string): Promise<string> {
  return invoke('read_file', { path })
}

export function writeFile(path: string, content: string): Promise<void> {
  return invoke('write_file', { path, content })
}

export function listMdFiles(dir: string): Promise<MdFile[]> {
  return invoke('list_md_files', { dir })
}

export function loadConfig(): Promise<EditorConfig> {
  return invoke('load_config')
}

export function saveConfig(config: EditorConfig): Promise<void> {
  return invoke('save_config', { config })
}

export function exportHtml(path: string, content: string): Promise<void> {
  return invoke('export_html', { path, content })
}
