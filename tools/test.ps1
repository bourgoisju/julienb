# Site checks: static (links, images, SEO, config) + runtime (JavaScript boots in headless Chrome).
# Usage: powershell -ExecutionPolicy Bypass -File tools/test.ps1 [-Port 8099] [-SkipBrowser]
param([int]$Port = 8099, [switch]$SkipBrowser)

$ErrorActionPreference = 'Stop'
$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$script:failures = 0
$script:passes = 0

function Check([string]$name, [bool]$ok, [string]$detail = '') {
  if ($ok) { $script:passes++; Write-Host "  ok    $name" -ForegroundColor Green }
  else {
    $script:failures++; Write-Host "  FAIL  $name $detail" -ForegroundColor Red
    # On GitHub Actions, also surface the failure as an annotation on the run summary.
    if ($env:GITHUB_ACTIONS) { Write-Host "::error title=Test du site::$name $detail" }
  }
}
trap {
  if ($env:GITHUB_ACTIONS) { Write-Host "::error title=Erreur du script de test::$($_.Exception.Message) (ligne $($_.InvocationInfo.ScriptLineNumber))" }
  Write-Host "ERROR $($_.Exception.Message)" -ForegroundColor Red
  exit 99
}
function Read-Utf8([string]$path) { [IO.File]::ReadAllText((Join-Path $root $path), [Text.Encoding]::UTF8) }

$pages = @('index.html', '404.html')

