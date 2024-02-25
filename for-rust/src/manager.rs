use anyhow::Result;
use semver::Version;
use serde::{Deserialize, Serialize};
use std::{
    fs,
    path::{Path, PathBuf},
    process::exit,
    process::Command as Process,
};

use crate::{
    download,
    locator::{self, VelopackLocator},
    manifest::Manifest,
    util,
};

#[cfg(target_os = "windows")]
use std::os::windows::process::CommandExt;

#[cfg(feature = "async")]
use async_std::channel::Sender;
#[cfg(feature = "async")]
use async_std::task::JoinHandle;

#[allow(non_snake_case)]
#[derive(Serialize, Deserialize, Debug, Clone, Default)]
#[serde(default)]
/// A feed of Velopack assets, usually retrieved from a remote location.
pub struct VelopackAssetFeed {
    /// The list of assets in the (probably remote) update feed.
    pub Assets: Vec<VelopackAsset>,
}

#[allow(non_snake_case)]
#[derive(Serialize, Deserialize, Debug, Clone, Default)]
#[serde(default)]
/// An individual Velopack asset, could refer to an asset on-disk or in a remote package feed.
pub struct VelopackAsset {
    /// The name or Id of the package containing this release.
    pub PackageId: String,
    /// The version of this release.
    pub Version: String,
    /// The type of asset (eg. "Full" or "Delta").
    pub Type: String,
    /// The filename of the update package containing this release.
    pub FileName: String,
    /// The SHA1 checksum of the update package containing this release.
    pub SHA1: String,
    /// The size in bytes of the update package containing this release.
    pub Size: u64,
    /// The release notes in markdown format, as passed to Velopack when packaging the release. This may be an empty string.
    pub NotesMarkdown: String,
    /// The release notes in HTML format, transformed from Markdown when packaging the release. This may be an empty string.
    pub NotesHtml: String,
}

#[allow(non_snake_case)]
#[derive(Serialize, Deserialize, Debug, Clone, Default)]
#[serde(default)]
/// Holds information about the current version and pending updates, such as how many there are, and access to release notes.
pub struct UpdateInfo {
    /// The available version that we are updating to.
    pub TargetFullRelease: VelopackAsset,
    /// True if the update is a version downgrade or lateral move (such as when switching channels to the same version number).
    /// In this case, only full updates are allowed, and any local packages on disk newer than the downloaded version will be
    /// deleted.
    pub IsDowngrade: bool,
}

impl AsRef<VelopackAsset> for UpdateInfo {
    fn as_ref(&self) -> &VelopackAsset {
        &self.TargetFullRelease
    }
}

#[derive(Clone)]
#[allow(non_snake_case)]
/// Options to customise the behaviour of UpdateManager.
pub struct UpdateOptions {
    /// Allows UpdateManager to update to a version that's lower than the current version (i.e. downgrading).
    /// This could happen if a release has bugs and was retracted from the release feed, or if you're using
    /// ExplicitChannel to switch channels to another channel where the latest version on that
    /// channel is lower than the current version.
    pub AllowVersionDowngrade: bool,
    /// **This option should usually be left None**. <br/>
    /// Overrides the default channel used to fetch updates.
    /// The default channel will be whatever channel was specified on the command line when building this release.
    /// For example, if the current release was packaged with '--channel beta', then the default channel will be 'beta'.
    /// This allows users to automatically receive updates from the same channel they installed from. This options
    /// allows you to explicitly switch channels, for example if the user wished to switch back to the 'stable' channel
    /// without having to reinstall the application.
    pub ExplicitChannel: Option<String>,
}

#[derive(Clone)]
/// Provides functionality for checking for updates, downloading updates, and applying updates to the current application.
pub struct UpdateManager {
    allow_version_downgrade: bool,
    explicit_channel: Option<String>,
    url_or_path: String,
    paths: VelopackLocator,
}

/// Arguments to pass to the Update.exe process when restarting the application after applying updates.
pub enum RestartArgs<'a> {
    /// No arguments to pass to the restart process.
    None,
    /// Arguments to pass to the restart process, as borrowed strings.
    Some(Vec<&'a str>),
    /// Arguments to pass to the restart process, as owned strings.
    SomeOwned(Vec<String>),
}

