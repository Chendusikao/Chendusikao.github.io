$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$output = Join-Path $env:TEMP 'chendusikao-portfolio-smoke'
Remove-Item -Recurse -Force $output -ErrorAction SilentlyContinue

function ConvertFrom-CodePoints {
  param([int[]]$CodePoints)

  -join ($CodePoints | ForEach-Object { [char]$_ })
}

Push-Location $root
try {
  & (Get-Command hugo -ErrorAction Stop).Source --gc --minify --destination $output
  if ($LASTEXITCODE -ne 0) {
    throw "Hugo build failed with exit code $LASTEXITCODE"
  }
} finally {
  Pop-Location
}

$checks = @{
  'index.html' = @(
    "AI $(ConvertFrom-CodePoints 0x5E94, 0x7528, 0x5F00, 0x53D1, 0x5DE5, 0x7A0B, 0x5E08)",
    (ConvertFrom-CodePoints 0x7CBE, 0x9009, 0x9879, 0x76EE),
    'GitHub'
  )
  'projects/index.html' = @(
    (ConvertFrom-CodePoints 0x9879, 0x76EE),
    "A $([char]0x80A1) K $([char]0x7EBF) $(ConvertFrom-CodePoints 0x7EC8, 0x7AEF)"
  )
  'projects/a-share-kline-terminal/index.html' = @(
    (ConvertFrom-CodePoints 0x5F00, 0x53D1, 0x4E2D),
    "GitHub $(ConvertFrom-CodePoints 0x4ED3, 0x5E93)"
  )
}

foreach ($relativePath in $checks.Keys) {
  $html = Get-Content -Raw -Encoding utf8 (Join-Path $output $relativePath)
  foreach ($expected in $checks[$relativePath]) {
    if ($html -notmatch [regex]::Escape($expected)) {
      throw "Missing '$expected' in $relativePath"
    }
  }
}
