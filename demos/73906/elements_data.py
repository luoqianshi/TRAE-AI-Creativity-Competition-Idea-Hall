"""
elements_data.py - Complete element data (Z=1..118) for the pygame atom simulator.

Each ELEMENTS entry contains:
    name           : Chinese element name
    protons        : atomic number Z
    neutrons       : neutron count N of the most common / longest-lived isotope
    color          : (R, G, B) tuple based on real physical appearance
    radius         : pixel radius (20-74) scaled from covalent radius
    category       : one of "nonmetal", "noble_gas", "alkali", "alkaline",
                     "halogen", "transition", "metalloid", "post_transition",
                     "lanthanide", "actinide"
    atomic_weight  : float (standard atomic weight, or mass number for radioisotopes)
    e_config       : abbreviated (noble-gas core) electron configuration

Also provides:
    PROTON_TO_SYMBOL      : {Z: "SYMBOL", ...} for Z=1..118
    NUCLEAR_BINDING_FULL  : {Z: total_binding_energy_MeV, ...} for Z=1..118
"""

ELEMENTS = {
    # ---- Period 1 ----
    "H": {
        "name": "氢", "protons": 1, "neutrons": 0,
        "color": (180, 220, 255), "radius": 24,
        "category": "nonmetal", "atomic_weight": 1.008,
        "e_config": "1s\u00b9",
    },
    "He": {
        "name": "氦", "protons": 2, "neutrons": 2,
        "color": (255, 220, 230), "radius": 22,
        "category": "noble_gas", "atomic_weight": 4.003,
        "e_config": "1s\u00b2",
    },
    # ---- Period 2 ----
    "Li": {
        "name": "锂", "protons": 3, "neutrons": 4,
        "color": (200, 200, 205), "radius": 46,
        "category": "alkali", "atomic_weight": 6.941,
        "e_config": "[He]2s\u00b9",
    },
    "Be": {
        "name": "铍", "protons": 4, "neutrons": 5,
        "color": (190, 195, 200), "radius": 36,
        "category": "alkaline", "atomic_weight": 9.012,
        "e_config": "[He]2s\u00b2",
    },
    "B": {
        "name": "硼", "protons": 5, "neutrons": 6,
        "color": (120, 90, 70), "radius": 34,
        "category": "metalloid", "atomic_weight": 10.811,
        "e_config": "[He]2s\u00b22p\u00b9",
    },
    "C": {
        "name": "碳", "protons": 6, "neutrons": 6,
        "color": (50, 50, 50), "radius": 33,
        "category": "nonmetal", "atomic_weight": 12.011,
        "e_config": "[He]2s\u00b22p\u00b2",
    },
    "N": {
        "name": "氮", "protons": 7, "neutrons": 7,
        "color": (180, 210, 255), "radius": 31,
        "category": "nonmetal", "atomic_weight": 14.007,
        "e_config": "[He]2s\u00b22p\u00b3",
    },
    "O": {
        "name": "氧", "protons": 8, "neutrons": 8,
        "color": (255, 160, 140), "radius": 31,
        "category": "nonmetal", "atomic_weight": 15.999,
        "e_config": "[He]2s\u00b22p\u2074",
    },
    "F": {
        "name": "氟", "protons": 9, "neutrons": 10,
        "color": (180, 255, 180), "radius": 29,
        "category": "halogen", "atomic_weight": 18.998,
        "e_config": "[He]2s\u00b22p\u2075",
    },
    "Ne": {
        "name": "氖", "protons": 10, "neutrons": 10,
        "color": (255, 80, 30), "radius": 28,
        "category": "noble_gas", "atomic_weight": 20.180,
        "e_config": "[He]2s\u00b22p\u2076",
    },
    # ---- Period 3 ----
    "Na": {
        "name": "钠", "protons": 11, "neutrons": 12,
        "color": (255, 220, 100), "radius": 42,
        "category": "alkali", "atomic_weight": 22.990,
        "e_config": "[Ne]3s\u00b9",
    },
    "Mg": {
        "name": "镁", "protons": 12, "neutrons": 12,
        "color": (200, 200, 205), "radius": 39,
        "category": "alkaline", "atomic_weight": 24.305,
        "e_config": "[Ne]3s\u00b2",
    },
    "Al": {
        "name": "铝", "protons": 13, "neutrons": 14,
        "color": (190, 195, 200), "radius": 37,
        "category": "post_transition", "atomic_weight": 26.982,
        "e_config": "[Ne]3s\u00b23p\u00b9",
    },
    "Si": {
        "name": "硅", "protons": 14, "neutrons": 14,
        "color": (160, 170, 180), "radius": 36,
        "category": "metalloid", "atomic_weight": 28.086,
        "e_config": "[Ne]3s\u00b23p\u00b2",
    },
    "P": {
        "name": "磷", "protons": 15, "neutrons": 16,
        "color": (255, 240, 180), "radius": 35,
        "category": "nonmetal", "atomic_weight": 30.974,
        "e_config": "[Ne]3s\u00b23p\u00b3",
    },
    "S": {
        "name": "硫", "protons": 16, "neutrons": 16,
        "color": (240, 220, 60), "radius": 34,
        "category": "nonmetal", "atomic_weight": 32.065,
        "e_config": "[Ne]3s\u00b23p\u2074",
    },
    "Cl": {
        "name": "氯", "protons": 17, "neutrons": 18,
        "color": (100, 255, 100), "radius": 33,
        "category": "halogen", "atomic_weight": 35.453,
        "e_config": "[Ne]3s\u00b23p\u2075",
    },
    "Ar": {
        "name": "氩", "protons": 18, "neutrons": 22,
        "color": (200, 230, 255), "radius": 32,
        "category": "noble_gas", "atomic_weight": 39.948,
        "e_config": "[Ne]3s\u00b23p\u2076",
    },
    # ---- Period 4 ----
    "K": {
        "name": "钾", "protons": 19, "neutrons": 20,
        "color": (180, 80, 255), "radius": 50,
        "category": "alkali", "atomic_weight": 39.098,
        "e_config": "[Ar]4s\u00b9",
    },
    "Ca": {
        "name": "钙", "protons": 20, "neutrons": 20,
        "color": (255, 150, 80), "radius": 45,
        "category": "alkaline", "atomic_weight": 40.078,
        "e_config": "[Ar]4s\u00b2",
    },
    "Sc": {
        "name": "钪", "protons": 21, "neutrons": 24,
        "color": (190, 190, 195), "radius": 42,
        "category": "transition", "atomic_weight": 44.956,
        "e_config": "[Ar]3d\u00b94s\u00b2",
    },
    "Ti": {
        "name": "钛", "protons": 22, "neutrons": 26,
        "color": (175, 175, 185), "radius": 41,
        "category": "transition", "atomic_weight": 47.867,
        "e_config": "[Ar]3d\u00b24s\u00b2",
    },
    "V": {
        "name": "钒", "protons": 23, "neutrons": 28,
        "color": (165, 165, 175), "radius": 40,
        "category": "transition", "atomic_weight": 50.942,
        "e_config": "[Ar]3d\u00b34s\u00b2",
    },
    "Cr": {
        "name": "铬", "protons": 24, "neutrons": 28,
        "color": (130, 140, 165), "radius": 39,
        "category": "transition", "atomic_weight": 51.996,
        "e_config": "[Ar]3d\u20754s\u00b9",
    },
    "Mn": {
        "name": "锰", "protons": 25, "neutrons": 30,
        "color": (180, 170, 175), "radius": 39,
        "category": "transition", "atomic_weight": 54.938,
        "e_config": "[Ar]3d\u20754s\u00b2",
    },
    "Fe": {
        "name": "铁", "protons": 26, "neutrons": 30,
        "color": (220, 100, 80), "radius": 41,
        "category": "transition", "atomic_weight": 55.845,
        "e_config": "[Ar]3d\u20764s\u00b2",
    },
    "Co": {
        "name": "钴", "protons": 27, "neutrons": 32,
        "color": (120, 140, 180), "radius": 40,
        "category": "transition", "atomic_weight": 58.933,
        "e_config": "[Ar]3d\u20774s\u00b2",
    },
    "Ni": {
        "name": "镍", "protons": 28, "neutrons": 30,
        "color": (175, 175, 175), "radius": 40,
        "category": "transition", "atomic_weight": 58.693,
        "e_config": "[Ar]3d\u20784s\u00b2",
    },
    "Cu": {
        "name": "铜", "protons": 29, "neutrons": 34,
        "color": (255, 150, 50), "radius": 39,
        "category": "transition", "atomic_weight": 63.546,
        "e_config": "[Ar]3d\u00b9\u20704s\u00b9",
    },
    "Zn": {
        "name": "锌", "protons": 30, "neutrons": 34,
        "color": (180, 185, 195), "radius": 38,
        "category": "transition", "atomic_weight": 65.38,
        "e_config": "[Ar]3d\u00b9\u20704s\u00b2",
    },
    "Ga": {
        "name": "镓", "protons": 31, "neutrons": 38,
        "color": (200, 200, 210), "radius": 37,
        "category": "post_transition", "atomic_weight": 69.723,
        "e_config": "[Ar]3d\u00b9\u20704s\u00b24p\u00b9",
    },
    "Ge": {
        "name": "锗", "protons": 32, "neutrons": 42,
        "color": (150, 160, 165), "radius": 36,
        "category": "metalloid", "atomic_weight": 72.64,
        "e_config": "[Ar]3d\u00b9\u20704s\u00b24p\u00b2",
    },
    "As": {
        "name": "砷", "protons": 33, "neutrons": 42,
        "color": (120, 130, 120), "radius": 35,
        "category": "metalloid", "atomic_weight": 74.922,
        "e_config": "[Ar]3d\u00b9\u20704s\u00b24p\u00b3",
    },
    "Se": {
        "name": "硒", "protons": 34, "neutrons": 46,
        "color": (180, 100, 80), "radius": 34,
        "category": "nonmetal", "atomic_weight": 78.96,
        "e_config": "[Ar]3d\u00b9\u20704s\u00b24p\u2074",
    },
    "Br": {
        "name": "溴", "protons": 35, "neutrons": 44,
        "color": (180, 50, 30), "radius": 34,
        "category": "halogen", "atomic_weight": 79.904,
        "e_config": "[Ar]3d\u00b9\u20704s\u00b24p\u2075",
    },
    "Kr": {
        "name": "氪", "protons": 36, "neutrons": 48,
        "color": (200, 220, 240), "radius": 33,
        "category": "noble_gas", "atomic_weight": 83.798,
        "e_config": "[Ar]3d\u00b9\u20704s\u00b24p\u2076",
    },
    # ---- Period 5 ----
    "Rb": {
        "name": "铷", "protons": 37, "neutrons": 48,
        "color": (210, 180, 200), "radius": 55,
        "category": "alkali", "atomic_weight": 85.468,
        "e_config": "[Kr]5s\u00b9",
    },
    "Sr": {
        "name": "锶", "protons": 38, "neutrons": 50,
        "color": (210, 200, 180), "radius": 49,
        "category": "alkaline", "atomic_weight": 87.62,
        "e_config": "[Kr]5s\u00b2",
    },
    "Y": {
        "name": "钇", "protons": 39, "neutrons": 50,
        "color": (190, 195, 200), "radius": 45,
        "category": "transition", "atomic_weight": 88.906,
        "e_config": "[Kr]4d\u00b95s\u00b2",
    },
    "Zr": {
        "name": "锆", "protons": 40, "neutrons": 50,
        "color": (180, 185, 190), "radius": 43,
        "category": "transition", "atomic_weight": 91.224,
        "e_config": "[Kr]4d\u00b25s\u00b2",
    },
    "Nb": {
        "name": "铌", "protons": 41, "neutrons": 52,
        "color": (120, 140, 180), "radius": 42,
        "category": "transition", "atomic_weight": 92.906,
        "e_config": "[Kr]4d\u20745s\u00b9",
    },
    "Mo": {
        "name": "钼", "protons": 42, "neutrons": 56,
        "color": (150, 160, 170), "radius": 41,
        "category": "transition", "atomic_weight": 95.96,
        "e_config": "[Kr]4d\u20755s\u00b9",
    },
    "Tc": {
        "name": "锝", "protons": 43, "neutrons": 55,
        "color": (170, 175, 180), "radius": 40,
        "category": "transition", "atomic_weight": 98.0,
        "e_config": "[Kr]4d\u20755s\u00b2",
    },
    "Ru": {
        "name": "钌", "protons": 44, "neutrons": 58,
        "color": (170, 170, 175), "radius": 40,
        "category": "transition", "atomic_weight": 101.07,
        "e_config": "[Kr]4d\u20775s\u00b9",
    },
    "Rh": {
        "name": "铑", "protons": 45, "neutrons": 58,
        "color": (200, 200, 210), "radius": 39,
        "category": "transition", "atomic_weight": 102.906,
        "e_config": "[Kr]4d\u20785s\u00b9",
    },
    "Pd": {
        "name": "钯", "protons": 46, "neutrons": 60,
        "color": (200, 200, 210), "radius": 39,
        "category": "transition", "atomic_weight": 106.42,
        "e_config": "[Kr]4d\u00b9\u2070",
    },
    "Ag": {
        "name": "银", "protons": 47, "neutrons": 60,
        "color": (225, 225, 230), "radius": 40,
        "category": "transition", "atomic_weight": 107.868,
        "e_config": "[Kr]4d\u00b9\u20705s\u00b9",
    },
    "Cd": {
        "name": "镉", "protons": 48, "neutrons": 66,
        "color": (190, 200, 210), "radius": 39,
        "category": "transition", "atomic_weight": 112.411,
        "e_config": "[Kr]4d\u00b9\u20705s\u00b2",
    },
    "In": {
        "name": "铟", "protons": 49, "neutrons": 66,
        "color": (200, 205, 210), "radius": 39,
        "category": "post_transition", "atomic_weight": 114.818,
        "e_config": "[Kr]4d\u00b9\u20705s\u00b25p\u00b9",
    },
    "Sn": {
        "name": "锡", "protons": 50, "neutrons": 70,
        "color": (190, 200, 205), "radius": 38,
        "category": "post_transition", "atomic_weight": 118.710,
        "e_config": "[Kr]4d\u00b9\u20705s\u00b25p\u00b2",
    },
    "Sb": {
        "name": "锑", "protons": 51, "neutrons": 70,
        "color": (160, 165, 170), "radius": 37,
        "category": "metalloid", "atomic_weight": 121.760,
        "e_config": "[Kr]4d\u00b9\u20705s\u00b25p\u00b3",
    },
    "Te": {
        "name": "碲", "protons": 52, "neutrons": 78,
        "color": (180, 180, 185), "radius": 36,
        "category": "metalloid", "atomic_weight": 127.60,
        "e_config": "[Kr]4d\u00b9\u20705s\u00b25p\u2074",
    },
    "I": {
        "name": "碘", "protons": 53, "neutrons": 74,
        "color": (100, 30, 120), "radius": 36,
        "category": "halogen", "atomic_weight": 126.904,
        "e_config": "[Kr]4d\u00b9\u20705s\u00b25p\u2075",
    },
    "Xe": {
        "name": "氙", "protons": 54, "neutrons": 78,
        "color": (180, 200, 230), "radius": 35,
        "category": "noble_gas", "atomic_weight": 131.293,
        "e_config": "[Kr]4d\u00b9\u20705s\u00b25p\u2076",
    },
    # ---- Period 6 (Cs -> Rn, includes lanthanides La-Lu) ----
    "Cs": {
        "name": "铯", "protons": 55, "neutrons": 78,
        "color": (255, 210, 130), "radius": 61,
        "category": "alkali", "atomic_weight": 132.905,
        "e_config": "[Xe]6s\u00b9",
    },
    "Ba": {
        "name": "钡", "protons": 56, "neutrons": 82,
        "color": (200, 200, 190), "radius": 53,
        "category": "alkaline", "atomic_weight": 137.327,
        "e_config": "[Xe]6s\u00b2",
    },
    "La": {
        "name": "镧", "protons": 57, "neutrons": 82,
        "color": (190, 195, 200), "radius": 48,
        "category": "lanthanide", "atomic_weight": 138.905,
        "e_config": "[Xe]5d\u00b96s\u00b2",
    },
    "Ce": {
        "name": "铈", "protons": 58, "neutrons": 82,
        "color": (185, 190, 195), "radius": 47,
        "category": "lanthanide", "atomic_weight": 140.116,
        "e_config": "[Xe]4f\u00b95d\u00b96s\u00b2",
    },
    "Pr": {
        "name": "镨", "protons": 59, "neutrons": 82,
        "color": (185, 195, 195), "radius": 46,
        "category": "lanthanide", "atomic_weight": 140.908,
        "e_config": "[Xe]4f\u00b36s\u00b2",
    },
    "Nd": {
        "name": "钕", "protons": 60, "neutrons": 82,
        "color": (185, 190, 200), "radius": 46,
        "category": "lanthanide", "atomic_weight": 144.24,
        "e_config": "[Xe]4f\u20746s\u00b2",
    },
    "Pm": {
        "name": "钷", "protons": 61, "neutrons": 84,
        "color": (180, 185, 190), "radius": 45,
        "category": "lanthanide", "atomic_weight": 145.0,
        "e_config": "[Xe]4f\u20756s\u00b2",
    },
    "Sm": {
        "name": "钐", "protons": 62, "neutrons": 90,
        "color": (180, 185, 195), "radius": 45,
        "category": "lanthanide", "atomic_weight": 150.36,
        "e_config": "[Xe]4f\u20766s\u00b2",
    },
    "Eu": {
        "name": "铕", "protons": 63, "neutrons": 90,
        "color": (180, 185, 190), "radius": 45,
        "category": "lanthanide", "atomic_weight": 151.964,
        "e_config": "[Xe]4f\u20776s\u00b2",
    },
    "Gd": {
        "name": "钆", "protons": 64, "neutrons": 94,
        "color": (185, 190, 195), "radius": 44,
        "category": "lanthanide", "atomic_weight": 157.25,
        "e_config": "[Xe]4f\u20775d\u00b96s\u00b2",
    },
    "Tb": {
        "name": "铽", "protons": 65, "neutrons": 94,
        "color": (180, 190, 185), "radius": 44,
        "category": "lanthanide", "atomic_weight": 158.925,
        "e_config": "[Xe]4f\u20796s\u00b2",
    },
    "Dy": {
        "name": "镝", "protons": 66, "neutrons": 98,
        "color": (180, 185, 190), "radius": 44,
        "category": "lanthanide", "atomic_weight": 162.50,
        "e_config": "[Xe]4f\u00b9\u20706s\u00b2",
    },
    "Ho": {
        "name": "钬", "protons": 67, "neutrons": 98,
        "color": (180, 185, 190), "radius": 44,
        "category": "lanthanide", "atomic_weight": 164.930,
        "e_config": "[Xe]4f\u00b9\u00b96s\u00b2",
    },
    "Er": {
        "name": "铒", "protons": 68, "neutrons": 98,
        "color": (180, 190, 190), "radius": 43,
        "category": "lanthanide", "atomic_weight": 167.259,
        "e_config": "[Xe]4f\u00b9\u00b26s\u00b2",
    },
    "Tm": {
        "name": "铥", "protons": 69, "neutrons": 100,
        "color": (180, 185, 195), "radius": 43,
        "category": "lanthanide", "atomic_weight": 168.934,
        "e_config": "[Xe]4f\u00b9\u00b36s\u00b2",
    },
    "Yb": {
        "name": "镱", "protons": 70, "neutrons": 104,
        "color": (180, 185, 190), "radius": 43,
        "category": "lanthanide", "atomic_weight": 173.054,
        "e_config": "[Xe]4f\u00b9\u20746s\u00b2",
    },
    "Lu": {
        "name": "镥", "protons": 71, "neutrons": 104,
        "color": (180, 185, 190), "radius": 43,
        "category": "lanthanide", "atomic_weight": 174.967,
        "e_config": "[Xe]4f\u00b9\u20745d\u00b96s\u00b2",
    },
    "Hf": {
        "name": "铪", "protons": 72, "neutrons": 108,
        "color": (170, 175, 180), "radius": 42,
        "category": "transition", "atomic_weight": 178.49,
        "e_config": "[Xe]4f\u00b9\u20745d\u00b26s\u00b2",
    },
    "Ta": {
        "name": "钽", "protons": 73, "neutrons": 108,
        "color": (120, 130, 160), "radius": 42,
        "category": "transition", "atomic_weight": 180.948,
        "e_config": "[Xe]4f\u00b9\u20745d\u00b36s\u00b2",
    },
    "W": {
        "name": "钨", "protons": 74, "neutrons": 110,
        "color": (100, 105, 120), "radius": 41,
        "category": "transition", "atomic_weight": 183.84,
        "e_config": "[Xe]4f\u00b9\u20745d\u20746s\u00b2",
    },
    "Re": {
        "name": "铼", "protons": 75, "neutrons": 112,
        "color": (180, 185, 195), "radius": 41,
        "category": "transition", "atomic_weight": 186.207,
        "e_config": "[Xe]4f\u00b9\u20745d\u20756s\u00b2",
    },
    "Os": {
        "name": "锇", "protons": 76, "neutrons": 116,
        "color": (130, 135, 150), "radius": 40,
        "category": "transition", "atomic_weight": 190.23,
        "e_config": "[Xe]4f\u00b9\u20745d\u20766s\u00b2",
    },
    "Ir": {
        "name": "铱", "protons": 77, "neutrons": 116,
        "color": (200, 200, 210), "radius": 40,
        "category": "transition", "atomic_weight": 192.217,
        "e_config": "[Xe]4f\u00b9\u20745d\u20776s\u00b2",
    },
    "Pt": {
        "name": "铂", "protons": 78, "neutrons": 117,
        "color": (210, 210, 220), "radius": 42,
        "category": "transition", "atomic_weight": 195.084,
        "e_config": "[Xe]4f\u00b9\u20745d\u20796s\u00b9",
    },
    "Au": {
        "name": "金", "protons": 79, "neutrons": 118,
        "color": (255, 215, 0), "radius": 43,
        "category": "transition", "atomic_weight": 196.967,
        "e_config": "[Xe]4f\u00b9\u20745d\u00b9\u20706s\u00b9",
    },
    "Hg": {
        "name": "汞", "protons": 80, "neutrons": 122,
        "color": (200, 200, 210), "radius": 40,
        "category": "transition", "atomic_weight": 200.59,
        "e_config": "[Xe]4f\u00b9\u20745d\u00b9\u20706s\u00b2",
    },
    "Tl": {
        "name": "铊", "protons": 81, "neutrons": 124,
        "color": (180, 180, 195), "radius": 40,
        "category": "post_transition", "atomic_weight": 204.383,
        "e_config": "[Xe]4f\u00b9\u20745d\u00b9\u20706s\u00b26p\u00b9",
    },
    "Pb": {
        "name": "铅", "protons": 82, "neutrons": 126,
        "color": (100, 100, 120), "radius": 40,
        "category": "post_transition", "atomic_weight": 207.2,
        "e_config": "[Xe]4f\u00b9\u20745d\u00b9\u20706s\u00b26p\u00b2",
    },
    "Bi": {
        "name": "铋", "protons": 83, "neutrons": 126,
        "color": (220, 180, 180), "radius": 40,
        "category": "post_transition", "atomic_weight": 208.980,
        "e_config": "[Xe]4f\u00b9\u20745d\u00b9\u20706s\u00b26p\u00b3",
    },
    "Po": {
        "name": "钋", "protons": 84, "neutrons": 125,
        "color": (180, 170, 175), "radius": 39,
        "category": "post_transition", "atomic_weight": 209.0,
        "e_config": "[Xe]4f\u00b9\u20745d\u00b9\u20706s\u00b26p\u2074",
    },
    "At": {
        "name": "砹", "protons": 85, "neutrons": 125,
        "color": (110, 80, 90), "radius": 38,
        "category": "halogen", "atomic_weight": 210.0,
        "e_config": "[Xe]4f\u00b9\u20745d\u00b9\u20706s\u00b26p\u2075",
    },
    "Rn": {
        "name": "氡", "protons": 86, "neutrons": 136,
        "color": (255, 180, 130), "radius": 37,
        "category": "noble_gas", "atomic_weight": 222.0,
        "e_config": "[Xe]4f\u00b9\u20745d\u00b9\u20706s\u00b26p\u2076",
    },
    # ---- Period 7 (Fr -> Og, includes actinides Ac-Lr) ----
    "Fr": {
        "name": "钫", "protons": 87, "neutrons": 136,
        "color": (200, 180, 170), "radius": 65,
        "category": "alkali", "atomic_weight": 223.0,
        "e_config": "[Rn]7s\u00b9",
    },
    "Ra": {
        "name": "镭", "protons": 88, "neutrons": 138,
        "color": (200, 195, 185), "radius": 55,
        "category": "alkaline", "atomic_weight": 226.0,
        "e_config": "[Rn]7s\u00b2",
    },
    "Ac": {
        "name": "锕", "protons": 89, "neutrons": 138,
        "color": (190, 195, 200), "radius": 51,
        "category": "actinide", "atomic_weight": 227.0,
        "e_config": "[Rn]6d\u00b97s\u00b2",
    },
    "Th": {
        "name": "钍", "protons": 90, "neutrons": 142,
        "color": (170, 175, 180), "radius": 50,
        "category": "actinide", "atomic_weight": 232.038,
        "e_config": "[Rn]6d\u00b27s\u00b2",
    },
    "Pa": {
        "name": "镤", "protons": 91, "neutrons": 140,
        "color": (160, 165, 170), "radius": 49,
        "category": "actinide", "atomic_weight": 231.036,
        "e_config": "[Rn]5f\u00b26d\u00b97s\u00b2",
    },
    "U": {
        "name": "铀", "protons": 92, "neutrons": 146,
        "color": (100, 255, 100), "radius": 53,
        "category": "actinide", "atomic_weight": 238.029,
        "e_config": "[Rn]5f\u00b36d\u00b97s\u00b2",
    },
    "Np": {
        "name": "镎", "protons": 93, "neutrons": 144,
        "color": (170, 175, 180), "radius": 52,
        "category": "actinide", "atomic_weight": 237.0,
        "e_config": "[Rn]5f\u20746d\u00b97s\u00b2",
    },
    "Pu": {
        "name": "钚", "protons": 94, "neutrons": 150,
        "color": (150, 80, 50), "radius": 51,
        "category": "actinide", "atomic_weight": 244.0,
        "e_config": "[Rn]5f\u20767s\u00b2",
    },
    "Am": {
        "name": "镅", "protons": 95, "neutrons": 148,
        "color": (180, 180, 185), "radius": 50,
        "category": "actinide", "atomic_weight": 243.0,
        "e_config": "[Rn]5f\u20777s\u00b2",
    },
    "Cm": {
        "name": "锔", "protons": 96, "neutrons": 151,
        "color": (180, 185, 190), "radius": 50,
        "category": "actinide", "atomic_weight": 247.0,
        "e_config": "[Rn]5f\u20776d\u00b97s\u00b2",
    },
    "Bk": {
        "name": "锫", "protons": 97, "neutrons": 150,
        "color": (175, 180, 185), "radius": 49,
        "category": "actinide", "atomic_weight": 247.0,
        "e_config": "[Rn]5f\u20797s\u00b2",
    },
    "Cf": {
        "name": "锎", "protons": 98, "neutrons": 153,
        "color": (175, 180, 185), "radius": 49,
        "category": "actinide", "atomic_weight": 251.0,
        "e_config": "[Rn]5f\u00b9\u20707s\u00b2",
    },
    "Es": {
        "name": "锿", "protons": 99, "neutrons": 153,
        "color": (175, 180, 180), "radius": 48,
        "category": "actinide", "atomic_weight": 252.0,
        "e_config": "[Rn]5f\u00b9\u00b97s\u00b2",
    },
    "Fm": {
        "name": "镄", "protons": 100, "neutrons": 157,
        "color": (170, 175, 180), "radius": 48,
        "category": "actinide", "atomic_weight": 257.0,
        "e_config": "[Rn]5f\u00b9\u00b27s\u00b2",
    },
    "Md": {
        "name": "钔", "protons": 101, "neutrons": 158,
        "color": (170, 175, 180), "radius": 47,
        "category": "actinide", "atomic_weight": 258.0,
        "e_config": "[Rn]5f\u00b9\u00b37s\u00b2",
    },
    "No": {
        "name": "锘", "protons": 102, "neutrons": 157,
        "color": (170, 170, 175), "radius": 47,
        "category": "actinide", "atomic_weight": 259.0,
        "e_config": "[Rn]5f\u00b9\u20747s\u00b2",
    },
    "Lr": {
        "name": "铹", "protons": 103, "neutrons": 163,
        "color": (170, 175, 180), "radius": 47,
        "category": "actinide", "atomic_weight": 266.0,
        "e_config": "[Rn]5f\u00b9\u20747s\u00b27p\u00b9",
    },
    "Rf": {
        "name": "𬬻", "protons": 104, "neutrons": 163,
        "color": (170, 175, 180), "radius": 46,
        "category": "transition", "atomic_weight": 267.0,
        "e_config": "[Rn]5f\u00b9\u20746d\u00b27s\u00b2",
    },
    "Db": {
        "name": "𬭊", "protons": 105, "neutrons": 163,
        "color": (170, 175, 180), "radius": 46,
        "category": "transition", "atomic_weight": 268.0,
        "e_config": "[Rn]5f\u00b9\u20746d\u00b37s\u00b2",
    },
    "Sg": {
        "name": "𬭳", "protons": 106, "neutrons": 165,
        "color": (170, 175, 180), "radius": 45,
        "category": "transition", "atomic_weight": 271.0,
        "e_config": "[Rn]5f\u00b9\u20746d\u20747s\u00b2",
    },
    "Bh": {
        "name": "𬭛", "protons": 107, "neutrons": 163,
        "color": (170, 170, 175), "radius": 45,
        "category": "transition", "atomic_weight": 270.0,
        "e_config": "[Rn]5f\u00b9\u20746d\u20757s\u00b2",
    },
    "Hs": {
        "name": "𬭶", "protons": 108, "neutrons": 169,
        "color": (170, 170, 180), "radius": 45,
        "category": "transition", "atomic_weight": 277.0,
        "e_config": "[Rn]5f\u00b9\u20746d\u20767s\u00b2",
    },
    "Mt": {
        "name": "鿏", "protons": 109, "neutrons": 169,
        "color": (165, 170, 175), "radius": 44,
        "category": "transition", "atomic_weight": 278.0,
        "e_config": "[Rn]5f\u00b9\u20746d\u20777s\u00b2",
    },
    "Ds": {
        "name": "𫟼", "protons": 110, "neutrons": 171,
        "color": (165, 170, 175), "radius": 44,
        "category": "transition", "atomic_weight": 281.0,
        "e_config": "[Rn]5f\u00b9\u20746d\u20787s\u00b2",
    },
    "Rg": {
        "name": "𬬭", "protons": 111, "neutrons": 171,
        "color": (200, 180, 80), "radius": 44,
        "category": "transition", "atomic_weight": 282.0,
        "e_config": "[Rn]5f\u00b9\u20746d\u20797s\u00b2",
    },
    "Cn": {
        "name": "鿔", "protons": 112, "neutrons": 173,
        "color": (200, 200, 215), "radius": 44,
        "category": "transition", "atomic_weight": 285.0,
        "e_config": "[Rn]5f\u00b9\u20746d\u00b9\u20707s\u00b2",
    },
    "Nh": {
        "name": "鉨", "protons": 113, "neutrons": 173,
        "color": (170, 175, 180), "radius": 43,
        "category": "post_transition", "atomic_weight": 286.0,
        "e_config": "[Rn]5f\u00b9\u20746d\u00b9\u20707s\u00b27p\u00b9",
    },
    "Fl": {
        "name": "𫓧", "protons": 114, "neutrons": 175,
        "color": (170, 175, 180), "radius": 43,
        "category": "post_transition", "atomic_weight": 289.0,
        "e_config": "[Rn]5f\u00b9\u20746d\u00b9\u20707s\u00b27p\u00b2",
    },
    "Mc": {
        "name": "镆", "protons": 115, "neutrons": 175,
        "color": (165, 170, 175), "radius": 43,
        "category": "post_transition", "atomic_weight": 290.0,
        "e_config": "[Rn]5f\u00b9\u20746d\u00b9\u20707s\u00b27p\u00b3",
    },
    "Lv": {
        "name": "鉝", "protons": 116, "neutrons": 177,
        "color": (165, 170, 175), "radius": 42,
        "category": "post_transition", "atomic_weight": 293.0,
        "e_config": "[Rn]5f\u00b9\u20746d\u00b9\u20707s\u00b27p\u2074",
    },
    "Ts": {
        "name": "鿬", "protons": 117, "neutrons": 177,
        "color": (160, 165, 170), "radius": 42,
        "category": "halogen", "atomic_weight": 294.0,
        "e_config": "[Rn]5f\u00b9\u20746d\u00b9\u20707s\u00b27p\u2075",
    },
    "Og": {
        "name": "鿫", "protons": 118, "neutrons": 176,
        "color": (180, 190, 200), "radius": 41,
        "category": "noble_gas", "atomic_weight": 294.0,
        "e_config": "[Rn]5f\u00b9\u20746d\u00b9\u20707s\u00b27p\u2076",
    },
}