impl<'a> IntoIterator for RestartArgs<'a> {
    type Item = String;
    type IntoIter = std::vec::IntoIter<String>;

    fn into_iter(self) -> Self::IntoIter {
        match self {
            RestartArgs::None => Vec::new().into_iter(),
            RestartArgs::Some(args) => args.into_iter().map(|s| s.to_string()).collect::<Vec<String>>().into_iter(),
            RestartArgs::SomeOwned(args) => args.into_iter().collect::<Vec<String>>().into_iter(),
        }
    }
}

impl UpdateManager {
    /// Create a new UpdateManager instance. This will return an error if the application is not yet installed.
    pub fn new<S: AsRef<str>>(url_or_path: S, options: Option<UpdateOptions>) -> Result<UpdateManager> {
        Ok(UpdateManager {
            paths: locator::auto_locate()?,
            allow_version_downgrade: options.as_ref().map(|f| f.AllowVersionDowngrade).unwrap_or(false),
            explicit_channel: options.as_ref().map(|f| f.ExplicitChannel.clone()).unwrap_or(None),
            url_or_path: url_or_path.as_ref().to_string(),
        })
    }

    /// The currently installed app version when you created your release.
    pub fn current_version(&self) -> Result<String> {
        Ok(self.paths.manifest.version.to_string())
    }

    /// Checks for updates, returning None if there are none available. If there are updates available, this method will return an
    /// UpdateInfo object containing the latest available release, and any delta updates that can be applied if they are available.
    pub fn check_for_updates(&self) -> Result<Option<UpdateInfo>> {
        let path = self.url_or_path.clone();
        let allow_downgrade = self.allow_version_downgrade;
        let channel = self.explicit_channel.as_deref();
        let result = if util::is_http_url(&path) {
            info!("Checking for updates from URL: {}", path);
            check_url(&self.paths.manifest, &path, allow_downgrade, channel)
        } else {
            let buf = PathBuf::from(&path);
            info!("Checking for updates from Local Path: {}", buf.to_string_lossy());
            if !buf.exists() {
                bail!("Path must be a valid HTTP Url or a path to an existing directory: {}", path);
            }
            check_dir(&self.paths.manifest, buf, allow_downgrade, channel)
        };
        result
    }

    #[cfg(feature = "async")]
    /// Checks for updates, returning None if there are none available. If there are updates available, this method will return an
    /// UpdateInfo object containing the latest available release, and any delta updates that can be applied if they are available.
    pub fn check_for_updates_async(&self) -> JoinHandle<Result<Option<UpdateInfo>>> {
        let self_clone = self.clone();
        async_std::task::spawn_blocking(move || self_clone.check_for_updates())
    }

    /// Downloads the specified updates to the local app packages directory. If the update contains delta packages and the delta feature is enabled
    /// this method will attempt to unpack and prepare them. If there is no delta update available, or there is an error preparing delta
    /// packages, this method will fall back to downloading the full version of the update. This function will acquire a global update lock
    /// so may fail if there is already another update operation in progress.
    pub fn download_updates<A>(&self, update: &UpdateInfo, mut progress: A) -> Result<()>
    where
        A: FnMut(i16),
    {
        let path = &self.url_or_path;
        let name = &update.TargetFullRelease.FileName;
        let packages_dir = &self.paths.packages_dir;
        let target_file = packages_dir.join(name);

        let mut to_delete = Vec::new();

        let g = format!("{}/*.nupkg", packages_dir.to_string_lossy());
        info!("Searching for packages to clean in: '{}'", g);
        match glob::glob(&g) {
            Ok(paths) => {
                for path in paths {
                    if let Ok(path) = path {
                        to_delete.push(path);
                    }
                }
            }
            Err(e) => {
                error!("Error while searching for packages to clean: {}", e);
            }
        }

        if util::is_http_url(path) {
            info!("About to download from URL '{}' to file '{}'", path, target_file.to_string_lossy());
            download::download_url_to_file(path, &target_file.to_string_lossy(), &mut progress)?;
        } else {
            let source_path = Path::new(path);
            let source_file = source_path.join(name);
            info!("About to copy local file from '{}' to '{}'", source_file.to_string_lossy(), target_file.to_string_lossy());

            if !source_file.exists() {
                bail!("Local file does not exist: {}", source_file.to_string_lossy());
            }

            progress(50);
            fs::copy(&source_file, &target_file)?;
        }

        info!("Successfully placed file: '{}'", target_file.to_string_lossy());

        for path in to_delete {
            info!("Cleaning up old package: '{}'", path.to_string_lossy());
            fs::remove_file(&path)?;
        }

        progress(100);
        Ok(())
    }

