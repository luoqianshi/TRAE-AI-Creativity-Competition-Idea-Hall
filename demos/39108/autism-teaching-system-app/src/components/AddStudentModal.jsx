import { useState } from 'react';
import { X } from 'lucide-react';
import { addStudent } from '../data/store';

export default function AddStudentModal({ onClose, onAdd }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    gender: '男',
    birthDate: '',
    diagnosisType: '自闭症谱系障碍',
    diagnosisHospital: '',
    diagnosisDate: '',
    guardianName: '',
    guardianPhone: '',
    address: '',
    notes: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return 0;
    const birth = new Date(birthDate);
    const now = new Date();
    return now.getFullYear() - birth.getFullYear();
  };

  const handleSubmit = () => {
    const age = calculateAge(formData.birthDate);
    const newStudent = addStudent({
      ...formData,
      age,
      currentStage: '待评估',
      lastAssessmentDate: '-',
      enrolledAt: new Date().toISOString().split('T')[0]
    });
    onAdd(newStudent);
  };

  const isStep1Valid = formData.name && formData.birthDate;
  const isStep2Valid = formData.diagnosisType;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-lg font-bold">新增学生</h2>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-slate-100">
            <X size={20} />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex items-center px-6 pt-4 gap-2">
          <div className={`flex-1 h-2 rounded-full ${step >= 1 ? 'bg-primary-500' : 'bg-slate-200'}`} />
          <div className={`flex-1 h-2 rounded-full ${step >= 2 ? 'bg-primary-500' : 'bg-slate-200'}`} />
          <div className={`flex-1 h-2 rounded-full ${step >= 3 ? 'bg-primary-500' : 'bg-slate-200'}`} />
        </div>

        <div className="p-6 space-y-4">
          {step === 1 && (
            <>
              <h3 className="font-medium text-slate-700">基本信息</h3>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">姓名 *</label>
                <input name="name" value={formData.name} onChange={handleChange} className="input" placeholder="请输入学生姓名" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">性别</label>
                <select name="gender" value={formData.gender} onChange={handleChange} className="input">
                  <option value="男">男</option>
                  <option value="女">女</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">出生日期 *</label>
                <input name="birthDate" type="date" value={formData.birthDate} onChange={handleChange} className="input" />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h3 className="font-medium text-slate-700">诊断信息</h3>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">障碍类型 *</label>
                <select name="diagnosisType" value={formData.diagnosisType} onChange={handleChange} className="input">
                  <option value="自闭症谱系障碍">自闭症谱系障碍</option>
                  <option value="阿斯伯格综合征">阿斯伯格综合征</option>
                  <option value="广泛性发育障碍">广泛性发育障碍</option>
                  <option value="其他">其他</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">诊断医院</label>
                <input name="diagnosisHospital" value={formData.diagnosisHospital} onChange={handleChange} className="input" placeholder="请输入诊断医院" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">诊断日期</label>
                <input name="diagnosisDate" type="date" value={formData.diagnosisDate} onChange={handleChange} className="input" />
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h3 className="font-medium text-slate-700">家庭信息</h3>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">监护人姓名</label>
                <input name="guardianName" value={formData.guardianName} onChange={handleChange} className="input" placeholder="请输入监护人姓名" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">监护人电话</label>
                <input name="guardianPhone" value={formData.guardianPhone} onChange={handleChange} className="input" placeholder="请输入监护人电话" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">家庭住址</label>
                <input name="address" value={formData.address} onChange={handleChange} className="input" placeholder="请输入家庭住址" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">备注</label>
                <textarea name="notes" value={formData.notes} onChange={handleChange} className="input h-20 resize-none" placeholder="其他需要说明的情况..." />
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-between p-6 border-t border-slate-200">
          {step > 1 ? (
            <button className="btn-secondary" onClick={() => setStep(step - 1)}>上一步</button>
          ) : (
            <button className="btn-secondary" onClick={onClose}>取消</button>
          )}
          
          {step < 3 ? (
            <button 
              className="btn-primary" 
              onClick={() => setStep(step + 1)}
              disabled={step === 1 ? !isStep1Valid : !isStep2Valid}
            >
              下一步
            </button>
          ) : (
            <button className="btn-primary" onClick={handleSubmit}>完成</button>
          )}
        </div>
      </div>
    </div>
  );
}
