"""Authors the two original Lottie assets for the app (no third-party files, no license strings attached).
  assets/lottie/heart-burst.json   favourite heart pops with a ring and particles
  assets/lottie/key-turn.json      a key slides in, turns, and sparkles (booking confirmed)
Re-run after changing colors. Preview: python3 scripts/preview_lotties.py"""
import json, math

def rgba(h, a=1):
    h = h.lstrip('#')
    return [int(h[i:i+2], 16) / 255 for i in (0, 2, 4)] + [a]

TERRA, GOLD, PINE = rgba('#E2725B'), rgba('#E9B949'), rgba('#0F4A3C')
FR = 30

def static(v): return {"a": 0, "k": v}

def ease(i=0.2, o=0.4, dims=1):
    return {"i": {"x": [i] * dims, "y": [1] * dims}, "o": {"x": [o] * dims, "y": [0] * dims}}

def kf(frames, dims=1):
    """frames: [(t, value)] -> animated property. value is a list."""
    out = []
    for idx, (t, v) in enumerate(frames):
        k = {"t": t, "s": v}
        if idx < len(frames) - 1:
            k.update(ease(dims=dims))
        out.append(k)
    return {"a": 1, "k": out}

def layer(ind, name, shapes, p=(100, 100), s=None, r=None, o=None, ip=0, op=60):
    ks = {
        "o": o or static(100),
        "r": r or static(0),
        "p": static([p[0], p[1], 0]) if not isinstance(p, dict) else p,
        "a": static([0, 0, 0]),
        "s": s or static([100, 100, 100]),
    }
    return {"ddd": 0, "ind": ind, "ty": 4, "nm": name, "sr": 1, "ks": ks, "ao": 0, "shapes": shapes, "ip": ip, "op": op, "st": 0, "bm": 0}

def tr():
    return {"ty": "tr", "p": static([0, 0]), "a": static([0, 0]), "s": static([100, 100]), "r": static(0), "o": static(100), "sk": static(0), "sa": static(0)}

def group(items, nm="g"):
    return {"ty": "gr", "nm": nm, "it": items + [tr()]}

def fill(c): return {"ty": "fl", "c": static(c), "o": static(100), "r": 1}
def stroke(c, w): return {"ty": "st", "c": static(c), "o": static(100), "w": static(w), "lc": 2, "lj": 2}
def ellipse(w, h, x=0, y=0): return {"ty": "el", "p": static([x, y]), "s": static([w, h])}
def path(v, i, o, closed): return {"ty": "sh", "ks": static({"i": i, "o": o, "v": v, "c": closed})}
def line(a, b): return path([a, b], [[0, 0], [0, 0]], [[0, 0], [0, 0]], False)

def doc(name, op, layers):
    return {"v": "5.7.0", "fr": FR, "ip": 0, "op": op, "w": 200, "h": 200, "nm": name, "ddd": 0, "assets": [], "layers": layers}

# ---------------- heart burst ----------------
heart_path = path(
    [[0, 30], [-34, -4], [0, -14], [34, -4]],
    [[16, -14], [0, 16], [-14, -14], [0, -22]],
    [[-16, -14], [0, -22], [14, -14], [0, 16]],
    True,
)
heart = layer(1, "heart", [group([heart_path, fill(TERRA)], "heart")],
              s=kf([(0, [0, 0, 100]), (9, [138, 138, 100]), (17, [100, 100, 100])], dims=3),
              r=kf([(0, [0]), (9, [-8]), (17, [0])]),
              op=45)
ring = layer(2, "ring", [group([ellipse(64, 64), stroke(TERRA, 3)], "ring")],
             s=kf([(5, [45, 45, 100]), (30, [210, 210, 100])], dims=3),
             o=kf([(5, [85]), (30, [0])]), ip=5, op=45)
layers = [heart, ring]
for k in range(8):
    ang = math.radians(k * 45 + 22.5)
    r0, r1 = 20, 74
    col = TERRA if k % 2 == 0 else GOLD
    pos = kf([(6, [100 + r0 * math.cos(ang), 100 + r0 * math.sin(ang), 0]), (30, [100 + r1 * math.cos(ang), 100 + r1 * math.sin(ang), 0])], dims=3)
    layers.append(layer(3 + k, f"dot{k}", [group([ellipse(9, 9), fill(col)], "dot")],
                        p=pos, s=kf([(6, [100, 100, 100]), (30, [0, 0, 100])], dims=3), ip=6, op=45))
open("assets/lottie/heart-burst.json", "w").write(json.dumps(doc("heart-burst", 45, layers), separators=(",", ":")))

# ---------------- key turn ----------------
key_group = group([
    group([ellipse(30, 30, -26, 0), stroke(PINE, 7)], "bow"),
    group([line([-9, 0], [34, 0]), stroke(PINE, 7)], "shaft"),
    group([line([22, 0], [22, 11]), stroke(PINE, 6)], "tooth1"),
    group([line([33, 0], [33, 8]), stroke(PINE, 6)], "tooth2"),
], "key")
key = layer(1, "key", [key_group],
            p=kf([(0, [20, 100, 0]), (14, [100, 100, 0])], dims=3),
            r=kf([(14, [0]), (22, [-8]), (32, [90]), (38, [84])]),
            o=kf([(0, [0]), (6, [100])]),
            s=kf([(0, [90, 90, 100]), (14, [100, 100, 100])], dims=3), op=70)

def star(cx, cy, size, delay, col):
    s = size
    v = [[0, -s], [s * 0.28, -s * 0.28], [s, 0], [s * 0.28, s * 0.28], [0, s], [-s * 0.28, s * 0.28], [-s, 0], [-s * 0.28, -s * 0.28]]
    z = [[0, 0]] * 8
    return [group([path(v, z, z, True), fill(col)], "star")], (cx, cy), delay

pulse = layer(2, "pulse", [group([ellipse(70, 70), stroke(TERRA, 3)], "pulse")],
              s=kf([(30, [60, 60, 100]), (62, [230, 230, 100])], dims=3),
              o=kf([(30, [80]), (62, [0])]), ip=30, op=70)
layers2 = [key, pulse]
for idx, (cx, cy, size, delay, col) in enumerate([(150, 62, 11, 32, GOLD), (52, 56, 8, 36, TERRA), (158, 138, 7, 40, GOLD)]):
    shapes, p, d = star(cx, cy, size, delay, col)
    layers2.append(layer(3 + idx, f"star{idx}", shapes, p=p,
                         s=kf([(d, [0, 0, 100]), (d + 8, [130, 130, 100]), (d + 18, [0, 0, 100])], dims=3),
                         r=kf([(d, [0]), (d + 18, [90])]), ip=d, op=70))
open("assets/lottie/key-turn.json", "w").write(json.dumps(doc("key-turn", 70, layers2), separators=(",", ":")))
print("lotties written")
