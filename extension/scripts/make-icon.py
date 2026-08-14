"""Write a 128x128 marketplace icon (dark bag)."""
import pathlib
import struct
import zlib

W = H = 128
BG = (15, 16, 17, 255)
FG = (197, 197, 197, 255)


def pixel(x: int, y: int) -> tuple[int, int, int, int]:
    if 28 <= x <= 99 and 44 <= y <= 110:
        if x in (28, 29, 98, 99) or y in (44, 45, 109, 110):
            return FG
    if 44 <= x <= 83 and 22 <= y <= 48:
        handle = (x in (44, 45, 82, 83) and 22 <= y <= 48) or (
            22 <= y <= 23 and 44 <= x <= 83
        )
        if handle:
            return FG
    return BG


def chunk(tag: bytes, data: bytes) -> bytes:
    return (
        struct.pack(">I", len(data))
        + tag
        + data
        + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)
    )


raw = bytearray()
for y in range(H):
    raw.append(0)
    for x in range(W):
        raw.extend(pixel(x, y))

png = b"\x89PNG\r\n\x1a\n"
png += chunk(b"IHDR", struct.pack(">IIBBBBB", W, H, 8, 6, 0, 0, 0))
png += chunk(b"IDAT", zlib.compress(bytes(raw), 9))
png += chunk(b"IEND", b"")

out = pathlib.Path(__file__).resolve().parent.parent / "media" / "icon.png"
out.write_bytes(png)
print(out, out.stat().st_size)
