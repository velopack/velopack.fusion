use anyhow::Result;
use std::path::PathBuf;

use crate::{
    manifest::{self, Manifest},
    util,
};

#[derive(Clone)]
/// VelopackLocator provides some utility functions for locating the current app important paths (eg. path to packages, update binary, and so forth).
pub struct VelopackLocator {
    /// The root directory of the current app.
    pub root_app_dir: PathBuf,
    /// The path to the Update.exe binary.
    pub update_exe_path: PathBuf,
    /// The path to the packages directory.
    pub packages_dir: PathBuf,
    /// The current app manifest.
    pub manifest: Manifest,
}

#[cfg(target_os = "windows")]
/// Automatically locates the current app's important paths. If the app is not installed, it will return an error.
pub fn auto_locate() -> Result<VelopackLocator> {
    let mut path = std::env::current_exe()?;
    path.pop(); // current dir
    path.pop(); // root dir
    if (path.join("Update.exe")).exists() {
        return Ok(VelopackLocator {
            root_app_dir: path.clone(),
            update_exe_path: path.join("Update.exe"),
            packages_dir: path.join("packages"),
            manifest: read_current_manifest(&path.join("current").join("sq.version"))?,
        });
    }
    bail!("Unable to locate Update.exe in directory: {}", path.to_string_lossy());
}

fn read_current_manifest(nuspec_path: &PathBuf) -> Result<Manifest> {
    if nuspec_path.exists() {
        if let Ok(nuspec) = util::retry_io(|| std::fs::read_to_string(&nuspec_path)) {
            return Ok(manifest::read_manifest_from_string(&nuspec)?);
        }
    }
    bail!("Unable to read nuspec file in current directory.")
}
