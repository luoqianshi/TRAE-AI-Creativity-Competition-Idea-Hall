#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod core;
mod window;

fn main() {
    window::run();
}
