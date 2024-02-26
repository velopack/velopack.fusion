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

#[cfg(target_os = "linux")]
/// Automatically locates the current app's important paths. If the app is not installed, it will return an error.
pub fn auto_locate() -> Result<VelopackLocator> {
    let path = std::env::current_exe()?;
    let path = path.to_string_lossy();
    let idx = path.find("/usr/bin/");
    if idx.is_none() {
        bail!("Unable to locate '/usr/bin/' directory in path: {}", path);
    }
    let idx = idx.unwrap();
    let root_app_dir = PathBuf::from(path[..idx].to_string());
    let contents_dir = root_app_dir.join("usr").join("bin");
    let update_exe_path = contents_dir.join("UpdateNix");
    let metadata_path = contents_dir.join("sq.version");

    if !update_exe_path.exists() {
        bail!("Unable to locate UpdateMac in directory: {}", contents_dir.to_string_lossy());
    }

    let app = read_current_manifest(&metadata_path)?;
    Ok(VelopackLocator {
        root_app_dir,
        update_exe_path,
        packages_dir: PathBuf::from("/var/tmp/velopack").join(&app.id).join("packages"),
        manifest: app,
    })
}

#[cfg(target_os = "macos")]
/// Automatically locates the current app's important paths. If the app is not installed, it will return an error.
pub fn auto_locate() -> Result<VelopackLocator> {
    let path = std::env::current_exe()?;
    let path = path.to_string_lossy();
    let idx = path.find(".app/");
    if idx.is_none() {
        bail!("Unable to locate '.app' directory in path: {}", path);
    }
    let idx = idx.unwrap();
    let path = path[..(idx + 4)].to_string();

    let root_app_dir = PathBuf::from(&path);
    let contents_dir = root_app_dir.join("Contents").join("MacOS");
    let update_exe_path = contents_dir.join("UpdateMac");
    let metadata_path = contents_dir.join("sq.version");

    if !update_exe_path.exists() {
        bail!("Unable to locate UpdateMac in directory: {}", contents_dir.to_string_lossy());
    }

    let app = read_current_manifest(&metadata_path)?;
    Ok(VelopackLocator {
        root_app_dir,
        update_exe_path,
        packages_dir: PathBuf::from("/tmp/velopack").join(&app.id).join("packages"),
        manifest: app,
    })
}

fn read_current_manifest(nuspec_path: &PathBuf) -> Result<Manifest> {
    if nuspec_path.exists() {
        if let Ok(nuspec) = util::retry_io(|| std::fs::read_to_string(&nuspec_path)) {
            return Ok(manifest::read_manifest_from_string(&nuspec)?);
        }
    }
    bail!("Unable to read nuspec file in current directory.")
}
