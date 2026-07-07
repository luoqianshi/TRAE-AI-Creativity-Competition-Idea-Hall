import sys
import json
import os
import uuid
import webbrowser
from datetime import datetime

from PyQt5.QtWidgets import (
    QApplication, QMainWindow, QWidget, QVBoxLayout, QHBoxLayout, QGridLayout,
    QTableWidget, QTableWidgetItem, QPushButton, QDialog, QLabel,
    QLineEdit, QComboBox, QTextEdit, QMessageBox, QFrame, QHeaderView,
    QDateEdit, QDesktopWidget, QSpacerItem, QSizePolicy
)
from PyQt5.QtCore import Qt, QDate
from PyQt5.QtGui import QColor, QPalette, QFont, QBrush, QPainter, QIcon

APP_DIR = os.path.join(os.path.expanduser("~"), "招聘记录")
DATA_FILE = os.path.join(APP_DIR, "records.json")

ENTERPRISE_TYPES = ["国企", "央企", "外企", "民企"]
APPLICATION_STATUS = ["待处理", "笔试中", "一面中", "二面中", "三面中", "已录用", "已拒绝"]

STATUS_COLORS = {
    "待处理": "#9CA3AF",
    "笔试中": "#3B82F6",
    "一面中": "#F59E0B",
    "二面中": "#F97316",
    "三面中": "#EF4444",
    "已录用": "#10B981",
    "已拒绝": "#6B7280"
}

PRIMARY_COLOR = "#2D7FF9"
BG_COLOR = "#F5F6FA"
CARD_COLOR = "#FFFFFF"
TEXT_COLOR = "#1F2937"
TEXT_LIGHT = "#6B7280"
BORDER_RADIUS = "8px"

def init_data_dir():
    if not os.path.exists(APP_DIR):
        os.makedirs(APP_DIR)
    if not os.path.exists(DATA_FILE):
        with open(DATA_FILE, "w", encoding="utf-8") as f:
            json.dump([], f)

def load_records():
    try:
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return []

def save_records(records):
    try:
        with open(DATA_FILE, "w", encoding="utf-8") as f:
            json.dump(records, f, ensure_ascii=False, indent=2)
        return True
    except Exception as e:
        QMessageBox.critical(None, "保存失败", f"保存数据时出错: {str(e)}")
        return False

def create_record(data):
    record = {
        "id": str(uuid.uuid4()),
        "company_name": data.get("company_name", ""),
        "enterprise_type": data.get("enterprise_type", ""),
        "submit_date": data.get("submit_date", ""),
        "website_url": data.get("website_url", ""),
        "position": data.get("position", ""),
        "location": data.get("location", ""),
        "status": data.get("status", "待处理"),
        "notes": data.get("notes", "")
    }
    records = load_records()
    records.insert(0, record)
    if save_records(records):
        return record
    return None

def update_record(record_id, data):
    records = load_records()
    for i, record in enumerate(records):
        if record["id"] == record_id:
            records[i].update(data)
            if save_records(records):
                return records[i]
    return None

def delete_record(record_id):
    records = load_records()
    records = [r for r in records if r["id"] != record_id]
    return save_records(records)

def apply_shadow(widget, offset=0, blur=20, opacity=40):
    from PyQt5.QtWidgets import QGraphicsDropShadowEffect
    shadow = QGraphicsDropShadowEffect()
    shadow.setOffset(offset, offset)
    shadow.setBlurRadius(blur)
    shadow.setColor(QColor(0, 0, 0, opacity))
    widget.setGraphicsEffect(shadow)

class StatusLabel(QLabel):
    def __init__(self, status):
        super().__init__(status)
        self.set_status(status)
    
    def set_status(self, status):
        self.setText(status)
        color = STATUS_COLORS.get(status, "#9CA3AF")
        self.setStyleSheet(f"""
            QLabel {{
                background-color: {color}20;
                color: {color};
                padding: 4px 12px;
                border-radius: 12px;
                font-size: 12px;
                font-weight: 500;
            }}
        """)
        self.setAlignment(Qt.AlignCenter)

