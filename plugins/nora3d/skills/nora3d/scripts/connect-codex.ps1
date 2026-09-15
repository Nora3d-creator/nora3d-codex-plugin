# Starts only the current host's official OAuth flow. Never reads token stores.
[CmdletBinding()]
param([ValidateSet('Check','Login')][string]$Mode='Check',
      [ValidateRange(1,300)][int]$TimeoutSeconds=300,
      [ValidatePattern('^$|^[\w-]+\.[\w-]+$')][string]$ConnectionCode='')
$ErrorActionPreference='Stop'
$script:ConnectionFailureDetails=@{}

function Write-ConnectionState($Status,$Extra=@{}) {
    $value=@{status=$Status;server='nora3d';url='https://mcp.nora3d.ai/mcp'}
    foreach($key in $Extra.Keys){$value[$key]=$Extra[$key]}
    Write-Output ($value | ConvertTo-Json -Compress -Depth 4)
}

function Start-CliProcess([string]$Executable,[string]$Arguments) {
    $start=New-Object Diagnostics.ProcessStartInfo
    $start.FileName=$Executable;$start.Arguments=$Arguments
    $start.UseShellExecute=$false;$start.CreateNoWindow=$true
    $start.RedirectStandardOutput=$true;$start.RedirectStandardError=$true
    $process=New-Object Diagnostics.Process
    $process.StartInfo=$start
    [void]$process.Start()
    return $process
}

function Read-ServerMetadata([string]$Executable) {
    $process=Start-CliProcess $Executable 'mcp get nora3d --json'
    try {
        # Drain both streams concurrently. Configuration stays in memory; never
        # emit headers, environment entries, raw errors or credential values.
        $stdout=$process.StandardOutput.ReadToEndAsync()
        $stderr=$process.StandardError.ReadToEndAsync()
        if(-not $process.WaitForExit(10000)){throw 'metadata_timeout'}
        if($process.ExitCode -ne 0){
            # A sandbox can hide plugin/config discovery even when this task has
            # live MCP tools. Report an execution check, not an account failure.
            # Classify only; never return the raw stderr or configuration.
            $errorText=$stderr.GetAwaiter().GetResult()
            $script:ConnectionFailureDetails=@{phase='metadata';cli_exit_code=$process.ExitCode;oauth_started=$false}
            if($errorText -match 'Permission denied|Access is denied|os error (5|13)\b'){
                $script:ConnectionFailureDetails.next_action='check_host_execution_access'
                throw 'host_access_denied'
            }
            if($errorText -match "No MCP server named 'nora3d' found"){
                $script:ConnectionFailureDetails.next_action='check_host_execution_access'
                throw 'server_not_available_in_current_host'
            }
            throw 'host_configuration_error'
        }
        $server=$stdout.GetAwaiter().GetResult() | ConvertFrom-Json
        if($server.name -ne 'nora3d' -or $server.enabled -ne $true -or
            $server.transport.type -notin @('streamable_http','http') -or
            $server.transport.url -cne 'https://mcp.nora3d.ai/mcp'){
            throw 'unexpected_server_configuration'
        }
        if($server.transport.bearer_token_env_var -or $server.transport.http_headers_helper -or
            @($server.transport.http_headers.PSObject.Properties | Where-Object {$_.Name -match '^(Authorization|Proxy-Authorization)$'}).Count -or
            @($server.transport.env_http_headers.PSObject.Properties | Where-Object {$_.Name -match '^(Authorization|Proxy-Authorization)$'}).Count){
            throw 'non_oauth_credentials_configured'
        }
        return $true
    } finally {
        if(-not $process.HasExited){$process.Kill();[void]$process.WaitForExit(5000)}
        $process.Dispose()
    }
}

function Find-HostCli {
    $candidates=@()
    if($env:CODEX_CLI_PATH){$candidates+= $env:CODEX_CLI_PATH}
    $session=(Get-Process -Id $PID).SessionId
    $candidates+=@(Get-Process -Name codex -ErrorAction SilentlyContinue |
        Where-Object {$_.SessionId -eq $session} | Select-Object -ExpandProperty Path -Unique)
    $command=Get-Command codex -CommandType Application -ErrorAction SilentlyContinue
    if($command){$candidates+=$command.Source}
    $valid=@($candidates | Where-Object {$_ -and [IO.Path]::IsPathRooted($_) -and
        [IO.Path]::GetFileName($_) -ieq 'codex.exe' -and (Test-Path -LiteralPath $_ -PathType Leaf)} | Select-Object -Unique)
    if(-not $valid.Count){throw 'host_cli_unavailable'}
    # A host-provided path is authoritative. Otherwise a unique running CLI or
    # PATH binary is required; never guess a cache version or another Windows user.
    if($env:CODEX_CLI_PATH -and $valid -contains $env:CODEX_CLI_PATH){$valid=@($env:CODEX_CLI_PATH)}
    if($valid.Count -ne 1){throw 'host_cli_ambiguous'}
    return $valid[0]
}

