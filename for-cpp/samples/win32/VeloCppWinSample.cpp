#define WIN32_LEAN_AND_MEAN
#include <windows.h>
#include <shellapi.h>
#include <stdlib.h>
#include <malloc.h>
#include <memory.h>
#include <tchar.h>
#include "../../Velopack.hpp"
#include "constants.h"

#pragma comment(linker, \
  "\"/manifestdependency:type='Win32' "\
  "name='Microsoft.Windows.Common-Controls' "\
  "version='6.0.0.0' "\
  "processorArchitecture='*' "\
  "publicKeyToken='6595b64144ccf1df' "\
  "language='*'\"")
#pragma comment(lib, "ComCtl32.lib")

HINSTANCE hInst;
const WCHAR szTitle[] = L"Velopack C++ Sample App";
const WCHAR szWindowClass[] = L"VeloCppWinSample";
std::shared_ptr<Velopack::UpdateInfo> updInfo{};
Velopack::UpdateManager manager{};
std::string updPath = "";
std::string currentVersion = "";

class SampleProgressHandler : public Velopack::ProgressHandler
{
public:
	SampleProgressHandler() = default;
	void onProgress(int progress) override
	{
		
	}
	void onComplete(std::string assetPath) override 
	{
		updPath = assetPath;
		std::wstring message = L"Downloaded successfully to: " + std::wstring(updPath.begin(), updPath.end());
	}
	void onError(std::string error) override 
	{

	}
};

std::shared_ptr<SampleProgressHandler> progressHandler = std::make_shared<SampleProgressHandler>();

// Forward declarations of functions included in this code module:
int					MessageBoxCentered(HWND hWnd, LPCTSTR lpText, LPCTSTR lpCaption, UINT uType);
ATOM                MyRegisterClass(HINSTANCE hInstance);
BOOL                InitInstance(HINSTANCE, int);
LRESULT CALLBACK    WndProc(HWND, UINT, WPARAM, LPARAM);
INT_PTR CALLBACK    About(HWND, UINT, WPARAM, LPARAM);

int APIENTRY wWinMain(_In_ HINSTANCE hInstance,
	_In_opt_ HINSTANCE hPrevInstance,
	_In_ LPWSTR    lpCmdLine,
	_In_ int       nCmdShow)
{
	UNREFERENCED_PARAMETER(hPrevInstance);

	// the first thing we need to do in our app is initialise the velopack sdk
	int pNumArgs = 0;
	wchar_t** args = CommandLineToArgvW(lpCmdLine, &pNumArgs);
	Velopack::startup(args, pNumArgs);
	manager.setUrlOrPath(UPDATE_URL);
	manager.setProgressHandler(progressHandler);
	currentVersion = manager.getCurrentVersion();

	MyRegisterClass(hInstance);
	if (!InitInstance(hInstance, nCmdShow))
	{
		return FALSE;
	}

	MSG msg;

	// Main message loop:
	while (GetMessage(&msg, nullptr, 0, 0))
	{
		TranslateMessage(&msg);
		DispatchMessage(&msg);
	}

	return (int)msg.wParam;
}

ATOM MyRegisterClass(HINSTANCE hInstance)
{
	WNDCLASSEXW wcex;

	wcex.cbSize = sizeof(WNDCLASSEX);

	wcex.style = CS_HREDRAW | CS_VREDRAW;
	wcex.lpfnWndProc = WndProc;
	wcex.cbClsExtra = 0;
	wcex.cbWndExtra = 0;
	wcex.hInstance = hInstance;
	wcex.hCursor = LoadCursor(nullptr, IDC_ARROW);
	wcex.hbrBackground = (HBRUSH)(COLOR_WINDOW + 1);
	wcex.lpszClassName = szWindowClass;
	wcex.hIcon = 0;
	wcex.hIconSm = 0;
	wcex.lpszMenuName = 0;

	return RegisterClassExW(&wcex);
}

HWND hCheckButton;
HWND hDownloadButton;
HWND hRestartButton;

BOOL InitInstance(HINSTANCE hInstance, int nCmdShow)
{
	hInst = hInstance; // Store instance handle in our global variable

	HWND hWnd = CreateWindowW(szWindowClass, szTitle, WS_OVERLAPPEDWINDOW,
		CW_USEDEFAULT, 0, 300, 260, nullptr, nullptr, hInstance, nullptr);

	hCheckButton = CreateWindowW(L"BUTTON", L"Check for updates",
		WS_TABSTOP | WS_VISIBLE | WS_CHILD | BS_DEFPUSHBUTTON,
		40, 50, 200, 40,
		hWnd, NULL, (HINSTANCE)GetWindowLongPtr(hWnd, GWLP_HINSTANCE), NULL);

	hDownloadButton = CreateWindowW(L"BUTTON", L"Download update",
		WS_TABSTOP | WS_VISIBLE | WS_CHILD | BS_DEFPUSHBUTTON,
		40, 100, 200, 40,
		hWnd, NULL, (HINSTANCE)GetWindowLongPtr(hWnd, GWLP_HINSTANCE), NULL);

	hRestartButton = CreateWindowW(L"BUTTON", L"Apply / Restart",
		WS_TABSTOP | WS_VISIBLE | WS_CHILD | BS_DEFPUSHBUTTON,
		40, 150, 200, 40,
		hWnd, NULL, (HINSTANCE)GetWindowLongPtr(hWnd, GWLP_HINSTANCE), NULL);

	if (!hWnd)
	{
		return FALSE;
	}

	ShowWindow(hWnd, nCmdShow);
	UpdateWindow(hWnd);

	return TRUE;
}

