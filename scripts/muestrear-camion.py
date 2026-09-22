"""Sample the original OBJ with wheel labels from connected mesh components.
Usage: python3 scripts/muestrear-camion.py /path/model.obj /tmp/truck-surface.json
Then: node scripts/generar-camion.cjs /tmp/truck-surface.json
Original licensed OBJ remains outside the public repo.
"""
import bisect
import collections
import json
import math
import random
import sys

vertices, faces = [], []
for line in open(sys.argv[1]):
    if line.startswith('v '):
        vertices.append(list(map(float, line.split()[1:4])))
    elif line.startswith('f '):
        faces.append([int(v.split('/')[0])-1 for v in line.split()[1:]])
parent = list(range(len(vertices)))
def root(a):
    while parent[a] != a:
        parent[a] = parent[parent[a]]
        a = parent[a]
    return a
for face in faces:
    for i in face[1:]:
        parent[root(i)] = root(face[0])
groups = collections.defaultdict(list)
for i in range(len(vertices)):
    groups[root(i)].append(i)
bounds = [(min(v[k] for v in vertices), max(v[k] for v in vertices)) for k in range(3)]
center = [(a+b)/2 for a,b in bounds]
scale = (bounds[0][1]-bounds[0][0])/2
labels = {}
for group, indices in groups.items():
    bb = [(min(vertices[i][k] for i in indices), max(vertices[i][k] for i in indices)) for k in range(3)]
    # Both wheel/axle assemblies and the inner dual rear tyres have the same
    # circular X/Z bounds and touch ground. No body component satisfies this.
    wheel = (abs(bb[2][0]-bounds[2][0])<1 and 390<bb[2][1]-bb[2][0]<405
             and abs((bb[0][1]-bb[0][0])-(bb[2][1]-bb[2][0]))<1)
    labels[group] = (1 if sum(bb[0])/2<center[0] else 2) if wheel else 0
print('Wheel components:', sum(bool(v) for v in labels.values()))
assert sum(bool(v) for v in labels.values()) == 4
# Source Z is up. Runtime coordinates use Y up and Z across the truck.
vs = [[(v[0]-center[0])/scale,(v[2]-center[2])/scale,(v[1]-center[1])/scale] for v in vertices]
triangles, cumulative = [], []
total = 0
for face in faces:
    for i in range(1,len(face)-1):
        a,b,c = [vs[j] for j in (face[0],face[i],face[i+1])]
        u,v = [[p[k]-a[k] for k in range(3)] for p in (b,c)]
        normal = [u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]]
        length = math.sqrt(sum(n*n for n in normal))
        if length<1e-12:
            continue
        total += length/2
        cumulative.append(total)
        triangles.append((a,b,c,[n/length for n in normal],labels[root(face[0])]))
rng = random.Random(793)
points = []
for _ in range(85000):
    a,b,c,n,wheel = triangles[bisect.bisect_left(cumulative,rng.random()*total)]
    u,v = rng.random(),rng.random()
    if u+v>1:
        u,v = 1-u,1-v
    xyz = [a[k]+u*(b[k]-a[k])+v*(c[k]-a[k]) for k in range(3)]
    points.append(xyz+n+[0,wheel])
with open(sys.argv[2],'w') as out:
    json.dump(points,out,separators=(',',':'))
print('Sampled',len(points),'points with mesh-derived wheel labels')
