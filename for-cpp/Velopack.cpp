// Generated automatically with "fut". Do not edit.

    #include <functional>
    #include <iostream>
    #include <fstream>
    #include <sstream>
    #include <thread>
#include <algorithm>
#include <cstdlib>
#include <regex>
#include <stdexcept>
#include "Velopack.hpp"

namespace Velopack
{

std::string Util::getCurrentProcessPath()
{
	std::string ret{""};
	 ret = util_get_own_exe_path(); return ret;
}

bool Util::fileExists(std::string path)
{
	bool ret = false;
	 ret = util_does_file_exist(path); return ret;
}

std::string Util::getUpdateExePath()
{
	std::string exePath{getCurrentProcessPath()};
	if (isWindows()) {
		exePath = pathJoin(pathParent(pathParent(exePath)), "Update.exe");
	}
	else if (isLinux()) {
		exePath = pathJoin(pathParent(exePath), "UpdateNix");
	}
	else if (isOsx()) {
		exePath = pathJoin(pathParent(exePath), "UpdateMac");
	}
	else {
		throw std::runtime_error("Unsupported platform");
	}
	if (!fileExists(exePath)) {
		throw std::runtime_error("Update executable not found: " + exePath);
	}
	return exePath;
}

std::string Util::strTrim(std::string str)
{
	std::cmatch match;
	if (std::regex_search(str.c_str(), match, std::regex("(\\S.*\\S|\\S)"))) {
		return match.str(1);
	}
	return str;
}

std::string Util::pathParent(std::string str)
{
	int ix_win = static_cast<int>(str.rfind('\\'));
	int ix_nix = static_cast<int>(str.rfind('/'));
	int ix = std::max(ix_win, ix_nix);
	return str.substr(0, ix);
}

std::string Util::pathJoin(std::string s1, std::string s2)
{
	while (s1.ends_with('/') || s1.ends_with('\\')) {
		s1.resize(std::ssize(s1) - 1);
	}
	while (s2.starts_with('/') || s2.starts_with('\\')) {
		s2 = s2.substr(1);
	}
	return s1 + std::string(pathSeparator()) + s2;
}

std::string_view Util::pathSeparator()
{
	if (isWindows()) {
		return "\\";
	}
	else {
		return "/";
	}
}

bool Util::isWindows()
{
	return getOsName() == "win32";
}

bool Util::isLinux()
{
	return getOsName() == "linux";
}

bool Util::isOsx()
{
	return getOsName() == "darwin";
}

std::string Util::getOsName()
{
	std::string ret{""};
	 ret = util_current_os_name(); return ret;
}

void Util::exit(int code)
{
	 exit(code); }

std::unique_ptr<VelopackAsset> VelopackAsset::fromJson(std::string_view json)
{
	std::string id{""};
	std::string version{""};
	std::string type{""};
	std::string filename{""};
	std::string sha1{""};
	std::string size{""};
	std::string markdown{""};
	std::string html{""};
	 
            auto obj = nlohmann::json::parse(json);
            for (auto& el : obj.items()) {
                std::string key = el.key();
                if (ci_equal(key, "id")) id = el.value();
                else if (ci_equal(key, "version")) version = el.value();
                else if (ci_equal(key, "type")) type = el.value();
                else if (ci_equal(key, "filename")) filename = el.value();
                else if (ci_equal(key, "sha1")) sha1 = el.value();
                else if (ci_equal(key, "size")) size = el.value();
                else if (ci_equal(key, "markdown")) markdown = el.value();
                else if (ci_equal(key, "html")) html = el.value();
            }
        std::unique_ptr<VelopackAsset> asset = std::make_unique<VelopackAsset>();
	asset->packageId = id;
	asset->version = version;
	asset->fileName = filename;
	asset->sha1 = sha1;
	asset->notesMarkdown = markdown;
	asset->notesHTML = html;
	int i;
	if ([&] { char *ciend; i = std::strtol(size.data(), &ciend, 10); return *ciend == '\0'; }()) {
		asset->size = i;
	}
	if (type == "full" || type == "Full") {
		asset->type = VelopackAssetType::full;
	}
	else if (type == "delta" || type == "Delta") {
		asset->type = VelopackAssetType::delta;
	}
	return asset;
}

std::unique_ptr<UpdateInfo> UpdateInfo::fromJson(std::string_view json)
{
	std::string assetJson{""};
	bool isDowngrade = false;
	
            auto obj = nlohmann::json::parse(json);
            for (auto& el : obj.items()) {
                std::string key = el.key();
                if (ci_equal(key, "targetfullrelease")) {
                    assetJson = el.value().dump();
                } else if (ci_equal(key, "isdowngrade")) {
                    isDowngrade = el.value().get<bool>();
                }
            }
        if (assetJson.empty()) {
		return nullptr;
	}
	std::unique_ptr<UpdateInfo> updateInfo = std::make_unique<UpdateInfo>();
	updateInfo->targetFullRelease = VelopackAsset::fromJson(assetJson);
	updateInfo->isDowngrade = isDowngrade;
	return updateInfo;
}

std::unique_ptr<ProgressEvent> ProgressEvent::fromJson(std::string_view json)
{
	std::string file{""};
	bool complete = false;
	int progress = 0;
	std::string error{""};
	
            auto obj = nlohmann::json::parse(json);
            // Helper lambda to perform case-insensitive comparison
            auto ci_equal = [](const std::string& a, const std::string& b) {
                return std::equal(a.begin(), a.end(), b.begin(), b.end(),
                    [](char a, char b) {
                        return tolower(a) == tolower(b);
                    });
            };
            for (auto& el : obj.items()) {
                std::string key = el.key();
                if (ci_equal(key, "file")) {
                    file = el.value();
                } else if (ci_equal(key, "complete")) {
                    complete = el.value().get<bool>();
                } else if (ci_equal(key, "progress")) {
                    progress = el.value().get<int>();
                } else if (ci_equal(key, "error")) {
                    error = el.value();
                }
            }
        std::unique_ptr<ProgressEvent> progressEvent = std::make_unique<ProgressEvent>();
	progressEvent->file = file;
	progressEvent->complete = complete;
	progressEvent->progress = progress;
	progressEvent->error = error;
	return progressEvent;
}

std::string Platform::startProcessBlocking(const std::vector<std::string> * command_line) const
{
	std::string ret{""};
	 
	        subprocess_s subprocess = util_start_subprocess(command_line, subprocess_option_no_window);

            // read all stdout from the process
            FILE* p_stdout = subprocess_stdout(&subprocess);
            std::filebuf buf = std::basic_filebuf<char>(p_stdout);
            std::istream is(&buf);
            std::stringstream buffer;
            buffer << is.rdbuf();
            ret = buffer.str();
         return Util::strTrim(ret);
}

void Platform::startProcessFireAndForget(const std::vector<std::string> * command_line) const
{
	 util_start_subprocess(command_line, subprocess_option_no_window); }

void Platform::startProcessAsyncReadLine(const std::vector<std::string> * command_line)
{
	 
	        subprocess_s subprocess = util_start_subprocess(command_line, subprocess_option_no_window | subprocess_option_enable_async);

            std::thread outputThread([subprocess, this]() mutable {
                const unsigned BUFFER_SIZE = 1024;
                char readBuffer[BUFFER_SIZE];
                std::string accumulatedData;

                // read all stdout from the process one line at a time
                while (true) {
                    unsigned bytesRead = subprocess_read_stdout(&subprocess, readBuffer, BUFFER_SIZE - 1);

                    if (bytesRead == 0) {
                        // bytesRead is 0, indicating the process has completed
                        // Process any remaining data in accumulatedData as the last line if needed
                        if (!accumulatedData.empty()) {
                            handleProcessOutputLine(accumulatedData);
                        }
                        return;
                    }

                    accumulatedData += std::string(readBuffer, bytesRead);

                    // Process accumulated data for lines
                    size_t pos;
                    while ((pos = accumulatedData.find('\n')) != std::string::npos) {
                        std::string line = accumulatedData.substr(0, pos);
                        if (handleProcessOutputLine(line)) {
                            return; // complete or err
                        }
                        accumulatedData.erase(0, pos + 1);
                    }
                }
            });
        }

void UpdateOptions::setUrlOrPath(std::string urlOrPath)
{
	this->_urlOrPath = urlOrPath;
}

std::string UpdateOptions::getUrlOrPath() const
{
	return this->_urlOrPath;
}

void UpdateOptions::setAllowDowngrade(bool allowDowngrade)
{
	this->_allowDowngrade = allowDowngrade;
}

bool UpdateOptions::getAllowDowngrade() const
{
	return this->_allowDowngrade;
}

void UpdateOptions::setExplicitChannel(std::string explicitChannel)
{
	this->_explicitChannel = explicitChannel;
}

std::string UpdateOptions::getExplicitChannel() const
{
	return this->_explicitChannel;
}

void UpdateOptions::setProgressHandler(const ProgressHandler * progress)
{
	this->_progress = progress;
}

const ProgressHandler * UpdateOptions::getProgressHandler() const
{
	return this->_progress;
}

void UpdateManager::setOptions(const UpdateOptions * options)
{
	this->_options = options;
}

std::string UpdateManager::getCurrentVersion() const
{
	std::vector<std::string> command;
	command.push_back(Util::getUpdateExePath());
	command.push_back("get-version");
	return startProcessBlocking(&command);
}

std::unique_ptr<UpdateInfo> UpdateManager::checkForUpdates() const
{
	if (this->_options == nullptr) {
		throw std::runtime_error("Please call SetOptions before trying to check for updates.");
	}
	std::vector<std::string> command;
	command.push_back(Util::getUpdateExePath());
	command.push_back("check");
	command.push_back("--url");
	command.push_back(this->_options->getUrlOrPath());
	command.push_back("--format");
	command.push_back("json");
	if (this->_options->getAllowDowngrade()) {
		command.push_back("--downgrade");
	}
	std::string explicitChannel{this->_options->getExplicitChannel()};
	if (!explicitChannel.empty()) {
		command.push_back("--channel");
		command.push_back(explicitChannel);
	}
	std::string output{startProcessBlocking(&command)};
	if (output.empty() || output == "null") {
		return nullptr;
	}
	return UpdateInfo::fromJson(output);
}

void UpdateManager::downloadUpdateAsync(std::unique_ptr<UpdateInfo> updateInfo)
{
	if (this->_options == nullptr) {
		throw std::runtime_error("Please call SetOptions before trying to download updates.");
	}
	std::vector<std::string> command;
	command.push_back(Util::getUpdateExePath());
	command.push_back("download");
	command.push_back("--url");
	command.push_back(this->_options->getUrlOrPath());
	command.push_back("--clean");
	command.push_back("--format");
	command.push_back("json");
	command.push_back("--name");
	command.push_back(updateInfo->targetFullRelease->fileName);
	startProcessAsyncReadLine(&command);
}

void UpdateManager::applyUpdatesAndExit(std::string assetPath) const
{
	std::vector<std::string> args;
	waitExitThenApplyUpdates(assetPath, false, false, &args);
	Util::exit(0);
}

void UpdateManager::applyUpdatesAndRestart(std::string assetPath, const std::vector<std::string> * restartArgs) const
{
	waitExitThenApplyUpdates(assetPath, false, true, restartArgs);
	Util::exit(0);
}

void UpdateManager::waitExitThenApplyUpdates(std::string assetPath, bool silent, bool restart, const std::vector<std::string> * restartArgs) const
{
	std::vector<std::string> command;
	command.push_back(Util::getUpdateExePath());
	if (silent) {
		command.push_back("--silent");
	}
	command.push_back("apply");
	command.push_back("--wait");
	if (!assetPath.empty()) {
		command.push_back("--package");
		command.push_back(assetPath);
	}
	if (restart) {
		command.push_back("--restart");
	}
	if (restart && std::ssize(*restartArgs) > 0) {
		command.push_back("--");
		command.insert(command.end(), restartArgs->begin(), restartArgs->end());
	}
	startProcessFireAndForget(&command);
}

bool UpdateManager::handleProcessOutputLine(std::string line)
{
	std::unique_ptr<ProgressEvent> ev = ProgressEvent::fromJson(line);
	if (ev == nullptr) {
		return true;
	}
	if (this->_options->getProgressHandler() == nullptr) {
		return true;
	}
	if (ev->complete) {
		this->_options->getProgressHandler()->onComplete(ev->file);
		return true;
	}
	else if (!ev->error.empty()) {
		this->_options->getProgressHandler()->onError(ev->error);
		return true;
	}
	else {
		this->_options->getProgressHandler()->onProgress(ev->progress);
		return false;
	}
}
}


