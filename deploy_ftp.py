"""FTP deploy script for ps.kz — uploads modified files to httpdocs/."""
import os
import sys
from ftplib import FTP_TLS, error_perm

HOST = "srv-plesk21.ps.kz"
USER = "malyark1"
PASS = os.environ.get("FTP_PASS", "")
REMOTE_BASE = "httpdocs"

FILES = [
    "style.css",
    "main.js",
    "shared.js",
    "pixel.js",
    "index.html",
    "privacy.html",
    "warranty.html",
    "kalkulyator/index.html",
    "uslugi/index.html",
    "portfolio/index.html",
    "preimushhestva/index.html",
    "kontakty/index.html",
    "blog/index.html",
    "blog/skolko-stoit-pokraska-fasadov/index.html",
    "blog/kak-vybrat-pokrasochnyj-ceh/index.html",
    "blog/matovaya-ili-glyantsevaya-pokraska/index.html",
]

# Image directories to walk recursively — all files inside get uploaded.
IMAGE_DIRS = [
    "images/mdf",
    "images/samples",
    "images/shpon",
    "images/portfolio",
    "images/gloss",
    "images/blog",
]

IMAGE_EXTS = (".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg")


def ensure_remote_dir(ftp, path):
    """mkdir -p equivalent for FTP."""
    parts = path.split("/")
    cur = ""
    for p in parts:
        if not p:
            continue
        cur = cur + "/" + p if cur else p
        try:
            ftp.mkd(cur)
        except error_perm:
            pass  # exists


def main():
    if not PASS:
        sys.exit("FTP_PASS env var not set")

    print(f"Connecting to {HOST} as {USER}...")
    try:
        ftp = FTP_TLS(HOST, timeout=30)
        ftp.login(USER, PASS)
        ftp.prot_p()
        print("  TLS OK")
    except Exception as e:
        print(f"  FTPS failed: {e}, trying plain FTP...")
        from ftplib import FTP
        ftp = FTP(HOST, timeout=30)
        ftp.login(USER, PASS)
        print("  plain FTP OK")

    ftp.cwd(REMOTE_BASE)
    print(f"cwd: {REMOTE_BASE}")

    def upload_one(rel):
        remote_dir = os.path.dirname(rel)
        if remote_dir:
            ensure_remote_dir(ftp, remote_dir)
        if not os.path.exists(rel):
            print(f"  SKIP {rel} (not found locally)")
            return False
        with open(rel, "rb") as f:
            try:
                # Normalize to forward slashes for FTP path
                ftp.storbinary(f"STOR {rel.replace(os.sep, '/')}", f)
                size = os.path.getsize(rel)
                print(f"  OK  {rel}  ({size:,} bytes)")
                return True
            except Exception as e:
                print(f"  ERR {rel}: {e}")
                return False

    uploaded = []
    print("\n--- code files ---")
    for rel in FILES:
        if upload_one(rel):
            uploaded.append(rel)

    print("\n--- images ---")
    image_count = 0
    for d in IMAGE_DIRS:
        if not os.path.isdir(d):
            print(f"  (dir {d} not found, skip)")
            continue
        for root, _, files in os.walk(d):
            for name in files:
                if not name.lower().endswith(IMAGE_EXTS):
                    continue
                rel = os.path.join(root, name).replace(os.sep, "/")
                if upload_one(rel):
                    uploaded.append(rel)
                    image_count += 1

    ftp.quit()
    print(f"\nUploaded {len(uploaded)} files total ({image_count} images)")


if __name__ == "__main__":
    main()
