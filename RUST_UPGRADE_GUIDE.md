# Rust Upgrade Guide

## Quick Fix: Upgrade Rust to 1.88.0

Your current Rust version (1.87.0) is too old for the latest SpacetimeDB (1.3.0).

### Step 1: Upgrade Rust

```bash
# Update rustup
rustup update

# Check current version
rustc --version

# If still old, force update to latest
rustup default stable
rustup update
```

### Step 2: Verify Upgrade

```bash
# Should show 1.88.0 or newer
rustc --version
```

### Step 3: Retry Publish

```bash
cd ~/FO/server
spacetime publish status-module-v2
```

## Alternative: Use Compatible Versions

If you can't upgrade Rust, downgrade SpacetimeDB:

```bash
# Edit Cargo.toml to use older version
nano Cargo.toml

# Change this line:
# spacetimedb = "1.3.0"
# To:
# spacetimedb = "1.2.0"

# Then try publishing again
spacetime publish status-module-v2
```

## Recommended: Upgrade Rust

The upgrade is the better long-term solution since SpacetimeDB 1.3.0 has improvements and bug fixes. 