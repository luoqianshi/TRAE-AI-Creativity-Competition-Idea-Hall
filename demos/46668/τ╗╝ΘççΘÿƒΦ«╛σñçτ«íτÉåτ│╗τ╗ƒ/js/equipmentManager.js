// 三机设备管理 - 使用公共代码库

// 初始数据
const initialData = [
    { name: '设备1', category: '分类1', model: '型号1', repairCycle: 30, lastRepairDate: '2024-01-15', checkContent: '123', checkMethod: '456', standardRequirement: '789' },
    { name: '设备2', category: '分类2', model: '型号2', repairCycle: 60, lastRepairDate: '2024-02-20', checkContent: '', checkMethod: '', standardRequirement: '' },
    { name: '设备3', category: '分类3', model: '型号3', repairCycle: 90, lastRepairDate: '2024-03-10', checkContent: '', checkMethod: '', standardRequirement: '' }
];

const historyRecords = [];

// 加载保存的数据
let savedData, savedHistory;
try {
    savedData = JSON.parse(localStorage.getItem('sanjiDeviceData'));
    savedHistory = JSON.parse(localStorage.getItem('sanjiDeviceData_history'));
} catch (e) {
    console.error('加载数据失败:', e);
    savedData = null;
    savedHistory = null;
}
const data = savedData || initialData;
if (savedHistory) historyRecords.push(...savedHistory);

// 使用公共函数
async function handleDeleteDevice() {
    await handleDeleteDeviceCommon(data, 'sanjiDeviceData', historyRecords, 'sanjiDeviceData_history', loadTableData);
}

async function handleInspection(index) {
    await handleInspectionCommon(index, data, historyRecords, loadTableData);
}

function saveData() {
    saveDataCommon('sanjiDeviceData', 'sanjiDeviceData_history', 'deviceTableBody', historyRecords);
}

function searchDevice() {
    searchDeviceCommon(data, loadTableData);
}

function showHistory() {
    showHistoryCommon('sanjiDeviceData_history');
}

function exportToExcel() {
    exportToExcelCommon(data, '三机设备数据.xlsx');
}

function importFromExcel() {
    importFromExcelCommon(data, 'sanjiDeviceData', loadTableData);
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
    // 检查登录状态
    if (!checkLoginStatus()) return;
    
    // 加载表格数据
    loadTableData();
    
    // 设置退出按钮
    setupLogoutButton();
};