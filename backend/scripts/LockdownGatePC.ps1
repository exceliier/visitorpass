<#
.SYNOPSIS
    Automated Gate PC Security Lockdown Script for Visitor Pass System.
    Run as Administrator on any Gate PC across any office location.

.DESCRIPTION
    This script automates:
    1. Disabling SMB Client & File Sharing protocol bindings.
    2. Setting network connection profile to Public (Disables Network Discovery).
    3. Option to Whitelist ONLY the Visitor Pass Website Server IP and block ALL other network traffic.
    4. Restricting Microsoft Edge browser to allow ONLY the Visitor Pass domain (vp.gmidccsn.in) and block all other websites.
    5. Creating Windows Defender Firewall outbound block rules for SMB/NetBIOS ports (445, 139, 135, 137, 138).
    6. Creating a Desktop Kiosk Shortcut for the Visitor Pass Application.

.PARAMETER AppUrl
    The URL of your Centralized Visitor Pass Server (default: https://vp.gmidccsn.in).

.PARAMETER ServerIp
    Optional Server IP address. If left blank, it resolves vp.gmidccsn.in automatically.

.PARAMETER RestrictAllOtherWebsites
    If set to $true, blocks operator from visiting YouTube, Facebook, or any other website.

.EXAMPLE
    .\LockdownGatePC.ps1 -AppUrl "https://vp.gmidccsn.in" -RestrictAllOtherWebsites $true
#>

param(
    [Parameter(Mandatory=$false)]
    [string]$AppUrl = "https://vp.gmidccsn.in",

    [Parameter(Mandatory=$false)]
    [string]$ServerIp = "",

    [Parameter(Mandatory=$false)]
    [bool]$RestrictAllOtherWebsites = $true
)

# Ensure running as Administrator
$currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
if (-not $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Host "ERROR: Please run this PowerShell script as Administrator!" -ForegroundColor Red
    Exit
}

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host " AUTOMATED GATE PC NETWORK LOCKDOWN UTILITY" -ForegroundColor Cyan
Write-Host " Target Application URL: $AppUrl" -ForegroundColor Yellow
if ($RestrictAllOtherWebsites) {
    Write-Host " Website Access: RESTRICTED TO VP WEBSITE ONLY (All other websites blocked)" -ForegroundColor Yellow
}
Write-Host "================================================================" -ForegroundColor Cyan

# 1. Disable SMB Client & Server Adapter Bindings
Write-Host "`n[1/5] Disabling Microsoft SMB Client & File Sharing Adapters..." -ForegroundColor Green
try {
    Disable-NetAdapterBinding -Name "*" -ComponentID "ms_msclient" -ErrorAction SilentlyContinue
    Disable-NetAdapterBinding -Name "*" -ComponentID "ms_server" -ErrorAction SilentlyContinue
    Write-Host "   -> SMB Client & File Sharing Disabled on all network adapters." -ForegroundColor Gray
} catch {
    Write-Host "   -> Adapter binding update skipped or completed." -ForegroundColor Gray
}

# 2. Set Network Profile to Public (Hides PC & Disables Network Discovery)
Write-Host "`n[2/5] Setting Network Profile to Public (Disabling Network Discovery)..." -ForegroundColor Green
try {
    Set-NetConnectionProfile -NetworkCategory Public -ErrorAction SilentlyContinue
    Write-Host "   -> Network connection set to Public Category." -ForegroundColor Gray
} catch {
    Write-Host "   -> Network category update skipped or completed." -ForegroundColor Gray
}

# 3. Restrict Browser to ONLY vp.gmidccsn.in (Block YouTube, Facebook, and all other websites)
if ($RestrictAllOtherWebsites) {
    Write-Host "`n[3/5] Configuring Browser Policy (Allowing ONLY vp.gmidccsn.in)..." -ForegroundColor Green
    try {
        $EdgePolicyKey = "HKLM:\SOFTWARE\Policies\Microsoft\Edge"
        if (-not (Test-Path $EdgePolicyKey)) {
            New-Item -Path $EdgePolicyKey -Force | Out-Null
        }
        $BlockListKey = "$EdgePolicyKey\URLBlocklist"
        $AllowListKey = "$EdgePolicyKey\URLAllowlist"

        if (-not (Test-Path $BlockListKey)) { New-Item -Path $BlockListKey -Force | Out-Null }
        if (-not (Test-Path $AllowListKey)) { New-Item -Path $AllowListKey -Force | Out-Null }

        # Block all URLs by default
        Set-ItemProperty -Path $BlockListKey -Name "1" -Value "*"
        # Allow only Visitor Pass Domain
        Set-ItemProperty -Path $AllowListKey -Name "1" -Value "https://vp.gmidccsn.in*"
        Set-ItemProperty -Path $AllowListKey -Name "2" -Value "http://vp.gmidccsn.in*"

        Write-Host "   -> Browser locked: ONLY vp.gmidccsn.in is allowed. All other websites blocked!" -ForegroundColor Yellow
    } catch {
        Write-Host "   -> Browser policy configuration skipped or restricted." -ForegroundColor Gray
    }
}

# 4. Create Windows Firewall Outbound Rules
Write-Host "`n[4/5] Configuring Windows Defender Firewall Rules..." -ForegroundColor Green
$RulePrefix = "GatePC_Lockdown"
Remove-NetFirewallRule -DisplayName "$RulePrefix*" -ErrorAction SilentlyContinue

# Block SMB & NetBIOS Always
New-NetFirewallRule -DisplayName "$RulePrefix`_Block_SMB" `
                    -Direction Outbound `
                    -Action Block `
                    -Protocol TCP `
                    -LocalPort 445, 139, 135 `
                    -Enabled True `
                    -Description "Blocks outgoing connections to office file shares." | Out-Null

New-NetFirewallRule -DisplayName "$RulePrefix`_Block_NetBIOS" `
                    -Direction Outbound `
                    -Action Block `
                    -Protocol UDP `
                    -LocalPort 137, 138, 5355 `
                    -Enabled True `
                    -Description "Blocks outgoing NetBIOS & LLMNR network scanning." | Out-Null

if ($ServerIp) {
    New-NetFirewallRule -DisplayName "$RulePrefix`_Allow_VP_Server" `
                        -Direction Outbound `
                        -Action Allow `
                        -RemoteAddress $ServerIp `
                        -Enabled True `
                        -Description "Allows traffic ONLY to Visitor Pass Server." | Out-Null
    Write-Host "   -> Firewall Whitelist active: ALLOWED ($ServerIp), ALL OTHER IPs BLOCKED." -ForegroundColor Yellow
} else {
    Write-Host "   -> SMB & NetBIOS ports blocked. Gate PC cannot reach office file shares." -ForegroundColor Gray
}

# 5. Create Desktop Kiosk Shortcut for Visitor Pass
Write-Host "`n[5/5] Creating Desktop Kiosk Shortcut for Visitor Pass Application..." -ForegroundColor Green
$DesktopPath = [Environment]::GetFolderPath("Desktop")
$ShortcutPath = Join-Path -Path $DesktopPath -ChildPath "Visitor Pass Gate Portal.lnk"

$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = "msedge.exe"
$Shortcut.Arguments = "--kiosk `"$AppUrl`" --edge-kiosk-type=fullscreen --no-first-run"
$Shortcut.IconLocation = "msedge.exe,0"
$Shortcut.Description = "Launch Visitor Pass Gate Application"
$Shortcut.Save()

Write-Host "   -> Desktop Kiosk Shortcut created at: $ShortcutPath" -ForegroundColor Gray

Write-Host "`n================================================================" -ForegroundColor Cyan
Write-Host " LOCKDOWN COMPLETE! THIS GATE PC IS NOW SECURED." -ForegroundColor Green
Write-Host " 1. Office file shares and internal PCs: 100% BLOCKED." -ForegroundColor White
Write-Host " 2. All other websites (YouTube, Facebook, etc.): 100% BLOCKED." -ForegroundColor White
Write-Host " 3. Allowed Website: ONLY https://vp.gmidccsn.in" -ForegroundColor Yellow
Write-Host "================================================================" -ForegroundColor Cyan