class EditDialog(QDialog):
    def __init__(self, parent=None, record=None):
        super().__init__(parent)
        self.record = record
        self.setWindowTitle("编辑记录" if record else "新建记录")
        self.resize(480, 600)
        self.center()
        self.setWindowFlags(self.windowFlags() & ~Qt.WindowContextHelpButtonHint)
        self.setStyleSheet(f"""
            QDialog {{
                background-color: {CARD_COLOR};
                border-radius: {BORDER_RADIUS};
            }}
        """)
        apply_shadow(self, blur=30)

        self.init_ui()
        if record:
            self.load_data(record)

    def center(self):
        qr = self.frameGeometry()
        cp = QDesktopWidget().availableGeometry().center()
        qr.moveCenter(cp)
        self.move(qr.topLeft())

    def init_ui(self):
        layout = QVBoxLayout()
        layout.setSpacing(16)
        layout.setContentsMargins(24, 24, 24, 24)

        title_label = QLabel("编辑记录" if self.record else "新建记录")
        title_label.setStyleSheet(f"""
            QLabel {{
                font-size: 20px;
                font-weight: 600;
                color: {TEXT_COLOR};
            }}
        """)
        layout.addWidget(title_label)

        form_layout = QVBoxLayout()
        form_layout.setSpacing(12)

        form_layout.addWidget(QLabel("公司名称"))
        self.company_name_edit = QLineEdit()
        self.company_name_edit.setStyleSheet(f"""
            QLineEdit {{
                background-color: {BG_COLOR};
                border: none;
                border-radius: {BORDER_RADIUS};
                padding: 12px;
                font-size: 14px;
                color: {TEXT_COLOR};
            }}
            QLineEdit:focus {{
                background-color: {CARD_COLOR};
                border: 2px solid {PRIMARY_COLOR};
            }}
        """)
        form_layout.addWidget(self.company_name_edit)

        form_layout.addWidget(QLabel("企业性质"))
        self.enterprise_type_combo = QComboBox()
        self.enterprise_type_combo.addItems(ENTERPRISE_TYPES)
        self.enterprise_type_combo.setStyleSheet(f"""
            QComboBox {{
                background-color: {BG_COLOR};
                border: none;
                border-radius: {BORDER_RADIUS};
                padding: 12px;
                font-size: 14px;
                color: {TEXT_COLOR};
                min-height: 40px;
            }}
            QComboBox::drop-down {{
                border: none;
                width: 30px;
            }}
            QComboBox QAbstractItemView {{
                background-color: {CARD_COLOR};
                border-radius: {BORDER_RADIUS};
                padding: 8px;
                outline: none;
            }}
        """)
        form_layout.addWidget(self.enterprise_type_combo)

        form_layout.addWidget(QLabel("投递日期"))
        self.submit_date_edit = QDateEdit()
        self.submit_date_edit.setDate(QDate.currentDate())
        self.submit_date_edit.setDisplayFormat("yyyy-MM-dd")
        self.submit_date_edit.setStyleSheet(f"""
            QDateEdit {{
                background-color: {BG_COLOR};
                border: none;
                border-radius: {BORDER_RADIUS};
                padding: 12px;
                font-size: 14px;
                color: {TEXT_COLOR};
                min-height: 40px;
            }}
            QDateEdit::drop-down {{
                border: none;
                width: 30px;
            }}
        """)
        form_layout.addWidget(self.submit_date_edit)

        form_layout.addWidget(QLabel("投递官网"))
        url_layout = QHBoxLayout()
        url_layout.setSpacing(8)
        self.website_url_edit = QLineEdit()
        self.website_url_edit.setStyleSheet(f"""
            QLineEdit {{
                background-color: {BG_COLOR};
                border: none;
                border-radius: {BORDER_RADIUS};
                padding: 12px;
                font-size: 14px;
                color: {TEXT_COLOR};
            }}
            QLineEdit:focus {{
                background-color: {CARD_COLOR};
                border: 2px solid {PRIMARY_COLOR};
            }}
        """)
        url_layout.addWidget(self.website_url_edit)
        self.open_url_btn = QPushButton("打开")
        self.open_url_btn.setStyleSheet(f"""
            QPushButton {{
                background-color: {PRIMARY_COLOR};
                color: white;
                border: none;
                border-radius: {BORDER_RADIUS};
                padding: 8px 16px;
                font-size: 13px;
                font-weight: 500;
            }}
            QPushButton:hover {{
                background-color: {PRIMARY_COLOR}DD;
            }}
            QPushButton:pressed {{
                background-color: {PRIMARY_COLOR}AA;
            }}
        """)
        self.open_url_btn.clicked.connect(self.open_url)
        url_layout.addWidget(self.open_url_btn)
        form_layout.addLayout(url_layout)

        form_layout.addWidget(QLabel("投递岗位"))
        self.position_edit = QLineEdit()
        self.position_edit.setStyleSheet(f"""
            QLineEdit {{
                background-color: {BG_COLOR};
                border: none;
                border-radius: {BORDER_RADIUS};
                padding: 12px;
                font-size: 14px;
                color: {TEXT_COLOR};
            }}
            QLineEdit:focus {{
                background-color: {CARD_COLOR};
                border: 2px solid {PRIMARY_COLOR};
            }}
        """)
        form_layout.addWidget(self.position_edit)

        form_layout.addWidget(QLabel("工作地点"))
        self.location_edit = QLineEdit()
        self.location_edit.setStyleSheet(f"""
            QLineEdit {{
                background-color: {BG_COLOR};
                border: none;
                border-radius: {BORDER_RADIUS};
                padding: 12px;
                font-size: 14px;
                color: {TEXT_COLOR};
            }}
            QLineEdit:focus {{
                background-color: {CARD_COLOR};
                border: 2px solid {PRIMARY_COLOR};
            }}
        """)
        form_layout.addWidget(self.location_edit)

        form_layout.addWidget(QLabel("投递状态"))
        self.status_combo = QComboBox()
        self.status_combo.addItems(APPLICATION_STATUS)
        self.status_combo.setStyleSheet(f"""
            QComboBox {{
                background-color: {BG_COLOR};
                border: none;
                border-radius: {BORDER_RADIUS};
                padding: 12px;
                font-size: 14px;
                color: {TEXT_COLOR};
                min-height: 40px;
            }}
            QComboBox::drop-down {{
                border: none;
                width: 30px;
            }}
            QComboBox QAbstractItemView {{
                background-color: {CARD_COLOR};
                border-radius: {BORDER_RADIUS};
                padding: 8px;
                outline: none;
            }}
        """)
        form_layout.addWidget(self.status_combo)

        form_layout.addWidget(QLabel("备注"))
        self.notes_edit = QTextEdit()
        self.notes_edit.setMaximumHeight(100)
        self.notes_edit.setStyleSheet(f"""
            QTextEdit {{
                background-color: {BG_COLOR};
                border: none;
                border-radius: {BORDER_RADIUS};
                padding: 12px;
                font-size: 14px;
                color: {TEXT_COLOR};
            }}
            QTextEdit:focus {{
                background-color: {CARD_COLOR};
                border: 2px solid {PRIMARY_COLOR};
            }}
        """)
        form_layout.addWidget(self.notes_edit)

        form_layout.setContentsMargins(0, 0, 0, 0)
        layout.addLayout(form_layout)

        btn_layout = QHBoxLayout()
        btn_layout.setSpacing(12)
        
        self.save_btn = QPushButton("保存")
        self.save_btn.setStyleSheet(f"""
            QPushButton {{
                background-color: {PRIMARY_COLOR};
                color: white;
                border: none;
                border-radius: {BORDER_RADIUS};
                padding: 12px 24px;
                font-size: 14px;
                font-weight: 600;
            }}
            QPushButton:hover {{
                background-color: {PRIMARY_COLOR}DD;
            }}
            QPushButton:pressed {{
                background-color: {PRIMARY_COLOR}AA;
            }}
        """)
        self.save_btn.clicked.connect(self.save)
        btn_layout.addWidget(self.save_btn)

        self.cancel_btn = QPushButton("取消")
        self.cancel_btn.setStyleSheet(f"""
            QPushButton {{
                background-color: {BG_COLOR};
                color: {TEXT_LIGHT};
                border: none;
                border-radius: {BORDER_RADIUS};
                padding: 12px 24px;
                font-size: 14px;
                font-weight: 500;
            }}
            QPushButton:hover {{
                background-color: #E5E7EB;
            }}
        """)
        self.cancel_btn.clicked.connect(self.reject)
        btn_layout.addWidget(self.cancel_btn)

        layout.addLayout(btn_layout)
        self.setLayout(layout)

    def load_data(self, record):
        self.company_name_edit.setText(record.get("company_name", ""))
        idx = self.enterprise_type_combo.findText(record.get("enterprise_type", ""))
        if idx >= 0:
            self.enterprise_type_combo.setCurrentIndex(idx)
        
        date_str = record.get("submit_date", "")
        if date_str:
            date = QDate.fromString(date_str, "yyyy-MM-dd")
            if date.isValid():
                self.submit_date_edit.setDate(date)
        
        self.website_url_edit.setText(record.get("website_url", ""))
        self.position_edit.setText(record.get("position", ""))
        self.location_edit.setText(record.get("location", ""))
        
        idx = self.status_combo.findText(record.get("status", "待处理"))
        if idx >= 0:
            self.status_combo.setCurrentIndex(idx)
        
        self.notes_edit.setText(record.get("notes", ""))

    def open_url(self):
        url = self.website_url_edit.text().strip()
        if url:
            if not url.startswith("http"):
                url = "https://" + url
            webbrowser.open(url)

    def save(self):
        data = {
            "company_name": self.company_name_edit.text().strip(),
            "enterprise_type": self.enterprise_type_combo.currentText().strip(),
            "submit_date": self.submit_date_edit.date().toString("yyyy-MM-dd"),
            "website_url": self.website_url_edit.text().strip(),
            "position": self.position_edit.text().strip(),
            "location": self.location_edit.text().strip(),
            "status": self.status_combo.currentText().strip(),
            "notes": self.notes_edit.toPlainText().strip()
        }

        if not data["company_name"]:
            QMessageBox.warning(self, "提示", "请输入公司名称")
            return

        if self.record:
            result = update_record(self.record["id"], data)
        else:
            result = create_record(data)

        if result:
            self.accept()