LRESULT CALLBACK WndProc(HWND hWnd, UINT message, WPARAM wParam, LPARAM lParam)
{
	switch (message)
	{
	case WM_COMMAND:
	{
		if (LOWORD(wParam) == BN_CLICKED)
		{
			if ((HWND)lParam == hCheckButton)
			{
				try {
					updInfo = manager.checkForUpdates();
					if (updInfo != nullptr) {
						// this is a hack to convert ascii to wide string
						auto version = updInfo->targetFullRelease->version;
						std::wstring message = L"Update available: " + std::wstring(version.begin(), version.end());
						MessageBoxCentered(hWnd, message.c_str(), szTitle, MB_OK);
					}
					else {
						MessageBoxCentered(hWnd, L"No updates available.", szTitle, MB_OK);
					}
				}
				catch (std::exception& e) {
					std::string what = e.what();
					std::wstring wideWhat(what.begin(), what.end());
					MessageBoxCentered(hWnd, wideWhat.c_str(), szTitle, MB_OK | MB_ICONERROR);
				}
			}
			else if ((HWND)lParam == hDownloadButton)
			{
				if (updInfo != nullptr) {
					try {
						manager.downloadUpdateAsync(updInfo);
					}
					catch (std::exception& e) {
						std::string what = e.what();
						std::wstring wideWhat(what.begin(), what.end());
						MessageBoxCentered(hWnd, wideWhat.c_str(), szTitle, MB_OK | MB_ICONERROR);
					}
				}
				else {
					MessageBoxCentered(hWnd, L"Check for updates first.", szTitle, MB_OK);
				}
			}
			else if ((HWND)lParam == hRestartButton)
			{
				if (updPath.empty()) {
					MessageBoxCentered(hWnd, L"Download an update first.", szTitle, MB_OK);
				}
				else {
					manager.applyUpdatesAndRestart(updPath);
				}
			}
		}
		break;
	}
	case WM_PAINT:
	{
		PAINTSTRUCT ps;
		HDC hdc = BeginPaint(hWnd, &ps);
		RECT r{ 0, 5, ps.rcPaint.right, ps.rcPaint.bottom };
		auto ver = std::wstring(currentVersion.begin(), currentVersion.end());
		std::wstring text = L"Welcome to v" + ver + L" of the\nVelopack C++ Sample App.";
		DrawText(hdc, text.c_str(), -1, &r, DT_BOTTOM | DT_CENTER);
		EndPaint(hWnd, &ps);
		break;
	}
	case WM_DESTROY:
		PostQuitMessage(0);
		break;
	default:
		return DefWindowProc(hWnd, message, wParam, lParam);
	}
	return 0;
}

int MessageBoxCentered(HWND hWnd, LPCTSTR lpText, LPCTSTR lpCaption, UINT uType)
{
	// Center message box at its parent window
	static HHOOK hHookCBT{};
	hHookCBT = SetWindowsHookEx(WH_CBT,
		[](int nCode, WPARAM wParam, LPARAM lParam) -> LRESULT
		{
			if (nCode == HCBT_CREATEWND)
			{
				if (((LPCBT_CREATEWND)lParam)->lpcs->lpszClass == (LPWSTR)(ATOM)32770)  // #32770 = dialog box class
				{
					RECT rcParent{};
					GetWindowRect(((LPCBT_CREATEWND)lParam)->lpcs->hwndParent, &rcParent);
					((LPCBT_CREATEWND)lParam)->lpcs->x = rcParent.left + ((rcParent.right - rcParent.left) - ((LPCBT_CREATEWND)lParam)->lpcs->cx) / 2;
					((LPCBT_CREATEWND)lParam)->lpcs->y = rcParent.top + ((rcParent.bottom - rcParent.top) - ((LPCBT_CREATEWND)lParam)->lpcs->cy) / 2;
				}
			}

			return CallNextHookEx(hHookCBT, nCode, wParam, lParam);
		},
		0, GetCurrentThreadId());

	int iRet{ MessageBox(hWnd, lpText, lpCaption, uType) };

	UnhookWindowsHookEx(hHookCBT);

	return iRet;
}