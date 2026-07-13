// 设置页（我的）
import { useNavigate } from 'react-router-dom';
import { LogOut, Phone, Info, ChevronRight, Pencil } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useFamilyStore } from '@/store/familyStore';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/common/Button';
import { Avatar } from '@/components/common/Avatar';
import { getDisplayName, getGenderLabel, getLifeSpan } from '@/utils/helpers';

export function SettingsPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { selfPerson } = useFamilyStore();

  const handleLogout = () => {
    logout();
    navigate('/auth', { replace: true });
  };

  return (
    <>
      <PageHeader title="我的" />
      <div className="px-4 py-4 space-y-4">
        {/* 个人信息卡片 */}
        <button
          onClick={() => selfPerson && navigate(`/person/${selfPerson.id}`)}
          className="block w-full text-left"
        >
          <div className="rounded-xl bg-white border border-xuan-200 p-5">
            <div className="flex items-center gap-3">
              {selfPerson ? (
                <Avatar person={selfPerson} size="lg" />
              ) : (
                <div className="w-14 h-14 rounded-full bg-xuan-200 flex items-center justify-center text-ink-400 text-xl font-serif">
                  {user?.phone.slice(-1)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                {selfPerson ? (
                  <>
                    <p className="text-base font-medium text-ink-800 truncate">
                      {getDisplayName(selfPerson)}
                    </p>
                    <p className="text-xs text-ink-500">
                      {getGenderLabel(selfPerson.gender)}
                      {getLifeSpan(selfPerson) ? ` · ${getLifeSpan(selfPerson)}` : ''}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-base font-medium text-ink-800">
                      未完善资料
                    </p>
                    <p className="text-xs text-cinnabar-600">
                      点击完善个人资料
                    </p>
                  </>
                )}
              </div>
              <ChevronRight size={18} className="text-ink-400" />
            </div>
          </div>
        </button>

        {/* 编辑资料入口 */}
        {selfPerson && (
          <button
            onClick={() => navigate(`/person/${selfPerson.id}/edit`)}
            className="w-full rounded-xl bg-white border border-xuan-200 p-3 flex items-center gap-3 hover:border-xuan-300 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-xuan-100 flex items-center justify-center">
              <Pencil size={14} className="text-ink-500" />
            </div>
            <span className="text-sm text-ink-700">编辑我的资料</span>
            <ChevronRight size={16} className="ml-auto text-ink-400" />
          </button>
        )}

        {/* 账号信息 */}
        <div className="rounded-xl bg-white border border-xuan-200 p-4 space-y-2">
          <div className="flex items-center gap-3 text-sm">
            <Phone size={16} className="text-ink-400" />
            <span className="text-ink-500">手机号：</span>
            <span className="text-ink-700">
              {user?.phone.slice(0, 3)}****{user?.phone.slice(-4)}
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Info size={16} className="text-ink-400" />
            <span className="text-ink-500">本人节点：</span>
            <span className="text-ink-700">
              {user?.personId ? '已创建' : '未创建'}
            </span>
          </div>
        </div>

        {/* 版本信息 */}
        <div className="rounded-xl bg-xuan-100 border border-xuan-300 p-4">
          <p className="text-sm text-ink-600 mb-1">亲络家谱</p>
          <p className="text-xs text-ink-400">v0.1.0 · S2 本人节点阶段</p>
        </div>

        {/* 退出登录 */}
        <Button
          variant="secondary"
          fullWidth
          size="lg"
          onClick={handleLogout}
          className="text-cinnabar-600"
        >
          <LogOut size={18} />
          退出登录
        </Button>
      </div>
    </>
  );
}
