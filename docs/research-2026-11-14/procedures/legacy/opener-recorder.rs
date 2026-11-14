#![windows_subsystem = "windows"]
use std::{env, fs, process};
fn main() {
    let Some(path) = env::var_os("MCP_RECORDER_OUTPUT") else { process::exit(2) };
    let args: Vec<String> = env::args_os().skip(1).map(|v| v.to_string_lossy().into_owned()).collect();
    if fs::write(path, args.join("\n")).is_err() { process::exit(3) }
}