foreach ($page in $pages) {
  Write-Host "`n$page" -ForegroundColor Cyan
  $html = Read-Utf8 $page

  # Local references (href, src, srcset) must exist on disk.
  $refs = [regex]::Matches($html, '(?:href|src)="([^"#][^"]*)"') | ForEach-Object { $_.Groups[1].Value }
  $refs += [regex]::Matches($html, 'srcset="([^"]+)"') | ForEach-Object { $_.Groups[1].Value -split ',' | ForEach-Object { ($_.Trim() -split '\s+')[0] } }
  $missing = $refs | Where-Object { $_ -notmatch '^(https?:|mailto:|tel:|data:)' } | Sort-Object -Unique |
    Where-Object { -not (Test-Path (Join-Path $root (($_ -replace '\?.*$', '').TrimStart('/') -replace '/', '\'))) }
  Check 'local references exist' (-not $missing) ($missing -join ', ')

  $imgs = [regex]::Matches($html, '<img\b[^>]*>') | ForEach-Object { $_.Value }
  Check 'every <img> has alt, width and height' (-not ($imgs | Where-Object { $_ -notmatch '\balt="' -or $_ -notmatch '\bwidth="' -or $_ -notmatch '\bheight="' }))

  $blank = [regex]::Matches($html, '<a\b[^>]*target="_blank"[^>]*>') | ForEach-Object { $_.Value }
  Check 'target=_blank links use rel=noopener' (-not ($blank | Where-Object { $_ -notmatch 'rel="[^"]*noopener' }))

  $ids = [regex]::Matches($html, '\sid="([^"]+)"') | ForEach-Object { $_.Groups[1].Value }
  $dup = $ids | Group-Object | Where-Object Count -gt 1 | ForEach-Object Name
  Check 'ids are unique' (-not $dup) ($dup -join ', ')

  $anchors = [regex]::Matches($html, 'href="#([^"]+)"') | ForEach-Object { $_.Groups[1].Value } | Sort-Object -Unique
  $broken = $anchors | Where-Object { $ids -notcontains $_ }
  Check 'in-page anchors point to existing ids' (-not $broken) ($broken -join ', ')

  Check 'exactly one <h1>' ([regex]::Matches($html, '<h1\b').Count -eq 1)
  Check '<html lang="fr">' ($html -match '<html lang="fr">')
  $title = [regex]::Match($html, '<title>(.*?)</title>').Groups[1].Value
  Check "title length <= 65 ($($title.Length))" ($title.Length -gt 0 -and $title.Length -le 65)
}

Write-Host "`nSEO & config" -ForegroundColor Cyan
$index = Read-Utf8 'index.html'
$desc = [regex]::Match($index, 'name="description" content="([^"]*)"').Groups[1].Value
Check "meta description 50-170 chars ($($desc.Length))" ($desc.Length -ge 50 -and $desc.Length -le 170)
foreach ($tag in 'rel="canonical"', 'og:title', 'og:description', 'og:image"', 'og:url', 'twitter:card') {
  Check "has $tag" ($index -match [regex]::Escape($tag))
}
# Cache busting: CSS / JS (page + module imports) must carry ?v=, all with the same value.
$mainJs = Read-Utf8 'assets\js\main.js'
$assetRefs = @([regex]::Matches($index, '(?:href|src)="(assets/(?:css|js)/[^"]+)"') | ForEach-Object { $_.Groups[1].Value })
$assetRefs += @([regex]::Matches($mainJs, "from '(\./[^']+)'") | ForEach-Object { $_.Groups[1].Value })
$unversioned = $assetRefs | Where-Object { $_ -notmatch '\?v=' }
Check 'CSS and JS references are versioned (?v=)' (-not $unversioned) ($unversioned -join ', ')
$versions = $assetRefs | ForEach-Object { if ($_ -match '\?v=([^&]+)') { $Matches[1] } } | Sort-Object -Unique
Check "one asset version everywhere ($($versions -join ', '))" (@($versions).Count -eq 1)

$projects = [regex]::Matches($index, '<li class="project[ "][^>]*data-reveal>').Count
Check "found project cards ($projects)" ($projects -gt 0)
$ld = [regex]::Match($index, '<script type="application/ld\+json">(.*?)</script>', 'Singleline').Groups[1].Value
try { $json = $ld | ConvertFrom-Json; $okLd = $true } catch { $okLd = $false }
Check 'JSON-LD parses' $okLd
if ($okLd) {
  $list = $json.'@graph' | Where-Object { $_.'@type' -eq 'ItemList' }
  Check "JSON-LD lists every project ($projects)" ($list.itemListElement.Count -eq $projects)
}

$vercel = Read-Utf8 'vercel.json' | ConvertFrom-Json
$csp = ($vercel.headers | ForEach-Object { $_.headers } | Where-Object key -eq 'Content-Security-Policy').value
$inline = [regex]::Match($index, '<script>(.*?)</script>', 'Singleline').Groups[1].Value
$hash = 'sha256-' + [Convert]::ToBase64String([Security.Cryptography.SHA256]::Create().ComputeHash([Text.Encoding]::UTF8.GetBytes($inline)))
Check 'CSP allows the inline head script (hash up to date)' ($csp -match [regex]::Escape($hash)) "expected $hash"
$origins = [regex]::Matches($index, '<a class="project-shot" href="(https://[^"/]+)') | ForEach-Object { $_.Groups[1].Value }
$notFramed = $origins | Where-Object { $csp -notmatch [regex]::Escape($_) }
Check 'CSP frame-src allows every previewed site' (-not $notFramed) ($notFramed -join ', ')
try { Read-Utf8 'site.webmanifest' | ConvertFrom-Json | Out-Null; $okManifest = $true } catch { $okManifest = $false }
Check 'site.webmanifest parses' $okManifest
Check 'sitemap.xml is valid XML' ($null -ne ([xml](Read-Utf8 'sitemap.xml')))

# Weight as actually transferred: LF line endings (a Windows checkout adds CR) and gzip compression.
$raw = 0; $gz = 0
Get-ChildItem (Join-Path $root 'assets') -Recurse -File -Include *.css, *.js | ForEach-Object {
  $bytes = [Text.Encoding]::UTF8.GetBytes(([IO.File]::ReadAllText($_.FullName, [Text.Encoding]::UTF8) -replace "`r", ''))
  $raw += $bytes.Length
  $ms = New-Object IO.MemoryStream
  $zip = New-Object IO.Compression.GZipStream($ms, [IO.Compression.CompressionMode]::Compress)
  $zip.Write($bytes, 0, $bytes.Length); $zip.Close()
  $gz += $ms.ToArray().Length
}
Check "CSS + JS under 25 KB gzipped ($([math]::Round($gz / 1KB)) KB, $([math]::Round($raw / 1KB)) KB raw)" ($gz -lt 25KB)
$heavy = Get-ChildItem (Join-Path $root 'assets\img') -File | Where-Object Length -gt 200KB
Check 'no image over 200 KB' (-not $heavy) (($heavy | ForEach-Object Name) -join ', ')

if (-not $SkipBrowser) {
  Write-Host "`nRuntime (headless Chrome)" -ForegroundColor Cyan
  # Chrome logs harmless noise on stderr; with 'Stop' PowerShell 5.1 would turn it into an exception.
  $ErrorActionPreference = 'Continue'
  $chrome = @("$env:ProgramFiles\Google\Chrome\Application\chrome.exe", "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe") |
    Where-Object { Test-Path $_ } | Select-Object -First 1
  if (-not $chrome) {
    Write-Host '  skip  no Chrome or Edge found' -ForegroundColor Yellow
  } else {
    $server = Start-Job -ScriptBlock { param($s, $p) & powershell -NoProfile -ExecutionPolicy Bypass -File $s -Port $p } -ArgumentList (Join-Path $root 'tools\serve.ps1'), $Port
    try {
      $up = $false
      for ($i = 0; $i -lt 40 -and -not $up; $i++) {
        try { Invoke-WebRequest "http://localhost:$Port/" -UseBasicParsing -TimeoutSec 2 | Out-Null; $up = $true } catch { Start-Sleep -Milliseconds 250 }
      }
      Check 'local server starts' $up
      if ($up) {
        $profile = Join-Path $env:TEMP "site-test-$Port"
        $dom = & $chrome --headless=new --disable-gpu --no-first-run --user-data-dir="$profile" --window-size=1280,900 --run-all-compositor-stages-before-draw --virtual-time-budget=10000 --dump-dom "http://localhost:$Port/" 2>$null | Out-String
        Check 'JavaScript modules boot without error (html.is-ready)' ($dom -match '<html[^>]*class="[^"]*is-ready')
        Check 'footer year filled by JS' ($dom -match 'data-year="">20[0-9][0-9]<')
        Check 'theme toggle labelled by JS' ($dom -match 'data-theme-toggle="" aria-label="Passer en th[^"]{1,3}me (sombre|clair)"')
        Check 'hero revealed' ($dom -match 'class="hero container[^"]*\bis-visible\b')
        $mobile = & $chrome --headless=new --disable-gpu --no-first-run --user-data-dir="$profile" --window-size=375,812 --virtual-time-budget=10000 --run-all-compositor-stages-before-draw --dump-dom "http://localhost:$Port/" 2>$null | Out-String
        Check 'page renders at phone width' ($mobile -match 'is-ready')
      }
    } finally {
      Stop-Job $server -ErrorAction SilentlyContinue; Remove-Job $server -Force -ErrorAction SilentlyContinue
    }
  }
}

Write-Host "`n$script:passes passed, $script:failures failed" -ForegroundColor ($(if ($script:failures) { 'Red' } else { 'Green' }))
exit $script:failures