    #[cfg(feature = "async")]
    /// Downloads the specified updates to the local app packages directory. If the update contains delta packages and the delta feature is enabled
    /// this method will attempt to unpack and prepare them. If there is no delta update available, or there is an error preparing delta
    /// packages, this method will fall back to downloading the full version of the update. This function will acquire a global update lock
    /// so may fail if there is already another update operation in progress.
    pub fn download_updates_async(&self, update: &UpdateInfo, progress: Option<Sender<i16>>) -> JoinHandle<Result<()>> {
        let self_clone = self.clone();
        let update_clone = update.clone();
        if let Some(p) = progress {
            async_std::task::spawn_blocking(move || {
                self_clone.download_updates(&update_clone, move |x| {
                    let _ = p.try_send(x);
                })
            })
        } else {
            async_std::task::spawn_blocking(move || self_clone.download_updates(&update_clone, |_| {}))
        }
    }

    /// This will exit your app immediately, apply updates, and then optionally relaunch the app using the specified
    /// restart arguments. If you need to save state or clean up, you should do that before calling this method.
    /// The user may be prompted during the update, if the update requires additional frameworks to be installed etc.
    pub fn apply_updates_and_restart<T: AsRef<VelopackAsset>>(&self, to_apply: T, restart_args: RestartArgs) -> Result<()> {
        self.wait_exit_then_apply_updates(to_apply, false, true, restart_args)?;
        exit(0);
    }

    /// This will exit your app immediately, apply updates, and then optionally relaunch the app using the specified
    /// restart arguments. If you need to save state or clean up, you should do that before calling this method.
    /// The user may be prompted during the update, if the update requires additional frameworks to be installed etc.
    pub fn apply_updates_and_exit<T: AsRef<VelopackAsset>>(&self, to_apply: T) -> Result<()> {
        self.wait_exit_then_apply_updates(to_apply, false, false, RestartArgs::None)?;
        exit(0);
    }

    /// This will launch the Velopack updater and tell it to wait for this program to exit gracefully.
    /// You should then clean up any state and exit your app. The updater will apply updates and then
    /// optionally restart your app. The updater will only wait for 60 seconds before giving up.
    pub fn wait_exit_then_apply_updates<T>(&self, to_apply: T, silent: bool, restart: bool, restart_args: RestartArgs) -> Result<()>
    where
        T: AsRef<VelopackAsset>,
    {
        let to_apply = to_apply.as_ref();
        let pkg_path = self.paths.packages_dir.join(&to_apply.FileName);
        let pkg_path_str = pkg_path.to_string_lossy();

        let mut args = Vec::new();
        args.push("apply".to_string());
        args.push("--wait".to_string());
        args.push("--package".to_string());
        args.push(pkg_path_str.into_owned());

        if silent {
            args.push("--silent".to_string());
        }
        if restart {
            args.push("--restart".to_string());
        }

        match restart_args {
            RestartArgs::None => {}
            RestartArgs::Some(ref ra) => {
                args.push("--".to_string());
                for arg in ra {
                    args.push(arg.to_string());
                }
            }
            RestartArgs::SomeOwned(ref ra) => {
                args.push("--".to_string());
                for arg in ra {
                    args.push(arg.clone());
                }
            }
        }

        let mut p = Process::new(&self.paths.update_exe_path);
        p.args(&args);
        p.current_dir(&self.paths.root_app_dir);

        #[cfg(target_os = "windows")]
        {
            const CREATE_NO_WINDOW: u32 = 0x08000000;
            p.creation_flags(CREATE_NO_WINDOW);
        }

        info!("About to run Update.exe: {} {:?}", self.paths.update_exe_path.to_string_lossy(), args);
        p.spawn()?;
        Ok(())
    }
}

