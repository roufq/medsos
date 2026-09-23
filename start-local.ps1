param([switch]$BuildFrontend)

$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

$localGo = Join-Path $PSScriptRoot 'tmp/toolchain/go/bin/go.exe'
if (Test-Path $localGo) {
    $goExecutable = $localGo
} elseif (Get-Command go -ErrorAction SilentlyContinue) {
    $goExecutable = (Get-Command go).Source
} else {
    throw 'Go belum tersedia. Instal Go 1.25 atau lebih baru.'
}

$env:GOPATH = Join-Path $PSScriptRoot 'tmp/gopath'
$env:GOCACHE = Join-Path $PSScriptRoot 'tmp/go-build'

if (-not (Test-Path '.env')) {
    throw 'File .env belum tersedia. Lengkapi konfigurasi lokal terlebih dahulu.'
}

if ($BuildFrontend -or -not (Test-Path 'frontend/dist/index.html')) {
    Push-Location frontend
    try {
        if (-not (Test-Path node_modules)) {
            & npm.cmd ci --no-audit --no-fund
            if ($LASTEXITCODE -ne 0) { throw 'Instalasi dependency frontend gagal.' }
        }
        & npm.cmd run build
        if ($LASTEXITCODE -ne 0) { throw 'Build frontend gagal.' }
    } finally {
        Pop-Location
    }
}

Write-Host 'Pastikan MySQL Laragon aktif. Buka http://localhost:3000 setelah server siap.'
& $goExecutable run .
exit $LASTEXITCODE