#include <string>
#include <filesystem>
#include <algorithm>
#include <cctype>
#include <stdexcept>

#if defined(_WIN32)
#define WIN32_LEAN_AND_MEAN
#define PATH_MAX MAX_PATH
#include <windows.h>
#endif // VELO_MSVC

namespace Velopack {

#if UNICODE
void startup(wchar_t** args, size_t c_args) {
    for (size_t i = 0; i < c_args; ++i) {
        if (::std::wstring(args[i]) == L"--veloapp-install") {
            exit(0);
        }
        if (::std::wstring(args[i]) == L"--veloapp-updated") {
            exit(0);
        }
        if (::std::wstring(args[i]) == L"--veloapp-obsolete") {
            exit(0);
        }
        if (::std::wstring(args[i]) == L"--veloapp-uninstall") {
            exit(0);
        }
    }
}
#endif // UNICODE

void startup(char** args, size_t c_args) {
    for (size_t i = 0; i < c_args; ++i) {
        if (::std::string(args[i]) == "--veloapp-install") {
            exit(0);
        }
        if (::std::string(args[i]) == "--veloapp-updated") {
            exit(0);
        }
        if (::std::string(args[i]) == "--veloapp-obsolete") {
            exit(0);
        }
        if (::std::string(args[i]) == "--veloapp-uninstall") {
            exit(0);
        }
    }
}

std::string util_current_os_name()
{
#ifdef __APPLE__
    return "darwin";
#elif defined(_WIN32)
    return "win32";
#else
    return "linux";
#endif
}

std::string util_string_to_lower(std::string str) {
    std::string data = str;
    std::transform(data.begin(), data.end(), data.begin(),
        [](unsigned char c) { return std::tolower(c); });
    return data;
}

bool util_does_file_exist(std::string file_path) {
    return std::filesystem::exists(file_path);
}

std::string util_get_own_exe_path() {
	const size_t buf_size = PATH_MAX;
	char path_buf[buf_size];
	size_t bytes_read = buf_size;

#ifdef __APPLE__
	if (_NSGetExecutablePath(path_buf, &bytes_read) != 0) {
		throw std::runtime_error("Buffer size is too small for executable path.");
	}
#elif defined(_WIN32)
	HMODULE hMod = GetModuleHandleA(NULL);
	bytes_read = GetModuleFileNameA(hMod, path_buf, buf_size);
#else
	bytes_read = readlink("/proc/self/exe", path_buf, bufSize);
	if ((int)bytes_read == -1) {
		throw std::runtime_error("Permission denied to /proc/self/exe.");
	}
#endif

	return std::string(path_buf, bytes_read);
}

bool ci_equal(const std::string& a, const std::string& b) {
    return std::equal(a.begin(), a.end(), b.begin(), b.end(),
        [](char a, char b) {
            return tolower(a) == tolower(b);
        });
}

subprocess_s util_start_subprocess(const std::vector<std::string>* command_line, int options) {
    auto size = command_line->size();
	const char** command_line_array = new const char* [size + 1];
	for (size_t i = 0; i < size; ++i) {
		command_line_array[i] = command_line->at(i).c_str();
	}
	command_line_array[size] = NULL; // last element must be NULL

	struct subprocess_s subprocess;
	int result = subprocess_create(command_line_array, options, &subprocess);
	delete[] command_line_array; // clean up the array

	if (result != 0) {
		throw std::runtime_error("Unable to start Update process.");
	}

	return subprocess;
}

}