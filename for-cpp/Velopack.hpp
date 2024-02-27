//
//  INTRODUCTION
//
//  This is a library to help developers integrate https://velopack.io into their 
//  applications. Velopack is an update/installer framework for cross-platform 
//  desktop applications. 
//  
//  This library is auto-generated using https://github.com/fusionlanguage/fut
//  and this source file should not be directly modified.
//
//  MIT LICENSE
//
//  Copyright (c) 2024 Caelan Sayler
//
//  Permission is hereby granted, free of charge, to any person obtaining a copy
//  of this software and associated documentation files (the "Software"), to deal
//  in the Software without restriction, including without limitation the rights
//  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
//  copies of the Software, and to permit persons to whom the Software is
//  furnished to do so, subject to the following conditions:
//
//  The above copyright notice and this permission notice shall be included in all
//  copies or substantial portions of the Software.
//
//  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
//  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
//  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
//  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
//  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
//  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
//  SOFTWARE.
//

#ifndef VELOPACK_H_INCLUDED
#define VELOPACK_H_INCLUDED

#include <cstddef>

namespace Velopack
{
#if UNICODE
    void startup(wchar_t **args, size_t c_args);
#endif // UNICODE
    void startup(char **args, size_t c_args);
}
#endif // VELOPACK_H_INCLUDED

// Generated automatically with "fut". Do not edit.
#pragma once
#include <cstdint>
#include <iostream>
#include <memory>
#include <sstream>
#include <string>
#include <string_view>
#include <unordered_map>
#include <vector>