fn get_default_channel() -> String {
    #[cfg(target_os = "windows")]
    return "win".to_owned();
    #[cfg(target_os = "linux")]
    return "linux".to_owned();
    #[cfg(target_os = "macos")]
    return "osx".to_owned();
}

fn check_url(app: &Manifest, path: &str, allow_downgrade: bool, channel: Option<&str>) -> Result<Option<UpdateInfo>> {
    let mut channel = channel.unwrap_or(&app.channel).to_string();
    if channel.is_empty() {
        channel = get_default_channel();
    }

    let non_default_channel = channel != app.channel;
    let releases_name = format!("releases.{}.json", channel);

    let path = path.trim_end_matches('/').to_owned() + "/";
    let url = url::Url::parse(&path)?;
    let mut releases_url = url.join(&releases_name)?;
    releases_url.set_query(Some(format!("localVersion={}&id={}", app.version, app.id).as_str()));

    info!("Downloading releases for channel {} from: {}", channel, releases_url.to_string());

    let json = download::download_url_as_string(releases_url.as_str())?;
    let feed: VelopackAssetFeed = serde_json::from_str(&json)?;
    process_feed(app, feed, allow_downgrade, non_default_channel)
}

fn check_dir(app: &Manifest, path: PathBuf, allow_downgrade: bool, channel: Option<&str>) -> Result<Option<UpdateInfo>> {
    let mut channel = channel.unwrap_or(&app.channel).to_string();
    if channel.is_empty() {
        channel = get_default_channel();
    }

    let non_default_channel = channel != app.channel;
    let releases_name = format!("releases.{}.json", channel);
    let releases_path = path.join(&releases_name);

    info!("Reading releases file for channel {} from: {}", channel, releases_path.to_string_lossy());

    if !releases_path.exists() {
        bail!("Could not find releases file: {}", path.to_string_lossy());
    }

    let json = fs::read_to_string(&releases_path)?;
    let feed: VelopackAssetFeed = serde_json::from_str(&json)?;
    process_feed(app, feed, allow_downgrade, non_default_channel)
}

fn process_feed(app: &Manifest, feed: VelopackAssetFeed, allow_downgrade: bool, is_non_default_channel: bool) -> Result<Option<UpdateInfo>> {
    let assets = feed.Assets;

    if assets.is_empty() {
        bail!("Zero assets found in releases feed.");
    }

    let mut latest: Option<VelopackAsset> = None;
    let mut latest_version: Version = Version::parse("0.0.0")?;
    for asset in assets {
        if let Ok(sv) = Version::parse(&asset.Version) {
            debug!("Found asset: {} ({}).", asset.FileName, sv.to_string());
            if latest.is_none() || (sv > latest_version && asset.Type.eq_ignore_ascii_case("Full")) {
                latest = Some(asset);
                latest_version = sv;
            }
        }
    }

    if latest.is_none() {
        bail!("No valid full releases found in feed.");
    }

    let remote_version = latest_version;
    let remote_asset = latest.unwrap();

    debug!("Latest remote release: {} ({}).", remote_asset.FileName, remote_version.to_string());

    let mut result: Option<UpdateInfo> = None;

    if remote_version > app.version {
        info!("Found newer remote release available ({} -> {}).", app.version, remote_version);
        result = Some(UpdateInfo { TargetFullRelease: remote_asset, IsDowngrade: false });
    } else if remote_version < app.version && allow_downgrade {
        info!("Found older remote release available and downgrade is enabled ({} -> {}).", app.version, remote_version);
        result = Some(UpdateInfo { TargetFullRelease: remote_asset, IsDowngrade: true });
    } else if remote_version == app.version && allow_downgrade && is_non_default_channel {
        info!("Latest remote release is the same version of a different channel, and downgrade is enabled ({} -> {}).", app.version, remote_version);
        result = Some(UpdateInfo { TargetFullRelease: remote_asset, IsDowngrade: true });
    } else {
        info!("No update available.");
    }

    Ok(result)
}
