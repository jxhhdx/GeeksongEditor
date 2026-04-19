use pulldown_cmark::{html, Options, Parser};
use serde::Serialize;

#[derive(Serialize)]
pub struct RenderResult {
    pub html: String,
}

#[tauri::command]
pub fn render_markdown(text: String) -> RenderResult {
    let mut options = Options::empty();
    options.insert(Options::ENABLE_TABLES);
    options.insert(Options::ENABLE_FOOTNOTES);
    options.insert(Options::ENABLE_STRIKETHROUGH);
    options.insert(Options::ENABLE_TASKLISTS);
    options.insert(Options::ENABLE_SMART_PUNCTUATION);

    let parser = Parser::new_ext(&text, options);
    let mut html_output = String::new();
    html::push_html(&mut html_output, parser);

    RenderResult { html: html_output }
}