# ---------------------------------------------------------------------------
# PROTON_TO_SYMBOL: reverse mapping Z -> element symbol (needed for fusion
# product lookups and nuclear-binding interpolation of transuranics).
# ---------------------------------------------------------------------------
PROTON_TO_SYMBOL = {data["protons"]: sym for sym, data in ELEMENTS.items()}


# ---------------------------------------------------------------------------
# NUCLEAR_BINDING_FULL: total nuclear binding energy (MeV) for the most common
# isotope of each element Z = 1 .. 118.
#
# Anchor values are taken from measured / evaluated nuclear data.
# For Z between anchors we linearly interpolate.
# For Z > 92 (transuranics) we use the semi-empirical approximation given:
#       binding_per_nucleon ≈ 7.5 - 0.007*(Z - 92)
#       total = binding_per_nucleon * (Z + N)
# ---------------------------------------------------------------------------

_BINDING_ANCHORS = {
    1:  0.0,
    2:  28.296,
    3:  39.245,
    4:  58.165,
    5:  76.205,
    6:  92.162,
    7:  104.659,
    8:  127.619,
    9:  147.801,
    10: 160.645,
    11: 186.564,
    12: 198.257,
    13: 224.951,
    14: 236.537,
    15: 262.917,
    16: 271.781,
    17: 298.210,
    18: 343.810,
    19: 333.724,
    20: 342.052,
    26: 492.254,
    28: 506.5,
    29: 551.4,
    30: 559.1,
    47: 915.3,
    50: 1020.4,
    79: 1559.4,
    82: 1636.4,
    92: 1801.7,
}