namespace Velopack
{

enum class JsonNodeType
{
    null,
    bool_,
    array,
    object,
    number,
    string
};

enum class JsonToken
{
    none,
    curlyOpen,
    curlyClose,
    squareOpen,
    squareClose,
    colon,
    comma,
    string,
    number,
    bool_,
    null
};
class JsonNode;
class JsonParser;
class Platform;
class StringStream;

enum class VelopackAssetType
{
    unknown,
    full,
    delta
};
class VelopackAsset;
class UpdateInfo;
class UpdateManagerSync;

class JsonNode
{
public:
    JsonNode() = default;
    /**
     * Get the type of this node, such as string, object, array, etc.
     * You should use this function and then call the corresponding
     * AsObject, AsArray, AsString, etc. functions to get the actual
     * parsed json information.
     */
    JsonNodeType getKind() const;
    /**
     * Check if the JSON value is null.
     */
    bool isNull() const;
    /**
     * Check if the JSON value is empty - eg. an empty string, array, or object.
     */
    bool isEmpty() const;
    /**
     * Reinterpret a JSON value as an object. Throws exception if the value type was not an object.
     */
    const std::unordered_map<std::string, std::shared_ptr<JsonNode>> * asObject() const;
    /**
     * Reinterpret a JSON value as an array. Throws exception if the value type was not an array.
     */
    const std::vector<std::shared_ptr<JsonNode>> * asArray() const;
    /**
     * Reinterpret a JSON value as a number. Throws exception if the value type was not a double.
     */
    double asNumber() const;
    /**
     * Reinterpret a JSON value as a boolean. Throws exception if the value type was not a boolean.
     */
    bool asBool() const;
    /**
     * Reinterpret a JSON value as a string. Throws exception if the value type was not a string.
     */
    std::string_view asString() const;
    static std::shared_ptr<JsonNode> parse(std::string_view text);
public:
    void initBool(bool value);
    void initArray();
    void addArrayChild(std::shared_ptr<JsonNode> child);
    void initObject();
    void addObjectChild(std::string_view key, std::shared_ptr<JsonNode> child);
    void initNumber(double value);
    void initString(std::string_view value);
private:
    JsonNodeType type = JsonNodeType::null;
    std::unordered_map<std::string, std::shared_ptr<JsonNode>> objectValue;
    std::vector<std::shared_ptr<JsonNode>> arrayValue;
    std::string stringValue;
    double numberValue;
    bool boolValue;
};

class StringStream
{
public:
    StringStream() = default;
    void clear();
    void write(std::string s);
    void writeLine(std::string s);
    void writeChar(int c);
    std::string toString() const;
private:
    std::ostringstream builder;
    std::ostream * writer;
    bool initialised;
    void init();
};

class JsonParser
{
public:
    JsonParser() = default;
    void load(std::string_view text);
    bool endReached() const;
    std::string readN(int n);
    int read();
    int peek() const;
    bool peekWhitespace() const;
    bool peekWordbreak() const;
    void eatWhitespace();
    std::string readWord();
    std::shared_ptr<JsonNode> parseNull();
    std::shared_ptr<JsonNode> parseBool();
    std::shared_ptr<JsonNode> parseNumber();
    std::shared_ptr<JsonNode> parseString();
    std::shared_ptr<JsonNode> parseObject();
    std::shared_ptr<JsonNode> parseArray();
    std::shared_ptr<JsonNode> parseValue();
private:
    std::string text{""};
    int position = 0;
    StringStream builder;
    JsonToken peekToken();
};

class Platform
{
public:
    static std::string startProcessBlocking(const std::vector<std::string> * command_line);
    static void startProcessFireAndForget(const std::vector<std::string> * command_line);
    static int getCurrentProcessId();
    static std::string getCurrentProcessPath();
    static bool fileExists(std::string path);
    static bool isInstalled();
    static std::string getFusionExePath();
    static std::string getUpdateExePath();
    static std::string strTrim(std::string str);
    static std::string pathParent(std::string str);
    static std::string pathJoin(std::string s1, std::string s2);
    static std::string_view pathSeparator();
    static bool isWindows();
    static bool isLinux();
    static bool isOsx();
    static std::string getOsName();
    static void exit(int code);
private:
    Platform() = delete;
    static std::string impl_GetFusionExePath();
    static std::string impl_GetUpdateExePath();
};

/**
 * An individual Velopack asset, could refer to an asset on-disk or in a remote package feed.
 */
class VelopackAsset
{
public:
    VelopackAsset() = default;
    /**
     * Parses a JSON string into a VelopackAsset object.
     */
    static std::shared_ptr<VelopackAsset> fromJson(std::string_view json);
    /**
     * Parses a JSON node into a VelopackAsset object.
     */
    static std::shared_ptr<VelopackAsset> fromNode(std::shared_ptr<JsonNode> node);
public:
    /**
     * The name or Id of the package containing this release.
     */
    std::string packageId{""};
    /**
     * The version of this release.
     */
    std::string version{""};
    /**
     * The type of asset (eg. full or delta).
     */
    VelopackAssetType type = VelopackAssetType::unknown;
    /**
     * The filename of the update package containing this release.
     */
    std::string fileName{""};
    /**
     * The SHA1 checksum of the update package containing this release.
     */
    std::string sha1{""};
    /**
     * The size in bytes of the update package containing this release.
     */
    int64_t size = 0;
    /**
     * The release notes in markdown format, as passed to Velopack when packaging the release.
     */
    std::string notesMarkdown{""};
    /**
     * The release notes in HTML format, transformed from Markdown when packaging the release.
     */
    std::string notesHTML{""};
};

/**
 * Holds information about the current version and pending updates, such as how many there are, and access to release notes.
 */
class UpdateInfo
{
public:
    UpdateInfo() = default;
    /**
     * Parses a JSON string into an UpdateInfo object.
     */
    static std::shared_ptr<UpdateInfo> fromJson(std::string_view json);
public:
    /**
     * The available version that we are updating to.
     */
    std::shared_ptr<VelopackAsset> targetFullRelease;
    /**
     * True if the update is a version downgrade or lateral move (such as when switching channels to the same version number).
     * In this case, only full updates are allowed, and any local packages on disk newer than the downloaded version will be
     * deleted.
     */
    bool isDowngrade = false;
};

/**
 * This class is used to check for updates, download updates, and apply updates. It is a synchronous version of the UpdateManager class.
 * This class is not recommended for use in GUI applications, as it will block the main thread, so you may want to use the async 
 * UpdateManager class instead, if it is supported for your programming language.
 */
class UpdateManagerSync
{
public:
    UpdateManagerSync() = default;
    /**
     * Set the URL or local file path to the update server. This is required before calling CheckForUpdates or DownloadUpdates.
     */
    void setUrlOrPath(std::string urlOrPath);
    /**
     * Allows UpdateManager to update to a version that's lower than the current version (i.e. downgrading).
     * This could happen if a release has bugs and was retracted from the release feed, or if you're using
     * ExplicitChannel to switch channels to another channel where the latest version on that
     * channel is lower than the current version.
     */
    void setAllowDowngrade(bool allowDowngrade);
    /**
     * This option should usually be left null. Overrides the default channel used to fetch updates.
     * The default channel will be whatever channel was specified on the command line when building this release.
     * For example, if the current release was packaged with '--channel beta', then the default channel will be 'beta'.
     * This allows users to automatically receive updates from the same channel they installed from. This options
     * allows you to explicitly switch channels, for example if the user wished to switch back to the 'stable' channel
     * without having to reinstall the application.
     */
    void setExplicitChannel(std::string explicitChannel);
    /**
     * Returns true if the current app is installed, false otherwise. If the app is not installed, other functions in 
     * UpdateManager may throw exceptions, so you may want to check this before calling other functions.
     */
    bool isInstalled() const;
    /**
     * Checks for updates, returning null if there are none available. If there are updates available, this method will return an 
     * UpdateInfo object containing the latest available release, and any delta updates that can be applied if they are available.
     */
    std::string getCurrentVersion() const;
    /**
     * This function will check for updates, and return information about the latest 
     * available release. This function runs synchronously and may take some time to
     * complete, depending on the network speed and the number of updates available.
     */
    std::shared_ptr<UpdateInfo> checkForUpdates() const;
    /**
     * Downloads the specified updates to the local app packages directory. If the update contains delta packages and ignoreDeltas=false, 
     * this method will attempt to unpack and prepare them. If there is no delta update available, or there is an error preparing delta 
     * packages, this method will fall back to downloading the full version of the update. This function will acquire a global update lock
     * so may fail if there is already another update operation in progress.
     */
    void downloadUpdates(const VelopackAsset * toDownload) const;
    /**
     * This will exit your app immediately, apply updates, and then optionally relaunch the app using the specified 
     * restart arguments. If you need to save state or clean up, you should do that before calling this method. 
     * The user may be prompted during the update, if the update requires additional frameworks to be installed etc.
     */
    void applyUpdatesAndExit(const VelopackAsset * toApply) const;
    /**
     * This will exit your app immediately, apply updates, and then optionally relaunch the app using the specified 
     * restart arguments. If you need to save state or clean up, you should do that before calling this method. 
     * The user may be prompted during the update, if the update requires additional frameworks to be installed etc.
     */
    void applyUpdatesAndRestart(const VelopackAsset * toApply, const std::vector<std::string> * restartArgs = nullptr) const;
    /**
     * This will launch the Velopack updater and tell it to wait for this program to exit gracefully.
     * You should then clean up any state and exit your app. The updater will apply updates and then
     * optionally restart your app. The updater will only wait for 60 seconds before giving up.
     */
    void waitExitThenApplyUpdates(const VelopackAsset * toApply, bool silent, bool restart, const std::vector<std::string> * restartArgs = nullptr) const;
protected:
    std::vector<std::string> getCurrentVersionCommand() const;
    std::vector<std::string> getCheckForUpdatesCommand() const;
    std::vector<std::string> getDownloadUpdatesCommand(const VelopackAsset * toDownload) const;
private:
    bool _allowDowngrade = false;
    std::string _explicitChannel{""};
    std::string _urlOrPath{""};
    std::string getPackagesDir() const;
};
}