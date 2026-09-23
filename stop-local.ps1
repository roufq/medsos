$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot
$expectedPath = Join-Path $PSScriptRoot 'tmp/medsos.exe'
if (Test-Path 'tmp/backend.pid') {
    $serverProcessId = [int](Get-Content 'tmp/backend.pid')
    $serverProcess = Get-Process -Id $serverProcessId -ErrorAction SilentlyContinue
    if ($serverProcess -and $serverProcess.Path -eq $expectedPath) {
        Stop-Process -Id $serverProcessId
        Write-Host 'Backend lokal dihentikan.'
    } elseif ($serverProcess) {
        throw 'PID dipakai proses lain; tidak dihentikan.'
    } else {
        Write-Host 'Backend latar belakang sudah berhenti.'
    }
    Remove-Item -LiteralPath 'tmp/backend.pid'
}
