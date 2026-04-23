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
    "index.html",
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

    uploaded = []
    for rel in FILES:
        remote_dir = os.path.dirname(rel)
        if remote_dir:
            ensure_remote_dir(ftp, remote_dir)
        local = rel
        with open(local, "rb") as f:
            try:
                ftp.storbinary(f"STOR {rel}", f)
                size = os.path.getsize(local)
                uploaded.append(rel)
                print(f"  OK  {rel}  ({size:,} bytes)")
            except Exception as e:
                print(f"  ERR {rel}: {e}")

    ftp.quit()
    print(f"\nUploaded {len(uploaded)}/{len(FILES)} files")


if __name__ == "__main__":
    main()
