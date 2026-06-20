import React, { useState } from 'react';
import { Download, Building2, Home, Factory, Building, Zap, Droplet, Flame, X } from 'lucide-react';
import { DailyFieldConfig, MonthlyCircuitConfig } from '../../shared/types';
import { INDUSTRY_TEMPLATES, IndustryTemplate } from '../../shared/constants/industryTemplates';

interface TemplateSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDailyFields: (fields: DailyFieldConfig[]) => void;
  onSelectMonthlyCircuits: (circuits: MonthlyCircuitConfig[]) => void;
  mode: 'daily' | 'monthly' | 'both';
}

const templateIcons: Record<string, React.ReactNode> = {
  hotel: <Building2 className="w-5 h-5" />,
  hospital: <Building className="w-5 h-5" />,
  office: <Building className="w-5 h-5" />,
  factory: <Factory className="w-5 h-5" />,
  basic: <Home className="w-5 h-5" />,
};

const categoryIcons: Record<string, React.ReactNode> = {
  '电': <Zap className="w-4 h-4 text-yellow-500" />,
  '水': <Droplet className="w-4 h-4 text-blue-500" />,
  '气': <Flame className="w-4 h-4 text-orange-500" />,
  default: <Zap className="w-4 h-4 text-zinc-400" />,
};

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  isOpen,
  onClose,
  onSelectDailyFields,
  onSelectMonthlyCircuits,
  mode,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<IndustryTemplate | null>(null);

  if (!isOpen) return null;

  const handleImport = () => {
    if (!selectedTemplate) return;

    if (mode === 'daily' || mode === 'both') {
      onSelectDailyFields(selectedTemplate.dailyFields);
    }
    if (mode === 'monthly' || mode === 'both') {
      onSelectMonthlyCircuits(selectedTemplate.monthlyCircuits);
    }
    onClose();
    setSelectedTemplate(null);
  };

  const currentTemplate = selectedTemplate;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 bg-zinc-50">
          <div className="flex items-center gap-3">
            <Download className="w-5 h-5 text-cyan-600" />
            <h2 className="text-lg font-bold text-zinc-900">导入行业模板</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <p className="text-sm text-zinc-600 mb-4">
            选择一个行业模板，系统将自动填充{mode === 'daily' ? '日常回路字段' : mode === 'monthly' ? '月度回路分类' : '日常回路字段和月度回路分类'}。
            导入后您仍可手动调整。
          </p>

          {/* Template Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {INDUSTRY_TEMPLATES.map((template) => (
              <button
                key={template.id}
                onClick={() => setSelectedTemplate(template)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  selectedTemplate?.id === template.id
                    ? 'border-cyan-500 bg-cyan-50 shadow-md'
                    : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-cyan-600">
                    {templateIcons[template.id] || <Building className="w-5 h-5" />}
                  </span>
                  <span className="font-bold text-zinc-900">{template.name}</span>
                </div>
                <p className="text-xs text-zinc-500">{template.description}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {template.dailyFields.slice(0, 3).map((f) => (
                    <span
                      key={f.id}
                      className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-zinc-100 text-zinc-600 text-[10px] rounded"
                    >
                      {categoryIcons[f.category] || categoryIcons.default}
                      {f.name}
                    </span>
                  ))}
                  {template.dailyFields.length > 3 && (
                    <span className="text-[10px] text-zinc-400">
                      +{template.dailyFields.length - 3}...
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Preview */}
          {currentTemplate && (
            <div className="mt-6 p-4 bg-zinc-50 rounded-xl border border-zinc-200">
              <h3 className="text-sm font-bold text-zinc-700 mb-3">
                模板预览：{currentTemplate.name}
              </h3>
              
              {(mode === 'daily' || mode === 'both') && (
                <div className="mb-4">
                  <h4 className="text-xs font-semibold text-zinc-600 mb-2">
                    日常回路字段（{currentTemplate.dailyFields.length} 项）
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {currentTemplate.dailyFields.map((f) => (
                      <span
                        key={f.id}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-zinc-200 rounded-lg text-xs"
                      >
                        {categoryIcons[f.category] || categoryIcons.default}
                        <span className="font-medium">{f.name}</span>
                        <span className="text-zinc-400">({f.unit})</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {(mode === 'monthly' || mode === 'both') && (
                <div>
                  <h4 className="text-xs font-semibold text-zinc-600 mb-2">
                    月度回路分类（{currentTemplate.monthlyCircuits.length} 项）
                  </h4>
                  <div className="space-y-1">
                    {Object.entries(
                      currentTemplate.monthlyCircuits.reduce((acc, c) => {
                        acc[c.category] = acc[c.category] || [];
                        acc[c.category].push(c);
                        return acc;
                      }, {} as Record<string, MonthlyCircuitConfig[]>)
                    ).map(([category, circuits]) => (
                      <div key={category} className="flex flex-wrap gap-1 items-center">
                        <span className="text-xs font-semibold text-zinc-500 w-20">{category}:</span>
                        {circuits.map((c) => (
                          <span
                            key={c.id}
                            className="px-1.5 py-0.5 bg-white border border-zinc-200 rounded text-xs"
                          >
                            {c.name}
                          </span>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-zinc-200 bg-zinc-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-800 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleImport}
            disabled={!selectedTemplate}
            className="px-6 py-2 bg-cyan-600 text-white text-sm font-bold rounded-lg hover:bg-cyan-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            确认导入
          </button>
        </div>
      </div>
    </div>
  );
};
