import sys
import json
import numpy as np
from sklearn.neighbors import KNeighborsClassifier

# -----------------------------
# TRAINING DATA (DUMMY)
# -----------------------------
# [spice_level, calories, cuisine_encoded]
X = np.array([
    [4, 700, 1],  # spicy lover
    [5, 800, 1],
    [1, 400, 2],  # health conscious
    [2, 350, 2],
    [3, 600, 3],  # balanced
    [2, 500, 3]
])

y = np.array([
    "Spicy Enthusiast",
    "Spicy Enthusiast",
    "Health Conscious",
    "Health Conscious",
    "Balanced",
    "Balanced"
])

model = KNeighborsClassifier(n_neighbors=3)
model.fit(X, y)

# -----------------------------
# INPUT FROM NODE
# -----------------------------
input_data = json.loads(sys.argv[1])

user_vector = np.array([[
    float(input_data["spice"]),
    float(input_data["calories"]),
    float(input_data["cuisine"])
]])

prediction = model.predict(user_vector)

print(json.dumps({
    "axis": "Spice",
    "category": prediction[0]
}))