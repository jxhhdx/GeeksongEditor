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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_render_heading() {
        let result = render_markdown("# Hello".to_string());
        assert!(result.html.contains("<h1>Hello</h1>"));
    }

    #[test]
    fn test_render_bold() {
        let result = render_markdown("**bold**".to_string());
        assert!(result.html.contains("<strong>bold</strong>"));
    }

    #[test]
    fn test_render_table() {
        let md = "| a | b |\n|---|---|\n| 1 | 2 |";
        let result = render_markdown(md.to_string());
        assert!(result.html.contains("<table>"));
        assert!(result.html.contains("<th>a</th>"));
    }

    #[test]
    fn test_render_tasklist() {
        let md = "- [x] done\n- [ ] todo";
        let result = render_markdown(md.to_string());
        assert!(result.html.contains("<input"));
        assert!(result.html.contains("checked"));
    }

    #[test]
    fn test_render_code_block() {
        let md = "```rust\nlet x = 1;\n```";
        let result = render_markdown(md.to_string());
        assert!(result.html.contains("<pre>"));
        assert!(result.html.contains("<code"));
        assert!(result.html.contains("let x = 1;"));
    }
}