def _build_binding_dict():
    """Return {Z: total_binding_MeV, ...} for Z=1..118 via interpolation / approximation."""
    anchor_zs = sorted(_BINDING_ANCHORS.keys())
    result = {}
    for z in range(1, 119):
        if z in _BINDING_ANCHORS:
            result[z] = round(_BINDING_ANCHORS[z], 3)
        elif z < 92:
            # linear interpolation between surrounding anchors
            # find first anchor > z
            hi_idx = 0
            while hi_idx < len(anchor_zs) and anchor_zs[hi_idx] <= z:
                hi_idx += 1
            z_hi = anchor_zs[hi_idx]
            z_lo = anchor_zs[hi_idx - 1]
            frac = (z - z_lo) / (z_hi - z_lo)
            val = _BINDING_ANCHORS[z_lo] + frac * (_BINDING_ANCHORS[z_hi] - _BINDING_ANCHORS[z_lo])
            result[z] = round(val, 3)
        else:
            # transuranics (Z >= 93): semi-empirical approximation
            n = ELEMENTS[PROTON_TO_SYMBOL[z]]["neutrons"]
            a = z + n  # mass number
            binding_per_nucleon = 7.5 - 0.007 * (z - 92)
            result[z] = round(binding_per_nucleon * a, 3)
    return result


NUCLEAR_BINDING_FULL = _build_binding_dict()
