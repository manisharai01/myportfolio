<#
  Registers a Windows scheduled task that runs scripts/publish-stats.mjs every hour
  (and shortly after you log in), so the live site's git stats follow your commits.
  It runs only while you're logged in, with no console window. Each run adds a line
  to .signal/refresh.log.

    npm run stats:schedule      install or update
    npm run stats:unschedule    remove
#>
param([switch]$Remove)

$ErrorActionPreference = 'Stop'
$name = 'Portfolio git stats'
$root = Split-Path -Parent $PSScriptRoot

if ($Remove) {
  if (Get-ScheduledTask -TaskName $name -ErrorAction SilentlyContinue) {
    Unregister-ScheduledTask -TaskName $name -Confirm:$false
    Write-Host "Removed the '$name' scheduled task."
  } else {
    Write-Host "There is no '$name' scheduled task."
  }
  return
}

$node = (Get-Command node).Source
$script = Join-Path $root 'scripts\publish-stats.mjs'
$user = "$env:USERDOMAIN\$env:USERNAME"

# conhost --headless runs node without a console window popping up every hour
$action = New-ScheduledTaskAction -Execute "$env:WINDIR\System32\conhost.exe" `
  -Argument "--headless `"$node`" `"$script`"" -WorkingDirectory $root

$hourly = New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(2) -RepetitionInterval (New-TimeSpan -Hours 1)
$logon = New-ScheduledTaskTrigger -AtLogOn -User $user
$logon.Delay = 'PT3M' # let the network and credential manager come up first

$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -RunOnlyIfNetworkAvailable `
  -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries `
  -ExecutionTimeLimit (New-TimeSpan -Minutes 20) -MultipleInstances IgnoreNew

# Interactive = only while you're logged in, which is also when git can use your saved GitHub login
$principal = New-ScheduledTaskPrincipal -UserId $user -LogonType Interactive -RunLevel Limited

Register-ScheduledTask -TaskName $name -Force `
  -Description "Hourly: refreshes the git stats on the portfolio site. Runs $script (log: .signal\refresh.log)." `
  -Action $action -Trigger $hourly, $logon -Settings $settings -Principal $principal | Out-Null

Write-Host "Scheduled '$name': hourly while you're logged in, and 3 minutes after you log in."
Write-Host "Log: $(Join-Path $root '.signal\refresh.log')"
Write-Host "Remove with: npm run stats:unschedule"
