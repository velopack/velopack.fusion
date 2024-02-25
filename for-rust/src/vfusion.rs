mod logging;

use anyhow::Result;
use clap::{arg, ArgMatches, Command};
use std::env;
use velopack::*;

#[macro_use]
extern crate anyhow;
#[macro_use]
extern crate log;

#[rustfmt::skip]
fn root_command() -> Command {
    let cmd = Command::new("Update")
    .version(env!("CARGO_PKG_VERSION"))
    .about(format!("Velopack Fusion ({}) manages and downloads packages.\nhttps://github.com/velopack/velopack", env!("CARGO_PKG_VERSION")))
    .subcommand(Command::new("get-version")
        .about("Prints the current version of the application")
    )
    .subcommand(Command::new("check")
        .about("Checks for available updates")
        .arg(arg!(--url <URL> "URL or local folder containing an update source").required(true))
        .arg(arg!(--downgrade "Allow version downgrade"))
        .arg(arg!(--channel <NAME> "Explicitly switch to a specific channel"))
    )
    .subcommand(Command::new("download")
        .about("Download/copies an available remote file into the packages directory")
        .arg(arg!(--url <URL> "URL or local folder containing an update source").required(true))
        .arg(arg!(--downgrade "Allow version downgrade"))
        .arg(arg!(--channel <NAME> "Explicitly switch to a specific channel"))
    )
    .arg(arg!(--verbose "Print debug messages to console / log").global(true))
    .disable_help_subcommand(true)
    .flatten_help(true);
    return cmd;
}

fn main() -> Result<()> {
    let matches = root_command().get_matches();
    let (subcommand, subcommand_matches) = matches.subcommand().ok_or_else(|| anyhow!("No subcommand was used. Try `--help` for more information."))?;
    let verbose = matches.get_flag("verbose");
    default_logging(verbose)?;

    info!("Starting Velopack Fusion ({})", env!("CARGO_PKG_VERSION"));
    info!("    Location: {}", env::current_exe()?.to_string_lossy());
    info!("    Verbose: {}", verbose);

    // change working directory to the containing directory of the exe
    let mut containing_dir = env::current_exe()?;
    containing_dir.pop();
    env::set_current_dir(containing_dir)?;

    let result = match subcommand {
        "check" => check(subcommand_matches).map_err(|e| anyhow!("Check error: {}", e)),
        "download" => download(subcommand_matches).map_err(|e| anyhow!("Download error: {}", e)),
        "get-version" => get_version(subcommand_matches).map_err(|e| anyhow!("Get-version error: {}", e)),
        _ => bail!("Unknown subcommand. Try `--help` for more information."),
    };

    if let Err(e) = result {
        error!("{}", e);
        return Err(e.into());
    }

    Ok(())
}

pub fn default_logging(verbose: bool) -> Result<()> {
    #[cfg(windows)]
    let default_log_file = {
        let mut my_dir = env::current_exe().unwrap();
        my_dir.pop();
        my_dir.pop();
        my_dir.join("Velopack.log")
    };

    #[cfg(unix)]
    let default_log_file = std::path::Path::new("/tmp/velopack.log").to_path_buf();

    logging::setup_logging(&default_log_file, verbose)
}

fn get_version(_matches: &ArgMatches) -> Result<()> {
    let loc = locator::auto_locate()?;
    println!("{}", loc.manifest.version);
    Ok(())
}

fn check(matches: &ArgMatches) -> Result<()> {
    let url = matches.get_one::<String>("url").unwrap();
    let allow_downgrade = matches.get_flag("downgrade");
    let channel = matches.get_one::<String>("channel").map(|x| x.as_str());

    info!("Command: Check");
    info!("    URL: {:?}", url);
    info!("    Allow Downgrade: {:?}", allow_downgrade);
    info!("    Channel: {:?}", channel);

    let options = UpdateOptions { AllowVersionDowngrade: allow_downgrade, ExplicitChannel: channel.map(|s| s.to_owned()) };
    let um = UpdateManager::new(url, Some(options))?;
    let updates = um.check_for_updates()?;

    if let Some(info) = updates {
        println!("{}", serde_json::to_string(&info)?);
    }

    Ok(())
}

fn download(matches: &ArgMatches) -> Result<()> {
    let url = matches.get_one::<String>("url").unwrap();
    let allow_downgrade = matches.get_flag("downgrade");
    let channel = matches.get_one::<String>("channel").map(|x| x.as_str());

    info!("Command: Download");
    info!("    URL: {:?}", url);
    info!("    Allow Downgrade: {:?}", allow_downgrade);
    info!("    Channel: {:?}", channel);

    let options = UpdateOptions { AllowVersionDowngrade: allow_downgrade, ExplicitChannel: channel.map(|s| s.to_owned()) };
    let um = UpdateManager::new(url, Some(options))?;
    let updates = um.check_for_updates()?;

    if updates.is_none() {
        bail!("No update available");
    }

    let updates = updates.unwrap();
    um.download_updates(&updates, |p| {
        println!("{}", p);
    })?;

    Ok(())
}