class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("招聘信息记录")
        self.resize(1000, 700)
        self.center()

        init_data_dir()
        self.init_ui()
        self.refresh_list()

    def center(self):
        qr = self.frameGeometry()
        cp = QDesktopWidget().availableGeometry().center()
        qr.moveCenter(cp)
        self.move(qr.topLeft())

    def init_ui(self):
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        self.setStyleSheet(f"QMainWindow {{ background-color: {BG_COLOR}; }}")

        main_layout = QHBoxLayout(central_widget)
        main_layout.setSpacing(16)
        main_layout.setContentsMargins(16, 16, 16, 16)

        left_panel = QFrame()
        left_panel.setFixedWidth(380)
        left_panel.setStyleSheet(f"""
            QFrame {{
                background-color: {CARD_COLOR};
                border-radius: {BORDER_RADIUS};
            }}
        """)
        apply_shadow(left_panel)
        left_layout = QVBoxLayout(left_panel)
        left_layout.setSpacing(12)
        left_layout.setContentsMargins(16, 16, 16, 16)

        header_layout = QHBoxLayout()
        title_label = QLabel("📋 招聘投递记录")
        title_label.setStyleSheet(f"""
            QLabel {{
                font-size: 18px;
                font-weight: 600;
                color: {TEXT_COLOR};
            }}
        """)
        header_layout.addWidget(title_label)
        header_layout.addStretch()
        left_layout.addLayout(header_layout)

        toolbar_layout = QHBoxLayout()
        toolbar_layout.setSpacing(8)

        self.new_btn = QPushButton("+ 新建")
        self.new_btn.setStyleSheet(f"""
            QPushButton {{
                background-color: {PRIMARY_COLOR};
                color: white;
                border: none;
                border-radius: {BORDER_RADIUS};
                padding: 10px 16px;
                font-size: 13px;
                font-weight: 500;
            }}
            QPushButton:hover {{
                background-color: {PRIMARY_COLOR}DD;
            }}
            QPushButton:pressed {{
                background-color: {PRIMARY_COLOR}AA;
            }}
        """)
        self.new_btn.clicked.connect(self.new_record)
        toolbar_layout.addWidget(self.new_btn)

        self.edit_btn = QPushButton("✏️ 编辑")
        self.edit_btn.setStyleSheet(f"""
            QPushButton {{
                background-color: {BG_COLOR};
                color: {TEXT_COLOR};
                border: none;
                border-radius: {BORDER_RADIUS};
                padding: 10px 16px;
                font-size: 13px;
                font-weight: 500;
            }}
            QPushButton:hover {{
                background-color: #E5E7EB;
            }}
        """)
        self.edit_btn.clicked.connect(self.edit_record)
        toolbar_layout.addWidget(self.edit_btn)

        self.delete_btn = QPushButton("🗑️ 删除")
        self.delete_btn.setStyleSheet(f"""
            QPushButton {{
                background-color: #FEF2F2;
                color: #DC2626;
                border: none;
                border-radius: {BORDER_RADIUS};
                padding: 10px 16px;
                font-size: 13px;
                font-weight: 500;
            }}
            QPushButton:hover {{
                background-color: #FEE2E2;
            }}
        """)
        self.delete_btn.clicked.connect(self.delete_record)
        toolbar_layout.addWidget(self.delete_btn)

        toolbar_layout.addStretch()
        left_layout.addLayout(toolbar_layout)

        self.table = QTableWidget()
        self.table.setColumnCount(4)
        self.table.setHorizontalHeaderLabels(["公司名称", "岗位", "状态", "日期"])
        self.table.horizontalHeader().setSectionResizeMode(QHeaderView.Stretch)
        self.table.setSelectionBehavior(QTableWidget.SelectRows)
        self.table.setEditTriggers(QTableWidget.NoEditTriggers)
        self.table.setShowGrid(False)
        self.table.setAlternatingRowColors(True)
        self.table.setStyleSheet(f"""
            QTableWidget {{
                background-color: {CARD_COLOR};
                border: none;
                border-radius: {BORDER_RADIUS};
                font-size: 13px;
            }}
            QTableWidget::item {{
                padding: 10px;
                border-bottom: 1px solid {BG_COLOR};
            }}
            QTableWidget::item:selected {{
                background-color: {PRIMARY_COLOR}15;
                color: {PRIMARY_COLOR};
            }}
            QTableWidget::item:hover {{
                background-color: {BG_COLOR};
            }}
            QHeaderView::section {{
                background-color: {BG_COLOR};
                border: none;
                padding: 10px;
                font-size: 12px;
                font-weight: 600;
                color: {TEXT_LIGHT};
            }}
        """)
        self.table.cellDoubleClicked.connect(self.edit_record)
        self.table.itemSelectionChanged.connect(self.on_select)
        left_layout.addWidget(self.table)

        main_layout.addWidget(left_panel)

        right_panel = QFrame()
        right_panel.setStyleSheet(f"""
            QFrame {{
                background-color: {CARD_COLOR};
                border-radius: {BORDER_RADIUS};
            }}
        """)
        apply_shadow(right_panel)
        right_layout = QVBoxLayout(right_panel)
        right_layout.setSpacing(16)
        right_layout.setContentsMargins(24, 24, 24, 24)

        right_title = QLabel("📊 详细信息")
        right_title.setStyleSheet(f"""
            QLabel {{
                font-size: 18px;
                font-weight: 600;
                color: {TEXT_COLOR};
            }}
        """)
        right_layout.addWidget(right_title)

        self.detail_container = QFrame()
        self.detail_container.setStyleSheet(f"""
            QFrame {{
                background-color: {BG_COLOR};
                border-radius: {BORDER_RADIUS};
            }}
        """)
        detail_layout = QVBoxLayout(self.detail_container)
        detail_layout.setSpacing(16)
        detail_layout.setContentsMargins(20, 20, 20, 20)

        self.no_selection_label = QLabel("请选择一条记录查看详情")
        self.no_selection_label.setStyleSheet(f"""
            QLabel {{
                font-size: 14px;
                color: {TEXT_LIGHT};
                text-align: center;
            }}
        """)
        self.no_selection_label.setAlignment(Qt.AlignCenter)
        self.no_selection_label.setWordWrap(True)
        
        self.company_label = QLabel()
        self.company_label.setStyleSheet(f"""
            QLabel {{
                font-size: 24px;
                font-weight: 600;
                color: {TEXT_COLOR};
            }}
        """)
        
        self.status_label = StatusLabel("待处理")
        
        info_grid = QGridLayout()
        info_grid.setSpacing(12)
        
        self.enterprise_label = QLabel()
        self.enterprise_label.setStyleSheet(f"""
            QLabel {{
                font-size: 13px;
                color: {TEXT_LIGHT};
            }}
        """)
        
        self.position_label = QLabel()
        self.position_label.setStyleSheet(f"""
            QLabel {{
                font-size: 14px;
                color: {TEXT_COLOR};
                font-weight: 500;
            }}
        """)
        
        self.location_label = QLabel()
        self.location_label.setStyleSheet(f"""
            QLabel {{
                font-size: 14px;
                color: {TEXT_COLOR};
                font-weight: 500;
            }}
        """)
        
        self.date_label = QLabel()
        self.date_label.setStyleSheet(f"""
            QLabel {{
                font-size: 14px;
                color: {TEXT_COLOR};
                font-weight: 500;
            }}
        """)
        
        url_layout = QHBoxLayout()
        self.url_label = QLabel()
        self.url_label.setStyleSheet(f"""
            QLabel {{
                font-size: 14px;
                color: {PRIMARY_COLOR};
                text-decoration: underline;
            }}
        """)
        self.url_label.setOpenExternalLinks(True)
        self.url_label.setWordWrap(True)
        
        self.open_url_btn = QPushButton("🔗 打开链接")
        self.open_url_btn.setStyleSheet(f"""
            QPushButton {{
                background-color: {PRIMARY_COLOR};
                color: white;
                border: none;
                border-radius: {BORDER_RADIUS};
                padding: 6px 12px;
                font-size: 12px;
            }}
            QPushButton:hover {{
                background-color: {PRIMARY_COLOR}DD;
            }}
        """)
        self.open_url_btn.clicked.connect(self.open_selected_url)
        url_layout.addWidget(self.url_label)
        url_layout.addWidget(self.open_url_btn)
        url_layout.addStretch()
        
        self.notes_label = QLabel()
        self.notes_label.setStyleSheet(f"""
            QLabel {{
                font-size: 13px;
                color: {TEXT_COLOR};
                background-color: {CARD_COLOR};
                border-radius: {BORDER_RADIUS};
                padding: 12px;
            }}
        """)
        self.notes_label.setWordWrap(True)

        info_grid.addWidget(QLabel("企业性质"), 0, 0)
        info_grid.addWidget(self.enterprise_label, 0, 1)
        info_grid.addWidget(QLabel("投递岗位"), 1, 0)
        info_grid.addWidget(self.position_label, 1, 1)
        info_grid.addWidget(QLabel("工作地点"), 2, 0)
        info_grid.addWidget(self.location_label, 2, 1)
        info_grid.addWidget(QLabel("投递日期"), 3, 0)
        info_grid.addWidget(self.date_label, 3, 1)
        info_grid.addWidget(QLabel("投递官网"), 4, 0)
        info_grid.addLayout(url_layout, 4, 1)

        info_grid.setColumnStretch(1, 1)
        
        detail_layout.addWidget(self.no_selection_label)
        detail_layout.addWidget(self.company_label)
        detail_layout.addWidget(self.status_label)
        detail_layout.addLayout(info_grid)
        detail_layout.addWidget(QLabel("备注"))
        detail_layout.addWidget(self.notes_label)
        
        for widget in [self.company_label, self.status_label, 
                      self.enterprise_label, self.position_label, 
                      self.location_label, self.date_label, 
                      self.url_label, self.open_url_btn, self.notes_label]:
            widget.hide()

        right_layout.addWidget(self.detail_container)
        right_layout.addStretch()

        main_layout.addWidget(right_panel, 1)

        self.current_selected_url = ""

    def refresh_list(self):
        self.table.setRowCount(0)
        records = load_records()
        for row, record in enumerate(records):
            self.table.insertRow(row)
            item0 = QTableWidgetItem(record["company_name"])
            item0.setData(Qt.UserRole, record["id"])
            item0.setToolTip(record["company_name"])
            self.table.setItem(row, 0, item0)
            
            item1 = QTableWidgetItem(record["position"])
            item1.setToolTip(record["position"])
            self.table.setItem(row, 1, item1)
            
            status = record["status"]
            item2 = QTableWidgetItem(status)
            item2.setToolTip(status)
            color = STATUS_COLORS.get(status, "#9CA3AF")
            item2.setForeground(QBrush(QColor(color)))
            self.table.setItem(row, 2, item2)
            
            item3 = QTableWidgetItem(record["submit_date"])
            item3.setToolTip(record["submit_date"])
            self.table.setItem(row, 3, item3)

    def new_record(self):
        dialog = EditDialog(self)
        if dialog.exec_() == QDialog.Accepted:
            self.refresh_list()

    def edit_record(self):
        current_row = self.table.currentRow()
        if current_row < 0:
            QMessageBox.warning(self, "提示", "请先选择一条记录")
            return

        item = self.table.item(current_row, 0)
        if not item:
            return
        record_id = item.data(Qt.UserRole)
        records = load_records()
        record = next((r for r in records if r["id"] == record_id), None)
        if record:
            dialog = EditDialog(self, record)
            if dialog.exec_() == QDialog.Accepted:
                self.refresh_list()
                self.on_select()

    def delete_record(self):
        current_row = self.table.currentRow()
        if current_row < 0:
            QMessageBox.warning(self, "提示", "请先选择一条记录")
            return

        reply = QMessageBox.question(self, "确认删除", "确定要删除这条记录吗？",
                                     QMessageBox.Yes | QMessageBox.No, QMessageBox.No)
        if reply == QMessageBox.Yes:
            item = self.table.item(current_row, 0)
            if not item:
                return
            record_id = item.data(Qt.UserRole)
            if delete_record(record_id):
                self.refresh_list()
                self.clear_detail()

    def on_select(self):
        current_row = self.table.currentRow()
        if current_row < 0:
            self.clear_detail()
            return

        item = self.table.item(current_row, 0)
        if not item:
            self.clear_detail()
            return
        record_id = item.data(Qt.UserRole)
        records = load_records()
        record = next((r for r in records if r["id"] == record_id), None)

        if record:
            self.no_selection_label.hide()
            
            self.company_label.show()
            self.company_label.setText(record["company_name"])
            
            self.status_label.show()
            self.status_label.set_status(record["status"])
            
            self.enterprise_label.show()
            self.enterprise_label.setText(record["enterprise_type"])
            
            self.position_label.show()
            self.position_label.setText(record["position"])
            
            self.location_label.show()
            self.location_label.setText(record["location"])
            
            self.date_label.show()
            self.date_label.setText(record["submit_date"])
            
            url = record.get("website_url", "")
            if url:
                self.url_label.show()
                self.open_url_btn.show()
                if not url.startswith("http"):
                    url = "https://" + url
                self.url_label.setText(f'<a href="{url}">{record["website_url"]}</a>')
                self.current_selected_url = url
            else:
                self.url_label.hide()
                self.open_url_btn.hide()
                self.current_selected_url = ""
            
            notes = record.get("notes", "")
            if notes:
                self.notes_label.show()
                self.notes_label.setText(notes)
            else:
                self.notes_label.hide()
        else:
            self.clear_detail()

    def clear_detail(self):
        self.no_selection_label.show()
        for widget in [self.company_label, self.status_label, 
                      self.enterprise_label, self.position_label, 
                      self.location_label, self.date_label, 
                      self.url_label, self.open_url_btn, self.notes_label]:
            widget.hide()
        self.current_selected_url = ""

    def open_selected_url(self):
        if self.current_selected_url:
            webbrowser.open(self.current_selected_url)

if __name__ == "__main__":
    app = QApplication(sys.argv)
    app.setStyle("Fusion")
    
    palette = QPalette()
    palette.setColor(QPalette.Window, QColor(BG_COLOR))
    palette.setColor(QPalette.WindowText, QColor(TEXT_COLOR))
    palette.setColor(QPalette.Base, QColor(CARD_COLOR))
    palette.setColor(QPalette.AlternateBase, QColor(BG_COLOR))
    palette.setColor(QPalette.Text, QColor(TEXT_COLOR))
    palette.setColor(QPalette.Button, QColor(CARD_COLOR))
    palette.setColor(QPalette.ButtonText, QColor(TEXT_COLOR))
    palette.setColor(QPalette.Highlight, QColor(PRIMARY_COLOR))
    palette.setColor(QPalette.HighlightedText, Qt.white)
    app.setPalette(palette)
    
    window = MainWindow()
    window.show()
    sys.exit(app.exec_())