function Bind-DocumentAuthorization([string]$AuthorizationUrl) {
    try {
        $body=@{connection_code=$ConnectionCode;authorization_url=$AuthorizationUrl} | ConvertTo-Json -Compress
        $result=Invoke-RestMethod -Uri 'https://mcp.nora3d.ai/v1/connection-authorizations' -Method Post -ContentType 'application/json' -Body $body -TimeoutSec 12
        if($result.status -ne 'awaiting_document_consent' -or $result.document_bound -ne $true){throw 'invalid_binding'}
        return $result
    } catch {throw 'document_authorization_failed'}
}

function Wait-HostLogin([string]$Executable,[int]$Seconds) {
    $process=Start-CliProcess $Executable 'mcp login nora3d'
    $seen=@{}
    try {
        Write-ConnectionState 'oauth_started' @{requires_user_authorization=$true}
        $ends=(Get-Date).AddSeconds($Seconds)
        $streams=@($process.StandardOutput,$process.StandardError)
        $reads=@($streams[0].ReadLineAsync(),$streams[1].ReadLineAsync())
        while($true){
            for($i=0;$i -lt 2;$i++){
                if($null -ne $reads[$i] -and $reads[$i].IsCompleted){
                    $line=$reads[$i].GetAwaiter().GetResult()
                    if($null -eq $line){$reads[$i]=$null;continue}
                    # Only expose the gateway's authorization entry, never raw
                    # process output, localhost callback codes, tokens or logs.
                    foreach($match in [regex]::Matches($line,'https://mcp\.nora3d\.ai/(?:authorize(?:\?|/)|connect/)[^\s<>"'']+')){
                        $url=$match.Value
                        if(-not $seen.ContainsKey($url)){
                            $seen[$url]=$true
                            if($ConnectionCode){
                                $bound=Bind-DocumentAuthorization $url
                                Write-ConnectionState 'awaiting_document_consent' @{authorization_id=$bound.authorization_id;document_bound=$true}
                            } else {
                                Write-ConnectionState 'authorization_required' @{authorization_url=$url}
                            }
                        }
                    }
                    $reads[$i]=$streams[$i].ReadLineAsync()
                }
            }
            if($process.HasExited -and $null -eq $reads[0] -and $null -eq $reads[1]){break}
            if((Get-Date) -ge $ends){throw 'oauth_timeout'}
            Start-Sleep -Milliseconds 100
        }
        if($process.ExitCode -ne 0){throw 'oauth_failed_or_cancelled'}
        Write-ConnectionState 'oauth_callback_completed' @{requires_mcp_verification=$true}
    } finally {
        if(-not $process.HasExited){$process.Kill();[void]$process.WaitForExit(5000)}
        $process.Dispose()
    }
}

function Invoke-ConnectionAssistant {
    $script:ConnectionFailureDetails=@{}
    $mutex=$null;$ownsMutex=$false
    try {
        $cli=Find-HostCli
        $null=Read-ServerMetadata $cli
        Write-ConnectionState 'host_ready'
        if($Mode -eq 'Login'){
            $sid=[Security.Principal.WindowsIdentity]::GetCurrent().User.Value
            $mutex=New-Object Threading.Mutex($false,('Local\Nora3D-Codex-OAuth-'+$sid))
            try{$ownsMutex=$mutex.WaitOne(0)}catch [Threading.AbandonedMutexException]{$ownsMutex=$true}
            if(-not $ownsMutex){throw 'oauth_already_running'}
            Wait-HostLogin $cli $TimeoutSeconds
        }
    } catch {
        $known=@('host_cli_unavailable','host_cli_ambiguous','metadata_timeout',
            'server_not_available_in_current_host','host_access_denied','host_configuration_error','unexpected_server_configuration',
            'non_oauth_credentials_configured','oauth_already_running','oauth_timeout','oauth_failed_or_cancelled','document_authorization_failed')
        $code=$_.Exception.Message
        if($code -notin $known){$code='host_connection_failed'}
        Write-ConnectionState $code $script:ConnectionFailureDetails
        exit 1
    } finally {
        if($ownsMutex){$mutex.ReleaseMutex()}
        if($null -ne $mutex){$mutex.Dispose()}
    }
}
if($MyInvocation.InvocationName -ne '.'){Invoke-ConnectionAssistant}
