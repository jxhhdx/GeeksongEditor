use crate::markdown::render_markdown;

#[tauri::command]
pub fn export_html(path: String, content: String) -> Result<(), String> {
    let rendered = render_markdown(content);
    let title = std::path::Path::new(&path)
        .file_stem()
        .unwrap_or_default()
        .to_string_lossy();
    let html = format!(
        r#"<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title}</title>
<style>
body {{ max-width: 900px; margin: 2em auto; padding: 0 1em; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #24292f; }}
h1, h2, h3, h4, h5, h6 {{ margin-top: 1.5em; margin-bottom: 0.5em; font-weight: 600; }}
h1 {{ font-size: 2em; border-bottom: 1px solid #d0d7de; padding-bottom: 0.3em; }}
h2 {{ font-size: 1.5em; border-bottom: 1px solid #d0d7de; padding-bottom: 0.3em; }}
p {{ margin-bottom: 1em; }}
pre {{ background: #f6f8fa; padding: 1em; border-radius: 6px; overflow-x: auto; }}
code {{ font-family: 'SFMono-Regular', Consolas, monospace; font-size: 0.875em; background: #f6f8fa; padding: 0.2em 0.4em; border-radius: 3px; }}
pre code {{ background: transparent; padding: 0; }}
blockquote {{ border-left: 4px solid #d0d7de; padding-left: 1em; color: #57606a; margin: 0 0 1em 0; }}
ul, ol {{ padding-left: 1.5em; margin-bottom: 1em; }}
li + li {{ margin-top: 0.25em; }}
img {{ max-width: 100%; }}
table {{ border-collapse: collapse; width: 100%; margin-bottom: 1em; }}
th, td {{ border: 1px solid #d0d7de; padding: 6px 12px; }}
th {{ background: #f6f8fa; font-weight: 600; }}
input[type="checkbox"] {{ margin-right: 0.5em; }}
</style>
</head>
<body>
{body}
</body>
</html>"#,
        title = html_escape::encode_text(&title),
        body = rendered.html
    );
    std::fs::write(&path, html).map_err(|e| e.to_string())
}
