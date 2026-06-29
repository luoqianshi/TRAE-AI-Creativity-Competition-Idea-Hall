// 泵站设备管理 - 使用公共代码库

// 初始数据
const initialData = [
    { name: '乳化液泵站1', category: '乳化液泵站', model: 'BRW400/31.5', repairCycle: 30, lastRepairDate: '2024-01-15', checkContent: '', checkMethod: '', standardRequirement: '' },
    { name: '乳化液泵站2', category: '乳化液泵站', model: 'BRW500/31.5', repairCycle: 45, lastRepairDate: '2024-02-20', checkContent: '', checkMethod: '', standardRequirement: '' }
];

const historyRecords = [];

// 加载保存的数据
let savedData, savedHistory;
try {
    savedData = JSON.parse(localStorage.getItem('bengzhanDeviceData'));
    savedHistory = JSON.parse(localStorage.getItem('bengzhanDeviceData_history'));
} catch (e) {
    console.error('加载数据失败:', e);
    savedData = null;
    savedHistory = null;
}
const data = savedData || initialData;
if (savedHistory) historyRecords.push(...savedHistory);

// 使用公共函数
async function handleDeleteDevice() {
    await handleDeleteDeviceCommon(data, 'bengzhanDeviceData', historyRecords, 'bengzhanDeviceData_history', loadTableData);
}

async function handleInspection(index) {
    await handleInspectionCommon(index, data, historyRecords, loadTableData);
}

function saveData() {
    saveDataCommon('bengzhanDeviceData', 'bengzhanDeviceData_history', 'deviceTableBody', historyRecords);
}

function searchDevice() {
    searchDeviceCommon(data, loadTableData);
}

function showHistory() {
    showHistoryCommon('bengzhanDeviceData_history');
}

function exportToExcel() {
    exportToExcelCommon(data, '泵站设备数据.xlsx');
}

function importFromExcel() {
    importFromExcelCommon(data, 'bengzhanDeviceData', loadTableData);
}

function addDevice() {
    const userRole = sessionStorage.getItem('userRole');
    if (userRole !== 'admin') {
        showAlert('只有管理员可以添加设备！', '权限不足');
        return;
    }
    
    const newDevice = {
        name: '新设备',
        category: '新分类',
        model: '新型号',
        repairCycle: 30,
        lastRepairDate: new Date().toLocaleDateString('en-CA')
    };
    data.push(newDevice);
    
    historyRecords.push({
        type: '添加设备',
        deviceName: newDevice.name,
        timestamp: new Date().toLocaleString(),
        details: JSON.stringify(newDevice)
    });
    
    loadTableData();
    showSuccessToast('新设备已添加');
}

// 加载表格数据
function loadTableData() {
    const userRole = sessionStorage.getItem('userRole');
    const isAdmin = userRole === 'admin';
    loadTableDataCommon(data, 'deviceTableBody', handleInspection, handleDeleteDevice, isAdmin);
}

// 页面加载完成后执行
window.onload = function() {
    if (!checkLoginStatus()) return;
    loadTableData();
    setupLogoutButton();
};