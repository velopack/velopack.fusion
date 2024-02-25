use std::process::exit;

pub struct VelopackApp {}

impl VelopackApp {
    pub fn build() -> Self {
        VelopackApp {}
    }
    pub fn run(&self) {
        for (_, arg) in std::env::args().enumerate() {
            match arg.to_ascii_lowercase().as_str() {
                "--veloapp-install" => exit(0),
                "--veloapp-updated" => exit(0),
                "--veloapp-obsolete" => exit(0),
                "--veloapp-uninstall" => exit(0),
                _ => {}
            }
        }
    }
}
