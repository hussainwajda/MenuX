$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path

# Load .env from repo root (if present)
$envFile = Join-Path $root ".env"
if (Test-Path $envFile) {
  Get-Content $envFile | ForEach-Object {
    $line = $_.Trim()
    if ($line -and -not $line.StartsWith("#")) {
      $parts = $line -split "=", 2
      if ($parts.Length -eq 2) {
        $key = $parts[0].Trim()
        $value = $parts[1].Trim()
        if ($key) { Set-Item -Path "env:$key" -Value $value }
      }
    }
  }
}

Write-Host "Starting backend (Spring Boot)..." -ForegroundColor Cyan
$backend = Start-Process `
  -FilePath (Join-Path $root "backend\\mvnw.cmd") `
  -ArgumentList "spring-boot:run" `
  -WorkingDirectory (Join-Path $root "backend") `
  -NoNewWindow `
  -PassThru

Write-Host "Starting frontend (Next.js)..." -ForegroundColor Cyan
$frontend = Start-Process `
  -FilePath "npm.cmd" `
  -ArgumentList "run dev" `
  -WorkingDirectory (Join-Path $root "menux-frontend") `
  -NoNewWindow `
  -PassThru

try {
  Wait-Process -Id $backend.Id, $frontend.Id
} finally {
  Write-Host "Stopping processes..." -ForegroundColor Yellow
  if ($backend -and -not $backend.HasExited) { Stop-Process -Id $backend.Id -Force }
  if ($frontend -and -not $frontend.HasExited) { Stop-Process -Id $frontend.Id -Force }
}
