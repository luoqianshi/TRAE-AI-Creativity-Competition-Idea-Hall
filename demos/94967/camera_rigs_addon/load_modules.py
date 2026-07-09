import importlib

if "conf" in locals():
    importlib.reload(conf)
else:
    from . import conf

if "utils" in locals():
    importlib.reload(utils)
else:
    from . import utils

if "operators" in locals():
    importlib.reload(operators)
else:
    from . import operators

if "ui" in locals():
    importlib.reload(ui)
else:
    from . import ui

module_list = (
    conf,
    utils,
    operators,
    ui,
)


def register(bl_info):
    print("[Camera Rigs] Registering...")
    for mod in module_list:
        mod.register()
    print("[Camera Rigs] Registered successfully")


def unregister(bl_info):
    for mod in reversed(module_list):
        mod.unregister()
    print("[Camera Rigs] Unregistered")
