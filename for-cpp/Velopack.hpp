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

#include <string>
#include <vector>
#include <thread>

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
#include <stdexcept>
#include <string>
#include <string_view>
#include <unordered_map>
#include <vector>

namespace Velopack
{
class FutureResult;

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
class JsonParseException;
class JsonNode;
class StringAppendable;
class JsonParser;
class Platform;
class ProgressHandler;
class ProcessReadLineHandler;
class DefaultProgressHandler;

enum class VelopackAssetType
{
    unknown,
    full,
    delta
};
class VelopackAsset;
class UpdateInfo;
class ProgressEvent;
class UpdateManager;

class FutureResult
{
public:
    FutureResult() = default;
    static std::shared_ptr<FutureResult> create();
};

class JsonParseException : public std::runtime_error
{
public:
    using std::runtime_error::runtime_error;
};

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
    JsonNodeType getType() const;
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

class StringAppendable
{
public:
    StringAppendable() = default;
    void clear();
    void writeChar(int c);
    std::string toString() const;
private:
    std::ostringstream builder;
    std::ostream * writer;
    bool initialised;
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
    StringAppendable builder;
    JsonToken peekToken();
};

class Platform
{
public:
    /**
     * Starts a new process and sychronously reads/returns its output.
     */
    static std::string startProcessBlocking(const std::vector<std::string> * command_line);
    /**
     * Starts a new process and returns immediately.
     */
    static void startProcessFireAndForget(const std::vector<std::string> * command_line);
    static std::thread startProcessAsyncReadLine(const std::vector<std::string> * command_line, ProcessReadLineHandler * handler);
    /**
     * Returns the path of the current process.
     */
    static std::string getCurrentProcessPath();
    static bool fileExists(std::string path);
    static std::string getUpdateExePath();
    static std::string strTrim(std::string str);
    static std::string pathParent(std::string str);
    static std::string pathJoin(std::string s1, std::string s2);
    static std::string_view pathSeparator();
    static bool isWindows();
    static bool isLinux();
    static bool isOsx();
    /**
     * Returns the name of the operating system.
     */
    static std::string getOsName();
    static void exit(int code);
private:
    Platform() = delete;
};

class ProgressHandler
{
public:
    virtual ~ProgressHandler() = default;
    virtual void onProgress(int progress) = 0;
    virtual void onComplete(std::string assetPath) = 0;
    virtual void onError(std::string error) = 0;
protected:
    ProgressHandler() = default;
};

class ProcessReadLineHandler
{
public:
    ProcessReadLineHandler() = default;
    void setProgressHandler(ProgressHandler * progress);
    bool handleProcessOutputLine(std::string line);
private:
    ProgressHandler * _progress;
};

class DefaultProgressHandler : public ProgressHandler
{
public:
    DefaultProgressHandler() = default;
    void onProgress(int progress) override;
    void onComplete(std::string assetPath) override;
    void onError(std::string error) override;
};

class VelopackAsset
{
public:
    VelopackAsset() = default;
    static std::shared_ptr<VelopackAsset> fromJson(std::string_view json);
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

class UpdateInfo
{
public:
    UpdateInfo() = default;
    static std::shared_ptr<UpdateInfo> fromJson(std::string_view json);
public:
    std::shared_ptr<VelopackAsset> targetFullRelease;
    bool isDowngrade = false;
};

class ProgressEvent
{
public:
    ProgressEvent() = default;
    static std::shared_ptr<ProgressEvent> fromJson(std::string_view json);
public:
    std::string file{""};
    bool complete = false;
    int progress = 0;
    std::string error{""};
};

class UpdateManager
{
public:
    UpdateManager() = default;
    void setUrlOrPath(std::string urlOrPath);
    void setAllowDowngrade(bool allowDowngrade);
    void setExplicitChannel(std::string explicitChannel);
    void setProgressHandler(ProgressHandler * progress);
    /**
     * This function will return the current installed version of the application
     * or throw, if the application is not installed.
     */
    std::string getCurrentVersion() const;
    /**
     * This function will check for updates, and return information about the latest available release.
     */
    std::shared_ptr<UpdateInfo> checkForUpdates() const;
    /**
     * This function will request the update download, and then return immediately.
     * To be informed of progress/completion events, please see UpdateOptions.SetProgressHandler.
     */
    std::thread downloadUpdateAsync(std::shared_ptr<UpdateInfo> updateInfo);
    void applyUpdatesAndExit(std::string assetPath) const;
    void applyUpdatesAndRestart(std::string assetPath, const std::vector<std::string> * restartArgs = nullptr) const;
    void waitExitThenApplyUpdates(std::string assetPath, bool silent, bool restart, const std::vector<std::string> * restartArgs = nullptr) const;
private:
    bool _allowDowngrade = false;
    std::string _explicitChannel{""};
    std::string _urlOrPath{""};
    std::shared_ptr<ProgressHandler> _pDefault = std::make_shared<DefaultProgressHandler>();
    ProgressHandler * _progress = nullptr;
    std::shared_ptr<ProcessReadLineHandler> _readline = std::make_shared<ProcessReadLineHandler>();
};
}