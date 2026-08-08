$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$output = Join-Path ([System.IO.Path]::GetTempPath()) 'chendusikao-portfolio-smoke'
Remove-Item -Recurse -Force $output -ErrorAction SilentlyContinue

function ConvertFrom-CodePoints {
  param([int[]]$CodePoints)

  -join ($CodePoints | ForEach-Object { [char]$_ })
}

try {
  $config = Get-Content -Raw -Encoding utf8 (Join-Path $root 'hugo.toml')
  if ($config -notmatch "(?m)^locale = 'zh-CN'\r?$") {
    throw "hugo.toml must declare locale = 'zh-CN'"
  }
  if ($config -match '(?m)^languageCode\s*=') {
    throw 'hugo.toml must not use the deprecated languageCode setting'
  }

  $workflow = Get-Content -Raw -Encoding utf8 (Join-Path $root '.github/workflows/hugo.yaml')
  $buildIndex = $workflow.IndexOf('Build site')
  $smokeIndex = $workflow.IndexOf('tests/portfolio-smoke.ps1')
  $uploadIndex = $workflow.IndexOf('Upload Pages artifact')
  if ($buildIndex -lt 0 -or $smokeIndex -lt 0 -or $uploadIndex -lt 0 -or $buildIndex -gt $smokeIndex -or $smokeIndex -gt $uploadIndex) {
    throw 'The Pages workflow must run the portfolio smoke test after building and before uploading the artifact'
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
    "A $([char]0x80A1) K $([char]0x7EBF)$(ConvertFrom-CodePoints 0x7EC8, 0x7AEF)",
    'github.com/Chendusikao/a-share-kline-terminal',
    "$(ConvertFrom-CodePoints 0x79DF, 0x623F, 0x5408, 0x540C) AI $(ConvertFrom-CodePoints 0x667A, 0x80FD, 0x5206, 0x6790, 0x52A9, 0x624B)",
    'github.com/Chendusikao/rent-contract-ai-assistant',
    "$(ConvertFrom-CodePoints 0x591A, 0x6A21, 0x6001) RAG $(ConvertFrom-CodePoints 0x77E5, 0x8BC6, 0x5E93)",
    'github.com/Chendusikao/rag-knowledge-base'
  )
  'projects/index.html' = @(
    (ConvertFrom-CodePoints 0x9879, 0x76EE),
    "A $([char]0x80A1) K $([char]0x7EBF)$(ConvertFrom-CodePoints 0x7EC8, 0x7AEF)",
    "$(ConvertFrom-CodePoints 0x79DF, 0x623F, 0x5408, 0x540C) AI $(ConvertFrom-CodePoints 0x667A, 0x80FD, 0x5206, 0x6790, 0x52A9, 0x624B)",
    (ConvertFrom-CodePoints 0x53EF, 0x672C, 0x5730, 0x8FD0, 0x884C),
    'rag-knowledge-base'
  )
  'projects/a-share-kline-terminal/index.html' = @(
    "A $([char]0x80A1) K $([char]0x7EBF)$(ConvertFrom-CodePoints 0x7EC8, 0x7AEF)",
    (ConvertFrom-CodePoints 0x9879, 0x76EE, 0x80CC, 0x666F),
    (ConvertFrom-CodePoints 0x6280, 0x672F, 0x65B9, 0x6848),
    (ConvertFrom-CodePoints 0x5F53, 0x524D, 0x8FDB, 0x5EA6),
    "$(ConvertFrom-CodePoints 0x672C, 0x5730, 0x8FD0, 0x884C) + $(ConvertFrom-CodePoints 0x9759, 0x6001, 0x6F14, 0x793A)",
    "GitHub $(ConvertFrom-CodePoints 0x4ED3, 0x5E93)",
    '/a-share-kline-demo/'
  )
  'projects/rag-knowledge-base/index.html' = @(
    "$(ConvertFrom-CodePoints 0x591A, 0x6A21, 0x6001) RAG $(ConvertFrom-CodePoints 0x77E5, 0x8BC6, 0x5E93, 0x95EE, 0x7B54, 0x7CFB, 0x7EDF)",
    (ConvertFrom-CodePoints 0x9879, 0x76EE, 0x80CC, 0x666F),
    (ConvertFrom-CodePoints 0x6280, 0x672F, 0x65B9, 0x6848),
    (ConvertFrom-CodePoints 0x5F53, 0x524D, 0x8FDB, 0x5EA6),
    (ConvertFrom-CodePoints 0x672C, 0x5730, 0x8FD0, 0x884C),
    '/rag-knowledge-base-demo/',
    "GitHub $(ConvertFrom-CodePoints 0x4ED3, 0x5E93)"
  )
  'projects/rent-contract-ai-assistant/index.html' = @(
    "$(ConvertFrom-CodePoints 0x79DF, 0x623F, 0x5408, 0x540C) AI $(ConvertFrom-CodePoints 0x667A, 0x80FD, 0x5206, 0x6790, 0x52A9, 0x624B)",
    (ConvertFrom-CodePoints 0x9879, 0x76EE, 0x80CC, 0x666F),
    (ConvertFrom-CodePoints 0x6280, 0x672F, 0x65B9, 0x6848),
    (ConvertFrom-CodePoints 0x6280, 0x672F, 0x6808),
    (ConvertFrom-CodePoints 0x5F53, 0x524D, 0x8FDB, 0x5EA6),
    (ConvertFrom-CodePoints 0x53EF, 0x672C, 0x5730, 0x8FD0, 0x884C),
    (ConvertFrom-CodePoints 0x6682, 0x65E0, 0x7EBF, 0x4E0A, 0x6F14, 0x793A),
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

  $metadataPages = @('index.html', 'projects/index.html', 'about/index.html', 'projects/a-share-kline-terminal/index.html', 'projects/rent-contract-ai-assistant/index.html', 'projects/rag-knowledge-base/index.html')
  foreach ($relativePath in $metadataPages) {
    $html = Get-Content -Raw -Encoding utf8 (Join-Path $output $relativePath)
    foreach ($requiredAttribute in @('name\s*=\s*["'']?description', 'rel\s*=\s*["'']?canonical', 'property\s*=\s*["'']?og:title', 'property\s*=\s*["'']?og:description', 'property\s*=\s*["'']?og:url')) {
      if ($html -notmatch $requiredAttribute) {
        throw "Missing SEO metadata '$requiredAttribute' in $relativePath"
      }
    }
    if ($html -notmatch 'href\s*=\s*["'']?/favicon\.svg') {
      throw "Missing local favicon declaration in $relativePath"
    }
  }

  $activeNavigation = @{
    'index.html' = 'href\s*=\s*["'']?/["'']?\s+aria-current\s*=\s*["'']?page'
    'projects/index.html' = 'href\s*=\s*["'']?/projects/["'']?\s+aria-current\s*=\s*["'']?page'
    'about/index.html' = 'href\s*=\s*["'']?/about/["'']?\s+aria-current\s*=\s*["'']?page'
  }
  foreach ($relativePath in $activeNavigation.Keys) {
    $html = Get-Content -Raw -Encoding utf8 (Join-Path $output $relativePath)
    if ($html -notmatch $activeNavigation[$relativePath]) {
      throw "Missing active navigation state in $relativePath"
    }
    if ([regex]::Matches($html, 'aria-current\s*=\s*["'']?page').Count -ne 1) {
      throw "Expected exactly one active navigation item in $relativePath"
    }
  }

  if (-not (Test-Path (Join-Path $output 'favicon.svg'))) {
    throw 'No local favicon asset found in the generated site'
  }

  $css = Get-ChildItem -Path (Join-Path $output 'css') -Filter '*.css' -Recurse
  if ($css.Count -eq 0) { throw 'No compiled portfolio stylesheet found' }
  $compiledCss = ($css | ForEach-Object { Get-Content -Raw -Encoding utf8 $_.FullName }) -join "`n"
  if ($compiledCss -notmatch 'prefers-reduced-motion\s*:\s*reduce') {
    throw 'No reduced-motion stylesheet rule found'
  }

  $demoRoot = Join-Path $output 'a-share-kline-demo'
  foreach ($relativePath in @('index.html', 'styles.css', 'demo-data.js', 'app.js')) {
    if (-not (Test-Path (Join-Path $demoRoot $relativePath))) {
      throw "Missing A-share static demo asset: $relativePath"
    }
  }

  $demoHtml = Get-Content -Raw -Encoding utf8 (Join-Path $demoRoot 'index.html')
  $demoExpected = @(
    "A $([char]0x80A1) K $([char]0x7EBF)$(ConvertFrom-CodePoints 0x7EC8, 0x7AEF) $([char]0x00B7) $(ConvertFrom-CodePoints 0x9759, 0x6001, 0x6F14, 0x793A)",
    (ConvertFrom-CodePoints 0x793A, 0x4F8B, 0x6570, 0x636E, 0xFF0C, 0x975E, 0x5B9E, 0x65F6, 0x884C, 0x60C5, 0xFF0C, 0x4E0D, 0x6784, 0x6210, 0x6295, 0x8D44, 0x5EFA, 0x8BAE),
    "$(ConvertFrom-CodePoints 0x8FD1) 3 $(ConvertFrom-CodePoints 0x6708)",
    "$(ConvertFrom-CodePoints 0x8FD1) 6 $(ConvertFrom-CodePoints 0x6708)",
    "$(ConvertFrom-CodePoints 0x8FD1) 1 $(ConvertFrom-CodePoints 0x5E74)",
    'MA',
    'MACD',
    'RSI',
    (ConvertFrom-CodePoints 0x6280, 0x672F, 0x9762, 0x603B, 0x5206),
    (ConvertFrom-CodePoints 0x7ED3, 0x6784, 0x5316, 0x89E3, 0x8BFB),
    (ConvertFrom-CodePoints 0x65B0, 0x624B, 0x5F15, 0x5BFC),
    (ConvertFrom-CodePoints 0x6307, 0x6807, 0x8BCD, 0x5178),
    (ConvertFrom-CodePoints 0x5B9A, 0x4F4D, 0x56FE, 0x8868),
    'data-preset=',
    'data-evidence='
  )
  foreach ($expected in $demoExpected) {
    if ($demoHtml -notmatch [regex]::Escape($expected)) {
      throw "Missing '$expected' in A-share static demo"
    }
  }

  $demoScript = Get-Content -Raw -Encoding utf8 (Join-Path $demoRoot 'app.js')
  if ($demoScript -match '\bfetch\s*\(') {
    throw 'A-share static demo must not request external APIs'
  }

  foreach ($token in @('pointermove', 'pointerdown', 'Escape', 'selectedIndex', 'tooltip-date', 'tooltip-open', 'tooltip-close')) {
    if ($demoScript -notmatch [regex]::Escape($token)) {
      throw "Missing K-line inspection behavior: $token"
    }
  }
  foreach ($token in @('applyPreset', 'glossary', 'scrollIntoView', 'evidenceTarget')) {
    if ($demoScript -notmatch [regex]::Escape($token)) {
      throw "Missing A-share demo learning interaction: $token"
    }
  }

  $ragDemoRoot = Join-Path $output 'rag-knowledge-base-demo'
  foreach ($relativePath in @('index.html', 'styles.css', 'app.js')) {
    if (-not (Test-Path (Join-Path $ragDemoRoot $relativePath))) {
      throw "Missing RAG static demo asset: $relativePath"
    }
  }
  $ragDemoHtml = Get-Content -Raw -Encoding utf8 (Join-Path $ragDemoRoot 'index.html')
  foreach ($expected in @(
    "RAG $(ConvertFrom-CodePoints 0x77E5, 0x8BC6, 0x5E93)$(ConvertFrom-CodePoints 0x95EE, 0x7B54)$(ConvertFrom-CodePoints 0x9759, 0x6001, 0x6F14, 0x793A)",
    (ConvertFrom-CodePoints 0x793A, 0x4F8B, 0x6570, 0x636E, 0xFF0C, 0x65E0, 0x771F, 0x5B9E, 0x6A21, 0x578B, 0x8C03, 0x7528),
    (ConvertFrom-CodePoints 0x77E5, 0x8BC6, 0x5E93),
    (ConvertFrom-CodePoints 0x68C0, 0x7D22),
    (ConvertFrom-CodePoints 0x5F15, 0x7528)
  )) {
    if ($ragDemoHtml -notmatch [regex]::Escape($expected)) {
      throw "Missing '$expected' in RAG static demo"
    }
  }
  $ragDemoScript = Get-Content -Raw -Encoding utf8 (Join-Path $ragDemoRoot 'app.js')
  if ($ragDemoScript -match '\bfetch\s*\(') {
    throw 'RAG static demo must not request external APIs'
  }
  foreach ($token in @('data-mode', 'data-query', 'citations', 'MockProvider')) {
    if ($ragDemoScript -notmatch [regex]::Escape($token)) {
      throw "Missing RAG demo interaction: $token"
    }
  }
} finally {
  Remove-Item -Recurse -Force $output -ErrorAction SilentlyContinue
}
